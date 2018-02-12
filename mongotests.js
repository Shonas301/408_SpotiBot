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
            });
        })
    })

    describe("DB insertion", function () {
        it("insert one user into the database", function () {
            expect(db).to.not.equal(null)
            var user = {
                user_id: 2,
                user_token: "tokens_my_dude",
                refresh_token: "fresh_token_dude",
            };

            var result = dbDriver.addUser(db, user);
            expect(result).to.equal(true);
        });
    });

    describe("DB Update", function () {
        it("Update one user in the database", function () {
            expect(db).to.not.equal(null)
            var user = {
                user_id: -1,
                user_token: "tokens_my_dude_woah",
                refresh_token: "fresh_token_dude",
            };

            var result = dbDriver.addUser(db, user);
            expect(result).to.equal(true);
        });
    });

    describe("DB Fetch Users", function () {
        it("Get all users from database", function () {
            expect(db).to.not.equal(null)
            var result = dbDriver.findAllUsers(db)
            expect(result.length > 1).to.equal(true);
        });
    });

    describe("DB Remove", function () {
        it("Attempt to remove empty user", function () {
            expect(db).to.not.equal(null)
            var user = {};
            var result = dbDriver.removeUser(db, user);
            expect(result).to.not.equal(true);
        });

        it("Remove one user in the database", function () {
            expect(db).to.not.equal(null)
            var user = {
                user_id: -1,
                user_token: "tokens_my_dude_woah",
                refresh_token: "fresh_token_dude",
            };
            var result = dbDriver.removeUser(db, user);
            expect(result).to.equal(true);
        });
    });
});