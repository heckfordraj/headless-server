const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const chai = require('chai');
const expect = chai.expect;
const httpMocks = require('node-mocks-http');
const randomstring = require('randomstring').generate(5);

const MongoService = require('../service.js');
const req = httpMocks.createResponse();


describe('Server', () => {

  let db;

  beforeEach((done) => {

    mongoose.connect('mongodb://localhost/' + randomstring, { useMongoClient: true })
    .then((database) => {

      db = database;
      mongoose.model('Collection').ensureIndexes();

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

      return mongoose.model('Collection').count()
      .then((res) => {

        expect(res).to.equal(0);
      })
    });

  });


  describe('getCollection', () => {

    describe('should', () => {

      it('get collection', () => {

        mongoService = new MongoService(null, null);

        return mongoService.getCollection(req, 'collections')
        .then((res) => {

          expect(req.statusCode).to.equal(200);
          expect(res[0].name).to.equal('collections');
        });
      });

      it('get all collections');

      it('reject nonexistent collection', () => {

        mongoService = new MongoService(null, null);

        return mongoService.getCollection(req, 'null')
        .then((res) => {
          expect(req.statusCode).to.equal(404);
          expect(res).to.be.an('array').that.is.empty;
        });
      });

    });

  });


  describe('addField', () => {

    describe('should', () => {

      it('add field', () => {

        mongoService = new MongoService(null, null);

        return mongoService.addField(req, 'name')
        .then(() => {

          expect(req.statusCode).to.equal(201);
        });
      });

      it('add field to database', () => {

        return mongoose.model('Collection').count()
        .then((res) => {

          expect(res).to.equal(1);
        })
      });

      it('reject duplicate name', () => {

        mongoService = new MongoService(null, null);

        return mongoService.addField(req, 'name')
        .then(() => {

          expect(req.statusCode).to.equal(409);
        });
      });

    });


    describe('should not', () => {

      it('accept empty name', () => {

        mongoService = new MongoService(null, null);

        return mongoService.addField(req, null)
        .then(() => {

          expect(req.statusCode).to.equal(200);
        });
      });

    });


    after(() => {

      return mongoose.model('Collection').deleteOne({ name: 'name' });
    });

  });


  describe('removeField', () => {

    before(() => {

      return mongoose.model('Collection').create({ name: 'name' });
    });


    describe('should', () => {

      it('remove field', () => {

        mongoService = new MongoService(null, null);

        return mongoService.removeField(req, 'name')
        .then(() => {

          expect(req.statusCode).to.equal(204);
        });
      });

      it('remove field from database', () => {

        return mongoose.model('Collection').count()
        .then((res) => {

          expect(res).to.equal(0);
        })
      });

      it('reject nonexistent field', () => {

        mongoService = new MongoService(null, null);

        return mongoService.removeField(req, 'name1')
        .then(() => {

          expect(req.statusCode).to.equal(404);
        });
      });

    });


    describe('should not', () => {

      it('accept empty name', () => {

        mongoService = new MongoService(null, null);

        return mongoService.removeField(req, null)
        .then(() => {

          expect(req.statusCode).to.equal(404);
        });
      });

    });

  });


  describe('getField', () => {

    before(() => {

      return mongoose.model('Collection').insertMany([{ name: 'name1' }, { name: 'name2' }]);
    });


    describe('should', () => {

      it('get field', () => {

        mongoService = new MongoService(null, null);

        return mongoService.getField(req, 'name1')
        .then((res) => {

          expect(req.statusCode).to.equal(200);
          expect(res[0].name).to.equal('name1');
        });
      });

      it('get all fields', () => {

        mongoService = new MongoService(null, null);

        return mongoService.getField(req, null)
        .then((res) => {

          expect(req.statusCode).to.equal(200);
          expect(res).to.have.lengthOf(2);
        });
      });

      it('reject nonexistent field', () => {

        mongoService = new MongoService(null, null);

        return mongoService.getField(req, 'null')
        .then((res) => {

          expect(req.statusCode).to.equal(404);
          expect(res).to.be.an('array').that.is.empty;
        });
      });

    });


    after(() => {

      return mongoose.model('Collection').deleteMany({ name: ['name1', 'name2'] });
    });

  });


  after((done) => {

    if (db) {
      db.dropDatabase();
    }

    done();
  });

});
