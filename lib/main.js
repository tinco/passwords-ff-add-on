// import the modules we need
var data = require('self').data;
var {Cc, Ci} = require('chrome');
var s2pp = require('s2pp');
var mediator = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);

var key = "geheim";
var keyTwo = "supergeheim";

// exports.main is called when extension is installed or re-enabled
exports.main = function(options, callbacks) {
	addToolbarButton();
};

// exports.onUnload is called when Firefox starts and when the extension is disabled or uninstalled
exports.onUnload = function(reason) {
	removeToolbarButton();
};

var downloadKeyDatabase = function(callback) {
	var data = [{
		"url" : "http://tinco.nl",
		"password" : "geheim"
	}];
	s2pp.addEntropy();
	var tan = s2pp.nextTan();
	var nonce = s2pp.phaseTwoHash(tan,keyTwo);
  data[0].password = s2pp.encrypt(key,nonce,data[0].password);
	data[0].tan = tan;
	tan = s2pp.nextTan();
	nonce = s2pp.phaseTwoHash(tan,keyTwo);
	var encryptedData = s2pp.encryptKeyDatabase(key,tan,nonce,data);
	callback(encryptedData);
};

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
			var nonce = s2pp.phaseTwoHash(data.tan,keyTwo);
			var database = JSON.parse(s2pp.decrypt(key,nonce, data.database));
			nonce = s2pp.phaseTwoHash(database[0].tan, keyTwo);
			var password = s2pp.decrypt(key, nonce, database[0].password);
			console.log(password);
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

