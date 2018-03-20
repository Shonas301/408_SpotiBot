module.exports = {

  findUser: function (db, user) {
    console.log(user.id)
    if (!db) throw new Error("No DB connection");
    
    return new Promise(function (resolve, reject) {
      db.collection("users").find({"id": user.id } ).toArray((err, result) => {
        if (err) throw err;
        return resolve(result);
      });
    });
  },

  addUser: function (db, user) {
    if (!db) throw new Error("No DB connection");
    if (isEmpty(user)) throw new Error("Attempt to add Empty User");

    return new Promise((resolve, reject) => {
      db.collection('users').insert(
        user, function (err, res) {
          if (err) throw err;
          return resolve(res);
        });
    });
  },


  updateUserAccessToken: function (db, user, new_token) {
    if (!db) throw new Error("No DB connection");
    if (isEmpty(user)) throw new Error("Attempt to add Empty User");

    var query = { "id": user.id }
    return new Promise((resolve, reject) => {
      db.collection('users').updateOne(
        query, {$set: {"access_token": new_token, 'expires_at': new Date() + 3600000}} , function (err, res) {
          if (err) throw err;
          return resolve(res);
        });
    });
  },

  removeUser: function (db, user) {
    if (!db) throw new Error("No DB connection");
    if (isEmpty(user)) throw new Error("Attempt to add Empty User");

    var query = { id: user.id };
    return new Promise((resolve, reject) => {
      db.collection("users").remove(query, function (err, obj) {
        if (err) throw error;
        console.log(obj.result.n + " document(s) deleted");
        return resolve(obj.result.n);
      });
    })
  },

  dropDB: function (db) {
    if (!db) throw new Error("No DB connection");
    return new Promise((resolve, reject) => {
      db.dropDatabase(function (err, res) {
        if (err) throw err;
        db.close();
        resolve(res);
      });
    });
  },

  emptyCollection: function (db) {
    if (!db) throw new Error("No DB connection");
    return new Promise((resolve, reject) => {
      db.collection('users').remove({}, function (err, obj) {
        if (err) throw err;
        resolve(obj.result);
      });
    });
  }
}

// Checks if a json is empty
function isEmpty(obj) {
  return Object.keys(obj).length == 0;
}
