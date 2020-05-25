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
    } else {
      var splittedUrl = req.url.split('/');
      if (splittedUrl[1] === 'getpic') {
	// Check user input
	if (instapic.isInputLegal(instapic.getUserInput(req.url))) {

	  // Redirect user to picture
	  //instapic.redirectUserToPic(req.url, res);

	  try {

	    https.get(instapic.getUserInput(req.url), (response) => {
	      const { statusCode } = response;
	      const contentType = response.headers['content-type'];
	      let error;
	      if (statusCode !== 200) {
		error = new Error('Request Failed.\n' +
				  `Status Code: ${statusCode}`);
	      }
	      let rawData = '';
	      response.on('data', (chunk) => {
		rawData += chunk;
	      });
	      response.on('end', () => {
		let picture = instapic.getPhotoUrl(rawData);

		res.statusCode = 302;
		res.setHeader('Location', picture);
		res.end();
	      });
	    });

	  } catch (e) {
	    console.log(e);
	    res.end("Error:" + e);
	  }

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
