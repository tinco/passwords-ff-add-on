// import the modules we need
var data = require('self').data;
var {Cc, Ci} = require('chrome');
var sjcl = require('sjcl');
var mediator = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);

var key = "geheim";
var keyTwo = "supergeheim";
var lastTan = 0;

function nextTan() {
  return lastTan += 1;
}

// exports.main is called when extension is installed or re-enabled
exports.main = function(options, callbacks) {
	addToolbarButton();
	sjcl.random.addEntropy("Dit is een random string",256);
	sjcl.random.addEntropy("Dit is een random string",256);
	sjcl.random.addEntropy("Dit is een random string",256);
	sjcl.random.addEntropy("Dit is een random string",256);
	sjcl.random.addEntropy("Dit is een random string",256);
};

// exports.onUnload is called when Firefox starts and when the extension is disabled or uninstalled
exports.onUnload = function(reason) {
	removeToolbarButton();
};

function encrypt(key,tan,data) {
	var phaseTwo = phaseTwoHash(tan,keyTwo);
	console.log('encrypt: ' + (key+phaseTwo) + ',' + tan);
	return sjcl.encrypt(key + phaseTwo,data, {
		"iter" : 1000,
		"ks"   : 256,
		"ts"   : 128,
		"mode" : "ccm"
	});
}

function decrypt(key,tan,data) {
	var phaseTwo = phaseTwoHash(tan,keyTwo);
	console.log('decrypt: ' + (key+phaseTwo) + ',' + tan);
	return sjcl.decrypt(key + phaseTwo,data,{},{});
}

function phaseTwoHash(tan, key) {
	return sjcl.codec.base64.fromBits(sjcl.hash.sha256.hash(tan + key));
}

function encryptKeyDatabase(key, database) {
	var encryptedDatabase = [];
	var tan = nextTan();
	for(var i=0;i < database.length;i++) {
		var entry = database[i];
		var encryptedEntry = encryptedDatabase[i] = {}
		for(var prop in database[i]) {
			encryptedDatabase[i][prop] = database[i][prop];
		}
		var pTan = nextTan();
		encryptedEntry.password = encrypt(key,pTan,entry.password);
		encryptedEntry.tan = pTan;
	}
	return {
		"tan" : tan,
		"database" : encrypt(key,tan,encryptedDatabase)
	}
}

function downloadKeyDatabase(callback) {
	var data = [{
		"url" : "http://tinco.nl",
		"password" : "geheim"
	}];
	var encryptedData = encryptKeyDatabase(key, data);
	callback(encryptedData);
}

// add our button
function addToolbarButton() {
	// this document is an XUL document
	var document = mediator.getMostRecentWindow('navigator:browser').document;
	var navBar = document.getElementById('nav-bar');
	if (!navBar) {
		return;
	}
	var btn = document.createElement('toolbarbutton');
	btn.setAttribute('id', 'mybutton-id');
	btn.setAttribute('type', 'button');
	// the toolbarbutton-1 class makes it look like a traditional button
	btn.setAttribute('class', 'toolbarbutton-1');
	// the data.url is relative to the data folder
	btn.setAttribute('image', data.url('key.png'));
	btn.style.height = '100%';
	btn.setAttribute('orient', 'horizontal');
	// this text will be shown when the toolbar is set to text or text and iconss
	btn.setAttribute('label', 'My Button');
	btn.addEventListener('click', function() {
		downloadKeyDatabase(function(data) {
			var database = decrypt(key,data.tan,data.database);
			console.log(database);
		});
	}, false)
	navBar.appendChild(btn);
}

function removeToolbarButton() {
	// this document is an XUL document
	var document = mediator.getMostRecentWindow('navigator:browser').document;
	var navBar = document.getElementById('nav-bar');
	var btn = document.getElementById('mybutton-id');
	if (navBar && btn) {
		navBar.removeChild(btn);
	}
}

