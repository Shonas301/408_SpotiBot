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

  addUser: function (db) {
    var date = new Date();
    date += 0;

    db.collection('users').updateOne(
      {
        user_id: 0,
        user_token: "",
        refresh_token: "",
        expires_at: date,
      },
      { upsert: true }
    );
  },

  removeUser: function (db, id) {
    var query = { user_id: id };
    return db.collection("users").remove(query, function (err, obj) {
      if (err) {
        console.error(err)
        return false
      }
      console.log(obj.result.n + " document(s) deleted");
      return true
    });
  }
}
