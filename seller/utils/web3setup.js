const Web3 = require('web3');
// const seller_config = require('./seller_config');
const config = require('./loadConfig');

// const web3 = new Web3(new Web3.providers.HttpProvider(seller_config.HTTP_SERVER));
const web3 = new Web3(new Web3.providers.HttpProvider(config.payment.HTTP_SERVER));

// web3.eth.defaultAccount = seller_config.account1;
web3.eth.defaultAccount = config.payment.account;

web3.eth.net.isListening()
    .then(console.log("Listening: web3"))
    .catch(e => console.log('Wow. Something went wrong'));

module.exports = web3;