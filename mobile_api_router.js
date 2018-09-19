var muser = require('./controllers/mobile/UsersController');
var mproducts = require('./controllers/mobile/ProductsController');
var mdata = require('./controllers/mobile/DataController');
var cart = require('./controllers/mobile/CartController');
var wl = require('./controllers/mobile/WatchListController');

var express = require('express');

module.exports = function (app) {
    var apiRoutes = express.Router();
    apiRoutes.post('/login',muser.VerifyApiCode,muser.Login);
    apiRoutes.post('/register',muser.VerifyApiCode,muser.Register);
    apiRoutes.post('/add-address',muser.authenticate,muser.saveUserAddress);
    apiRoutes.post('/get-addresses',muser.authenticate,muser.getUserAddresses);

    apiRoutes.get('/categories',muser.authenticate,mproducts.GetCategories);
    apiRoutes.get('/subcategories/:cat_id',muser.authenticate,mproducts.GetSubCategories);
    apiRoutes.get('/products/:cat_id',muser.authenticate,mproducts.GetProductsByCat);
    apiRoutes.get('/products/:cat_id/:scat_id',muser.authenticate,mproducts.GetProductsBySubCat);
    apiRoutes.get('/product/:pid',muser.authenticate,mproducts.GetProductDetails); 
    apiRoutes.post('/product-review',muser.authenticate,mproducts.submitProdReview);     
    
    apiRoutes.post('/get-states',muser.authenticate,mdata.getStates); 
    apiRoutes.get('/get-countries',muser.authenticate,mdata.getCountries);

    apiRoutes.post('/add-to-cart',muser.authenticate,cart.addToCart);
    apiRoutes.post('/remove-from-cart',muser.authenticate,cart.removeFromCart);
    apiRoutes.post('/cart',muser.authenticate,cart.getCart);
    apiRoutes.post('/cart-count',muser.authenticate,cart.getCartCount);

    apiRoutes.post('/add-to-wl',muser.authenticate,wl.addToWl);
    apiRoutes.post('/remove-from-wl',muser.authenticate,wl.removeFromWl);
    apiRoutes.post('/watchlist',muser.authenticate,wl.getWatchList);
    
    app.use('/app', apiRoutes);    
};
