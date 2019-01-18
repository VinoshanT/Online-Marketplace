const path = require('path');
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

var Datastore = require('nedb');
var products = new Datastore({ filename: 'db/products.db', autoload: true, timestampData:true});
var carts = new Datastore({ filename: 'db/carts.db', autoload: true, timestampData:true});

// Create products
app.post('/api/products/', function (req, res, next) {
    products.insert(req.body, function (err, product) {
        if (err) return res.status(500).end(err);
        return res.json(product);
    });
});

// Fetch product by Id
app.get('/api/products/:productId', function (req, res, next) {
    products.findOne({ _id: req.params.productId}, function(err, product) {
        if (err) return res.status(500).end(err);
        if (!product) return res.status(404).end("Product id:" +  req.params.productId + " does not exist");
        return res.json(product);
    });
});

// Fetch product all products
app.get('/api/products/', function (req, res, next) {
    var inventory = 0;
    if (req.query.inventory){
        if (parseInt(req.query.inventory) != 0){
            inventory = 1;
        }   
    }
    products.find({ inventory_count: { $gte: inventory }}).sort({createdAt:1}).exec(function(err, data) {
        if (err) return res.status(500).end(err);
        return res.json(data);
    });
});


// Create a cart
app.post('/api/carts/', function (req, res, next) {
    carts.insert(req.body, function (err, cart) {
        if (err) return res.status(500).end(err);
        return res.json(cart);
    });
});


// add product to cart
app.put('/api/carts/:cartId', function (req, res, next){
    // check if product exists first
    products.findOne({ _id: req.body.productId}, function(err, product) {
        if (err) return res.status(500).end(err);
        if (!product) return res.status(404).end("Product id:" +  req.body.productId + " does not exist");
        // check if cart exists
        carts.findOne({_id: req.params.cartId}, function(err, cart){
            if (err) return res.status(500).end(err);
            if (!cart) return res.status(404).end("Cart id:" + req.params.cartId + " does not exist");
            // update cart
            cart.products.push(req.body.productId)
            cart.total_cost += product.price
            carts.update({ _id: req.params.cartId }, { $set: {products: cart.products, total_cost: cart.total_cost} }, function () {
                return res.json(cart);
            });
        });
    });
});


// Fetch cart
app.get('/api/carts/:cartId', function (req, res, next) {
    carts.findOne({ _id: req.params.cartId}, function(err, data) {
        if (err) return res.status(500).end(err);
        if (!data) return res.status(404).end("Cart id:" +  req.params.cartId + " does not exist");
        return res.json(data);
    });
});

async function purchaseProducts(prods){
    for (var i = 0; i < prods.length; i++) {
        // retrieve product
        await products.findOne({ _id: prods[i]}, function(err, product) {
            if (!err && product){
                // update product if enough in stock
                if (product.inventory_count > 0) {
                    product.inventory_count -= 1;
                    products.update({ _id: product._id }, { $set: {inventory_count: product.inventory_count} }, function (){});
                }
            }
        });
    } 
}

// Complete cart
app.delete('/api/carts/:cartId', function (req, res, next) {
    // search for cart
    carts.findOne({ _id:  req.params.cartId }, function (err, cart) {
        if (err) return res.status(500).end(err);
        if (!cart) return res.status(404).end("Cart id:" + req.params.cartId + " does not exist");
        // update inventory counts
        purchaseProducts(cart.products)
        // remove cart once completed
        carts.remove({ _id: req.params.cartId }, {}, function (err, numRemoved) {
            return res.json(cart);   
        });     
    });
});

const http = require('http');
const PORT = 3000;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});

