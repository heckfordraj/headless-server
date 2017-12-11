var mongoose = require('mongoose');
var Collections = require('./collections.js');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;
new Collections;

mongoose.connect('mongodb://localhost/db', {
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

        req.status(404);

      } else {

        req.status(200);
      }

      return res;
    });
  }


  addField(req, field){

    if (!field || !field.name) {

      req.status(200);
      Promise.resolve(null);
    }

    return mongoose.model('Page').create({ name: field.name })
    .then((res) => {

      req.status(201);
      return res;
    })
    .catch((error) => {

      if (error.code === 11000) {

        req.status(409);
        return null;
      }
    });
  }


  removeField(req, name){

    if (!name) {
      return Promise.resolve(req.status(404).send('Not Found'));
    }

    return mongoose.model('Page').findOneAndRemove({ name: name })
    .then((res) => {

      if (!res) {

        return req.status(404).send('Not Found');
      }

      return req.status(204).send('No Content');
    });
  }


  getField(req, name){

    let query = {};

    if (name) {
      query.name = name;
    }

    return mongoose.model('Page').find(query)
    .then((res) => {

      if (res.length > 0) {

        req.status(200);

      } else {

        req.status(404);
      }

      return res;
    });
  }

}
module.exports = MongoService
