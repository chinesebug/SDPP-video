const crypt = require('../utils/crypt');
const config = require('../utils/loadConfig');
const fs = require('fs');
const K = config.data.K;
const prep = require('../utils/data_prep');


function get_order(socket){
    socket.on('order info',(order_info)=>{
        jsonData = JSON.parse(order_info);
        encrypt_public_key = jsonData.pub_key;
        console.log(encrypt_public_key);
        pay = jsonData.payment_type;
        if(pay == 1){
          console.log('** buyer chose iota for payment');
          config.payment.currency = 'iota';
        }else if(pay == 2){
          console.log('** buyer chose eth for payment');
          config.payment.currency = 'eth';
        }else{
          console.log('** buyer chose USD for payment');
          config.payment.currency = 'usd';
          console.log(config.payment.currency)
        }
          
        var secret_key_encrypted=crypt.enc_pubKey(encrypt_public_key);
        socket.emit('session_key', {key:secret_key_encrypted, address: config.payment.account});
    })
}

function send_data(socket,index){
    try{
      const filename = '../seller/data/'+'frames-' + crypt.pad(index,4) +'.jpg';
      const frame = fs.readFileSync(filename);
      const image = frame.toString('base64');
      const image_hash = crypt.encrypt(image);
      socket.emit('image',image_hash);
      console.log('send encrypted image');
    }
    catch(error){
      console.log('error');
    }
}



module.exports = {get_order, send_data, K};