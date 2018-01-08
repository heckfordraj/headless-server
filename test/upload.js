const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const sizeOf = require('image-size');

const config = require('../config.json');
const app = require('../app/app.js');
const UploadService = require('../app/upload.js');
const url = 'http://localhost:4100';

chai.use(chaiHttp);

describe('UploadService', () => {
  before(() => {
    return fs.ensureDir(config.env.test.uploads);
  });

  let testImage;

  describe('addImage', () => {
    it('should upload image', () => {
      return chai
        .request(url)
        .post('/upload')
        .attach('image', fs.createReadStream('./test/assets/image.jpg'))
        .then(res => {
          testImage = res.body;

          expect(res).to.have.status(201);
          expect(res.body).to.be.not.empty;
        });
    });

    it('should write images to disk', () => {
      let images = Object.values(testImage).map(image => {
        return fs
          .stat(`${config.env.test.uploads}/${image}`)
          .catch(err => err.response)
          .then(res => {
            expect(res).to.be.an('object').to.be.not.empty;
          });
      });

      return Promise.all(images);
    });

    it('should write resized images', () => {
      let images = Object.values(testImage).map((image, index) => {
        let required = config.upload.sizes[index];
        let actual = sizeOf(`${config.env.test.uploads}/${image}`);

        expect(actual.width).to.be.at.most(required.width);
        expect(actual.height).to.be.at.most(required.height);
      });

      return Promise.all(images);
    });

    it('should set file extension using mimetype', () => {
      return chai
        .request(url)
        .post('/upload')
        .attach('image', fs.createReadStream('./test/assets/image.png.jpg'))
        .then(res => {
          expect(res.body.xs).to.match(/.png/);
          expect(res.body.xs).to.not.match(/.jpg/);
        });
    });

    it('should accept .jpg', () => {
      return chai
        .request(url)
        .post('/upload')
        .attach('image', fs.createReadStream('./test/assets/image.jpg'))
        .then(res => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.not.empty;
        });
    });

    it('should accept .jpeg', () => {
      return chai
        .request(url)
        .post('/upload')
        .attach('image', fs.createReadStream('./test/assets/image.jpeg'))
        .then(res => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.not.empty;
        });
    });

    it('should accept .png', () => {
      return chai
        .request(url)
        .post('/upload')
        .attach('image', fs.createReadStream('./test/assets/image.png'))
        .then(res => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.not.empty;
        });
    });

    it('should accept png as .jpg', () => {
      return chai
        .request(url)
        .post('/upload')
        .attach('image', fs.createReadStream('./test/assets/image.png.jpg'))
        .then(res => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.not.empty;
        });
    });

    it('should not accept .js', () => {
      return chai
        .request(url)
        .post('/upload')
        .attach('image', fs.createReadStream('./test/assets/script.js'))
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(403);
          expect(res.body).to.be.empty;
        });
    });

    it('should not accept html file as .jpg', () => {
      return chai
        .request(url)
        .post('/upload')
        .attach('image', fs.createReadStream('./test/assets/script.jpg'))
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(403);
          expect(res.body).to.be.empty;
        });
    });
  });

  describe('getImage', () => {
    it('should get image', () => {
      return chai
        .request(url)
        .get(`/image/${testImage.xs}`)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.not.empty;
        });
    });

    it('should not accept empty id', () => {
      return chai
        .request(url)
        .get('/image/')
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(403);
          expect(res.body).to.be.empty;
        });
    });

    it('should reject nonexistent id', () => {
      return chai
        .request(url)
        .get('/image/aaaaaaaaaaaaaaaa')
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(404);
          expect(res.body).to.be.empty;
        });
    });
  });

  after(() => {
    return fs.remove(config.env.test.uploads);
  });
});
