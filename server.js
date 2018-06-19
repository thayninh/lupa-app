// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
var multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/upload')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage })

// Parsers for POST data
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(cors());

// Point static path to dist
app.use(express.static(path.join(__dirname, 'build')));


// Catch all other routes and return the index file
app.get('*', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

//get upload file
app.post('/upload',upload.any(), (req, res, next) => {
  res.send({status: 'Sucessfully uploaded'})
});
/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '4000';
app.set('port', port);

/**
 * Create HTTP server
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));