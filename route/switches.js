var db = require('../config/mongo_database.js');

exports.list = function(req, res) {

  var query = db.switchModel.find();
  query.exec(function(err, results) {
    if (err) {
        console.log(err);
        return res.send(400);
      }

      return res.status(200).json(results)
  });
};