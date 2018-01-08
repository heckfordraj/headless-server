const mongoose = require('mongoose');
const chai = require('chai');
const chaiSubset = require('chai-subset');
const chaiHttp = require('chai-http');
const expect = chai.expect;

const config = require('../config.json');
const app = require('../app/app.js');
const MongoService = require('../app/service.js');
const url = 'http://localhost:4100';

chai.use(chaiSubset);
chai.use(chaiHttp);

describe('MongoService', () => {
  let db;

  beforeEach(done => {
    mongoose
      .connect(config.env['test'].mongodb, { useMongoClient: true })
      .then(database => {
        db = database;
        mongoose.model('Page').ensureIndexes();

        done();
      })
      .catch(err => {
        done(new Error('Failed to connect to MongoDB'));
      });
  });

  it('should connect to MongoDB', () => {
    let connectionStatus = mongoose.connection.readyState;
    expect(connectionStatus).to.equal(1);
  });

  it('should connect to empty db', () => {
    return mongoose
      .model('Page')
      .count()
      .then(length => {
        expect(length).to.equal(0);
      });
  });

  describe('getCollections', () => {
    it('should get all collections', () => {
      return chai
        .request(url)
        .get('/api/get')
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body)
            .to.be.an('array')
            .to.have.lengthOf.at.least(1);
        });
    });
  });

  describe('addField', () => {
    it('should add field', () => {
      return chai
        .request(url)
        .post('/api/add')
        .send({ name: 'Title' })
        .then(res => {
          expect(res).to.have.status(201);
          expect(res.body.name).to.equal('Title');
        });
    });

    it('should add field to database', () => {
      return mongoose
        .model('Page')
        .findOne({ name: 'Title' })
        .then(res => {
          expect(res).to.be.not.null;
        });
    });

    it('should reject duplicate name', () => {
      return chai
        .request(url)
        .post('/api/add')
        .send({ name: 'Title' })
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(409);
          expect(res.body).to.be.empty;
        });
    });

    it('should reject similar name', () => {
      return chai
        .request(url)
        .post('/api/add')
        .send({ name: '   tiTLe ' })
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(409);
          expect(res.body).to.be.empty;
        });
    });

    it('should not accept empty name', () => {
      return chai
        .request(url)
        .post('/api/add')
        .send({ name: null })
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(403);
          expect(res.body).to.be.empty;
        });
    });

    after(() => {
      return mongoose.model('Page').deleteOne({ name: 'Title' });
    });
  });

  describe('addSubField', () => {
    let testField;

    before(() => {
      return mongoose
        .model('Page')
        .create({ name: 'Title' })
        .then(field => {
          testField = field;
        });
    });

    it('should add text subfield', () => {
      return chai
        .request(url)
        .post('/api/add/field')
        .send({ id: testField.id, data: { type: 'text', data: 'Hello' } })
        .then(res => {
          expect(res).to.have.status(201);
          expect(res.body.data).to.containSubset([
            { type: 'text', _id: String, data: 'Hello' }
          ]);
        });
    });

    it('should add text subfield to database', () => {
      return mongoose
        .model('Page')
        .findById(testField.id)
        .then(field => {
          expect(field.data).to.containSubset([
            { type: 'text', _id: String, data: 'Hello' }
          ]);
        });
    });

    it('should add image subfield', () => {
      return chai
        .request(url)
        .post('/api/add/field')
        .send({
          id: testField.id,
          data: { type: 'image', url: 'http://localhost/img/1.jpg' }
        })
        .then(res => {
          expect(res).to.have.status(201);
          expect(res.body.data).to.containSubset([
            { type: 'image', _id: String, url: 'http://localhost/img/1.jpg' }
          ]);
        });
    });

    it('should add image subfield to database', () => {
      return mongoose
        .model('Page')
        .findById(testField.id)
        .then(field => {
          expect(field.data).to.containSubset([
            { type: 'image', _id: String, url: 'http://localhost/img/1.jpg' }
          ]);
        });
    });

    it('should reject nonexistent field', () => {
      return chai
        .request(url)
        .post('/api/add/field')
        .send({
          id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
          data: { type: 'text', data: 'Hello' }
        })
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(404);
          expect(res.body).to.be.empty;
        });
    });

    it('should not accept empty field id', () => {
      return chai
        .request(url)
        .post('/api/add/field')
        .send({ id: null, data: { type: 'text', data: 'Hello' } })
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(403);
          expect(res.body).to.be.empty;
        });
    });

    it('should not accept empty field data', () => {
      return chai
        .request(url)
        .post('/api/add/field')
        .send({ id: testField.id, data: null })
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(403);
          expect(res.body).to.be.empty;
        });
    });

    it('should not overwrite subfield', () => {
      return chai
        .request(url)
        .post('/api/add/field')
        .send({ id: testField.id, data: { type: 'text', data: 'Hi' } })
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(201);
          expect(res.body.data)
            .to.be.an('array')
            .to.have.lengthOf(3);
        });
    });

    after(() => {
      return mongoose.model('Page').deleteOne({ name: 'Title' });
    });
  });

  describe('updateField', () => {
    let testFields;

    before(() => {
      return mongoose
        .model('Page')
        .insertMany([{ name: 'Title 1' }, { name: 'Title 2' }])
        .then(fields => {
          testFields = fields;
        });
    });

    it('should update field', () => {
      return chai
        .request(url)
        .put('/api/update')
        .send({ name: 'New Title', id: testFields[0].id })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body.name).to.equal('New Title');
        });
    });

    it('should update database field', () => {
      return mongoose
        .model('Page')
        .findById(testFields[0].id)
        .then(field => {
          expect(field.name).to.equal('New Title');
        });
    });

    it('should reject nonexistent field', () => {
      return chai
        .request(url)
        .put('/api/update')
        .send({ name: 'Title', id: 'aaaaaaaaaaaaaaaaaaaaaaaa' })
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(404);
          expect(res.body).to.be.empty;
        });
    });

    it('should reject duplicate name', () => {
      return chai
        .request(url)
        .put('/api/update')
        .send({ name: 'New Title', id: testFields[1].id })
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(409);
          expect(res.body).to.be.empty;
        });
    });

    it('should reject similar name', () => {
      return chai
        .request(url)
        .put('/api/update')
        .send({ name: ' neW  tItle   ', id: testFields[1].id })
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(409);
          expect(res.body).to.be.empty;
        });
    });

    it('should not accept empty id', () => {
      return chai
        .request(url)
        .put('/api/update')
        .send({ name: 'New Title' })
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(403);
          expect(res.body).to.be.empty;
        });
    });

    after(() => {
      return mongoose
        .model('Page')
        .deleteMany({ _id: { $in: [testFields[0].id, testFields[1].id] } });
    });
  });

  describe('updateSubField', () => {
    let testField;

    before(() => {
      return mongoose
        .model('Page')
        .create({ name: 'Title', data: { type: 'text', data: 'Hello' } })
        .then(field => {
          testField = field;
        });
    });

    it('should update subfield', () => {
      return chai
        .request(url)
        .put('/api/update/field')
        .send({
          id: testField.id,
          data: {
            type: testField.data[0].type,
            id: testField.data[0].id,
            data: 'Hi'
          }
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body.data[0].data).to.equal('Hi');
        });
    });

    it('should update database subfield', () => {
      return mongoose
        .model('Page')
        .findById(testField.id)
        .then(field => {
          expect(field.data[0].data).to.equal('Hi');
        });
    });

    it('should reject nonexistent field', () => {
      return chai
        .request(url)
        .put('/api/update/field')
        .send({
          id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
          data: {
            type: testField.data[0].type,
            id: testField.data[0].id,
            data: 'Hello'
          }
        })
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(404);
          expect(res.body).to.be.empty;
        });
    });

    it('should reject nonexistent subfield', () => {
      return chai
        .request(url)
        .put('/api/update/field')
        .send({
          id: testField.id,
          data: {
            type: testField.data[0].type,
            id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
            data: 'Hi'
          }
        })
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(404);
          expect(res.body).to.be.empty;
        });
    });

    it('should not accept empty id', () => {
      return chai
        .request(url)
        .put('/api/update/field')
        .send({
          data: {
            type: testField.data[0].type,
            id: testField.data[0].id,
            data: 'Hello'
          }
        })
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(403);
          expect(res.body).to.be.empty;
        });
    });

    it('should not accept empty data', () => {
      return chai
        .request(url)
        .put('/api/update/field')
        .send({ id: testField.id, data: null })
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(403);
          expect(res.body).to.be.empty;
        });
    });

    it('should not accept empty data type', () => {
      return chai
        .request(url)
        .put('/api/update/field')
        .send({
          id: testField.id,
          data: { id: testField.data[0].id, data: 'Hello' }
        })
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(403);
          expect(res.body).to.be.empty;
        });
    });

    it('should not accept empty data id', () => {
      return chai
        .request(url)
        .put('/api/update/field')
        .send({
          id: testField.id,
          data: { type: testField.data[0].type, data: 'Hello' }
        })
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(403);
          expect(res.body).to.be.empty;
        });
    });

    after(() => {
      return mongoose.model('Page').deleteOne({ name: 'Title' });
    });
  });

  describe('removeField', () => {
    let testField;

    before(() => {
      return mongoose
        .model('Page')
        .create({ name: 'Title' })
        .then(field => {
          testField = field;
        });
    });

    it('should remove field', () => {
      return chai
        .request(url)
        .delete(`/api/remove/${testField._id}`)
        .then(res => {
          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;
        });
    });

    it('should remove field from database', () => {
      return mongoose
        .model('Page')
        .findById(testField._id)
        .then(field => {
          expect(field).to.be.null;
        });
    });

    it('should reject nonexistent field', () => {
      return chai
        .request(url)
        .delete('/api/remove/aaaaaaaaaaaaaaaaaaaaaaaa')
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(404);
          expect(res.body).to.be.empty;
        });
    });

    it('should not accept empty id', () => {
      return chai
        .request(url)
        .delete('/api/remove/')
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(403);
          expect(res.body).to.be.empty;
        });
    });
  });

  describe('removeSubField', () => {
    let testField;

    before(() => {
      return mongoose
        .model('Page')
        .create({
          name: 'Title',
          data: [
            { type: 'text', data: 'Hello' },
            { type: 'text', data: 'Hello' }
          ]
        })
        .then(field => {
          testField = field;
        });
    });

    it('should remove subfield', () => {
      return chai
        .request(url)
        .delete(`/api/remove/${testField.id}/${testField.data[0].id}`)
        .then(res => {
          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;
        });
    });

    it('should remove subfield from database', () => {
      return mongoose
        .model('Page')
        .findById(testField._id)
        .then(field => {
          expect(field.data).to.have.lengthOf(1);
        });
    });

    it('should reject nonexistent id', () => {
      return chai
        .request(url)
        .delete(`/api/remove/aaaaaaaaaaaaaaaaaaaaaaaa/${testField.data[0].id}`)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(404);
          expect(res.body).to.be.empty;
        });
    });

    it('should reject nonexistent data id', () => {
      return chai
        .request(url)
        .delete(`/api/remove/${testField.id}/aaaaaaaaaaaaaaaaaaaaaaaa`)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(404);
          expect(res.body).to.be.empty;
        });
    });

    it('should not accept empty id', () => {
      return chai
        .request(url)
        .delete(`/api/remove/null/${testField.data[0].id}`)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(403);
          expect(res.body).to.be.empty;
        });
    });

    it('should not accept empty data id', () => {
      return chai
        .request(url)
        .delete(`/api/remove/${testField.id}/null`)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(403);
          expect(res.body).to.be.empty;
        });
    });

    it('should not remove field', () => {
      return mongoose
        .model('Page')
        .findById(testField.id)
        .then(field => {
          expect(field).to.not.be.empty;
        });
    });

    it('should not remove duplicate subfield', () => {
      return mongoose
        .model('Page')
        .findById(testField.id)
        .then(field => {
          expect(field.data)
            .to.be.an('array')
            .to.have.lengthOf(1);
        });
    });

    after(() => {
      return mongoose.model('Page').deleteOne({ name: 'Title' });
    });
  });

  describe('getField', () => {
    let testFields;

    before(() => {
      return mongoose
        .model('Page')
        .create([{ name: 'Title 1' }, { name: 'Title 2' }])
        .then(fields => {
          testFields = fields;
        });
    });

    it('should get field', () => {
      return chai
        .request(url)
        .get(`/api/get/page/${testFields[0]._id}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body[0].name).to.equal('Title 1');
        });
    });

    it('should get all fields', () => {
      return chai
        .request(url)
        .get('/api/get/page')
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.lengthOf(2);
        });
    });

    it('should reject nonexistent field', () => {
      return chai
        .request(url)
        .get('/api/get/page/aaaaaaaaaaaaaaaaaaaaaaaa')
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(404);
          expect(res.body).to.be.an('array').that.is.empty;
        });
    });

    after(() => {
      return mongoose
        .model('Page')
        .deleteMany({ _id: { $in: [testFields[0].id, testFields[1].id] } });
    });
  });

  after(done => {
    if (db) {
      db.dropDatabase();
    }

    done();
  });
});
