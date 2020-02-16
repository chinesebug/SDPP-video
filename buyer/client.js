const express = require('express');
const app = express();
const path = require('path');
const fs = require("fs");
const inquirer = require('inquirer');
//display data to web page
const client_server = require('http').Server(app);
const io = require('socket.io')(client_server);

app.get('/', (req,res) =>{
  res.sendFile(path.join(__dirname, 'index.html'));
})

app.use("/static", express.static('./static/'));

//connect to sdpp server to get data
const sdpp_client = require('socket.io-client');
//const client_socket =  sdpp_client.connect('http://seller:3000');
const client_socket =  sdpp_client.connect('http://localhost:3000');

//
const config = require('./buyer_config');
var iota, sender_seed, recv_address;
//set up iota
console.log(config.payment.currency == 'iota');
if(config.payment.currency == 'iota' || config.record.platform == 'iota'){
  iota = require('./iotaModule');
  sender_seed = 'RAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHUL9RAHUL';
  recv_address ='HELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDD';
}
//web3 

  const Tx = require('ethereumjs-tx');
  const web3 = require('./utils/web3setup');
  var contract = require('./contract');
  const keys = require('./keys');
  // const buyer_conifg = require('./buyer_config');
  var escrow = require('./escrow');
  // const account2 = '0x8Cee03568EfE66D2F4046a04ea36c413394c6951';
  // const privateKey2 = '782ca5bcd50a61993a3077ac1138e8270800e26239fefc8611f79d35e361c461';

  const account1 = '0xFb05Aab59e5d1EE9F62B7eA0a349Dcc402f2f8f7';
  const privateKey1 = 'ae3439bcdc8d961030684468caf5f92ff71dff4ec4f68e86b7cb137717a9ed0a';

// database
var db;
if(config.record.platform == 'database'){
  db = require("./db");
}

var hash = '';
var payment_granularity = 0;
var cost = 2;
var pay = 1;
////////video//////////
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

function pad(num, size) {
  var s = num+"";
  while (s.length < size) s = "0" + s;
  return s;
}

/////////encryption////////////
const crypto = require('crypto');
const keyOptions = [{
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
    //cipher: 'aes-256-cbc',
    //passphrase: 'top secret 1'
  }
}, {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
    //cipher: 'aes-256-cbc',
    //passphrase: 'top secret 2'
  }
}]

const [
  { publicKey: encrypt_public_key, privateKey: encrypt_key },
  { publicKey: signature_public_key, privateKey: signature_key }
] = keyOptions.map(options => crypto.generateKeyPairSync('rsa', options))

console.log(encrypt_public_key);

//sign
const sign = crypto.createSign('RSA-SHA256');
var verify = crypto.createVerify('RSA-SHA256');
var seller_public_key = "";
var session_key = "";
var cipher;
var decipher;
var pre_hash;

//crypto functions
function encrypt(text, myKey) {
  let iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(myKey), iv);
  let encrypted = cipher.update(text);
 
  encrypted = Buffer.concat([encrypted, cipher.final()]);
 
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text, myKey) {
 text =text.toString();
  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(myKey), iv);
  let decrypted = decipher.update(encryptedText);
 
  decrypted = Buffer.concat([decrypted, decipher.final()]);
 
  return decrypted.toString();
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function prepareOrderData(payment_type, pub_key){
  var json_data = {}

  json_data.payment_type = payment_type;
  json_data.pub_key = pub_key;

  return JSON.stringify(json_data);
}


console.log(config);
///////network ////////
async function enterOrder(){
  if(config.payment.currency == ''){
    console.log('***** Choose payment *****')
    inquirer
      .prompt([
        {
          name: 'pay_type',
          message: 'Chose the no. of payment method? Enter 1.iota; 2.eth; 3.stripe',
          //default: 'Alligators, of course!',
        }
      ])
      .then(answers => {
        pay = answers.pay_type;
        if(pay == 1){
          console.log('buyer chose iota');
        }else if(pay ==2){
          console.log('buyer chose eth');
        }else{
          console.log('buyer chose stripe');
        }
        
        client_socket.emit('chose payment', pay);
      });
  }else{
    if(config.payment.currency == 'iota'){
      pay = 1;
    }else if(config.payment.currency == 'eth'){
      pay = 2;
    }else{
      pay = 3;
    }
    
    var order = prepareOrderData(pay, encrypt_public_key);
    client_socket.emit('order info', order);
  }
}

//get hash
try{
  pre_hash = escrow.getHash((newhash)=>{
    hash1 = newhash;
    console.log("new:",newhash.toString());
  });
}catch(err){
  console.log(err);
}

