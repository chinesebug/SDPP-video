const fs = require('fs');

const app = require('express')();
const bodyParser = require('body-parser');

const io = require('socket.io').listen(process.env.PORT || 3000);

module.exports = {io}