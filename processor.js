class Processor {
  config;

  constructor(config) {
    this.config = config;
  }

  async process(events) {
    const documents = events.map(event => {
      const document = {};

      for (const field of this.config.fields)
        document[field.alias || field.name] = field.transform ? field.transform(event[field.name]) : event[field.name];

      return document;
    });

    await this.config.elasticsearch.insertDocuments(documents);
  }
}

module.exports = Processor;
