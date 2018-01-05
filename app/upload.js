const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const storage = multer.memoryStorage();
const multerOptions = multer({ storage: storage });
const fileType = require('file-type');
const sharp = require('sharp');

const config = require('../config.json');
const env = process.env.NODE_ENV || 'dev';

const filetypes = new RegExp(config.upload.filetypes);
const sizes = config.upload.sizes;


class UploadService {

  constructor(req, res){
    this.req = req;
    this.res = res;
  }


  addImage() {

    let upload = multerOptions.single('image');

    return upload(this.req, this.res, (err) => {

      let mimetype = fileType(this.req.file.buffer || null);

      if (err || !this.req.file || !this.req.file.buffer || !mimetype || !filetypes.test(mimetype.mime)) {

        return this.res.status(403).send(new Error(err || null));
      }

      let rand = crypto.randomBytes(16);
      let filename = rand.toString('hex');

      const images = sizes.map((size) => {

        let filepath = path.join(config.env[env].uploads, `${filename}-${size.name}`);

        return sharp(this.req.file.buffer)
        .resize(size.width, size.height)
        .max()
        .toFile(filepath)
        .then(() => {

          return { [size.name]: filepath };
        });
      })

      Promise.all(images)
      .then(data => this.res.status(201).json(Object.assign({}, ...data)))
      .catch(err => this.res.status(500).send(new Error(err)))
    });
  }

  getImage(id) {

    return new Promise((resolve) => {

      if (!id) {

        this.res.status(403);
        return resolve(null);
      }

      this.res.setHeader('Content-Type', 'image/jpeg')

      return this.res.sendFile(id, { root: `./${config.env[env].uploads}` });
    });
  }

}
module.exports = UploadService;
