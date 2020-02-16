const path = require('path');
const fs = require('fs');

const app = require('express')();
const bodyParser = require('body-parser');
const env = require("dotenv").config({ path: "./.env" });
// const seller_config = require('./seller_config');
//socket.io
const io = require('socket.io').listen(process.env.PORT || 3000);
// read config and setup accordingly
const config = require('./utils/loadConfig');

// set up iota
  const iota = require('./utils/iotaModule');
  const sender_seed = 'RAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHUL9RAHUL';
  const recv_address ='HELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDD';

//web3 
  const Tx = require('ethereumjs-tx');
  const web3 = require('./utils/web3setup');
  var contract = require('./utils/contract');
  var escrow = require('./utils/escrow');
  //
  const account2 = '0x8Cee03568EfE66D2F4046a04ea36c413394c6951';
  const privateKey2 = '782ca5bcd50a61993a3077ac1138e8270800e26239fefc8611f79d35e361c461';

//database
var db;
if(config.record.platform == 'database'){
  db = require("./utils/db");
}

if(config.payment.currency == 'usd'){
//webhook secret
const endpointSecret = 'whsec_Ql3y2uPjrHxpLePhzwrUp8UXl5jDbt5z';
}

app.listen(8001, () => console.log('Running on port 8001'));


//////////crytography//////////////
const crypto = require('crypto');

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
    //cipher: 'aes-256-cbc',
    //passphrase: 'top secret'
  }
});

const key = privateKey;
const seller_public_key = publicKey;
var encrypt_public_key = '';
//console.log('pub: '+ publicKey)
//console.log('private: ' + privateKey)

//generate privateKey
var hash = crypto.createHash('sha256')
var randomBytes = crypto.randomBytes(32);
hash.update(randomBytes);
const secret_key = hash.digest();

/////////video prep////////////
var hash2 = crypto.createHash('sha256');
var stream = fs.createReadStream('your_target.mp4')

stream.on('data', function(data) {
  hash2.update(data, 'utf8')
})

stream.on('end', function() {
  const video_hash = hash2.digest('hex');// 34f7a3113803f8ed3b8fd7ce5656ebec
  console.log(video_hash);
  //escrow.addHash(video_hash);
})

//get video length
const { getVideoDurationInSeconds } = require('get-video-duration')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
//set K and fps
async function enterK(){
    console.log('***** K not defined, choose K value *****')
    inquirer
      .prompt([
        {
          name: 'K_number',
          message: 'Choose the chunk size you like?',
          //default: 'Alligators, of course!',
        }
      ])
      .then(answers => {
        return answers.K_number;
      });

}

// var K = seller_config.K;
var K = config.data.K;

// if(seller_config.K == ''){
//   async function getK(){
//     console.log('K not defined');
//     K = await enterK();
//     console.log(" K entered:", K);
    
//   }
// }

const FPS = 36;
var payment_granularity = K;
var cost = config.data.price;
var duration = 0;

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

getVideoDurationInSeconds('sample4.mp4').then((dur) => {
  duration = dur;
})

//screen shot frames
ffmpeg('sample4.mp4')
    .fps(36)
    .on('end', function() {
      console.log('Screenshots taken');
    })
    .output('../seller/data/frames-%04d.jpg')
    .run()

