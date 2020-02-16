

const app = require('express')();
const config = require('../utils/loadConfig');
const bodyParser = require('body-parser');
// const env = require("dotenv").config({ path: "../config/.env" });
// console.log('key',env.STRIPE_SECRET_KEY)
const stripe = require("stripe")(config.payment.STRIPE_SECRET_KEY);

app.listen(4242, () => console.log(`webhook listening on port ${4242}!`));

async function receive_payment_proof(socket, payment_invoice){
    return new Promise((resolve, reject) => {
      if(config.payment.currency == 'usd'){
        stripe_webhook(socket, resolve);
      }else{
        console.log('here')
        socket.emit('DATA_INVOICE', payment_invoice);
        socket.on('PAYMENT_ACK',(data) =>{
          const error = false;
          if(!error){
            resolve(data);
          }else{
            reject('Error!')
          }
        });
      }
    })
}

function stripe_webhook(socket, resolve){
  //stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
        //console.log(session.id)
        socket.emit('DATA_INVOICE', session.id);
    });

    app.post('/webhook', bodyParser.raw({type: 'application/json'}), (request, response) => {
        const sig = request.headers['stripe-signature'];
        let event;

        try {
          event = stripe.webhooks.constructEvent(request.body, sig, config.payment.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
          return response.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the checkout.session.completed event
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          resolve(event.type);
          // Fulfill the purchase...
          console.log(`🔔  Payment received!`);
          //isPaused = 0;
        }

        // Return a response to acknowledge receipt of the event
        response.json({received: true});
    });
}

module.exports = {receive_payment_proof, stripe_webhook}