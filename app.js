const express = require('express');
const bodyParser = require('body-parser')
const app = express();

const MongoService = require('./service.js');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended : false}))


app.get(['/api/get/all', '/api/get/:collection'], function (req, res) {
  let mongoService = new MongoService(req, res)

  mongoService.getCollection(res, req.params.collection)
})

app.get(['/api/get/:collection/all', '/api/get/:collection/:field'], function (req, res) {
  let mongoService = new MongoService(req, res)

  mongoService.getField(res, req.params.field)
})

app.post(['/api/add', '/api/add/:name'], function (req, res) {
  let mongoService = new MongoService(req, res)

  mongoService.addField(res, req.params.name)
})

app.delete(['/api/remove', '/api/remove/:name'], function (req, res) {
  let mongoService = new MongoService(req, res)

  mongoService.removeField(res, req.params.name)
})

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(4100, () => console.log('Example app listening on port 4100!'));