////////encryption for data////////
function encrypt(text, myKey) {
  let iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv('aes-256-cbc', myKey, iv);
  let encrypted = cipher.update(text);
 
  encrypted = Buffer.concat([encrypted, cipher.final()]);
 
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text, myKey) {
let textParts = text.split(':');
let iv = Buffer.from(textParts.shift(), 'hex');
let encryptedText = Buffer.from(textParts.join(':'), 'hex');
let decipher = crypto.createDecipheriv('aes-256-cbc', myKey, iv);
let decrypted = decipher.update(encryptedText);

decrypted = Buffer.concat([decrypted, decipher.final()]);

return decrypted.toString();
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

//////////network////////////
io.sockets.on('connection',(socket) =>{
  console.log('******** Connected to client!***********');

  escrow.sellerDeposit(12);
  console.log('** seller deposited **');

     if(escrow.checkDeposit()){
      var imageCount = 0;
      var isPaused = 0;
      var index = 1;
      
      // var secret_key_encrypted=crypto.publicEncrypt(encrypt_public_key,Buffer.from(secret_key));
      // socket.emit('session_key', secret_key_encrypted);
      // console.log('Sent session key')
      socket.on('order info',(order_info)=>{
        jsonData = JSON.parse(order_info);
        encrypt_public_key = jsonData.pub_key;
        console.log(encrypt_public_key);
        pay = jsonData.payment_type;
        if(pay == 1){
          console.log('** buyer chose iota');
        }else{
          console.log('** buyer chose eth');
        }

        var secret_key_encrypted=crypto.publicEncrypt(encrypt_public_key,Buffer.from(secret_key));

        socket.emit('session_key', secret_key_encrypted);
        
        
        var interval = setInterval(() => {
          //console.log('count:',imageCount)
          //console.log('paused:',isPaused)
          if(index>= duration*36 - 1){
            clearInterval(interval);
            escrow.sellerConfirm();
            socket.emit('Sent All');
            console.log("*********************************");
            console.log('Seller Sent all and confrimed');
            console.log("*********************************");

            sleep(2000)
            .then(()=>{escrow.refundSeller()})
            .then(()=>{socket.disconnect()});
          }
          if(isPaused == 0){
            if((imageCount % payment_granularity == 0) && (imageCount > 0)){
              isPaused = 1;
              console.log('*** Paused, wait for payment ***')
              
              async function payment(){
                try{
                  payment_invoice = "Sent: " + K;
                  payment_invoice += "\nPayment: " + K*cost;
                  ////choose iota or eth////
                  if(pay == 1){
                    console.log('* Recording invoice with iota');
                    //need to fix
                    hash = await iota.sendTokens(sender_seed, recv_address, 0, payment_invoice);
                    console.log('Invoice hash on Iota:',hash);
                    socket.emit('DATA_INVOICE', payment_invoice);

                    if(config.record.platform == "database"){

                      console.log('record on database')
                      
                      db.connect((err) =>{
                        if(err){
                            console.log('unable to connect');
                    
                        }else{
                            //console.log('connected');
                            const collection = db.getDB().collection('records');
                            db.insertMongodb(collection, 'seller_inovice')
                            .then((result) => {
                                console.log(`Successfully inserted ${result.length} documents into mongodb`);
                    
                                const options = {'sort': [['value', 'desc']]};
                                collection.findOne({},options,(err,doc) => {
                                    if(err) throw err;
                                    console.log(`MongoDB: invoice of ${K} data recorded on `);
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
                    console.log('* Recording invoice with eth');
                    web3.eth.getTransactionCount(web3.eth.defaultAccount).then(txCount => {
                      // create Tx object
                      const rawTx = {
                        nonce: web3.utils.toHex(txCount),
                        gasLimit: web3.utils.toHex(800000),
                        gasPrice: web3.utils.toHex(15e10),
                        //from: account2,
                        to: account2,
                        value: K*cost,
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
                        console.log('* Invoice hash on Ethereum:',eth_hash);
                        socket.emit('DATA_INVOICE', payment_invoice);
                        //console.log('Tx_Hash: ', eth_hash)
                      })
                      // .once('receipt', function (receipt) {
                      //   console.log('Receipt: ', receipt)
                      // })
                      .on('error', console.error)
                
                    })
                  }else{
                    //stripe
                    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

                    (async () => {
                        session = await stripe.checkout.sessions.create({
                          payment_method_types: ['card'],
                          line_items: [{
                            name: 'SDPP Data',
                            description: 'chunk of data',
                            images: ['https://example.com/t-shirt.png'],
                            amount: 300,
                            currency: 'usd',
                            quantity: 1,
                          }],
                          success_url: 'http://localhost:8080',
                          cancel_url: 'https://example.com/cancel',
                        });
                        console.log(session.id);
                        hash = session;
                        return session;
                      })().then(function(session){
                          console.log(session.id)
                          socket.emit('DATA_INVOICE', session.id);
                      });

                    app.post('/webhook', bodyParser.raw({type: 'application/json'}), (request, response) => {
                      const sig = request.headers['stripe-signature'];

                      let event;

                      try {
                        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
                      } catch (err) {
                        return response.status(400).send(`Webhook Error: ${err.message}`);
                      }

                      // Handle the checkout.session.completed event
                      if (event.type === 'checkout.session.completed') {
                        const session = event.data.object;
                        // Fulfill the purchase...
                        console.log(`🔔  Payment received!`);
                        isPaused = 0;
                      }

                      // Return a response to acknowledge receipt of the event
                      response.json({received: true});
                    });
                    
                  }

                  console.log('Sent payment transaction_hash:',hash);
                  console.log('****************************')
                }catch(e){
                  console.log(e);
                }
              }
              payment();
            }

            const filename = '../seller/data/'+'frames-' + pad(index,4) +'.jpg';
            const frame = fs.readFileSync(filename);
            const image = frame.toString('base64');

            const image_hash = encrypt(image, secret_key);
            socket.emit('image',image_hash);
            console.log('send encrypted image');
            
            //console.log(image);
            index++;
            imageCount++;
          }
        }, 1000/FPS)

        socket.on('PAYMENT_ACK',(data) =>{
          console.log('*** Received PAYMENT_ACK ********');
          console.log(`[Transcation hash: ${data}]`);
          console.log('Resuming...')
          console.log('****************************')
          setTimeout(function(){
            isPaused = 0;
          },1000);
        })
    });
    }else{ 
      console.log('Waiting Deposit')
    }
})

//server.listen(3000);
