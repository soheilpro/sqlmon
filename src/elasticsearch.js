const http = require('http');
const padLeft = require('./pad').padLeft;

class Elasticsearch {
  config;

  constructor(config) {
    this.config = config;
  }

  createRequest(documents) {
    let data = '';

    for (const document of documents) {
      const year = document['@timestamp'].getUTCFullYear();
      const month = padLeft(document['@timestamp'].getUTCMonth() + 1, 2, '0');
      const day = padLeft(document['@timestamp'].getUTCDate(), 2, '0');
      const index = `${this.config.indexPrefix}${year}.${month}.${day}`;

      data += '{ "index" : { "_index" : "' + index + '" } }\n';
      data += JSON.stringify(document) + '\n';
    }

    return Buffer.from(data, 'utf8');
  }

  sendRequest(data) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.config.address,
        port: this.config.port,
        path: '/_bulk',
        method: 'POST',
        headers: {
          'Content-Length': data.length,
          'Content-Type': 'application/json',
        },
        timeout: this.config.timeout,
      };

      const request = http.request(options, function(response) {
        if (response.statusCode !== 200)
          return reject(new Error(response.statusMessage));

        resolve();
      });

      request.on('error', function(error) {
        reject(error);
      });

      request.end(data);
    });
  }

  async insertDocuments(documents) {
    const data = this.createRequest(documents);

    await this.sendRequest(data);
  }
}

module.exports = Elasticsearch;
