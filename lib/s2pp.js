var sjcl = require('./sjcl.js');
var s2pp = {"lastTan" : 0};

s2pp.nextTan = function() {
  return s2pp.lastTan += 1;
}

s2pp.addEntropy = function() {
	sjcl.random.addEntropy("Dit is een random string",256);
	sjcl.random.addEntropy("Dit is een random string",256);
	sjcl.random.addEntropy("Dit is een random string",256);
	sjcl.random.addEntropy("Dit is een random string",256);
	sjcl.random.addEntropy("Dit is een random string",256);
}

s2pp.encrypt = function(key,nonce,data) {
	return sjcl.encrypt(key + nonce,data);
}

s2pp.decrypt = function(key,nonce,data) {
	return sjcl.decrypt(key + nonce,data,{},{});
}

s2pp.phaseTwoHash = function(tan, key) {
	return sjcl.codec.base64.fromBits(sjcl.hash.sha256.hash(tan + key));
}

s2pp.encryptKeyDatabase = function(key,tan,nonce,database) {
	return {
		"tan" : tan,
		"database" : s2pp.encrypt(key,nonce,JSON.stringify(database))
	}
}

module.exports = s2pp;
