"user strict";
const http = require('http');
const https = require('https');
const fs = require('fs');

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
		var link = splittedUrl.join('/');
		// remove '?link=' from the beginning of string
		link = decodeURIComponent(link.slice(6, link.length));
		
		getPage(link, res);

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
		console.log(rawData);
		handle.statusCode = 200;
		handle.setHeader('Content-type', 'text/plain');
		handle.end(rawData);
	    } catch (e) {
		console.error(e.message);
	    }
	});
    }).on('error', (e) => {
	console.error(`Got error: ${e.message}`);
    });
};

server.listen(port, () => {
    console.log(`Server running at port ${port}`);
});
