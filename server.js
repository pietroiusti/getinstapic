"user strict";
const http = require('http');
const https = require('https');
const fs = require('fs');
const mongodb = require('mongodb');

const port = process.env.PORT || 3000;

// Connect to mongo db
mongodb.MongoClient.connect(process.env.DBURI, (err, client) => {
    if (err) {
	console.log(err);
    }

    var collection = client.db('getinstapicdb').collection('usersRequests');

    const server = http.createServer((req, res) => {
	// Add error listener
	req.on('error', (err) => {
	    console.log(err);
	    res.statusCode = 400;
	    res.end();
	});

	if (req.method === 'GET') {
	    if (req.url === '/') {
		fs.readFile('./public/homepage.html', (err, fileContent) => {
		    if (err) {
			console.log('Error 1');
		    } else {
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(fileContent);
		    }
		});
	    } else if (req.url === '/public/css/styles.css') {
		fs.readFile('./public/css/styles.css', (err, fileContent) => {
		    if (err) {
			console.log('Error 2');
		    } else {
			res.writeHead(200, {'Content-Type': 'text/css'});
			res.end(fileContent);
		    }
		});
	    }else if (req.url === '/public/scripts/loadingGif.js') {
		fs.readFile('./public/scripts/loadingGif.js', (err, fileContent) => {
		    if (err) {
			console.log('Error 3');
		    } else {
			res.writeHead(200, {'Content-Type': 'text/javascript'});
			res.end(fileContent);
		    }
		});
	    } else if (req.url === '/public/images/lg.ajax-spinner-preloader.gif') {
		fs.readFile('./public/images/lg.ajax-spinner-preloader.gif', (err, fileContent) => {
		    if (err) {
			console.log('Error 4');
		    } else {
			res.writeHead(200, {'Content-Type': 'image/jpg'});
			res.end(fileContent);
		    }
		});	
	    } else {
		var splittedUrl = req.url.split('/');
		if (splittedUrl[1] === 'getpic') {
		    
		    // leave only link part in the array
		    splittedUrl.splice(0,2);
		    
		    // join with '/'
		    let link = splittedUrl.join('/');
		    // remove '?link=' from the beginning of string
		    link = decodeURIComponent(link.slice(6, link.length));

		    getPage(link, res);

		    // Insert user request into db
		    let userReq = {
		    	ip: req.connection.remoteAddress,
		    	requested: link,
			date: new Date//("<YYYY-mm-ddTHH:MM:ss>")
		    };
		    collection.insertOne(userReq, function(err, result) {
			if (err) {
			    console.log(err);
			} else {
			    console.log('Request stored in db');
			}
		    });
		} else {
		    res.statusCode = 404;
		    res.end('error');
		}
	    }
	} else if (req.method === 'POST') {
	    if (req.url === '/getpic/') {
		console.log('Got post request at /getpic/');
		console.log(req); // Where is the body??
		//getPage('https://www.google.com', res);
	    } else {
		res.statusCode = 404;
		res.end('error');
	    }
	} else {
	    res.statusCode = 404;
	    res.end('error');
	}
    });
    
    server.listen(port, () => {
	console.log(`Server running at port ${port}`);
    });
});



// Get an url and an http server response object.
// End the server response with the content retrieved from the url.
function getPage (url, handle) {
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
		// console.log(rawData);
		let regex = /og:image.+.jpg/.exec(rawData);
		regex = /http.+jpg/.exec(regex);
		// console.log(regex[0]);
		
		handle.statusCode = 200;
		handle.setHeader('Content-type', 'text/html');

		let link = '<a href="' + regex + '">here</a>';

		handle.end('<html><body>Download your picture ' + link + '</body></html>');

	    } catch (e) {
		console.error(e.message);
	    }
	});
    }).on('error', (e) => {
	console.error(`Got error: ${e.message}`);
    });
};
