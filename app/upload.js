const multer = require('multer');
const multerOptions = multer({
  dest: 'uploads/',
  fileFilter: function(req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {

      cb(null, true);

    } else {

      cb('Unsupported file format', false);
    }
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

        if (err) {

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
