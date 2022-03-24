var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var itemJSON = require("./contracts/Item.sol/Item.json");
var productJSON = require("./contracts/Product.sol/Product.json");

var app = express();

// set env vars down to jade
process.env.ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || "http://127.0.0.1:8545"
app.locals.env = process.env;
const { MongoClient } = require('mongodb');
const client = new MongoClient(`mongodb://santai:1234@localhost:27017/santaiDB`);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.get('/', function (req, res, next) {
  res.render('index', {
    title: 'The Ethereum Block Explorer'
  });
});

app.get('/block/:number/', function (req, res, next) {
  var number = req.params['number'];
  res.render('block', {
    title: 'Block',
    number: number
  });
});

app.get('/tx/:hash/', function (req, res, next) {
  var hash = req.params['hash'];
  res.render('transaction', {
    title: 'Transaction',
    hash: hash
  });
});

app.get('/address/:address/', async function (req, res, next) {
  var address = req.params['address'];
  res.render('address', {
    title: 'Address',
    address: address,
    itemJSON: JSON.stringify(itemJSON),
    productJSON: JSON.stringify(productJSON),
    sourceList: "HAHAHA"
  });
});

app.get('/shid/:shid/', async function (req, res, next) {
  const shid = req.params['shid'];
  const address = await getItemData(shid)
  res.render('address', {
    title: 'Address',
    address: address,
    itemJSON: JSON.stringify(itemJSON),
    productJSON: JSON.stringify(productJSON),
    sourceList: "HAHAHA"
  });
});

app.get('/phid/:phid/', async function (req, res, next) {
  const phid = req.params['phid'];
  const address = await getProductData(phid)
  res.render('address', {
    title: 'Address',
    address: address,
    itemJSON: JSON.stringify(itemJSON),
    productJSON: JSON.stringify(productJSON),
    sourceList: "HAHAHA"
  });
});

app.get('/watch', function (req, res, next) {
  res.render('watch', {
    title: 'Watch'
  });
});

app.post('/decoder', function (req, res, next) {
  // req.body.data
  res.json({});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

async function getItemData(shid) {
  await client.connect();
  const data = await client.db().collection('items').find({shid: parseInt(shid, 10)}).toArray()
  return data.length === 0 ? '' : data[0].address
}

async function getProductData(phid) {
  await client.connect();
  const data = await client.db().collection('products').find({phid: parseInt(phid, 10)}).toArray()
  return data.length === 0 ? '' : data[0].address
}

module.exports = app;
