#!/usr/bin/env node

const child_process = require('child_process');
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

const argv = require('yargs')
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
  .option('delay', { type: 'string', describe: 'Time to wait before starting.'})
  .option('collect-only', { type: 'boolean', conflicts: 'import', describe: 'Only collect events and do not save them to Elasticsearch.'})
  .option('import', { type: 'string', conflicts: 'collect-only', describe: 'Trace file to import.'})
  .option('schedule-hook', { type: 'string', describe: 'Script to run when program is scheduled to run at a later time.'})
  .option('collection-start-hook', { type: 'string', describe: 'Script to run when collection starts.'})
  .option('collection-end-hook', { type: 'string', describe: 'Script to run when collection ends.'})
  .option('save-start-hook', { type: 'string', describe: 'Script to run when saving starts.'})
  .option('save-end-hook', { type: 'string', describe: 'Script to run when saving ends.'})
  .option('error-hook', { type: 'string', describe: 'Script to run when an error occurs.'})
  .option('interrupt-hook', { type: 'string', describe: 'Script to run when the program is interrupted.'})
  .strict(true)
  .argv;

let env = {
  ...process.env,
  SQLMON_SQLSERVER_ADDRESS: argv['ss-address'],
  SQLMON_SQLSERVER_PORT: argv['ss-port'],
  SQLMON_SQLSERVER_USER: argv['ss-user'],
  SQLMON_SQLSERVER_PASSWORD: argv['ss-password'],
  SQLMON_SQLSERVER_TIMEOUT: argv['ss-timeout'],
  SQLMON_ELASTICSEARCH_ADDRESS: argv['es-address'],
  SQLMON_ELASTICSEARCH_PORT: argv['es-port'],
  SQLMON_ELASTICSEARCH_TIMEOUT: argv['es-timeout'],
  SQLMON_TRACE_DIRECTORY: argv['trace-directory'],
  SQLMON_INDEX_PREFIX: argv['index-prefix'],
  SQLMON_EVENTS: argv['events'],
  SQLMON_FIELDS: argv['fields'],
  SQLMON_DURATION: argv['duration'],
  SQLMON_MAX_SIZE: argv['max-size'],
  SQLMON_BATCH_SIZE: argv['batch-size'],
  SQLMON_DELAY: argv['delay'],
  SQLMON_COLLECT_ONLY: !!argv['collect-only'],
  SQLMON_IMPORT: argv['import'],
};

const cleanupHandlers = [];

const cleanup = async () => {
  for (cleanupHandler of cleanupHandlers.reverse())
    await cleanupHandler();
};

process.on('SIGTERM', async () => {
  await cleanup();

  if (argv['interrupt-hook']) {
    child_process.execFile(argv['interrupt-hook'], {
      env: env,
    });
  }

  process.exit();
});

process.on('SIGINT', async () => {
  await cleanup();

  if (argv['interrupt-hook']) {
    child_process.execFile(argv['interrupt-hook'], {
      env: env,
    });
  }

  process.exit();
});

async function main() {
  const events = argv['events'].map(event => Events[event]);
  const fields = argv['fields'].map(field => Fields[field]);
  let traceFilePath;

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

  if (argv['delay']) {
    const delay = parseDuration(argv['delay']);
    const startDateTime = new Date(Date.now() + delay);
    const startTime = `${padLeft(startDateTime.getHours(), 2, '0')}:${padLeft(startDateTime.getMinutes(), 2, '0')}:${padLeft(startDateTime.getSeconds(), 2, '0')}`;

    if (argv['schedule-hook']) {
      child_process.execFile(argv['schedule-hook'], {
        env: {
          ...env,
          SQLMON_START_DATETIME: startDateTime.toISOString(),
          SQLMON_START_TIME: startTime,
        }
      });
    }

    await wait(delay, `Waiting ${argv['delay']} until ${startTime}... (Press [s] to start now)`, 's');
  }

  console.log(`Connecting to ${argv['ss-address']}...`);

  await connection.open();

  if (!argv['import']) {
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

    console.log("Creating trace...");

    await trace.create();

    traceFilePath = trace.traceFilePath;

    env = {
      ...env,
      SQLMON_TRACE_FILE_PATH: traceFilePath,
    };

    console.log(`Trace file path: ${traceFilePath}`);
    console.log("Starting trace...");

    const duration = parseDuration(argv['duration']);
    const stopDateTime = new Date(Date.now() + duration);
    const stopTime = `${padLeft(stopDateTime.getHours(), 2, '0')}:${padLeft(stopDateTime.getMinutes(), 2, '0')}:${padLeft(stopDateTime.getSeconds(), 2, '0')}`;

    if (argv['collection-start-hook']) {
      child_process.execFile(argv['collection-start-hook'], {
        env: {
          ...env,
          SQLMON_STOP_DATETIME: stopDateTime.toISOString(),
          SQLMON_STOP_TIME: stopTime,
        }
      });
    }

    await trace.start();

    await wait(duration, `Collecting events for ${argv['duration']} until ${stopTime}... (Press [c] to stop now)`, 'c');

    console.log("Stopping trace...");

    if (argv['collection-end-hook']) {
      child_process.execFile(argv['collection-end-hook'], {
        env: env,
      });
    }

    await trace.stop();
  }
  else {
    console.log(`Importing ${argv['import']}...`);

    traceFilePath = argv['import'];

    env = {
      ...env,
      SQLMON_TRACE_FILE_PATH: traceFilePath,
    };
  }

  if (!argv['collect-only']) {
    const reader = new Reader({
      connection: connection,
      traceFilePath: traceFilePath,
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

    if (argv['save-start-hook']) {
      child_process.execFile(argv['save-start-hook'], {
        env: env,
      });
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

      if (argv['save-end-hook']) {
        child_process.execFile(argv['save-end-hook'], {
          env: env,
        });
      }

      await connection.close();
    };
  }
  else {
    console.log("Disconnecting...");

    await connection.close();
  }
}

main().catch(async error => {
  console.error(error);

  await cleanup();

  if (argv['error-hook']) {
    child_process.execFile(argv['error-hook'], {
      env: {
        ...env,
        SQLMON_ERROR: error.toString(),
      }
    });
  }
});
