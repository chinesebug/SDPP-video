  const Tx = require('ethereumjs-tx');
  const web3 = require('../utils/web3setup');
  const config = require('../utils/loadConfig');

  const iota = require('../utils/iotaModule');

  const K = config.data.K;
  const cost = config.data.price;
  const account = config.payment.account;
  var amount = K*cost;


  async function pay(data, payTo, client_socket, io){
    return new Promise((resolve,reject)=>{
      console.log('* paying: ',amount)

      if(config.payment.currency == 'iota'){
        iota_pay('HELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDD', 0).then((hash)=>{
          client_socket.emit('PAYMENT_ACK',hash);
          io.emit('PAYMENT_ACK',hash);
          resolve(hash);
        });

      }else if(config.payment.currency == 'eth'){
        eth_pay(payTo, amount).then((hash)=>{
          client_socket.emit('PAYMENT_ACK',hash);
          io.emit('PAYMENT_ACK',hash);
          resolve(hash);
        });
        
      }else{
        hash = stripe_pay(data,amount,io);
      }
      
      })
  }

  function eth_pay(payTo,amount){
    return new Promise((resolve,reject)=>{
      //console.log('* paying: ',amount)
      web3.eth.getTransactionCount(web3.eth.defaultAccount).then(txCount => {
        // create Tx object
        //console.log(payTo)
        const rawTx = {
          nonce: web3.utils.toHex(txCount),
          gasLimit: web3.utils.toHex(800000),
          gasPrice: web3.utils.toHex(15e10),
          from: account,
          to: payTo,
          value: web3.utils.toHex( web3.utils.toWei(amount.toString()), 'ether') ,
          data: 'SDPP_payment'
        }
        // sign the transaction and serialize
        PVK = new Buffer.from(config.payment.privateKey, 'hex')
        const tx = new Tx(rawTx);
        tx.sign(PVK);
        const serializedTx = tx.serialize();

        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
        .once('transactionHash', function (eth_hash) {
          hash = eth_hash;
          //console.log('* payment hash on Ethereum:',eth_hash);
          resolve(eth_hash);

        })
        // .once('receipt', function (receipt) {
        //   console.log('Receipt: ', receipt)
        // })
        .catch((error) =>{console.error})

      });
    })
  }

  async function iota_pay(recv_address, amount){
    //const sender_seed = account;
    return new Promise((resolve,reject) =>{ 
      const sender_seed = 'RAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHUL9RAHUL';
      payment_invoice = "Sent: " + K;
      payment_invoice += "\nPayment: " + K*cost;

      iota.sendTokens(sender_seed, recv_address, amount, payment_invoice).then((hash)=>{
        resolve(hash);
      })
      //console.log('* payment hash on Iota:',hash);
      
    })
    
  }

  function stripe_pay(SKU,amount,io){
    console.log('Using stripe');
          //var SKU = 'sku_GNxSnVRccQPCAk';
          io.emit('STRIPE_INVOICE', SKU);
          console.log('session id:', SKU);
          io.on('stripe_paid',function(data){
             console.log('paid on webpage', data);
             client_socket.emit('PAYMENT_ACK',data);
           })
  }

  module.exports = {eth_pay, iota_pay,stripe_pay,pay}