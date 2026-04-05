const express = require('express');
const { sayHello } = require('../controllers/home.controller');
const route = express.Router();

route.get("/", sayHello);

module.exports = route;