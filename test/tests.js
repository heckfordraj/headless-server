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

      done(new Error("Failed to connect to MongoDB"));
    });
  });


  it("should connect to MongoDB", () => {

    let connectionStatus = mongoose.connection.readyState;
    expect(connectionStatus).to.equal(1);
  });

  it("should connect to empty db", () => {

    return mongoose.model('Collection').count()
    .then((res) => {

      expect(res).to.equal(0);
    })
  });


  describe('addField', () => {

    describe('should', () => {

      it("add field", () => {

        mongoService = new MongoService(null, null);

        return mongoService.addField(req, 'testname1')
        .then(() => {

          expect(req.statusCode).to.equal(201);
        });
      });

      it("write field", () => {

        return mongoose.model('Collection').count()
        .then((res) => {

          expect(res).to.equal(1);
        })
      });

    });


    describe('should not', () => {

      it("accept empty name", () => {

        mongoService = new MongoService(null, null);

        return mongoService.addField(req, null)
        .then(() => {

          expect(req.statusCode).to.equal(200);
        });
      });

      it("accept duplicate name", () => {

        mongoService = new MongoService(null, null);

        return mongoService.addField(req, 'testname1')
        .then(() => {

          expect(req.statusCode).to.equal(409);
        });
      });

      it("write duplicate name", () => {

        return mongoose.model('Collection').count()
        .then((res) => {

          expect(res).to.equal(1);
        })
      });

    });

  });


  describe('getField', () => {

    before(() => {

      mongoService = new MongoService(null, null);

      return mongoService.addField(req, 'testname2');
    });


    describe('should', () => {

      it("get field", () => {

        mongoService = new MongoService(null, null);

        return mongoService.getField(req, 'testname1')
        .then((res) => {

          expect(req.statusCode).to.equal(200);
          expect(res[0].name).to.equal('testname1');
        });
      });

      it("get all fields", () => {

        mongoService = new MongoService(null, null);

        return mongoService.getField(req, null)
        .then((res) => {

          expect(req.statusCode).to.equal(200);
          expect(res).to.have.lengthOf(2);
        });
      });

    });


    describe('should not', () => {

      it("get nonexistent field", () => {

        mongoService = new MongoService(null, null);

        return mongoService.getField(req, 'testname3')
        .then((res) => {

          expect(req.statusCode).to.equal(404);
        });
      });

    });

  });


  after((done) => {

    if (db) {
      db.dropDatabase();
    }

    done();
  });

});
