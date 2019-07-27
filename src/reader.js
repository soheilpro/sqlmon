const _ = require('underscore');

class Reader {
  config;
  traceFilePath;
  onEvents;
  onEnd;

  constructor(config) {
    this.config = config;
  }

  setTraceFilePath(traceFilePath) {
    this.traceFilePath = traceFilePath;
  }

  async count() {
    const query = `
      SELECT COUNT(*) as Count
      FROM fn_trace_gettable(N'${this.traceFilePath}', default)
      WHERE EventClass NOT IN (
        65528, -- Profiler Start
        65534, -- ?
        65533 -- Profiler End
      )
    `;

    const result = await this.config.connection.execute(query);

    return result[0]['Count'];
  }

  async start() {
    const columns = _.uniq(this.config.fields.map(field => `[${field.name}]`)).join(', ');
    const query = `
      SELECT ${columns}
      FROM fn_trace_gettable(N'${this.traceFilePath}', default)
      WHERE EventClass NOT IN (
        65528, -- Profiler Start
        65534, -- ?
        65533 -- Profiler End
      )
    `;

    this.config.connection.stream(query, this.config.batchSize, (events) => this.onEvents(events), () => this.onEnd());
  }
}

module.exports = Reader;
