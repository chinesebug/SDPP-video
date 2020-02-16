// request is a module that makes http calls easier

const MongoClient = require('mongodb').MongoClient;
const dsn = 'mongodb://localhost:37017/maxcoin';
const state = {
    db : null
};

function insertMongodb(collection, data){
    const promisedInserts = [];
        promisedInserts.push(
            collection.insertOne({'data': 'SDPP', 'value': data})
        );

    return Promise.all(promisedInserts);
}

const connect = (cb) =>{
    if(state.db){
        cb();
        
    }else{
        MongoClient.connect(dsn,{
            useUnifiedTopology: true,
            useNewUrlParser: true,
            }, (err, db)=> {
            //console.time('mongdodb');
            if(err){
                cb(err);
            }else{
            console.log('Connected Successfully to MongoDB server');
            state.db = db.db('maxcoin');
            cb();
            }
        });
    }
}

const getDB = ()=>{
    return state.db;
}
module.exports = {connect, insertMongodb, getDB};
