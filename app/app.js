const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const app = express();

const MongoService = require('./service.js');

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(bodyParser.json());

app.get('/api/get', function (req, res) {
  let mongoService = new MongoService(req, res)

  console.log(`getCollection: ${req.params.collection}`);

  return mongoService.getCollection(res, req.params.collection)
  .then((data) => {

    res.json(data);
  });
})

app.get(['/api/get/:collection', '/api/get/:collection/:field'], function (req, res) {
  let mongoService = new MongoService(req, res)

  console.log(`getField: collection: ${req.params.collection}, field: ${req.params.field || ''}`);

  return mongoService.getField(res, req.params.field)
  .then((data) => {

    res.json(data);
  });
})

app.post('/api/add', function (req, res) {
  let mongoService = new MongoService(req, res)

  console.log(`addField: collection: page, field: ${req.body.name || ''}`);

  return mongoService.addField(res, req.body)
  .then((data) => {

    res.json(data);
  });
})

app.put('/api/update', function (req, res) {
  let mongoService = new MongoService(req, res)

  console.log(`updateField: collection: page, field: ${req.body.name || ''}`);

  return mongoService.updateField(res, req.body)
  .then((data) => {

    res.json(data);
  });
})

app.delete(['/api/remove', '/api/remove/:id'], function (req, res) {
  let mongoService = new MongoService(req, res)

  mongoService.removeField(res, req.params.id)
})

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(4100, () => console.log('Example app listening on port 4100!'));
