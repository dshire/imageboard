const express = require('express');
const app = express();
const spicedPg = require('spiced-pg');

var multer = require('multer');
var uidSafe = require('uid-safe');
var path = require('path');

var db = spicedPg(`postgres:webuser:letmein@localhost:5432/imageboard`);

var url = require('./config.json').s3Url;

var diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        filesize: 2097152
    }
});

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.render('index');
});


app.get('/images', function(req, res) {
    db.query('SELECT * FROM images').then(function(result) {
        for (var i in result.rows) {
            result.rows[i].url = url;
        }
        res.json({
            data: result.rows

        });
    });
});

app.post('/upload', uploader.single('file'), function(req, res) {
    // If nothing went wrong the file is already in the uploads directory
    console.log(req.file);
    if (req.file) {
        res.json({
            success: true
        });
    } else {
        res.json({
            success: false
        });
    }
});

app.listen(8080, () => console.log(`I'm listening.`));
