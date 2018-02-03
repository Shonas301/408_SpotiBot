const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

// Example mongodb driver
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("users");
  dbo.collection("users").find({}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    db.close();
  });
});