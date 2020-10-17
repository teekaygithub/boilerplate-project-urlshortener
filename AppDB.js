try {
  var mongoose = require('mongoose')
} catch (e) {
  console.log(e);
}
require('dotenv').config()

const {Schema} = mongoose;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }); 

const urlschema = new Schema({
    original_url: String,
    short_url: Number
});

var URL = mongoose.model("URL", urlschema);

let shortUrls = [0];

let shortUrlGenerator = function() {
    let temp = shortUrls[shortUrls.length-1]+1;
    shortUrls.push(temp);
    return temp;
}

// create
var createUrl = function(url, done) {
    var newURL = new URL({
        "original_url": url,
        "short_url": shortUrlGenerator()
    });
    
    newURL.save(function(err, data) {
        if(err) console.log(err);
        done(null, data)
    });
}

// read
var findByUrl = function(url, done) {
    URL.findOne({"short_url": url}, function(err, data) {
        if(err) console.log(err);
        done(null, data);
    });
}

// update

// delete
var deleteUrl = function(shorturl, done) {
    URL.findOneAndDelete({"short_url": shorturl}, function(err, data) {
        if (err) console.log("deletion error:", err);
        done(null, data);
    });
}

// EXPORTS
exports.urlModel = URL;
exports.createUrl = createUrl;
exports.findByUrl = findByUrl;
exports.deleteUrl = deleteUrl;