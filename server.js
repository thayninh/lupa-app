// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
var multer = require('multer');
var unzipper = require('unzipper');
const uuidv4 = require('uuid/v4');
var fs = require('fs');
const fsExtra = require('fs-extra');
var cmd = require('node-cmd');

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

//====================================================================

//get uploaded file
app.post('/upload', upload.any(), (req, res, next) => {
  try {
    //create uuid folder
    var uuid_v4 = uuidv4();
    var dir = path.join(__dirname, `upload/${uuid_v4}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    //unzip file
    var zip_file_path = req.files[0].path;
    var basename = path.basename(zip_file_path);
    var file_extension = path.extname(basename);
    if (file_extension == '.zip') {
      fs.createReadStream(zip_file_path).pipe(unzipper.Extract({ path: dir }));
      //delete origin file
      fs.unlinkSync(zip_file_path);
      //send status of uploaded process
      res.send({ status: 'Sucessfully uploaded', uuid: uuid_v4 });
    } else {
      fs.unlinkSync(zip_file_path);
      res.send({ status: 'Fail uploaded' });
    }
  }
  catch (error) {
    res.send({ status: 'Fail uploaded' });
  }
});

//get singal for processing
app.post('/process', (req, res, next) => {
  try {
    var received_uuid = req.body.uuid;
    var source_file = path.join(__dirname, 'lupa.py');
    var dest_file = path.join(__dirname, `upload/${received_uuid}/lupa.py`);
    //copy lupa.py to uuid folder
    fsExtra.copy(source_file, dest_file, err => {
      if (err) {
        res.send({ status: 'Fail processed' });
      } else {
        //run cmd command "C:\\Program Files\\QGIS 3.0\\bin\\python-qgis.bat" ${dest_file}
        var command = `"C:\\Program Files\\QGIS 3.0\\bin\\python-qgis.bat" ${dest_file}`;
        cmd.get(
          command,
          function (err, data, stderr) {
            if (err) {
              res.status(500).send({ status: 'Fail processed' });
            } else {
              res.status(200).send({ status: 'Sucessfully processed' });
              console.log(data)
            }
          }
        );
      }
    });
  } catch (error) {
    res.send({ status: 'Fail processed' });
  }
});
//====================================================================



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