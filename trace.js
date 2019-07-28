class Trace {
  config;
  traceFilePath;
  traceId;

  constructor(config) {
    this.config = config;
  }

  async createTrace(connection, filename, maxSize) {
    const query = `
      DECLARE @traceid INT;
      DECLARE @maxfilesize BIGINT = ${maxSize};
      EXEC sp_trace_create @traceid OUTPUT, 0, N'${filename}', @maxfilesize;
      SELECT @traceid AS TraceId;
    `;

    const result = await connection.execute(query);

    return result[0]['TraceId'];
  }

  async configureTrace(connection, traceId, events, fields) {
    let query = '';

    for (const event of events)
      for (const field of fields)
        query += `EXEC sp_trace_setevent ${traceId}, ${event.id}, ${field.id}, 1;`;

    query += `EXEC sp_trace_setfilter ${traceId}, 1, 0, 7, N'exec sp_reset_connection' -- TextData NOT LIKE`;

    await connection.execute(query);
  }

  async startTrace(connection, traceId) {
    const query = `
      EXEC sp_trace_setstatus ${traceId}, 1; -- start
    `;

    await connection.execute(query);
  }

  async stopTrace(connection, traceId) {
    const query = `
      EXEC sp_trace_setstatus ${traceId}, 0; -- stop
      EXEC sp_trace_setstatus ${traceId}, 2; -- close
    `;

    await connection.execute(query);
  }

  async start() {
    this.traceFilePath = `${this.config.traceDirectory}\\${new Date().toISOString().replace(/\-/g, '').replace('T', '').replace(/:/g, '').replace('.', '').replace('Z', '')}`;
    this.traceId = await this.createTrace(this.config.connection, this.traceFilePath, this.config.maxSize);
    this.traceFilePath += '.trc'; // SQL Server automatically adds this

    await this.configureTrace(this.config.connection, this.traceId, this.config.events, this.config.fields);
    await this.startTrace(this.config.connection, this.traceId);
  }

  async stop() {
    if (this.traceId) {
      try {
        await this.stopTrace(this.config.connection, this.traceId);
      }
      catch {
      }

      this.traceId = null;
    }
  }
}

module.exports = Trace;
