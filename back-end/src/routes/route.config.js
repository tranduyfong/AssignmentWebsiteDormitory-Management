const express = require('express');
const route = express.Router();

route.use("/home", require('./route.home'));

module.exports = route;