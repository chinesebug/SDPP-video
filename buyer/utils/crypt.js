const crypto = require('crypto');

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      //cipher: 'aes-256-cbc',
      //passphrase: 'top secret'
    }
  });

const key = privateKey;
const seller_public_key = publicKey;
var encrypt_public_key = '';

//generate privateKey
var hash = crypto.createHash('sha256')
var randomBytes = crypto.randomBytes(32);
hash.update(randomBytes);
const secret_key = hash.digest();

//encrypt the session key using publick key
function enc_pubKey(encrypt_public_key){
  var secret_key_encrypted=crypto.publicEncrypt(encrypt_public_key,Buffer.from(secret_key));

  return secret_key_encrypted;
}

//encrypt the data
function encrypt(text) {
    let iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv('aes-256-cbc', secret_key, iv);
    let encrypted = cipher.update(text);
   
    encrypted = Buffer.concat([encrypted, cipher.final()]);
   
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

//decrypt data
function decrypt(text, myKey) {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(myKey), iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function decrypt_session_key(key){
  return crypto.privateDecrypt(privateKey, Buffer.from(key));
}

module.exports = {encrypt, decrypt, pad, privateKey, publicKey, enc_pubKey, decrypt_session_key}
