const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const app = express();

const MongoService = require('./service.js');
const UploadService = require('./upload.js');

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(bodyParser.json());


app.post('/upload', function (req, res) {

  console.log('uploadImage' + req.file);

  let uploadService = new UploadService(req, res);
  return uploadService.uploadImage()
  .then((data) => {

    res.json(data);
  });
})

app.get('/api/get', function (req, res) {
  let mongoService = new MongoService(req, res)

  console.log(`getCollection: ${req.params.collection}`);

  return mongoService.getCollection(res, req.params.collection)
  .then((data) => {

    res.json(data);
  });
})

app.get(['/api/get/:collection', '/api/get/:collection/:id'], function (req, res) {
  let mongoService = new MongoService(req, res)

  console.log(`getField: collection: ${req.params.collection}, field id: ${req.params.id || ''}`);

  return mongoService.getField(res, req.params.id)
  .then((data) => {

    res.json(data);
  });
})

app.post('/api/add', function (req, res) {
  let mongoService = new MongoService(req, res)

  console.log(`addField: collection: page, field name: ${req.body.name || ''}`);

  return mongoService.addField(res, req.body)
  .then((data) => {

    res.json(data);
  });
})

app.post('/api/add/field', function (req, res) {
  let mongoService = new MongoService(req, res)

  console.log(`addSubField: collection: page, field id: ${req.body.id || ''}, subfield type: ${req.body.data.type || ''}`);

  return mongoService.addSubField(res, req.body)
  .then((data) => {

    res.json(data);
  });
})

app.put('/api/update', function (req, res) {
  let mongoService = new MongoService(req, res)

  console.log(`updateField: collection: page, field id: ${req.body.id || ''}`);

  return mongoService.updateField(res, req.body)
  .then((data) => {

    res.json(data);
  });
})

app.put('/api/update/field', function (req, res) {
  let mongoService = new MongoService(req, res)

  console.log(`updateSubField: collection: page, field id: ${req.body.id || ''}, subfield type: ${req.body.data.type || ''}`);

  return mongoService.updateSubField(res, req.body)
  .then((data) => {

    res.json(data);
  });
})

app.delete(['/api/remove', '/api/remove/:id'], function (req, res) {
  let mongoService = new MongoService(req, res)

  console.log(`removeField: collection: page, field id: ${req.params.id || ''}`);

  return mongoService.removeField(res, req.params.id)
  .then((data) => {

    res.json(data);
  });
})

app.delete('/api/remove/:id/:subid', function (req, res) {
  let mongoService = new MongoService(req, res)

  console.log(`removeSubField: collection: page, field id: ${req.params.id || ''}, subfield id: ${req.params.subid || ''}`);

  return mongoService.removeSubField(res, req.params.id, req.params.subid)
  .then((data) => {

    res.json(data);
  });
})

app.listen(4100, () => console.log('Server listening on port 4100'));
