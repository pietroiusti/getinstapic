"use strict";
const http = require('http');
const https = require('https');
const fs = require('fs');
const instapic = require('./instapic.js');

const port = process.env.PORT || 3000;

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
	} else if (req.url === '/cover.css') {
	    fs.readFile('./public/css/cover.css', (err, fileContent) => {
		if (err) {
		    console.log('Error 2');
		} else {
		    res.writeHead(200, {'Content-Type': 'text/css'});
		    res.end(fileContent);
		}
	    });
	} else if (req.url === '/public/scripts/loadingGif.js') {
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
		    // Redirect user to picture
		    instapic.redirectUserToPic(req.url, res);
		} else {
		    res.statusCode = 404;
		    res.end('Wrong link');			    
		}
	    } else {
		res.statusCode = 404;
		res.end('error');
	    }
	}
    } else {
	res.statusCode = 404;
	res.end('error');
    }
});

server.listen(port, () => {
    console.log(`Server running at port ${port}`);
});
