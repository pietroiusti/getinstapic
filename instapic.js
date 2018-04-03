const https = require('https');

module.exports = {
    getPhoto: getPhoto,
    storeRequestInDb: storeRequestInDb,
    getPhotoUrl: getPhotoUrl,
    getUserInput: getUserInput,
    isInputLegal: isInputLegal
};

// Get an url and an http server response object, a db collection, and
// a callback to insert the request in the db collection.
// End the server response with the content retrieved from the url.
function getPhoto (url, handle, dbCollection, callback) {
    https.get(url, (res) => {
	const { statusCode } = res;
	const contentType = res.headers['content-type'];

	let error;
	if (statusCode !== 200) {
	    error = new Error('Request Failed.\n' +
			      `Status Code: ${statusCode}`);
	}
	let rawData = '';
	res.on('data', (chunk) => {
	    rawData += chunk;
	});
	res.on('end', () => {
	    try {
		let originalPhoto = getPhotoUrl(rawData);
		handle.statusCode = 200;
		handle.setHeader('Content-type', 'text/html');
		handle.end('<!DOCTYPE html><html><body>Download your picture ' + '<a href="' + originalPhoto + '">here</a>' + '</body></html>');

		// Insert user request into db
		callback({
		    requested: url,
		    found: originalPhoto,
		    date: new Date().toLocaleString()
		}, dbCollection);
		
	    } catch (e) {
		console.error(e.message);
	    }
	});
    }).on('error', (e) => {
	console.error(`Got error: ${e.message}`);
    });
};

function storeRequestInDb(doc, collection) {
    collection.insertOne(doc, function(err, result) {
	if (err) {
	    console.log(err);
	} else {
	    console.log('Request stored in db');
	}
    });
}

// Find url photo within the html/js code of the page.
function getPhotoUrl (page) {
    let regex = /og:image.+.jpg/.exec(page);
    regex = /http.+jpg/.exec(regex);
    return regex[0];
};

// Return user input from url of get request
function getUserInput(url) {
    // split url using '/'
    var splittedUrl = url.split('/');
    // Leave only link part in the array
    splittedUrl.splice(0,2);
    // Join with '/'
    var userInput = splittedUrl.join('/');
    // remove '?link=' from the beginning of string
    userInput = decodeURIComponent(userInput.slice(6, userInput.length));
    return userInput;
}

// Check whether the input from the user is the right king of url
function isInputLegal(input) {
    let rightPrefix = "https://www.instagram.com/";
    let actualPrefix = input.slice(0,26);
    if (actualPrefix === rightPrefix) {
	return true;
    } else {
	return false;
    }
};
