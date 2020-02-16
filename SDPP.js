const { spawn } = require('child_process');
const { exec } = require('child_process');
const client_name = process.argv[2];
const client = "./server/" + client_name + ".js";

const seller = require('../SDPP/seller/test_main');
//const sdpp = spawn('node', [client]);
// const child = exec('node ./seller/index.js',(error, stdout, stderr) => {
//     if (error) {
//       throw error;
//     }
//     console.log(stdout);
//   });

seller.seller();