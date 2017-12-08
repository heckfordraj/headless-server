var mongoose = require('mongoose');

class Collections {

  constructor() {

    var pageSchema = mongoose.Schema({
      name: {
        type: String,
        required: true,
        unique: true
      }
    });

    mongoose.model('Page', pageSchema)
  }

}

module.exports = Collections;
