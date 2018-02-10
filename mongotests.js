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
                expect(err).to.equal(null)
            });
        })
    })
    describe("DB insertion", function () {
        it("insert one user into the database", function () {
            expect(db).to.not.equal(null)
        });
    });

    describe("DB Update", function () {
        it("Update one user in the database", function () {
            expect(db).to.not.equal(null)
        });
    });
});