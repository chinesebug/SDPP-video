const web3 = require('./web3setup');
var contract = require('./contract');
const keys = require('./keys');
// const buyer_config = require('./buyer_config');
const config = require('./loadConfig');

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

async function getHash(){
    var ans = "";
    try{
         ans = await contract.methods.getHash().call();
    }catch(err){
        return err;
    }
    return ans;
}

function buyerDeposit(amount){
    contract.methods.buyerDeposit().send({from:config.account2, value: amount})
        .then(console.log);
}

function sellerDeposit(sellerAccount, amount){
    contract.methods.sellerDeposit().send({from:sellerAccount, value: amount})
        .then(console.log);
}

function checkDeposit() {
    return contract.methods.bothReady().call().then(function(err,res){
        if(err){
            console.log(err);
        }
        if(res){
            console.log(res);
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
