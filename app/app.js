const express = require('express');
const cors = require('cors')
const app = express();

const MongoService = require('./service.js');

app.use(cors({ origin: 'http://localhost:4200' }));


app.get(['/api/get/all', '/api/get/:collection'], function (req, res) {
  let mongoService = new MongoService(req, res)

  return mongoService.getCollection(res, req.params.collection)
  .then((data) => {
    
    res.json({ data: data });
  });
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
