const multer = require('multer');
const config = require('../config.json');
const env = process.env.NODE_ENV || 'dev';

const multerOptions = multer({
  dest: config[env].uploads,
  fileFilter: function(req, file, cb) {

    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {

      return cb(null, true);
    }

    cb(null, false);
  }
});


class UploadService {

  constructor(req, res){
    this.req = req;
    this.res = res;
  }

  uploadImage() {

    return new Promise((resolve) => {

      let upload = multerOptions.single('image');

      upload(this.req, this.res, (err) => {

        if (err || !this.req.file) {

          this.res.status(403);
          return resolve(err);
        }

        this.res.status(201);
        return resolve(this.req.file);
      })

    })
  }

}
module.exports = UploadService;
