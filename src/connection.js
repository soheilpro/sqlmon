const sql = require('mssql');

class Connection {
  config;
  connection;

  constructor(config) {
    this.config = config;
  }

  async open() {
    const userDomainMatch = /^(.*)\\(.*)$/.exec(this.config.user);

    if (userDomainMatch) {
      this.config.domain = userDomainMatch[1];
      this.config.user = userDomainMatch[2];
    }

    this.connection = await sql.connect(this.config);
  }

  async execute(query) {
    const result = await this.connection.request().query(query);

    return result.recordset;
  }

  async stream(query, max, onRows, onEnd) {
    const request = this.connection.request();
    request.stream = true;

    let rows = [];

    request.on('row', async row => {
      rows.push(row);

      if (rows.length === max) {
        request.pause();
        await onRows(rows);
        rows = [];
        request.resume();
      }
    });

    request.on('done', async () => {
      if (rows.length > 0)
        await onRows(rows);

      await onEnd();
    });

    request.query(query);
  }

  async close() {
    if (!this.connection)
      return;

    await this.connection.close();

    this.connection = null;
  }
}

module.exports = Connection;
