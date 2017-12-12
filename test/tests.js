const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
mongoose.Promise = global.Promise;
const chai = require('chai');
const expect = chai.expect;
const httpMocks = require('node-mocks-http');
const randomstring = require('randomstring').generate(5);

const MongoService = require('../app/service.js');
const res = httpMocks.createResponse();


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


  describe('getCollection', () => {

    describe('should', () => {

      it('get collection', () => {

        mongoService = new MongoService(null, null);

        return mongoService.getCollection(res, 'pages')
        .then((collection) => {

          expect(res.statusCode).to.equal(200);
          expect(collection[0].name).to.equal('pages');
        });
      });

      it('get all collections');

      it('reject nonexistent collection', () => {

        mongoService = new MongoService(null, null);

        return mongoService.getCollection(res, 'null')
        .then((collection) => {
          expect(res.statusCode).to.equal(404);
          expect(collection).to.be.an('array').that.is.empty;
        });
      });

    });

  });


  describe('addField', () => {

    describe('should', () => {

      it('add field', () => {

        mongoService = new MongoService(null, null);

        let field = { name: 'name' };

        return mongoService.addField(res, field)
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

        mongoService = new MongoService(null, null);

        let field = { name: 'name' };

        return mongoService.addField(res, field)
        .then(() => {

          expect(res.statusCode).to.equal(409);
        });
      });

    });


    describe('should not', () => {

      it('accept empty name', () => {

        mongoService = new MongoService(null, null);

        let field = { name: null };

        return mongoService.addField(res, field)
        .then(() => {

          expect(res.statusCode).to.equal(403);
        });
      });

    });


    after(() => {

      return mongoose.model('Page').deleteOne({ name: 'name' });
    });

  });


  describe('updateField', () => {

    let testFields;

    before(() => {

      return mongoose.model('Page').insertMany([{ name: 'name1' }, { name: 'name2' }])
      .then((fields) => {

        testFields = fields;
      });
    });

    describe('should', () => {

      it('update field', () => {

        mongoService = new MongoService(null, null);

        return mongoService.updateField(res, { name: 'newname', id: testFields[0].id })
        .then(() => {

          expect(res.statusCode).to.equal(200);
        });
      });

      it('update database field', () => {

        return mongoose.model('Page').findOne({ _id: ObjectId(testFields[0].id) })
        .then((field) => {

          expect(field.name).to.equal('newname');
        });
      });

      it('reject nonexistent field', () => {

        mongoService = new MongoService(null, null);

        return mongoService.updateField(res, { name: 'name', id: 'aaaaaaaaaaaaaaaaaaaaaaaa' })
        .then(() => {

          expect(res.statusCode).to.equal(404);
        });
      });

      it('reject duplicate field', () => {

        mongoService = new MongoService(null, null);

        return mongoService.updateField(res, { name: 'newname', id: testFields[1].id })
        .then(() => {

          expect(res.statusCode).to.equal(409);
        });
      });

    });

    describe('should not', () => {

      it('accept empty id', () => {

        mongoService = new MongoService(null, null);

        return mongoService.updateField(res, { name: 'newname' })
        .then(() => {

          expect(res.statusCode).to.equal(403);
        });
      });

    });


    after(() => {

      return mongoose.model('Page').deleteMany({ _id: [ObjectId(testFields[0].id), ObjectId(testFields[1].id)] });
    });

  });


  describe('removeField', () => {

    let testField;

    before(() => {

      return mongoose.model('Page').create({ name: 'name' })
      .then((field) => {

        testField = field;
      });
    });


    describe('should', () => {

      it('remove field', () => {

        mongoService = new MongoService(null, null);

        return mongoService.removeField(res, testField._id)
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

        mongoService = new MongoService(null, null);

        return mongoService.removeField(res, 'aaaaaaaaaaaaaaaaaaaaaaaa')
        .then(() => {

          expect(res.statusCode).to.equal(404);
        });
      });

    });


    describe('should not', () => {

      it('accept empty id', () => {

        mongoService = new MongoService(null, null);

        return mongoService.removeField(res, null)
        .then(() => {

          expect(res.statusCode).to.equal(404);
        });
      });

    });

  });


  describe('getField', () => {

    before(() => {

      return mongoose.model('Page').insertMany([{ name: 'name1' }, { name: 'name2' }]);
    });


    describe('should', () => {

      it('get field', () => {

        mongoService = new MongoService(null, null);

        return mongoService.getField(res, 'name1')
        .then((field) => {

          expect(res.statusCode).to.equal(200);
          expect(field[0].name).to.equal('name1');
        });
      });

      it('get all fields', () => {

        mongoService = new MongoService(null, null);

        return mongoService.getField(res, null)
        .then((field) => {

          expect(res.statusCode).to.equal(200);
          expect(field).to.have.lengthOf(2);
        });
      });

      it('reject nonexistent field', () => {

        mongoService = new MongoService(null, null);

        return mongoService.getField(res, 'null')
        .then((field) => {

          expect(res.statusCode).to.equal(404);
          expect(field).to.be.an('array').that.is.empty;
        });
      });

    });


    after(() => {

      return mongoose.model('Page').deleteMany({ name: ['name1', 'name2'] });
    });

  });


  after((done) => {

    if (db) {
      db.dropDatabase();
    }

    done();
  });

});
