var mongoose = require('mongoose');

class Collections {

  constructor() {

    var collectionSchema = mongoose.Schema({
      name: {
        type: String,
        required: true,
        unique: true
      }
    });

    mongoose.model('Collection', collectionSchema)
  }

}

module.exports = Collections;
