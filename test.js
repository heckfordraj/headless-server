const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const chai = require('chai');
const expect = chai.expect;
var httpMocks = require('node-mocks-http');

const MongoService = require('./service.js');
const req = httpMocks.createResponse();


describe('Server', function () {

  let db;

  before(function(done){

    mongoose.connect('mongodb://localhost/abc', { useMongoClient: true })
    .then((database) => {

      db = database;
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

  it("should connect to empty test db", (done) => {

    db.db.listCollections().toArray(function(err, names) {

      if (err) {

        done(new Error(err));

      } else {

        expect(names.length).to.equal(0);
        done();
      }
    });

  });

});
