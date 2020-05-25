const https = require('https');

module.exports = {
  getPage: getPage,
  redirectUserToPic: redirectUserToPic,
  getPhotoUrl: getPhotoUrl,
  getUserInput: getUserInput,
  isInputLegal: isInputLegal
};

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

// Redirect user to picture url; take page url and a response object
async function redirectUserToPic(pageUrl, res) {
  try {
    let page = await getPage(getUserInput(pageUrl));
    console.log("PAGE: " + String(page));
    let picture = getPhotoUrl(page);
    // redirect to picture
    res.statusCode = 302;
    res.setHeader('Location', picture);
    res.end();
  } catch(e) {
    console.log(e);
  }
}

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

// Check whether the input from the user is the right kind of url
function isInputLegal(input) {
  let rightPrefix = "https://www.instagram.com/";
  let actualPrefix = input.slice(0,26);
  if (actualPrefix === rightPrefix) {
    return true;
  } else {
    return false;
  }
};
