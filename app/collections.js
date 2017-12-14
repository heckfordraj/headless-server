var mongoose = require('mongoose');
var slugify = require("underscore.string/slugify");

class Collections {

  constructor() {

    var pageSchema = mongoose.Schema({
      name: {
        type: String,
        required: true,
        trim: true
      },
      slug: {
        type: String,
        set: slugify,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true
      }
    });

    mongoose.model('Page', pageSchema)
  }

}

module.exports = Collections;
