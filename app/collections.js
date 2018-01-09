const mongoose = require('mongoose');
const slugify = require('underscore.string/slugify');

class Collections {
  constructor() {
    const textDataSchema = mongoose.Schema({
      text: String
    });

    const imageDataSchema = mongoose.Schema({
      xs: String,
      sm: String,
      md: String,
      lg: String
    });

    const textSchema = mongoose.Schema({
      _id: false,
      data: [textDataSchema]
    });

    const imageSchema = mongoose.Schema({
      _id: false,
      data: [imageDataSchema]
    });

    const blockSchema = mongoose.Schema(
      { type: String },
      { discriminatorKey: 'type' }
    );

    const Block = mongoose.model('Block', blockSchema);

    const pageSchema = mongoose.Schema({
      type: {
        type: String,
        default: 'page'
      },
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
      },
      data: [blockSchema]
    });

    pageSchema.path('data').discriminator('text', textSchema);
    pageSchema.path('data').discriminator('image', imageSchema);

    mongoose.model('Page', pageSchema);
  }
}

module.exports = Collections;
