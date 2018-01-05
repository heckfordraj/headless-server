const fs = require('fs-extra');
const path = require('path');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

const config = require('../config.json');
const app = require('../app/app.js');
const UploadService = require('../app/upload.js');
const url = 'http://localhost:4100';

chai.use(chaiHttp);


describe('UploadService', () => {

  let testImage;

  it('should upload image', () => {

    return chai.request(url)
    .post('/upload')
    .attach('image', fs.createReadStream('./test/assets/image.jpg'))
    .then(res => {

      testImage = res.body;

      expect(res).to.have.status(201);
      expect(res.body).to.be.not.empty;
    });
  });

  it('should write image to disk', () => {

    return fs.stat(testImage.path)
    .catch(err => err.response)
    .then(res => {

      expect(res).to.be.an('object').to.be.not.empty;
    });
  });

  it('should write identical image', () => {

    return fs.stat(testImage.path)
    .catch(err => err.response)
    .then(res => {

      expect(res.size).to.equal(testImage.size);
    });
  });

  it('should strip file extension', () => {

    let ext = path.extname(testImage.path);
    expect(ext).to.be.empty;
  });

  it('should accept .jpg', () => {

    return chai.request(url)
    .post('/upload')
    .attach('image', fs.createReadStream('./test/assets/image.jpg'))
    .then(res => {

      expect(res).to.have.status(201);
      expect(res.body).to.be.not.empty;
    });
  });

  it('should accept .jpeg', () => {

    return chai.request(url)
    .post('/upload')
    .attach('image', fs.createReadStream('./test/assets/image.jpeg'))
    .then(res => {

      expect(res).to.have.status(201);
      expect(res.body).to.be.not.empty;
    });
  });

  it('should accept .png', () => {

    return chai.request(url)
    .post('/upload')
    .attach('image', fs.createReadStream('./test/assets/image.png'))
    .then(res => {

      expect(res).to.have.status(201);
      expect(res.body).to.be.not.empty;
    });
  });

  it('should reject .js', () => {

    return chai.request(url)
    .post('/upload')
    .attach('image', fs.createReadStream('./test/assets/script.js'))
    .catch(err => err.response)
    .then(res => {

      expect(res).to.have.status(403);
      expect(res.body).to.be.empty;
    });
  });

  it('should reject js file as .jpg');

  it('should not accept duplicate image');


  after(() => {

    return fs.remove(config.test.uploads);
  });

});
