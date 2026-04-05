require('dotenv').config();
const express = require('express');
const connection = require('./configs/database');
const app = express();
const port = process.env.PORT;
const webRoute = require('./routes/route.config');

app.use("/", webRoute);

connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected!!!")
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
