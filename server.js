"use strict";
const http = require('http');
const https = require('https');
const fs = require('fs');
const mongodb = require('mongodb');

const instapic = require('./instapic.js');

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
		// Serve homepage
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
		    // Check user input
		    if (instapic.isInputLegal(instapic.getUserInput(req.url))) {
			// Find photo from link given, give it to user and store request in db.
			instapic.getPhoto(instapic.getUserInput(req.url), res, collection, instapic.storeRequestInDb);
		    } else {
			res.statusCode = 404;
			res.end('Wrong link');			    
		    }
		} else {
		    res.statusCode = 404;
		    res.end('error');
		}
	    }
	} else if (req.method === 'POST') {
	    if (req.url === '/getpic/') {
		console.log('Got post request at /getpic/');
		console.log(req); // Where is the body??
		//getPhoto('https://www.google.com', res);
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

