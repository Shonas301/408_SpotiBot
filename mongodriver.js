module.exports = {

  findAllUsers: function (db) {
    if (!db) {
      console.error("Nil DB connection")
      return;
    }

    return db.collection("users").find({}).toArray(function (err, result) {
      if (err) throw err;
      console.log(result);
      return result;
    });
  },

  addUser: function (db, user) {
    var date = new Date();
    date += 0;

    db.collection('users').updateOne(
      user,
      { upsert: true }, function (err, res) {
        if (err) throw err;
      }
    );

    return true;
  },

  removeUser: function (db, user) {
    var query = { user_id: user.user_id };
    db.collection("users").remove(query, function (err, obj) {
      if (err) throw error;
      console.log(obj.result.n + " document(s) deleted");
    });

    return true;
  }
}
