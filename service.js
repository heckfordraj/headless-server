var mongoose = require('mongoose');
var Collections = require('./collections.js');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;
new Collections;

mongoose.connect('mongodb://localhost/test', {
  useMongoClient: true
});


class MongoService {

  constructor(req, res){
    this.req = req
    this.res = res
  }


  getCollection(req, name){

    let query = {};

    if (name) {
      query.name = name;
    }

    return mongoose.connection.db.listCollections(query).toArray()
    .then((res) => {

      if (res.length <= 0) {

        req.status(404).send('Not Found');

      } else {

        req.status(200).send('Fetched');
      }

      return res;
    })
    .catch((error) => {

      console.log(error);
      return req.status(500).send('Error');
    });
  }


  addField(req, name){

    if (!name) {
      return Promise.resolve(req.status(200).send('No Content'));
    }

    return mongoose.model('Collection').create({ name: name })
    .then((res) => {

      return req.status(201).send('Created');
    })
    .catch((error) => {

      if (error.code === 11000) {

        return req.status(409).send('Conflict');

      } else {

        console.log(error);
        return req.status(500).send('Error');
      }
    });
  }


  removeField(req, name){

    if (!name) {
      return Promise.resolve(req.status(404).send('Not Found'));
    }

    return mongoose.model('Collection').findOneAndRemove({ name: name })
    .then((res) => {

      if (!res) {

        return req.status(404).send('Not Found');
      }

      return req.status(204).send('No Content');
    })
    .catch((error) => {

      console.log(error);
      return req.status(500).send('Error');
    });
  }


  getField(req, name){

    let query = {};

    if (name) {
      query.name = name;
    }

    return mongoose.model('Collection').find(query)
    .then((res) => {

      if (res.length > 0) {

        req.status(200).send('Fetched');

      } else {

        req.status(404).send('Not Found');
      }

      return res;
    })
    .catch((error) => {

      console.log(error);
      return req.status(500).send('Error');
    })
  }

}
module.exports = MongoService
