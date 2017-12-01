var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test', {
  useMongoClient: true
});

var Schema = mongoose.Schema;

var fieldSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true
  }
});

var Field = mongoose.model('Field', fieldSchema);


class MongoService{
  constructor(req, res){
    this.req = req
    this.res = res
  }

  addField(name){

    let self = this;

    if (!name) {
      return self.res.status(200).send('No Content');
    }

    Field.create({ name: name }, function (error, res) {

      if (error) {

        console.log(error);

        if (error.code === 11000) {

          return self.res.status(409).send('Conflict');

        } else {

          return self.res.status(500).send('Error');
        }
      }

      self.res.status(201).send('Created');
    });
  }


  removeField(name) {

    let self = this;

    if (!name) {
      return self.res.status(404).send('Not Found');
    }

    Field.findOneAndRemove({ name: name }, function (error, res) {

      if (error) {

        console.log(error);
        return self.res.status(500).send('Error');

      } else if (!res) {

        return self.res.status(404).send('Not Found');
      }

      self.res.status(204).send('No Content');
    });
  }


  getField(name){

    let self = this;
    let query = {};

    if (name) {
      query.name = name;
    }

    Field.find(query, function(error, res) {

      if (error) {

        console.log(error);
        return self.res.status(500).send('Error');
      }

      console.log(res);

      if (res.length > 0) {

        return self.res.status(200).send('Fetched');

      } else {

        return self.res.status(404).send('Not Found');
      }
    });
  }

}
module.exports = MongoService
