const express = require('express');
const app = express();
const spicedPg = require('spiced-pg');
const fs = require('fs');

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

const knox = require('knox');
let secrets;
if (process.env.NODE_ENV == 'production') {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require('./secrets'); // secrets.json is in .gitignore
}
const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: 'reallydavid'
});


app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.render('index');
});


app.get('/images', function(req, res) {
    db.query('SELECT * FROM images').then(function(result) {
        // console.log(result);
        for (var i in result.rows) {
            result.rows[i].url = url;
        }
        res.json({
            data: result.rows

        });
    });
});

app.post('/upload', uploader.single('file'), uploadToS3, function(req, res) {
    // If nothing went wrong the file is already in the uploads directory
    // console.log(req.file);
    // console.log(req.body);
    db.query(`INSERT INTO images (image, title, username, description) VALUES ($1, $2, $3, $4)`, [req.file.filename, req.body.title, req.body.user, req.body.descr]);
    res.json({
        success: true
    });
});

app.listen(8080, () => console.log(`I'm listening.`));



function uploadToS3(req, res, next) {
    // console.log(req);
    const s3Request = client.put(req.file.filename, {
        'Content-Type': req.file.mimetype,
        'Content-Length': req.file.size,
        'x-amz-acl': 'public-read'
    });

    const readStream = fs.createReadStream(req.file.path);
    readStream.pipe(s3Request);

    s3Request.on('response', function(resp) {
        if (resp.statusCode != 200) {
            res.json({
                success: false
            });
        } else {
            next();
        }
    });
}
