module.exports = {

  findAllUsers: function (db) {
    if (!db) {
      console.error("Nil DB connection")
      return;
    } 

    db.collection("users").find({}).toArray(function (err, result) {
      if (err) throw err;
      console.log(result);
    });
  }
}
