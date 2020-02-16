const config = require('../utils/loadConfig')
const crypt = require('../utils/crypt')
const fs = require("fs");

var session_key;
async function send_order(client_socket){
    return new Promise(function(resolve,reject){
    if(config.payment.currency == 'iota'){
        pay = 1;
      }else if(config.payment.currency == 'eth'){
        pay = 2;
      }else{
        pay = 3;
      }
      
      var order = prepareOrderData(pay, crypt.publicKey);
      client_socket.emit('order info', order);

      client_socket.on('session_key', function(data){
        session_key = crypt.decrypt_session_key(Buffer.from(data.key));
        console.log('Received session_key: \n'+ session_key.toString('hex'));
        payTo_address = data.address;
        //console.log('in',payTo_address);
        client_socket.emit('ready');
        resolve( payTo_address);
    });
  })

}

function receive(client_socket, io){

    var img_count = 1;
    
    client_socket.on('image',function(data){
      try{
        const image = crypt.decrypt(data, session_key);
        img_count++;
        const imageBuffer = new Buffer.from(image, "base64");
        const filename = '../buyer/data/frames-' + crypt.pad(img_count,4) +'.jpg';
        fs.writeFileSync(filename, imageBuffer);
        console.log('image from sdpp server')
        //console.log(image);
        io.to('lobby').emit('image', image);
        io.emit('image', image);
        //client_socket.emit('ACK');
      }catch(err){
        console.log(err);
      }
        
    })

}

function send_to_display(socket,client_socket){
    console.log('Connected to web page display');
    
    socket.on('image',(data) =>{
      console.log('forward')
      client_socket.emit('image',data);
      socket.emit('image',data);
    })
  
    socket.on('DATA_INVOICE',(data) =>{
      console.log('forward DATA_INVOICE');
      client_socket.emit('DATA_INVOICE',data);
      socket.emit('DATA_INVOICE',data);

    })
  
    socket.on('stripe_paid',function(){
        console.log('after pay from web')
        client_socket.emit('PAYMENT_ACK','stripe');
    })
}

function prepareOrderData(payment_type, pub_key){
    var json_data = {}
  
    json_data.payment_type = payment_type;
    json_data.pub_key = pub_key;
  
    return JSON.stringify(json_data);
}

module.exports = {send_order, receive, send_to_display}