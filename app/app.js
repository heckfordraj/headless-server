const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
const bodyParser = require('body-parser');
const app = express();

const config = require('../config.json');
const MongoService = require('./service.js');
const UploadService = require('./upload.js');

const env = process.env.NODE_ENV || 'dev';

let log = function(){};

if (env !== 'test') {

  log = console.log;

  mongoose.connect(config[env].mongodb, {
    useMongoClient: true
  });
}

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(bodyParser.json());


app.get(['/image', '/image/:id'], function (req, res) {

  log(`getImage: id: ${req.params.id}`);

  let uploadService = new UploadService(req, res);

  return uploadService.getImage(req.params.id);
})

app.post('/upload', function (req, res) {

  log('addImage');

  let uploadService = new UploadService(req, res);

  return uploadService.addImage()
  .then((data) => {

    res.json(data);
  });
})

app.get('/api/get', function (req, res) {

  log('getCollections');

  let mongoService = new MongoService(res);

  return mongoService.getCollections()
  .then((data) => {

    res.json(data);
  });
})

app.get(['/api/get/:collection', '/api/get/:collection/:id'], function (req, res) {

  log(`getField: collection: ${req.params.collection}, field id: ${req.params.id || ''}`);

  let mongoService = new MongoService(res);

  return mongoService.getField(req.params.id)
  .then((data) => {

    res.json(data);
  });
})

app.post('/api/add', function (req, res) {

  log(`addField: collection: page, field name: ${req.body.name || ''}`);

  let mongoService = new MongoService(res);

  return mongoService.addField(req.body)
  .then((data) => {

    res.json(data);
  });
})

app.post('/api/add/field', function (req, res) {

  log(`addSubField: collection: page, field id: ${req.body.id || ''}, subfield type: ${req.body.data ? req.body.data.type : ''}`);

  let mongoService = new MongoService(res);

  return mongoService.addSubField(req.body)
  .then((data) => {

    res.json(data);
  });
})

app.put('/api/update', function (req, res) {

  log(`updateField: collection: page, field id: ${req.body.id || ''}`);

  let mongoService = new MongoService(res);

  return mongoService.updateField(req.body)
  .then((data) => {

    res.json(data);
  });
})

app.put('/api/update/field', function (req, res) {

  log(`updateSubField: collection: page, field id: ${req.body.id || ''}, subfield type: ${req.body.data ? req.body.data.type : ''}`);

  let mongoService = new MongoService(res);

  return mongoService.updateSubField(req.body)
  .then((data) => {

    res.json(data);
  });
})

app.delete(['/api/remove', '/api/remove/:id'], function (req, res) {

  log(`removeField: collection: page, field id: ${req.params.id || ''}`);

  let mongoService = new MongoService(res);

  return mongoService.removeField(req.params.id)
  .then((data) => {

    res.json(data);
  });
})

app.delete('/api/remove/:id/:subid', function (req, res) {

  log(`removeSubField: collection: page, field id: ${req.params.id || ''}, subfield id: ${req.params.subid || ''}`);

  let mongoService = new MongoService(res);

  return mongoService.removeSubField(req.params.id, req.params.subid)
  .then((data) => {

    res.json(data);
  });
})

app.listen(4100, () => log('Server listening on port 4100'));
