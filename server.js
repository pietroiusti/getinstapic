"use strict";
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
    switch (req.url) {
    case '/': {
      fs.readFile('./public/homepage.html', (err, fileContent) => {
	if (err) {
	  console.log('Error 1');
	} else {
	  res.writeHead(200, {'Content-Type': 'text/html'});
	  res.end(fileContent);
	}
      });
      break;
    }
    case '/cover.css': {
      fs.readFile('./public/css/cover.css', (err, fileContent) => {
	if (err) {
	  console.log('Error 2');
	} else {
	  res.writeHead(200, {'Content-Type': 'text/css'});
	  res.end(fileContent);
	}
      });
      break;
    }
    default: {
      var splittedUrl = req.url.split('/');
      if (splittedUrl[1] === 'getpic') {
	// Check user input
	if (getUserInput(req.url).slice(0, 26)
	    ===
	    "https://www.instagram.com/") {
	  // Redirect user to picture
	  getPage(getUserInput(req.url))
	    .then((page) => {
	      res.statusCode = 302;
	      res.setHeader('Location', getPhotoUrl(page));
	      res.end();
	    }).catch((e) => {
	      console.log(e);
	      res.end(e);
	    });
	} else {
	  res.statusCode = 404;
	  res.end('Wrong link');			    
	}
      } else {
	res.statusCode = 404;
	res.end('error');
      }
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

// return a promise to page
function getPage (url) {
  return new Promise( (resolve, reject) => {
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
	  resolve(rawData);
	} catch (e) {
	  reject(e);
	}
      });
    }).on('error', (e) => {
      reject(e);
    });
  });
};

// Find url photo within the html/js code of the page.
function getPhotoUrl (page) {
  let regex = /"og:image.+content=".+"/.exec(page);
  regex = /http.+\"/.exec(regex);

  return regex[0].substring(0, regex[0].length-1);
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
