const web3 = require('./web3setup');
var contract = require('./contract');
const seller_config = require('./loadConfig');

function addHash(hash){
    contract.methods.addHash().send().then(function(err,res){
        if(err){
            console.log(err);
        }
        if(res){
            console.log(res);
        }
    });
}

function getHash(){
    return contract.methods.getHash().call().then(function(err,res){
        if(err){
            console.log(err);
        }
        if(res){
            console.log(res);
        }

    });
}

function buyerDeposit(amount){
    contract.methods.buyerDeposit().send({from:seller_config.account, value: amount})
        .then(console.log)
        .catch((err) =>{
            console.log(err);
        });
}

function sellerDeposit(sellerAccount, amount){
    contract.methods.sellerDeposit().send({from:seller_config.account1, value: amount})
        .then(console.log);
}

function checkDeposit() {
    return contract.methods.bothReady().call().then(function(err,res){
        if(err){
            console.log(err);
        }
        if(res){
            return res;
        }
    });
}

function buyerConfirm(){
    contract.methods.buyerConfirm().send().then(console.log);
}

function sellerConfirm(){
    contract.methods.sellerConfirm().send().then(console.log);
}

function refundBuyer(account){
    contract.methods.requestBuyerRefund().send().then(function(err,res){
        if(err){
            console.log('err');
        }
        if(res){
            console.log(res);
            return res;
        }
    });
}
function refundSeller(account){
    contract.methods.requestSellerRefund().send().then(function(err,res){
        if(err){
            console.log('err');
        }
        if(res){
            console.log(res);
            return res;
        }
    });
}
module.exports = {
    addHash,
    getHash,
    buyerDeposit,
    sellerDeposit,
    checkDeposit,
    buyerConfirm,
    sellerConfirm,
    refundBuyer,
    refundSeller
}
