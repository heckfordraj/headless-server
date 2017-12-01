const express = require('express');
const bodyParser = require('body-parser')
const app = express();

const MongoService = require('./service.js');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended : false}))

app.get(['/api/get', '/api/get/:name'], function (req, res) {
  let mongoService = new MongoService(req, res)

  mongoService.getField(req.params.name)
})

app.post(['/api/add', '/api/add/:name'], function (req, res) {
  let mongoService = new MongoService(req, res)

  mongoService.addField(req.params.name)
})

app.delete(['/api/remove', '/api/remove/:name'], function (req, res) {
  let mongoService = new MongoService(req, res)

  mongoService.removeField(req.params.name)
})

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(4100, () => console.log('Example app listening on port 4100!'));
