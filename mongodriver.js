module.exports = {

  findAllUsers: function (db) {
    if (!db) {
      console.error("No DB connection")
      return null;
    }

    return db.collection("users").find({}).toArray(function (err, result) {
      if (err) throw err;
      console.log(result);
      return result;
    });
  },

  addUser: function (db, user) {
    if (isEmpty(user)) return false;

    db.collection('users').insert(
      user,function (err, res) {
        if (err) throw err;
      }
    );

    return true;
  },

  removeUser: function (db, user) {
    if (isEmpty(user)) return false;

    var query = { user_id: user.user_id };
    db.collection("users").remove(query, function (err, obj) {
      if (err) throw error;
      console.log(obj.result.n + " document(s) deleted");
    });

    return true;
  }
}

// Checks if a json is empty
function isEmpty(obj) {
  return Object.keys(obj).length == 0;
}