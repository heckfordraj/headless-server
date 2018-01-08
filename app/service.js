const mongoose = require('mongoose');
const Collections = require('./collections.js');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

mongoose.Promise = global.Promise;
new Collections();

class MongoService {
  constructor(res) {
    this.res = res;
  }

  getCollections() {
    return mongoose.connection.db
      .listCollections()
      .toArray()
      .then(collections => {
        if (collections.length <= 0) {
          this.res.status(404);
        } else {
          this.res.status(200);
        }

        return this.res.send(collections);
      });
  }

  addField(field) {
    if (!field || !field.name) {
      return this.res.sendStatus(403);
    }

    field['slug'] = field.name;

    return mongoose
      .model('Page')
      .create(field)
      .then(field => {
        return this.res.status(201).send(field);
      })
      .catch(error => {
        if (error.code === 11000) {
          return this.res.sendStatus(409);
        }
      });
  }

  addSubField(field) {
    if (!field || !field.id || field.id.length < 12 || !field.data) {
      return this.res.sendStatus(403);
    }

    return mongoose
      .model('Page')
      .findByIdAndUpdate(
        field.id,
        { $push: { data: field.data } },
        { new: true, runValidators: true, runSettersOnQuery: true }
      )
      .then(field => {
        if (!field) {
          this.res.status(404);
        } else {
          this.res.status(201);
        }

        return this.res.send(field);
      });
  }

  updateField(field) {
    if (!field || !field.id || field.id.length < 12) {
      return this.res.sendStatus(403);
    }

    field['slug'] = field.name;

    return mongoose
      .model('Page')
      .findByIdAndUpdate(field.id, field, {
        new: true,
        runValidators: true,
        runSettersOnQuery: true
      })
      .then(field => {
        if (!field) {
          this.res.status(404);
        } else {
          this.res.status(200);
        }

        return this.res.send(field);
      })
      .catch(error => {
        if (error.code === 11000) {
          return this.res.sendStatus(409);
        }
      });
  }

  updateSubField(field) {
    if (
      !field ||
      !field.id ||
      field.id.length < 12 ||
      !field.data ||
      !field.data.type ||
      !field.data.id ||
      field.data.id.length < 12
    ) {
      return this.res.sendStatus(403);
    }

    return mongoose
      .model('Page')
      .findOneAndUpdate(
        { _id: ObjectId(field.id), 'data._id': ObjectId(field.data.id) },
        { $set: { 'data.$': field.data } },
        { new: true, runValidators: true, runSettersOnQuery: true }
      )
      .then(field => {
        if (!field) {
          this.res.status(404);
        } else {
          this.res.status(200);
        }

        return this.res.send(field);
      });
  }

  removeField(id) {
    if (!id || id.length < 12) {
      return this.res.sendStatus(403);
    }

    return mongoose
      .model('Page')
      .findByIdAndRemove(id)
      .then(field => {
        if (!field) {
          this.res.status(404);
        } else {
          this.res.status(204);
        }

        return this.res.send(field);
      });
  }

  removeSubField(id, subid) {
    if (!id || !subid || id.length < 12 || subid.length < 12) {
      return this.res.sendStatus(403);
    }

    return mongoose
      .model('Page')
      .findOneAndUpdate(
        { _id: ObjectId(id), 'data._id': ObjectId(subid) },
        { $pull: { data: { _id: ObjectId(subid) } } },
        { new: true }
      )
      .then(field => {
        if (!field) {
          this.res.status(404);
        } else {
          this.res.status(204);
        }

        return this.res.send(field);
      });
  }

  getField(id) {
    let query = {};

    if (id) {
      query._id = ObjectId(id);
    }

    return mongoose
      .model('Page')
      .find(query)
      .then(field => {
        if (!field || field.length <= 0) {
          this.res.status(404);
        } else {
          this.res.status(200);
        }

        return this.res.send(field);
      });
  }
}
module.exports = MongoService;
