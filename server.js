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
app.get('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

app.get('/report', (req, res, next) => {
  try {
    var uuid = req.query.ID;
    res.sendFile(path.join(__dirname, `upload/${uuid}/workspace/report.html`));
  } catch (error) {
    console.log(error);
  }
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
      
      //Copy lupa and lupa1 to uuid folder
      var source_file_lupa = path.join(__dirname, 'lupa.py');
      var source_file_lupa1 = path.join(__dirname, 'lupa1.py');
      var dest_file_lupa = path.join(__dirname, `upload/${uuid_v4}/lupa.py`);
      var dest_file_lupa1 = path.join(__dirname, `upload/${uuid_v4}/lupa1.py`);
      fsExtra.copy(source_file_lupa, dest_file_lupa, err => {
        if (err) {
          res.send({ status: 'Fail uploaded' });
        } else {
          fsExtra.copy(source_file_lupa1, dest_file_lupa1, err => {
            if (err) {
              res.send({ status: 'Fail uploaded' });
            } else {
              //delete origin file
              fs.unlinkSync(zip_file_path);
              res.send({ status: 'Sucessfully uploaded',uuid: uuid_v4 });
            }
          });
        }
      });
    } else {
      fs.unlinkSync(zip_file_path);
      res.send({ status: 'Fail uploaded' });
    }
  }
  catch (error) {
    res.send({ status: 'Fail uploaded' });
  }
});

//get singal for processing luapa
app.post('/process-lupa', (req, res, next) => {
  try {
    var received_uuid = req.body.uuid;
    var dest_file_lupa = path.join(__dirname, `upload/${received_uuid}/lupa.py`);

    //run cmd command "C:\\Program Files\\QGIS 3.0\\bin\\python-qgis.bat" ${dest_file}
    var command = `"C:\\Program Files\\QGIS 3.0\\bin\\python-qgis.bat" ${dest_file_lupa}`;
    cmd.get(
      command,
      function (err, data, stderr) {
        if (err) {
          res.status(500).send({ status: 'Fail processed' });
        } else {
          console.log(data)
          res.status(200).send({ status: 'Sucessfully processed'});
        }
      }
    );

  } catch (error) {
    res.send({ status: 'Fail processed' });
  }
});

//get singal for processing for lupa1
app.post('/process-lupa1', (req, res, next) => {
  try {
    var received_uuid = req.body.uuid;
    var dest_file_lupa1 = path.join(__dirname, `upload/${received_uuid}/lupa1.py`);

    //run cmd command "C:\\Program Files\\QGIS 3.0\\bin\\python-qgis.bat" ${dest_file}
    var command = `"C:\\Program Files\\QGIS 3.0\\bin\\python-qgis.bat" ${dest_file_lupa1}`;
    cmd.get(
      command,
      function (err, data, stderr) {
        if (err) {
          console.log(err);
          res.status(500).send({ status: 'Fail processed' });
        } else {
          console.log(data)
          res.status(200).send({  status: 'Sucessfully processed'});
        }
      }
    );

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