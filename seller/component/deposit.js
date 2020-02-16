const escrow = require('../utils/escrow');
const config = require('../utils/loadConfig');
const K = parseInt(config.data.K);
const cost = parseInt(config.data.cost);
const MIN_depo = K*cost;

// async function deposit_ready(){
//     // (()=>{
//     //     if(config.client == 'seller'){
//     //         escrow.sellerDeposit(MIN_depo);
//     //         console.log("seller");
//     //     }else if(config.client == 'buyer'){
//     //         escrow.buyerDeposit(MIN_depo);
//     //         console.log('buyer');
//     //     }else{
//     //         console.log('!Wrong client info in config!');
//     //     }
//     // }).then(function(){
//     //     return escrow.checkDeposit();
//     // }).catch(function(err){
//     //     console.log(err);
//     // })
//     console.log(config.client)
//     if(config.client == 'seller'){
//         escrow.sellerDeposit(parseInt(MIN_depo));
//         console.log("seller");
//         return escrow.checkDeposit();
//     }else if(config.client == 'buyer'){
//         escrow.buyerDeposit(parseInt(MIN_depo));
//         console.log('buyer');
//         return escrow.checkDeposit();
//     }else{
//         console.log('!Wrong client info in config!');
//     }
        
// }
async function deposit(){
    if(config.client == 'seller'){
        escrow.sellerDeposit(MIN_depo);
        console.log("** seller deposited");
        return escrow.checkDeposit();
    }else if(config.client == 'buyer'){
        escrow.buyerDeposit(MIN_depo);
        console.log('** buyer deposited');
        return escrow.checkDeposit();
    }else{
        console.log('!Wrong client info in config!');
    }
}

function confirm_transaction(){
    if(config.cleint == 'seller'){
        escrow.sellerConfirm();
    }else{
        escrow.buyerConfirm();
    }
    
}

function refund(){
    if(config.cleint == 'seller'){
        escrow.refundSeller();
    }else{
        escrow.refundBuyer();
    }
    
}

module.exports = {confirm_transaction, refund, deposit}
