#!/usr/bin/env node

const parseDuration = require('parse-duration')
const Connection = require('./connection');
const Elasticsearch = require('./elasticsearch');
const Events = require('./events');
const Fields = require('./fields');
const Processor = require('./processor');
const Reader = require('./reader');
const Trace = require('./trace');
const wait = require('./wait');
const padLeft = require('./pad').padLeft;

const yargs = require('yargs')
  .strict(true)
  .option('ss-address', { type: 'string', demandOption: true, describe: 'SQL Server address.'})
  .option('ss-port', { type: 'numbe', default: 1433, describe: 'SQL Server port.'})
  .option('ss-user', { type: 'string', demandOption: true,describe: 'SQL Server user.'})
  .option('ss-password', { type: 'string', demandOption: true, describe: 'SQL server password.'})
  .option('ss-timeout', { type: 'number', default: 60, describe: 'SQL Server timeout (in seconds).'})
  .option('es-address', { type: 'string', demandOption: true, describe: 'Elasticsearch address.'})
  .option('es-port', { type: 'number', default: 9200, describe: 'Elasticsearch port.'})
  .option('es-timeout', { type: 'number', default: 60, describe: 'Elasticsearch timeout (in seconds).'})
  .option('trace-directory', { type: 'string', demandOption: true, describe: 'Directory to create the trace file.'})
  .option('index-prefix', { type: 'string', default: 'sql-', describe: 'Elasticsearch index prefix.'})
  .option('events', { type: 'array', choices: Object.keys(Events), default: ['RPCCompleted', 'SQLBatchCompleted'], describe: 'Events to capture.'})
  .option('fields', { type: 'array', choices: Object.keys(Fields), default: ['EventClass', 'TextData', 'QueryHash', 'HostName', 'ClientProcessID', 'LoginName', 'SPID', 'Duration', 'StartTime', 'EndTime', 'Reads', 'Writes', 'CPU', 'ServerName', 'DatabaseName', 'RowCounts'], describe: 'Fields to include.'})
  .option('duration', { type: 'string', default: '60s', alias: 'd', describe: 'Duration to run the profiler.'})
  .option('max-size', { type: 'number', default: 1024, describe: 'Maximum size of the trace file (in megabytes).'})
  .option('batch-size', { type: 'number', default: 1000, describe: 'Number of events to save in each batch.'})
  .option('import', { type: 'string', describe: 'Trace file to import.'});

const cleanupHandlers = [];

const cleanup = async () => {
  for (cleanupHandler of cleanupHandlers.reverse())
    await cleanupHandler();
};

process.on('SIGTERM', async () => {
  await cleanup();
  process.exit();
});

process.on('SIGINT', async () => {
  await cleanup();
  process.exit();
});

async function main() {
  const argv = yargs.argv;
  const events = argv['events'].map(event => Events[event]);
  const fields = argv['fields'].map(field => Fields[field]);

  // StartTime must always be included
  if (argv['fields'].indexOf('StartTime') === -1);
    fields.push(Fields.StartTime);

  const connection = new Connection({
    server: argv['ss-address'],
    port: argv['ss-port'],
    user: argv['ss-user'],
    password: argv['ss-password'],
    requestTimeout: argv['ss-timeout'] * 1000,
  });

  cleanupHandlers.push(async () => {
    await connection.close();
  });

  const reader = new Reader({
    connection: connection,
    fields: fields,
    batchSize: argv['batch-size'],
  });

  const elasticsearch = new Elasticsearch({
    address: argv['es-address'],
    port: argv['es-port'],
    timeout: argv['es-timeout'] * 1000,
    indexPrefix: argv['index-prefix'],
  });

  const processor = new Processor({
    fields: fields,
    elasticsearch: elasticsearch,
  });

  console.log(`Connecting to ${argv['ss-address']}...`);

  await connection.open();

  if (!argv['import']) {
    console.log("Creating trace...");

    const trace = new Trace({
      connection: connection,
      events: events,
      fields: fields,
      traceDirectory: argv['trace-directory'],
      maxSize: argv['max-size'],
    });

    cleanupHandlers.push(async () => {
      await trace.stop();
    });

    await trace.create();

    console.log(`Trace file path: ${trace.traceFilePath}`);
    console.log("Starting trace...");

    await trace.start();

    const duration = parseDuration(argv['duration']);
    const stopTime = new Date(Date.now() + duration);
    const until = `${padLeft(stopTime.getHours(), 2, '0')}:${padLeft(stopTime.getMinutes(), 2, '0')}:${padLeft(stopTime.getSeconds(), 2, '0')}`;

    await wait(duration, `Collecting events for ${argv['duration']} until ${until}... (Press [c] to stop)`);

    console.log("Stopping trace...");

    await trace.stop();

    reader.setTraceFilePath(trace.traceFilePath);
  }
  else {
    console.log(`Importing ${argv['import']}...`);

    reader.setTraceFilePath(argv['import']);
  }

  console.log(`Reading trace...`);

  const totalEvents = await reader.count();
  let savedEvents = 0;

  console.log(`Saving ${totalEvents} events to ${argv['es-address']}...`);

  reader.start();

  reader.onEvents = async (events) => {
    await processor.process(events);

    savedEvents += events.length;
    const progress = (savedEvents * 100 / totalEvents).toFixed(2);
    process.stdout.write('\033[999D'); // Move cursor to the first column
    process.stdout.write(padLeft(progress, 6) + '% ' + padLeft(savedEvents, totalEvents.toString().length) + '/' + totalEvents);
  };

  reader.onEnd = async () => {
    if (totalEvents > 0)
      console.log();

    console.log("Disconnecting...");

    await connection.close();
  };
}

main().catch(async error => {
  console.error(error);
  await cleanup();
});
