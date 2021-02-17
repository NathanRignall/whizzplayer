// import dependancies
var express = require("express");
var logger = require("morgan");
var crypto = require("crypto");
var responseFormat = require("./functions/response");
var player = require("./functions/player")();

// make the some modules global
global.responseFormat = responseFormat;
global.player = player;

// import the routes after globals
var indexRouter = require("./routes/index");
var playRouter = require("./routes/play");
var testRouter = require("./routes/test");

// setup the app
var app = express();

// setup the middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(function (req, res, next) {
    res.locals.success = false;
    res.locals.errors = [];
    res.locals.logID = crypto.randomBytes(20).toString("hex");
    next();
});

// finally load the routes
app.use("/", indexRouter);
app.use("/play", playRouter);
app.use("/status", playRouter);
app.use("/test", testRouter);

// export app
module.exports = app;