//data from SDPP server
client_socket.on('connect', function(){
  console.log('Connected to SDPP server')
  var img_count = 1;
  escrow.buyerDeposit(12);
  console.log('**********Buyer deposited ***********');

  // client_socket.emit('encrypt_public_key',encrypt_public_key);
  // console.log("sent key");

  enterOrder();

  client_socket.on('session_key', function(key){
    session_key = crypto.privateDecrypt(encrypt_key,Buffer.from(key));
    console.log('Received session_key: \n'+ session_key.toString('hex'))
    client_socket.emit('ready');
  });

  client_socket.on('image',function(data){
    const image = decrypt(data, session_key);
    img_count++;
    const imageBuffer = new Buffer.from(image, "base64");
    const filename = '../buyer/data/frames-' + pad(img_count,4) +'.jpg';
    fs.writeFileSync(filename, imageBuffer);
    console.log('image from sdpp server, forward to browser')
    
    //console.log(image);
    
    io.to('lobby').emit('image', image);
    //client_socket.emit('ACK');
  })

  client_socket.on('DATA_INVOICE',function(data){
    //io.to('lobby').emit('DATA_INVOICE',data);
    async function payment(){
      try{
        console.log('**** Received Innovice ****')
        console.log('* Processing payment...')
        payment_granularity = data
        payment_invoice = "Sent: " + payment_granularity;
        payment_invoice += "\nPayment: " + payment_granularity*cost;
        ////choose iota or eth////
        if(pay == 1){
          console.log('* paying with iota');
          hash = await iota.sendTokens(sender_seed, recv_address, 0, payment_invoice);
          console.log('Sent payment transaction_hash:',hash);
          console.log('****************************')


          client_socket.emit('PAYMENT_ACK',hash);
          io.to('lobby').emit('PAYMENT_ACK',hash);


          if(config.record.platform == "database"){

            console.log('record on database')
            
            db.connect((err) =>{
              if(err){
                  console.log('unable to connect');
          
              }else{
                  //console.log('connected');
                  const collection = db.getDB().collection('records');
                  db.insertMongodb(collection, 'buyer_paid')
                  .then((result) => {
                      console.log(`Successfully inserted ${result.length} documents into mongodb`);
          
                      const options = {'sort': [['value', 'desc']]};
                      collection.findOne({},options,(err,doc) => {
                          if(err) throw err;
                          console.log(`MongoDB: payment recorded ${hash}`);
                      })
                      //console.timeEnd('mongdodb');
          
                      //db.close();
                  })
                  .catch((err)=>{
                      console.log(err);
                      process.exit();
                  })
              }
          })
          }
        }else if(pay ==2){
          console.log('* paying with eth');
          web3.eth.getTransactionCount(web3.eth.defaultAccount)
            .then(txCount => {
              // create Tx object
              const rawTx = {
                nonce: web3.utils.toHex(txCount),
                gasLimit: web3.utils.toHex(800000),
                gasPrice: web3.utils.toHex(15e10),
                //from: account2,
                to: account1,
                value: payment_granularity*cost,
                data: 'SDPP'
              }
              // sign the transaction and serialize
              PVK = new Buffer.from(config.payment.privateKey, 'hex')
              const tx = new Tx(rawTx);
              tx.sign(PVK);
              const serializedTx = tx.serialize();
        
              web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
              .once('transactionHash', function (eth_hash) {
                hash = eth_hash;
                console.log('Sent payment transaction_hash:',eth_hash);
                console.log('****************************')
                client_socket.emit('PAYMENT_ACK',hash);
                io.to('lobby').emit('PAYMENT_ACK',hash);
                //console.log('Tx_Hash: ', eth_hash)
              })
              .on('error', console.error);
          });
        }else{
          console.log('Using stripe');
          //var SKU = 'sku_GNxSnVRccQPCAk';
          io.to('lobby').emit('STRIPE_INVOICE', data);
          console.log('session id:', data);
          io.on('stripe_paid',function(data){
             console.log('paid on webpage', data);
             client_socket.emit('PAYMENT_ACK',SKU);
           })
        }
        
        // console.log('Sent payment transaction_hash:',hash);
        // console.log('****************************')
      }catch(e){
        console.log(e);
      }
    }
    payment();
  })

  client_socket.on('Sent All',() => {
    escrow.buyerConfirm();
    console.log("*********************************");
    console.log('buyer receieved all and confirmed');
    console.log("*********************************");

    var proc = ffmpeg('../buyer/data/frames-%04d.jpg')
      .inputFPS(36)
      .fps(36)
      // setup event handlers
      .on('end', function() {
        console.log('file has been converted succesfully');
      })
      .on('error', function(err) {
        console.log('an error happened: ' + err.message);
      })
      .save('your_target.mp4');


    sleep(3000).then(()=>{
      escrow.refundBuyer();
    
      var post_hash = "";
      var name = 'your_target.mp4';

      var hash = crypto.createHash('sha256'),
      stream = fs.createReadStream(name);

      stream.on('data', function(data) {
      hash.update(data, 'utf8')
      })

      stream.on('end', function() {
          post_hash =  hash.digest('hex');
          console.log("post_hash:",post_hash);
          console.log("pre_hash:", pre_hash);
          // 34f7a3113803f8ed3b8fd7ce5656ebec
      })
    });

  });
})

//connection to the web display
io.sockets.on('connection',(socket) =>{
  console.log('Connected to web page display');
  socket.join('lobby');
  socket.on('image',(data) =>{
    console.log('forward')
    client_socket.emit('image',data);
  })

  socket.on('DATA_INVOICE',(data) =>{
    console.log('forward DATA_INVOICE');
    client_socket.emit('DATA_INVOICE',data);
  })

  socket.on('stripe_paid',function(){
    
  })

});

io.sockets.on('stripe_paid',(socket)=>{
  console.log('after pay from web')
    client_socket.emit('PAYMENT_ACK','stripe');
})

client_server.listen(8080);
