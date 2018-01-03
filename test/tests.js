const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const chai = require('chai');
const chaiSubset = require('chai-subset');
const expect = chai.expect;
const httpMocks = require('node-mocks-http');
const randomstring = require('randomstring').generate(5);

const MongoService = require('../app/service.js');
const res = httpMocks.createResponse();

chai.use(chaiSubset);

describe('Server', () => {

  let db;

  beforeEach((done) => {

    mongoose.connect('mongodb://localhost/' + randomstring, { useMongoClient: true })
    .then((database) => {

      db = database;
      mongoose.model('Page').ensureIndexes();

      done();
    })
    .catch((err) => {

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

        let mongoService = new MongoService(res);

        return mongoService.getCollections()
        .then((collections) => {

          expect(res.statusCode).to.equal(200);
          expect(collections).to.be.an('array').to.have.lengthOf.at.least(1);
        });
      });

    });

  });


  describe('addField', () => {

    describe('should', () => {

      it('add field', () => {

        let field = { name: 'Title' };

        let mongoService = new MongoService(res);
        return mongoService.addField(field)
        .then(() => {

          expect(res.statusCode).to.equal(201);
        });
      });

      it('add field to database', () => {

        return mongoose.model('Page').count()
        .then((length) => {

          expect(length).to.equal(1);
        })
      });

      it('reject duplicate name', () => {

        let field = { name: 'Title' };

        let mongoService = new MongoService(res);
        return mongoService.addField(field)
        .then(() => {

          expect(res.statusCode).to.equal(409);
        });
      });

      it('reject similar name', () => {

        let field = { name: '   tiTLe ' };

        let mongoService = new MongoService(res);
        return mongoService.addField(field)
        .then(() => {

          expect(res.statusCode).to.equal(409);
        });
      });

    });


    describe('should not', () => {

      it('accept empty name', () => {

        let field = { name: null };

        let mongoService = new MongoService(res);
        return mongoService.addField(field)
        .then(() => {

          expect(res.statusCode).to.equal(403);
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
      .then((field) => {

        testField = field;
      });
    });


    describe('should', () => {

      it('add text subfield', () => {

        let field = { id: testField.id, data: { 'type': 'text', data: 'Hello' } };

        let mongoService = new MongoService(res);
        return mongoService.addSubField(field)
        .then((field) => {

          expect(res.statusCode).to.equal(201);
          expect(field.data).to.containSubset([{ _id: String }]);
          expect(field.data).to.containSubset([{ data: 'Hello' }]);
        });
      });

      it('add image subfield', () => {

        let field = { id: testField.id, data: { 'type': 'image', url: 'http://localhost/img/1.jpg' } };

        let mongoService = new MongoService(res);
        return mongoService.addSubField(field)
        .then((field) => {

          expect(res.statusCode).to.equal(201);
          expect(field.data).to.containSubset([{ _id: String }]);
          expect(field.data).to.containSubset([{ url: 'http://localhost/img/1.jpg' }]);
        });
      });

      it('reject nonexistent field', () => {

        let field = { id: 'aaaaaaaaaaaaaaaaaaaaaaaa', data: { 'type': 'text', data: 'Hello' } };

        let mongoService = new MongoService(res);
        return mongoService.addSubField(field)
        .then((field) => {

          expect(res.statusCode).to.equal(404);
        });
      });

    });


    describe('should not', () => {

      it('accept empty field id', () => {

        let field = { id: null, data: { 'type': 'text', data: 'Hello' } };

        let mongoService = new MongoService(res);
        return mongoService.addSubField(field)
        .then((field) => {

          expect(res.statusCode).to.equal(403);
        });
      });

      it('accept empty field data', () => {

        let field = { id: testField.id, data: null };

        let mongoService = new MongoService(res);
        return mongoService.addSubField(field)
        .then((field) => {

          expect(res.statusCode).to.equal(403);
        });
      });

      it('should not overwrite subfield', () => {

        let field = { id: testField.id, data: { 'type': 'text', data: 'Hi' } };

        let mongoService = new MongoService(res);
        return mongoService.addSubField(field)
        .then((field) => {

          expect(res.statusCode).to.equal(201);
          expect(field.data).to.be.an('array').to.have.lengthOf(3);
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

        let mongoService = new MongoService(res);
        return mongoService.updateField({ name: 'New Title', id: testFields[0].id })
        .then(() => {

          expect(res.statusCode).to.equal(200);
        });
      });

      it('update database field', () => {

        return mongoose.model('Page').findById(testFields[0].id)
        .then((field) => {

          expect(field.name).to.equal('New Title');
        });
      });

      it('reject nonexistent field', () => {

        let mongoService = new MongoService(res);
        return mongoService.updateField({ name: 'Title', id: 'aaaaaaaaaaaaaaaaaaaaaaaa' })
        .then(() => {

          expect(res.statusCode).to.equal(404);
        });
      });

      it('reject duplicate name', () => {

        let mongoService = new MongoService(res);
        return mongoService.updateField({ name: 'New Title', id: testFields[1].id })
        .then(() => {

          expect(res.statusCode).to.equal(409);
        });
      });

      it('reject similar name', () => {

        let mongoService = new MongoService(res);
        return mongoService.updateField({ name: ' neW  tItle   ', id: testFields[1].id })
        .then(() => {

          expect(res.statusCode).to.equal(409);
        });
      });

    });

    describe('should not', () => {

      it('accept empty id', () => {

        let mongoService = new MongoService(res);
        return mongoService.updateField({ name: 'New Title' })
        .then(() => {

          expect(res.statusCode).to.equal(403);
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
      .then((field) => {

        testField = field;
      });
    });


    describe('should', () => {

      it('update subfield', () => {

        let mongoService = new MongoService(res);
        return mongoService.updateSubField({ id: testField.id, data: { type: testField.data[0].type, id: testField.data[0].id, data: 'Hi' } })
        .then((field) => {

          expect(res.statusCode).to.equal(200);
          expect(field.data[0].data).to.equal('Hi');
        });
      });

      it('update database subfield', () => {

        return mongoose.model('Page').findById(testField.id)
        .then((field) => {

          expect(field.data[0].data).to.equal('Hi');
        });
      });

      it('reject nonexistent field', () => {

        let mongoService = new MongoService(res);
        return mongoService.updateSubField({ id: 'aaaaaaaaaaaaaaaaaaaaaaaa', data: { type: testField.data[0].type, id: testField.data[0].id, data: 'Hello' } })
        .then((field) => {

          expect(res.statusCode).to.equal(404);
        });
      });

      it('reject nonexistent subfield', () => {

        let mongoService = new MongoService(res);
        return mongoService.updateSubField({ id: testField.id, data: { type: testField.data[0].type, id: 'aaaaaaaaaaaaaaaaaaaaaaaa', data: 'Hi' } })
        .then((field) => {

          expect(res.statusCode).to.equal(404);
        });
      });

    });


    describe('should not', () => {

      it('accept empty id', () => {

        let mongoService = new MongoService(res);
        return mongoService.updateSubField({ data: { type: testField.data[0].type, id: testField.data[0].id, data: 'Hello' } })
        .then((field) => {

          expect(res.statusCode).to.equal(403);
        });
      });

      it('accept empty data', () => {

        let mongoService = new MongoService(res);
        return mongoService.updateSubField({ id: testField.id, data: null })
        .then((field) => {

          expect(res.statusCode).to.equal(403);
        });
      });

      it('accept empty data type', () => {

        let mongoService = new MongoService(res);
        return mongoService.updateSubField({ id: testField.id, data: { id: testField.data[0].id, data: 'Hello' } })
        .then((field) => {

          expect(res.statusCode).to.equal(403);
        });
      });

      it('accept empty data id', () => {

        let mongoService = new MongoService(res);
        return mongoService.updateSubField({ id: testField.id, data: { type: testField.data[0].type, data: 'Hello' } })
        .then((field) => {

          expect(res.statusCode).to.equal(403);
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
      .then((field) => {

        testField = field;
      });
    });


    describe('should', () => {

      it('remove field', () => {

        let mongoService = new MongoService(res);
        return mongoService.removeField(testField._id)
        .then(() => {

          expect(res.statusCode).to.equal(204);
        });
      });

      it('remove field from database', () => {

        return mongoose.model('Page').count()
        .then((length) => {

          expect(length).to.equal(0);
        })
      });

      it('reject nonexistent field', () => {

        let mongoService = new MongoService(res);
        return mongoService.removeField('aaaaaaaaaaaaaaaaaaaaaaaa')
        .then(() => {

          expect(res.statusCode).to.equal(404);
        });
      });

    });


    describe('should not', () => {

      it('accept empty id', () => {

        let mongoService = new MongoService(res);
        return mongoService.removeField(null)
        .then(() => {

          expect(res.statusCode).to.equal(403);
        });
      });

    });

  });


  describe('removeSubField', () => {

    let testField;

    before(() => {

      return mongoose.model('Page').create({ name: 'Title', data: [{ type: 'text', data: 'Hello' }, { type: 'text', data: 'Hello' }] })
      .then((field) => {

        testField = field;
      });
    });


    describe('should', () => {

      it('remove subfield', () => {

        let mongoService = new MongoService(res);
        return mongoService.removeSubField(testField.id, testField.data[0].id)
        .then(() => {

          expect(res.statusCode).to.equal(204);
        });
      });

      it('reject nonexistent id', () => {

        let mongoService = new MongoService(res);
        return mongoService.removeSubField('aaaaaaaaaaaaaaaaaaaaaaaa', testField.data[0].id)
        .then(() => {

          expect(res.statusCode).to.equal(404);
        });
      });

      it('reject nonexistent data id', () => {

        let mongoService = new MongoService(res);
        return mongoService.removeSubField(testField.id, 'aaaaaaaaaaaaaaaaaaaaaaaa')
        .then(() => {

          expect(res.statusCode).to.equal(404);
        });
      });

    });


    describe('should not', () => {

      it('accept empty id', () => {

        let mongoService = new MongoService(res);
        return mongoService.removeSubField(null, testField.data[0].id)
        .then(() => {

          expect(res.statusCode).to.equal(403);
        });
      });

      it('accept empty data id', () => {

        let mongoService = new MongoService(res);
        return mongoService.removeSubField(testField.id, null)
        .then(() => {

          expect(res.statusCode).to.equal(403);
        });
      });

      it('remove field', () => {

        return mongoose.model('Page').findById(testField.id)
        .then((field) => {

          expect(field).to.not.be.null;
        });
      });

      it('remove duplicate subfield', () => {

        return mongoose.model('Page').findById(testField.id)
        .then((field) => {

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

        let mongoService = new MongoService(res);
        return mongoService.getField(testFields[0]._id)
        .then((field) => {

          expect(res.statusCode).to.equal(200);
          expect(field[0].name).to.equal('Title 1');
        });
      });

      it('get all fields', () => {

        let mongoService = new MongoService(res);
        return mongoService.getField(null)
        .then((fields) => {

          expect(res.statusCode).to.equal(200);
          expect(fields).to.have.lengthOf(2);
        });
      });

      it('reject nonexistent field', () => {

        let mongoService = new MongoService(res);
        return mongoService.getField('aaaaaaaaaaaaaaaaaaaaaaaa')
        .then((field) => {

          expect(res.statusCode).to.equal(404);
          expect(field).to.be.an('array').that.is.empty;
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
