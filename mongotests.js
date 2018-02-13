/*
 * To run tests
 * $ npm test mongotests.js
 */

const
    dbDriver = require('./mongodriver.js'),
    MongoClient = require('mongodb').MongoClient,
    expect = require('chai').expect,
    mongoUrl = "mongodb://localhost:27017/";

describe("DB Test", function () {
    var db;
    describe("DB connect/setup", function () {
        it("Create a connection to the mongo server", function () {
            MongoClient.connect(mongoUrl, function (err, database) {
                db = database.db("users");
                expect(err).to.equal(null);
                done();
            });
        })
    });

    describe("DB insertion", function () {
        it("insert one user into the database", function () {
            expect(db).to.not.equal(null)

            var time = new Date();
            time.setSeconds(time.getSeconds() + 3600);

            var user = {
                id: 12789175297,
                expires_at: time,
                access_token: "NgCXRK...MzYjw",
                refresh_token: "NgAagA...Um_SHo"
            }

            var result = dbDriver.addUser(db, user);
            result.then((res, rej) => {
                expect(res).to.equal(true);
                done();
            });
        });
    });

    describe("DB Update", function () {
        it("Update one user in the database", function () {
            expect(db).to.not.equal(null)

            var time = new Date();
            time.setSeconds(time.getSeconds() + 3600);

            var user = {
                id: 127459175297,
                expires_at: time,
                access_token: "NgCX5K...Mz6jw",
                refresh_token: "NhAagA...Um_S7o"
            };

            var new_token = "token"
            var result = dbDriver.updateUserAccessToken(db, user,new_token);
            result.then((res, err) => {
                console.log(res)
                expect(res).to.equal(true);
                done();
            }).catch((err) => {
                done(new Error("Failed to update user"))
            });
        });
    });

    describe("DB Fetch Users", function () {
        it("Get all users from database", function (done) {
            expect(db).to.not.equal(null)
            var result = dbDriver.findAllUsers(db);
            result.then((res, rej) => {
                console.log(res);
                expect(res.length > 1).to.equal(true);
                done();
            }).catch((err) => {
                done(err);
            });
        });
    });

    describe("DB Remove", function () {
        it("Attempt to remove empty user", function () {
            expect(db).to.not.equal(null)
            var user = {};
            var result = dbDriver.removeUser(db, user);
            result.then((res, rej) => {
                expect(res).to.not.equal(true);
                done();
            }).catch((err) => {
                done(err);
            });
        });

        it("Remove one user in the database", function () {
            expect(db).to.not.equal(null)
            var user = {
                user_id: -1,
                user_token: "tokens_my_dude_woah",
                refresh_token: "fresh_token_dude",
            };
            var result = dbDriver.removeUser(db, user);
            result.then((res, rej) => {
                expect(res).to.equal(true);
                done();
            }).catch((err) => {
                done(err);
            })
        });
    });

    after(() => {
        var result = dbDriver.emptyCollection((res, rej) => {
            console.log("EMPTYING COLLECTION AFTER TESTING")
            console.log(res)
            done();
        });
    })
});