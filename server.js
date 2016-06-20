// set up ======================================================================
var express  = require('express');
var ParseServer = require('parse-server').ParseServer;

var app      = express();                 // create our app w/ express
var port     = process.env.PORT || 8100;        // set the port
var morgan   = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');

var APP_FOLDER = "/www";

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var config = {
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/parse/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:8100/parse'
}

var api = new ParseServer(config);
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey


app.use("/", express.static(__dirname + APP_FOLDER));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

app.listen(port);

app.get('/', function(req, res) {
  res.sendfile(path.resolve(__dirname + APP_FOLDER + '/index.html'));
});


app.get('/config.js',function(req,res){
    var setup = {
      appId: config.appId,
      masterKey: config.masterKey, //Add your master key here. Keep it secret!
      serverURL: config.serverURL,  // Don't forget to change to https if needed
   };
    res.send("var CONFIG="+JSON.stringify(setup));
});

console.log("App listening on port " + port);