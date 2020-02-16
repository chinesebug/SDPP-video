const escrow = require('../utils/escrow');
const config = require('../utils/loadConfig');

const K = parseInt(config.data.K);
const cost = parseInt(config.data.cost);
const MIN_depo = K*cost;

async function deposit(){

    if(config.client == 'seller'){
        escrow.sellerDeposit(parseInt(MIN_depo));
        console.log("** seller deposited");
        return escrow.checkDeposit();
    }else if(config.client == 'buyer'){
        escrow.buyerDeposit(1);
        console.log('** buyer deposited');
        return escrow.checkDeposit(parseInt(MIN_depo));
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
