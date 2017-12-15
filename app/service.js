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

    field['slug'] = field.name;

    return mongoose.model('Page').create(field)
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

  addSubField(res, field){

    if (!field || !field.id) {

      res.status(403);
      return Promise.resolve(null);
    }

    return mongoose.model('Page').findByIdAndUpdate(field.id, { $push: { data: field.data }}, { new: true, runValidators: true, runSettersOnQuery: true })
    .then((field) => {

      if (!field) {

        res.status(404);

      } else {

        res.status(201);
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

  updateField(res, field){

    if (!field || !field.id) {

      res.status(403);
      return Promise.resolve(null);
    }

    field['slug'] = field.name;

    return mongoose.model('Page').findByIdAndUpdate(field.id, field, { new: true, runValidators: true, runSettersOnQuery: true })
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


  updateSubField(res, field){

    if (!field || !field.id) {

      res.status(403);
      return Promise.resolve(null);
    }

    return mongoose.model('Page').findOneAndUpdate({ _id: ObjectId(field.id), "data._id": ObjectId(field.data.id) }, { "$set": { "data.$": field.data } }, { new: true, runValidators: true, runSettersOnQuery: true })
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

    return mongoose.model('Page').findByIdAndRemove(id)
    .then((field) => {

      if (!field) {

        res.status(404);

      } else {

        res.status(204);
      }

      return field;
    });
  }


  removeSubField(res, id, subid){

    if (!id || !subid) {

      res.status(403);
      return Promise.resolve(null);
    }

    return mongoose.model('Page').findByIdAndUpdate(id, { "$pull": { "data": { "_id": ObjectId(subid) } } })
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
