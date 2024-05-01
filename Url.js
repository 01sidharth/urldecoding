const http = require('http');
const readline = require('readline');
const url = require('url');

const urlDatabase = {};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise((resolve, reject) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to decode and redirect to the original long URL
function decodeURL(shortURL) {
  const shortCode = shortURL.split('/').pop(); 
  const longURL = urlDatabase[shortCode];
  
  if (longURL) {
    console.log("Redirecting to:", longURL);
    return longURL;
  } else {
    console.error('Short URL not found.');
    return null;
  }
}

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  
  const parsedUrl = url.parse(req.url);
  
  if (parsedUrl.pathname.startsWith('/')) {
    const longURL = decodeURL(req.url);
    if (longURL) {
      res.writeHead(301, { 'Location': longURL });
      res.end();
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Short URL not found');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  
  // Take URL from user input
  takeURLFromUser();
});

// Function to take URL from user input
async function takeURLFromUser() {
  const longURL = await prompt("Enter the URL to shorten: ");
  const shortURL = encodeURL(longURL);
  console.log("Shortened URL:", shortURL);
}

// Function to generate a random alphanumeric string of fixed length
function generateShortCode(length = 6) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortCode = '';
  for (let i = 0; i < length; i++) {
    shortCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return shortCode;
}

// Function to shorten a long URL
function encodeURL(longURL, customLength = 6) {
  let shortCode;
  do {
    shortCode = generateShortCode(customLength);
  } while (urlDatabase[shortCode]); 
  
  urlDatabase[shortCode] = longURL;
  
  return `http://localhost:${PORT}/${shortCode}`;
}
