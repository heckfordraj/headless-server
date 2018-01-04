var mongoose = require('mongoose');
var Collections = require('./collections.js');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

mongoose.Promise = global.Promise;
new Collections;


class MongoService {

  constructor(res){
    this.res = res
  }


  getCollections(){

    return mongoose.connection.db.listCollections().toArray()
    .then((collections) => {

      if (collections.length <= 0) {

        this.res.status(404);

      } else {

        this.res.status(200);
      }

      return collections;
    });
  }


  addField(field){

    if (!field || !field.name) {

      this.res.status(403);
      return Promise.resolve(null);
    }

    field['slug'] = field.name;

    return mongoose.model('Page').create(field)
    .then((field) => {

      this.res.status(201);
      return field;
    })
    .catch((error) => {

      if (error.code === 11000) {

        this.res.status(409);
        return null;
      }
    });
  }

  addSubField(field){

    if (!field || !field.id || field.id.length < 12 || !field.data) {

      this.res.status(403);
      return Promise.resolve(null);
    }

    return mongoose.model('Page').findByIdAndUpdate(field.id, { $push: { data: field.data }}, { new: true, runValidators: true, runSettersOnQuery: true })
    .then((field) => {

      if (!field) {

        this.res.status(404);

      } else {

        this.res.status(201);
      }

      return field;
    });
  }

  updateField(field){

    if (!field || !field.id || field.id.length < 12) {

      this.res.status(403);
      return Promise.resolve(null);
    }

    field['slug'] = field.name;

    return mongoose.model('Page').findByIdAndUpdate(field.id, field, { new: true, runValidators: true, runSettersOnQuery: true })
    .then((field) => {

      if (!field) {

        this.res.status(404);

      } else {

        this.res.status(200);
      }

      return field;
    })
    .catch((error) => {

      if (error.code === 11000) {

        this.res.status(409);
        return null;
      }
    });
  }


  updateSubField(field){

    if (!field || !field.id || field.id.length < 12 || !field.data || !field.data.type || !field.data.id || field.data.id.length < 12) {

      this.res.status(403);
      return Promise.resolve(null);
    }

    return mongoose.model('Page').findOneAndUpdate({ _id: ObjectId(field.id), "data._id": ObjectId(field.data.id) }, { "$set": { "data.$": field.data } }, { new: true, runValidators: true, runSettersOnQuery: true })
    .then((field) => {

      if (!field) {

        this.res.status(404);

      } else {

        this.res.status(200);
      }

      return field;
    });
  }


  removeField(id){

    if (!id || id.length < 12) {
      this.res.status(403);
      return Promise.resolve(null);
    }

    return mongoose.model('Page').findByIdAndRemove(id)
    .then((field) => {

      if (!field) {

        this.res.status(404);

      } else {

        this.res.status(204);
      }

      return field;
    });
  }


  removeSubField(id, subid){

    if (!id || !subid || id.length < 12 || subid.length < 12) {

      this.res.status(403);
      return Promise.resolve(null);
    }

    return mongoose.model('Page').findOneAndUpdate({ _id: ObjectId(id), "data._id": ObjectId(subid) }, { "$pull": { "data": { "_id": ObjectId(subid) } } }, { new: true })
    .then((field) => {

      if (!field) {

        this.res.status(404);

      } else {

        this.res.status(204);
      }

      return field;
    });
  }


  getField(id){

    let query = {};

    if (id) {
      query._id = ObjectId(id)
    }

    return mongoose.model('Page').find(query)
    .then((field) => {

      if (!field || field.length <= 0) {

        this.res.status(404);

      } else {

        this.res.status(200);
      }

      return field;
    });
  }

}
module.exports = MongoService
