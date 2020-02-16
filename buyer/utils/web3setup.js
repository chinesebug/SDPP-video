const Web3 = require('web3');
//const keys = require('./keys');
const config = require('./loadConfig');
// const fs = require('fs');
const account = config.payment.HTTP_SERVER;
// let rawdata = fs.readFileSync('config.json');
// let config = JSON.parse(rawdata);

//const web3 = new Web3(new Web3.providers.HttpProvider(keys.HTTP_SERVER));
// const web3 = new Web3(new Web3.providers.HttpProvider(buyer_config.HTTP_SERVER));
const web3 = new Web3(new Web3.providers.HttpProvider(config.payment.HTTP_SERVER));
// web3.eth.defaultAccount = buyer_config.account2;
web3.eth.defaultAccount = config.payment.account;
web3.eth.net.isListening()
    .then(console.log("Listening: web3"))
    .catch(e => console.log('Wow. Something went wrong'));

module.exports = web3;