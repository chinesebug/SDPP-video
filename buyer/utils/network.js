const fs = require('fs');
const config = require('./loadConfig');
// const app = require('express')();
const bodyParser = require('body-parser');

const express = require('express');
const app = express();

const path = require('path');
// const fs = require("fs");

app.get('/', (req,res) =>{
    res.sendFile(path.join(__dirname, '../index.html'));
})

app.use("/data", express.static('../data/'));

if(config.client == ' seller'){
    const io = require('socket.io').listen(process.env.PORT || 3000);
    module.exports = {io}
}else{
    const sdpp_client = require('socket.io-client');
    const client_socket =  sdpp_client.connect('http://localhost:3000');

    const client_server = require('http').Server(app);
    const io = require('socket.io')(client_server);
    client_server.listen(8080);

    module.exports = {io, client_socket}
}

