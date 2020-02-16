const records = require('./component/store_records');
const payment = require('./component/send_payment');
const io = require('./utils/network').io;
const crypt = require('./utils/crypt');
const prep = require('./utils/data_prep');
const deposit = require('./component/deposit');
const escrow = require('./utils/escrow');
const data_transfer = require('./component/send_data');
const payment_notification = require('./component/receive_payment')
const { getVideoDurationInSeconds } = require('get-video-duration')
const recv_address ='HELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDD';
var useEscrow = false;


//get the video length for the session
var duration;
prep.getDur().then((dur) =>{
    duration = dur;
    console.log(duration);
})

//Socket.io connecetion
io.sockets.on('connection',(socket) =>{
    console.log('*** Connected to client ***');
    //deposit to escrow smart contract
    
    
    if(useEscrow == false || deposit.deposit()){
        //take the order info
        data_transfer.get_order(socket);
        //after changed the necessary information
        socket.on('ready', () =>{

            var imageCount = 0;
            var isPaused = 0;//flag for stop/continue sending data

            var interval = setInterval(async () => {
                if(isPaused == 0){

                    //send images
                    data_transfer.send_data(socket, imageCount);
                    imageCount++;
                    
                    //pay at K chunks of data
                    if((imageCount % data_transfer.K == 0) && (imageCount > 0)){
                        isPaused = 1;
                        //store invoice and wait for payment
                        console.log('*** Send Inovice and and wait for payment ***')
                        records.store(socket).then((hash) =>{
                            console.log('* stored invoice', hash);
                            payment_notification.receive_payment_proof(socket,hash)
                                .then((value) =>{
                                    console.log('* payment hash:', value);
                                    isPaused = 0;
                                }).catch((err) =>
                                    console.log(err)
                                )
                        });
                    }
                  }
                
                  if(imageCount >= duration*36 - 1){
                    clearInterval(interval);
                    socket.emit('Sent All');
                    console.log('*** Seller Sent all *** ');
                    //confirm to smart contract
                    if(useEscrow){
                        deposit.confirm_transaction();
                        console.log('*** Seller Sent all and confrimed *** ');
                    
                        //refund and stop
                        setTimeout(()=> {
                            deposit.refund();
                            console.log('* requested refund');
                        }, 5000)
                    }
                    
                  }
    
            }, 1000/prep.FPS);
        })
    
    }

})

