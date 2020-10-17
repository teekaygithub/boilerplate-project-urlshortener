'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.DB_URI);
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

let myUrlModel = require('./AppDB.js').urlModel;

const urlRegex = /^http[s]*\:\/\/w{3}\.\w*\.com$/;
// Shorten URL
// 1. valid url?
// 2. does it already exist in DB?
// 3. if not, create it
let createShortUrl = require('./AppDB.js').createUrl;
app.post("/api/shorturl/new", function(req,res) {
    if(urlRegex.test(req.body.url_input)){
        console.log("input URL: ", req.body.url_input);

        myUrlModel.findOne({"original_url": req.body.url_input}, function(err, result) {
            if (err) {
                console.log("server error:", err);
                res.status(404).json({"error": err});
            }
            
            if(result) { //Already exists, do not save data
                res.status(200).json(result);
            } else {
                createShortUrl(req.body.url_input, function(err, data) {
                    if(err) {return res.status(404).json({"error": err})};
                    res.status(200).json(data);
                });
            }        
        });
    } else {
        res.status(404).json({"error": "invalid URL"});
    }
});

// Access short URL
// 1. does it already exist in DB?
// 2. if not, access it
let findMyUrl = require('./AppDB.js').findByUrl;
app.get("/api/shorturl/:shorturl", function(req,res){
    findMyUrl(req.params.shorturl, function(err,data) {
        if(err) {
            console.log("server error:", err);
            res.status(500).json({"error": err});
        }
        if (data) {
            console.log("getreq result:", data);
            res.redirect(data["original_url"]);
        } else {
            res.status(200).send("No entry found!");
        }
    });
});

let deleteMyUrl = require('./AppDB.js').deleteUrl
app.delete("/api/shorturl/:shorturl", function(req,res) {
    findMyUrl(req.params.shorturl, function(err, result) {
        if(err) {
            console.log();
            res.status(500).send("server error", err);
        }
        if (result) {
            deleteMyUrl(req.params.shorturl, function(err, data) {
                if(err) {
                   console.log("deletemyurl failed");
                   res.status(500).json({"error": err});
                }
                res.status(200).json({"data": data});
            });
        } else {
            res.status(200).send("Unable to find entry");
        }
    });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});