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


  getCollection(res, name){

    let query = {};

    if (name) {
      query.name = name;
    }

    return mongoose.connection.db.listCollections(query).toArray()
    .then((collection) => {

      if (collection.length <= 0) {

        res.status(404);

      } else {

        res.status(200);
      }

      return collection;
    });
  }


  addField(req, res, field){

    if (!field || !field.name) {

      res.status(200);
      Promise.resolve(null);
    }

    return mongoose.model('Page').create({ name: field.name })
    .then((field) => {


      res.status(201);

      return field;
    })
    .catch((error) => {

      if (error.code === 11000) {

        res.status(409);
        return null;
      }
    });
  }


  removeField(res, name){

    if (!name) {
      return Promise.resolve(res.status(404).send('Not Found'));
    }

    return mongoose.model('Page').findOneAndRemove({ name: name })
    .then((field) => {

      if (!field) {

        return res.status(404).send('Not Found');
      }

      return res.status(204).send('No Content');
    });
  }


  getField(res, name){

    let query = {};

    if (name) {
      query.name = name;
    }

    return mongoose.model('Page').find(query)
    .then((field) => {

      if (field.length > 0) {

        res.status(200);

      } else {

        res.status(404);
      }

      return field;
    });
  }

}
module.exports = MongoService
