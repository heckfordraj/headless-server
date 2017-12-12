var mongoose = require('mongoose');
var Collections = require('./collections.js');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

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


  addField(res, field){

    if (!field || !field.name) {

      res.status(403);
      return Promise.resolve(null);
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


  updateField(res, field){

    if (!field || !field.id) {

      res.status(403);
      return Promise.resolve(null);
    }

    return mongoose.model('Page').findOneAndUpdate({ _id: ObjectId(field.id) }, field, { new: true })
    .then((field) => {

      if (!field) {

        res.status(404);

      } else {

        res.status(200);
      }

      return field;
    })
    .catch((error) => {

      if (error.code === 11000) {

        res.status(409);
        return null;
      }
    });
  }

  
  removeField(res, id){

    if (!id) {
      res.status(403);
      return Promise.resolve(null);
    }

    return mongoose.model('Page').findOneAndRemove({ _id: ObjectId(id) })
    .then((field) => {

      if (!field) {

        res.status(404);

      } else {

        res.status(204);
      }

      return field;
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
