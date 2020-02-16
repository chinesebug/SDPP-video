const records = require('./component/store_records');
const payment = require('./component/send_payment');
const io = require('./utils/network').io;
const client_socket = require('./utils/network').client_socket;
const crypt = require('./utils/crypt');
const prep = require('./utils/data_prep');
const deposit = require('./component/deposit');
const escrow = require('./utils/escrow');
const rec_data = require('./component/receive_data');
const recv_address ='HELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDD';
const config = require('./utils/loadConfig');

var payTo_address;
var useEscrow = false;

client_socket.on('connect', function(){
    console.log('*** Connected to SDPP server ***');
    //deposit to escrow smart contract
    if(useEscrow){
        deposit.deposit();
    }
    
    
    //send order info, payment method and pub key
    rec_data.send_order(client_socket).then((address) => {
        payTo_address = address;
    })

    //receive session key and data
    rec_data.receive(client_socket, io);

    //payment for data
    client_socket.on('DATA_INVOICE',async function(data){
        console.log(`*** Received Innovice ${data} ***`);
        var hash = await payment.pay(data, payTo_address, client_socket, io);
        console.log('* payment hash:', hash);
        //store on DB for records if chosen
        records.store();
    })

    //end
    client_socket.on('Sent All',() => {
        //confrim to smart contract
        console.log('*** buyer receieved all ***');
        
        if(useEscrow){
            deposit.confirm_transaction();
            console.log('*** buyer receieved all and confirmed ***');
            
            //refund and stop
            setTimeout(()=> {
                deposit.refund();
                console.log('* requested refund');
            }, 3000)
        }
        
        
    })
})

