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


describe('Server', () => {

  let db;

  beforeEach((done) => {

    mongoose.connect(config['test'].mongodb, { useMongoClient: true })
    .then((database) => {

      db = database;
      mongoose.model('Page').ensureIndexes();

      done();
    })
    .catch(err => {

      done(new Error('Failed to connect to MongoDB'));
    });
  });


  describe('should', () => {

    it('connect to MongoDB', () => {

      let connectionStatus = mongoose.connection.readyState;
      expect(connectionStatus).to.equal(1);
    });

    it('connect to empty db', () => {

      return mongoose.model('Page').count()
      .then((length) => {

        expect(length).to.equal(0);
      })
    });

  });


  describe('getCollections', () => {

    describe('should', () => {

      it('get all collections', () => {

        return chai.request(url)
        .get('/api/get')
        .then(res => {

          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array').to.have.lengthOf.at.least(1);
        });
      });

    });

  });


  describe('addField', () => {

    describe('should', () => {

      it('add field', () => {

        return chai.request(url)
        .post('/api/add')
        .send({ name: 'Title' })
        .then(res => {

          expect(res).to.have.status(201);
          expect(res.body.name).to.equal('Title');
        });
      });

      it('add field to database', () => {

        return mongoose.model('Page').findOne({ name: 'Title' })
        .then(res => {

          expect(res).to.be.not.null;
        })
      });

      it('reject duplicate name', () => {

        return chai.request(url)
        .post('/api/add')
        .send({ name: 'Title' })
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(409);
          expect(res.body).to.be.null;
        });
      });

      it('reject similar name', () => {

        return chai.request(url)
        .post('/api/add')
        .send({ name: '   tiTLe ' })
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(409);
          expect(res.body).to.be.null;
        });
      });

    });


    describe('should not', () => {

      it('accept empty name', () => {

        return chai.request(url)
        .post('/api/add')
        .send({ name: null })
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(403);
          expect(res.body).to.be.null;
        });
      });

    });


    after(() => {

      return mongoose.model('Page').deleteOne({ name: 'Title' });
    });

  });


  describe('addSubField', () => {

    let testField;

    before(() => {

      return mongoose.model('Page').create({ name: 'Title' })
      .then(field => {

        testField = field;
      });
    });


    describe('should', () => {

      it('add text subfield', () => {

        return chai.request(url)
        .post('/api/add/field')
        .send({ id: testField.id, data: { 'type': 'text', data: 'Hello' } })
        .then(res => {

          expect(res).to.have.status(201);
          expect(res.body.data).to.containSubset([{ _id: String }]);
          expect(res.body.data).to.containSubset([{ data: 'Hello' }]);
        });
      });

      it('add text subfield to database');

      it('add image subfield', () => {

        return chai.request(url)
        .post('/api/add/field')
        .send({ id: testField.id, data: { 'type': 'image', url: 'http://localhost/img/1.jpg' } })
        .then(res => {

          expect(res).to.have.status(201);
          expect(res.body.data).to.containSubset([{ _id: String }]);
          expect(res.body.data).to.containSubset([{ url: 'http://localhost/img/1.jpg' }]);
        });
      });

      it('add image subfield to database');

      it('reject nonexistent field', () => {

        return chai.request(url)
        .post('/api/add/field')
        .send({ id: 'aaaaaaaaaaaaaaaaaaaaaaaa', data: { 'type': 'text', data: 'Hello' } })
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(404);
          expect(res.body).to.be.null;
        });
      });

    });


    describe('should not', () => {

      it('accept empty field id', () => {

        return chai.request(url)
        .post('/api/add/field')
        .send({ id: null, data: { 'type': 'text', data: 'Hello' } })
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(403);
          expect(res.body).to.be.null;
        });
      });

      it('accept empty field data', () => {

        return chai.request(url)
        .post('/api/add/field')
        .send({ id: testField.id, data: null })
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(403);
          expect(res.body).to.be.null;
        });
      });

      it('should not overwrite subfield', () => {

        return chai.request(url)
        .post('/api/add/field')
        .send({ id: testField.id, data: { 'type': 'text', data: 'Hi' } })
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(201);
          expect(res.body.data).to.be.an('array').to.have.lengthOf(3);
        });
      });

    });


    after(() => {

      return mongoose.model('Page').deleteOne({ name: 'Title' });
    });

  });


  describe('updateField', () => {

    let testFields;

    before(() => {

      return mongoose.model('Page').insertMany([{ name: 'Title 1' }, { name: 'Title 2' }])
      .then((fields) => {

        testFields = fields;
      });
    });

    describe('should', () => {

      it('update field', () => {

        return chai.request(url)
        .put('/api/update')
        .send({ name: 'New Title', id: testFields[0].id })
        .then(res => {

          expect(res).to.have.status(200);
          expect(res.body.name).to.equal('New Title');
        });
      });

      it('update database field', () => {

        return mongoose.model('Page').findById(testFields[0].id)
        .then(field => {

          expect(field.name).to.equal('New Title');
        });
      });

      it('reject nonexistent field', () => {

        return chai.request(url)
        .put('/api/update')
        .send({ name: 'Title', id: 'aaaaaaaaaaaaaaaaaaaaaaaa' })
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(404);
          expect(res.body).to.be.null;
        });
      });

      it('reject duplicate name', () => {

        return chai.request(url)
        .put('/api/update')
        .send({ name: 'New Title', id: testFields[1].id })
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(409);
          expect(res.body).to.be.null;
        });
      });

      it('reject similar name', () => {

        return chai.request(url)
        .put('/api/update')
        .send({ name: ' neW  tItle   ', id: testFields[1].id })
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(409);
          expect(res.body).to.be.null;
        });
      });

    });

    describe('should not', () => {

      it('accept empty id', () => {

        return chai.request(url)
        .put('/api/update')
        .send({ name: 'New Title' })
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(403);
          expect(res.body).to.be.null;
        });
      });

    });


    after(() => {

      return mongoose.model('Page').deleteMany({ _id: { $in: [testFields[0].id, testFields[1].id] } });
    });

  });


  describe('updateSubField', () => {

    let testField;

    before(() => {

      return mongoose.model('Page').create({ name: 'Title', data: { type: 'text', data: 'Hello' } })
      .then(field => {

        testField = field;
      });
    });


    describe('should', () => {

      it('update subfield', () => {

        return chai.request(url)
        .put('/api/update/field')
        .send({ id: testField.id, data: { type: testField.data[0].type, id: testField.data[0].id, data: 'Hi' } })
        .then(res => {

          expect(res).to.have.status(200);
          expect(res.body.data[0].data).to.equal('Hi');
        });
      });

      it('update database subfield', () => {

        return mongoose.model('Page').findById(testField.id)
        .then(field => {

          expect(field.data[0].data).to.equal('Hi');
        });
      });

      it('reject nonexistent field', () => {

        return chai.request(url)
        .put('/api/update/field')
        .send({ id: 'aaaaaaaaaaaaaaaaaaaaaaaa', data: { type: testField.data[0].type, id: testField.data[0].id, data: 'Hello' } })
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(404);
          expect(res.body).to.be.null;
        });
      });

      it('reject nonexistent subfield', () => {

        return chai.request(url)
        .put('/api/update/field')
        .send({ id: testField.id, data: { type: testField.data[0].type, id: 'aaaaaaaaaaaaaaaaaaaaaaaa', data: 'Hi' } })
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(404);
          expect(res.body).to.be.null;
        });
      });

    });


    describe('should not', () => {

      it('accept empty id', () => {

        return chai.request(url)
        .put('/api/update/field')
        .send({ data: { type: testField.data[0].type, id: testField.data[0].id, data: 'Hello' } })
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(403);
          expect(res.body).to.be.null;
        });
      });

      it('accept empty data', () => {

        return chai.request(url)
        .put('/api/update/field')
        .send({ id: testField.id, data: null })
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(403);
          expect(res.body).to.be.null;
        });
      });

      it('accept empty data type', () => {

        return chai.request(url)
        .put('/api/update/field')
        .send({ id: testField.id, data: { id: testField.data[0].id, data: 'Hello' } })
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(403);
          expect(res.body).to.be.null;
        });
      });

      it('accept empty data id', () => {

        return chai.request(url)
        .put('/api/update/field')
        .send({ id: testField.id, data: { type: testField.data[0].type, data: 'Hello' } })
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(403);
          expect(res.body).to.be.null;
        });
      });

    });


    after(() => {

      return mongoose.model('Page').deleteOne({ name: 'Title' });
    });

  });


  describe('removeField', () => {

    let testField;

    before(() => {

      return mongoose.model('Page').create({ name: 'Title' })
      .then(field => {

        testField = field;
      });
    });


    describe('should', () => {

      it('remove field', () => {

        return chai.request(url)
        .delete(`/api/remove/${testField._id}`)
        .then(res => {

          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;
        });
      });

      it('remove field from database', () => {

        return mongoose.model('Page').findById(testField._id)
        .then(field => {

          expect(field).to.be.null;
        });
      });

      it('reject nonexistent field', () => {

        return chai.request(url)
        .delete('/api/remove/aaaaaaaaaaaaaaaaaaaaaaaa')
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(404);
          expect(res.body).to.be.null;
        });
      });

    });


    describe('should not', () => {

      it('accept empty id', () => {

        return chai.request(url)
        .delete('/api/remove/')
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(403);
          expect(res.body).to.be.null;
        });
      });

    });

  });


  describe('removeSubField', () => {

    let testField;

    before(() => {

      return mongoose.model('Page').create({ name: 'Title', data: [{ type: 'text', data: 'Hello' }, { type: 'text', data: 'Hello' }] })
      .then(field => {

        testField = field;
      });
    });


    describe('should', () => {

      it('remove subfield', () => {

        return chai.request(url)
        .delete(`/api/remove/${testField.id}/${testField.data[0].id}`)
        .then(res => {

          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;
        });
      });

      it('remove subfield from database');

      it('reject nonexistent id', () => {

        return chai.request(url)
        .delete(`/api/remove/aaaaaaaaaaaaaaaaaaaaaaaa/${testField.data[0].id}`)
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(404);
          expect(res.body).to.be.null;
        });
      });

      it('reject nonexistent data id', () => {

        return chai.request(url)
        .delete(`/api/remove/${testField.id}/aaaaaaaaaaaaaaaaaaaaaaaa`)
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(404);
          expect(res.body).to.be.null;
        });
      });

    });


    describe('should not', () => {

      it('accept empty id', () => {

        return chai.request(url)
        .delete(`/api/remove/null/${testField.data[0].id}`)
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(403);
          expect(res.body).to.be.null;
        });
      });

      it('accept empty data id', () => {

        return chai.request(url)
        .delete(`/api/remove/${testField.id}/null`)
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(403);
          expect(res.body).to.be.null;
        });
      });

      it('remove field', () => {

        return mongoose.model('Page').findById(testField.id)
        .then(field => {

          expect(field).to.not.be.null;
        });
      });

      it('remove duplicate subfield', () => {

        return mongoose.model('Page').findById(testField.id)
        .then(field => {

          expect(field.data).to.be.an('array').to.have.lengthOf(1);
        });
      });

    });


    after(() => {

      return mongoose.model('Page').deleteOne({ name: 'Title' });
    });

  });


  describe('getField', () => {

    let testFields;

    before(() => {

      return mongoose.model('Page').create([{ name: 'Title 1' }, { name: 'Title 2' }])
      .then((fields) => {

        testFields = fields;
      });
    });


    describe('should', () => {

      it('get field', () => {

        return chai.request(url)
        .get(`/api/get/page/${testFields[0]._id}`)
        .then(res => {

          expect(res).to.have.status(200);
          expect(res.body[0].name).to.equal('Title 1');
        });
      });

      it('get all fields', () => {

        return chai.request(url)
        .get('/api/get/page')
        .then(res => {

          expect(res).to.have.status(200);
          expect(res.body).to.have.lengthOf(2);
        });
      });

      it('reject nonexistent field', () => {

        return chai.request(url)
        .get('/api/get/page/aaaaaaaaaaaaaaaaaaaaaaaa')
        .catch(err => err.response)
        .then(res => {

          expect(res).to.have.status(404);
          expect(res.body).to.be.an('array').that.is.empty;
        });
      });

    });


    after(() => {

      return mongoose.model('Page').deleteMany({ _id: { $in: [testFields[0].id, testFields[1].id] } });
    });

  });


  after((done) => {

    if (db) {
      db.dropDatabase();
    }

    done();
  });

});
