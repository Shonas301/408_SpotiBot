/*
 * To run tests
 * $ npm test mongotests.js
 */

const
    dbDriver = require('./mongodriver.js'),
    MongoClient = require('mongodb').MongoClient,
    expect = require('chai').expect,
    mongoUrl = "mongodb://127.0.0.1:27017/";

describe("DB Test", function () {
    var db;
    before(() => {
        MongoClient.connect(mongoUrl, function (err, database) {
            db = database.db("users");
            expect(err).to.equal(null);
        });
    })

    describe("DB insertion", function () {
        it("insert one user into the database", function () {
            expect(db).to.not.equal(null)

            var time = new Date();
            time.setSeconds(time.getSeconds() + 3600);

            var user = {
                id: 127,
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

    describe("DB Fetch User", function () {
        it("Get user from database", function (done) {
            expect(db).to.not.equal(null)
            var user_to_find = {
                id: 127,
                access_token: "NgCX5K...Mz6jw",
                refresh_token: "NhAagA...Um_S7o"
            };

            var result = dbDriver.findUser(db, user_to_find);
            result.then((res, rej) => {
                expect(res[0].id == user_to_find.id).to.equal(true);
                done();
            }).catch((err) => {
                done(err);
            });
        });
    });

    describe("DB Update", function () {
        it("Update one user in the database", function () {
            expect(db).to.not.equal(null)
            var time = new Date();
            time.setSeconds(time.getSeconds() + 3600);

            var user = {
                id: 127,
                expires_at: time,
                access_token: "NgCX5K...Mz6jw",
                refresh_token: "NhAagA...Um_S7o"
            };

            var new_token = "token"
            var result = dbDriver.updateUserAccessToken(db, user, new_token);
            result.then((res, rej) => {
                expect(res).to.equal(true);
            }).then(() => {
                done();
            }).catch((err) => {
                done(new Error("Failed to update user"))
            });
        });
    });

    describe("DB Remove", function () {
        it("Remove one user in the database", function () {
            expect(db).to.not.equal(null)
            var user = {
                user_id: 127,
                user_token: "tokens_my_dude_woah",
                refresh_token: "fresh_token_dude",
            };
            var result = dbDriver.removeUser(db, user);
            result.then((res, rej) => {
                expect(res).to.equal(true);
                done();
            }).catch((err) => {
                done(err);
            });
        });
    });
});
