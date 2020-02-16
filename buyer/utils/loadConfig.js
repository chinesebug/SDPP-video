// module.exports = {
//     //iota
//     sender_seed : 'RAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHUL9RAHUL',
//     recv_address :'HELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDD',

//     //web3
//     account1 : '0xFb05Aab59e5d1EE9F62B7eA0a349Dcc402f2f8f7',
//     privateKey1 : 'ae3439bcdc8d961030684468caf5f92ff71dff4ec4f68e86b7cb137717a9ed0a',
//     HTTP_SERVER : 'HTTP://127.0.0.1:7545',
//     CONTRACT_ADDRESS : '0x25F4704932D83282E266BcE1d05021846ba262d6',
//     payment_type : '',

//     //chunk size K and price
//     K : '300',
//     price : 1
// }
const fs = require('fs');

let rawdata = fs.readFileSync('../buyer/config/config.json');
let config = JSON.parse(rawdata);

module.exports = config;