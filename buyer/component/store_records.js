const db = require('../utils/db.js');
const iota = require('../utils/iotaModule');
const config = require('../utils/loadConfig');

const K = config.data.K;
const cost = config.data.cost;

function store(socket){
    return new Promise((resolve) =>{
        if(config.client == 'buyer' && config.record.platform == 'iota'){
            resolve('already recorded on iota ');
        }
        if(config.record.platform == 'iota'){
            store_iota('HELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDD',socket,(hash) =>{
                
                resolve(hash);
            });
        }else{
            store_db(socket).then((hash)=>resolve(hash));
        }

    })
    
}

async function store_iota(recv_address, socket){
    //const sender_seed = account;
    return new Promise((resolve,reject) =>{ 
        const sender_seed = 'RAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHULRAHUL9RAHUL';
        payment_invoice = "Sent: " + K;
        payment_invoice += "\nPayment: " + K*cost;
  
        iota.sendTokens(sender_seed, recv_address, 0, payment_invoice).then((hash)=>{
          resolve(hash);
        })
        //console.log('* payment hash on Iota:',hash);
        
    })
}

function store_db(socket){
    return new Promise((resolve,reject)=>{
        console.log('* using Mongo');

        db.connect((err) =>{
            if(err){
                console.log('unable to connect');
        
            }else{
                //console.log('connected');
                const collection = db.getDB().collection('records');
                db.insertMongodb(collection, 'seller_inovice')
                .then((result) => {
                    console.log(`* Successfully inserted ${result.length} documents, ID:${result[0].insertedId}`);
                    resolve(result[0].insertedId);
                    //socket.emit('DATA_INVOICE', result[0].insertedId);
                    // const options = {'sort': [['value', 'desc']]};
                    // collection.findOne({},options,(err,doc) => {
                    //     if(err) throw err;
                    //     console.log(`MongoDB: invoice of ${K} data recorded on `);
                    // })
                    //console.timeEnd('mongdodb');
                    //db.close();
                })
                .catch((err)=>{
                    console.log(err);
                    process.exit();
                })
            }
        })

    })
}

module.exports = {store, store_db, store_iota}