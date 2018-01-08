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
        .stat(image)
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
      let actual = sizeOf(image);

      expect(actual.width).to.be.at.most(required.width);
      expect(actual.height).to.be.at.most(required.height);
    });

    return Promise.all(images);
  });

  it('should strip file extensions', () => {
    let images = Object.values(testImage).map(image => {
      let ext = path.extname(image);
      expect(ext).to.be.empty;
    });

    return Promise.all(images);
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

  it('should reject .js', () => {
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

  it('should reject js file as .jpg', () => {
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

  it('should not accept duplicate image');

  after(() => {
    return fs.remove(config.env.test.uploads);
  });
});
