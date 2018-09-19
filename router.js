var UserController = require('./controllers/UserController');
var ProductController = require('./controllers/ProductController');
var CompanyController = require('./controllers/CompanyController');
var OfferController = require('./controllers/OfferController');
var CategoryController = require('./controllers/CategoryController');
var SubcategoryController = require('./controllers/SubcategoryController');
var CountriesController = require('./controllers/CountriesController');
var StatesController = require('./controllers/StatesController');
var AdminController = require('./controllers/AdminController');
var LockerController = require('./controllers/LockerController');
var HelpController = require('./controllers/HelpController');
var CommodityController = require('./controllers/insights/CommodityController');
var InsightController = require('./controllers/insights/InsightController');
var EInsightsController = require('./controllers/elastic/EInsightsController');
var EUserController = require('./controllers/elastic/EUserController');
var DashboardController = require('./controllers/DashboardController');

var banners = require('./controllers/BannersController');


var express = require('express');
var jwt = require('jsonwebtoken');
var config = require('./config/config.json')['system'];
var multer = require("multer");
var OAuth2 = require("oauth").OAuth2;
var models = require('./models');
var utils = require('./helpers/utils.js');

// Routes
module.exports = function (app) {

    app.get('/', (req, res) => {
        res.send('Revere Watch API is running at <a href="' + config.api_endpoint + '">' + config.api_endpoint + '</a>');
    });

    app.get('/fb',(req, res) => {
       
        var FB = require('fb');
        FB.setAccessToken('EAACEdEose0cBAJjLjbUmgEgD0BzDxHJltFyLseyBX1mPoRURXNZCvhcbfD88H65l2hLxwbKhEAiyNwUN8Nq3p813opeboTaMFHwY0Ww3Nv0jSstXB5em6xDQwU0gZBaNf9qNcnDBe1QTAqpAntQZCcZB7ZBljeifZB87tK6MmLnS5sNvaDwdeq5nHZASobw1TNSBbuGf1NmpQZDZD');
    
        var body = 'My first post using facebook-node-sdk';
        FB.api('me/feed', 'post', { message: body, link: 'http://ec2-35-178-115-252.eu-west-2.compute.amazonaws.com/insights/preview/23'}, function (res) {
        if(!res || res.error) {
            console.log(!res ? 'error occurred' : res.error);
            return;
        }
        });
        res.json({'hi':res.id});
    });
    accessToken = null;

    function handshake(code, ores) {
        let  querystring = require('querystring');     
        //set all required post parameters
        var data = querystring.stringify({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: config.domain+'linked-in',//should match as in Linkedin application setup
            client_id: '75mokwxxgpgynx',
            client_secret:'OOuPyGj2sWmJ3p6X'// the secret
        });
    
        var options = {
            host: 'www.linkedin.com',
            path: '/oauth/v2/accessToken',
            protocol: 'https:',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        let  http = require('https');   
        var req = http.request(options, function (res) {
             var data = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                data += chunk;
    
            });
            res.on('end', function () {
                //once the access token is received store in DB           
                let postData = JSON.parse(data);    
                if(postData.access_token){
                    models.settings.findOne({where:{social:'linkedin'}}).then(data=>{
                        let lindate= parseInt(postData.expires_in/(60*60*24));             
                        postData.expires_at=utils.addDate(lindate);
                    if(data){
                    data.updateAttributes(postData).then(settings => {
                        postData.access_token;
                        return ores.json(settings);
                    })
                    }else{
                        postData.social='linkedin';                 
                        models.settings.create(postData).then(settings => {
                            return ores.json(settings);
                        })
                    }
                    });
                }         
            });
            req.on('error', function (e) {
                return ores.json({'error':e.message});
            });
    
        });
        req.write(data);
        req.end();    
    
    }


    app.get('/linked-in',(req, response) => {

     // return  response.json({'error':utils.addDate(60)});
        
        if(req.query.code){
            handshake(req.query.code, response);      
        }       
    })
    
    var apiRoutes = express.Router();
    apiRoutes.get('/', (req, res) => {
        res.send('Welcome to Revere API service');
    });    

    /******Testing*****/
     apiRoutes.get('/search', UserController.test);
    /******END - Testing*****/

    apiRoutes.post('/filter-problems', HelpController.FilterProblems);
    apiRoutes.post('/login', UserController.Login);
    apiRoutes.post('/forgot-password', UserController.ForgotPwd);
    apiRoutes.post('/reset-password', UserController.ResetPwd);
    apiRoutes.post('/change-password', UserController.ChangePwd);
    apiRoutes.post('/checkuserlevel', UserController.checkuserlevel);
    
    //Elastic
    apiRoutes.get('/elastic/insights', EInsightsController.GetInsights);
    apiRoutes.get('/elastic/tickers', EInsightsController.GetTickers);
    apiRoutes.get('/elastic/analysts', EUserController.getAnalysts);
    
    //Insights 
    apiRoutes.get('/commodity-types',CommodityController.CommodityTypes);
    apiRoutes.post('/commodities',CommodityController.CreateCommodity);
    apiRoutes.delete('/commodity/:id', CommodityController.DeleteCommodity);
    apiRoutes.get('/commodities/:id', CommodityController.GetCommodity);
    apiRoutes.put('/commodities/:id', CommodityController.UpdateCommodity);
    apiRoutes.post('/filterCommodities', CommodityController.FilterCommodities);
    apiRoutes.post('/create-insight',InsightController.CreateInsight);

    apiRoutes.get('/insights/:id',InsightController.GetInsights);
    apiRoutes.get('/userVertical/:user',InsightController.GetVerticalUserInsights);
    apiRoutes.get('/companyVertical/:companyId',InsightController.GetVerticalCompanyInsights);
    apiRoutes.get('/userInsCount/:user',InsightController.GetUserInsightCount);
    apiRoutes.get('/compFollowCount/:user',InsightController.GetCompanyFollowCount);
    apiRoutes.get('/userFollowCount/:user',InsightController.GetUserFollowCount);
    apiRoutes.get('/companyInsCount/:companyId',InsightController.GetCompanyInsightCount);
    apiRoutes.get('/userSectorDist/:user',InsightController.GetSectorUserInsights);
    apiRoutes.get('/companySectorDist/:companyId',InsightController.GetSectorCompanyInsights);
    apiRoutes.get('/ins/:user',InsightController.GetLatestInsights);
    apiRoutes.get('/insight/:companyId',InsightController.companyInsights);
    //apiRoutes.put('/updateinsight/:id',InsightController.UpdateInsight);
    apiRoutes.post('/insight/path', InsightController.Upload);
    apiRoutes.post('/insights/files', InsightController.UploadImage);
    apiRoutes.post('/insightcomment/path', InsightController.InsightcommentUpload);
    apiRoutes.post('/insight_comments/:id', InsightController.CreateInsightComment);
    apiRoutes.post('/insights_commentsreply/:id',InsightController.GetCommentInsights);
    apiRoutes.get('/insight-comment/:id',InsightController.GetComment);
    
    apiRoutes.post('/insight-views', InsightController.CreateInsightViews);
    apiRoutes.get('/ins-views-count/:id', InsightController.InsightViewsCount);
    apiRoutes.post('/add-to-watchlist', InsightController.AddWatchlist);
    apiRoutes.get('/ins-comments-count/:id', InsightController.InsightCommentsCount);
    apiRoutes.post('/insight-client-rating', InsightController.addInsightRating);
    apiRoutes.post('/get-insight-rating', InsightController.getInsightRating);

    
    apiRoutes.post('/filter-insights', InsightController.FilterInsights);
    apiRoutes.put('/publish-insight', InsightController.PublishInsight);
    apiRoutes.post('/status-count', InsightController.InsightsCountByStatus)
    apiRoutes.post('/editorier-status-count', InsightController.EditoriereInsightsCountByStatus)
    apiRoutes.get('/latest-insight/:companyId',InsightController.companyLatestInsights);
    apiRoutes.delete('/insight/:id', InsightController.DeleteInsight);
    apiRoutes.delete('/insight-attachment/:id', InsightController.DeleteInsightAttachements);
        //Users        
        apiRoutes.post('/analyst-follower', UserController.CreateAnalystFollower);

         //Analyst Companies
         apiRoutes.post('/company', CompanyController.CreateCompany);
         apiRoutes.put('/company/:id', CompanyController.UpdateCompany);
         apiRoutes.get('/company/:id', CompanyController.GetCompany);
         apiRoutes.get('/companyByName/:name', CompanyController.GetCompanyByname);
         apiRoutes.get('/companies', CompanyController.Companies);
         apiRoutes.post('/filterCompanies', CompanyController.FilterCompanies);
         apiRoutes.delete('/company/:id', CompanyController.DeleteCompany);
         apiRoutes.get('/auto-search-Companies', CompanyController.AutoSearchCompanies);
         
        //Users
        apiRoutes.post('/user', UserController.CreateUser);
        apiRoutes.post('/filterUsers', UserController.FilterMUsers);
        apiRoutes.get('/user/:id', UserController.GetUser);
        apiRoutes.put('/user/:id', UserController.UpdateUser);
        apiRoutes.get('/user-details/:id', UserController.getUerDetails);

        

        apiRoutes.post('/privillage', UserController.CreatePrivillage);
        apiRoutes.get('/privillage/:id', UserController.GetPrivillages);
        
        
        apiRoutes.get('/users', UserController.Users);
        apiRoutes.get('/users/:companyId', UserController.UsersByCompany);
        apiRoutes.post('/filterClients', UserController.FilterClients);
        apiRoutes.delete('/user/:id', UserController.DeleteUser);
        apiRoutes.post('/user/profile-pic', UserController.Upload);
        apiRoutes.post('/user/about-files', UserController.UploadImage);
        apiRoutes.post('/adminlist',UserController.UserList)
        apiRoutes.get('/auto-search-editoriers', UserController.AutoSearchEditorier);
        apiRoutes.post('/contact-us', UserController.CreateContactUs);
        apiRoutes.post('/role', UserController.GetRole);
   
    



    //Analysts
    apiRoutes.post('/analyst', UserController.CreateUser);
    apiRoutes.put('/analyst/:id', UserController.UpdateUser);
    apiRoutes.get('/analyst/:id', UserController.GetUser);
    apiRoutes.get('/analyst', UserController.Users);
    apiRoutes.post('/filterAnalysts', UserController.FilterAnalysts);
    apiRoutes.delete('/analyst/:id', UserController.DeleteUser);

    //Management/Admin
    apiRoutes.post('/management', UserController.CreateUser);
    apiRoutes.put('/management/:id', UserController.UpdateUser);
    apiRoutes.get('/management/:id', UserController.GetUser);
    apiRoutes.post('/filterAdmins', UserController.FilterAdmins);
    apiRoutes.delete('/management/:id', UserController.DeleteUser);

    //Editoriers
    apiRoutes.post('/editorier', UserController.CreateUser);
    apiRoutes.put('/editorier/:id', UserController.UpdateUser);
    apiRoutes.get('/editorier/:id', UserController.GetUser);
    apiRoutes.post('/filterEditoriers', UserController.FilterEditoriers);
    apiRoutes.delete('/editorier/:id', UserController.DeleteUser);

    
    //Products
    apiRoutes.post('/product', ProductController.CreateProduct);
    apiRoutes.put('/updateproduct/:id',ProductController.UpdateProduct);
    apiRoutes.get('/product/:id', ProductController.GetProduct);
    apiRoutes.get('/products', ProductController.Products);
    apiRoutes.post('/products/path', ProductController.Upload);
    apiRoutes.delete('/products/remove-file', ProductController.RemoveFile);
    apiRoutes.post('/filterProducts', ProductController.FilterProducts);
    apiRoutes.delete('/product/:id', ProductController.DeleteProduct);
    apiRoutes.delete('/products/:id', ProductController.DeleteProductsAttachements);
    apiRoutes.post('/products/files', ProductController.UploadImage);

   //lockers
   apiRoutes.post('/lockers', LockerController.CreateLocker);
   apiRoutes.get('/lockers/:id', LockerController.GetLockers);
   apiRoutes.post('/filter-lockers', LockerController.FilterLockers);
   apiRoutes.post('/lockers/path', LockerController.Upload);
   apiRoutes.delete('/lockers/remove-file', LockerController.RemoveFile);
   apiRoutes.post('/fetch-lockercounts/:id', LockerController.fetchCounts);
   apiRoutes.get('/locker-types',LockerController.LockerTypes);

   //apiRoutes.get('/usersalllocker/:id', LockerController.Users);
   //Offers
   apiRoutes.post('/offers', OfferController.CreateOffers);
   apiRoutes.put('/offers/:id', OfferController.UpdateOffer);
   apiRoutes.get('/offers/:id', OfferController.GetOffers);
   apiRoutes.get('/offers', OfferController.Offers);
   apiRoutes.delete('/offers/:id', OfferController.DeleteOffer);
   apiRoutes.post('/filteroffers', OfferController.FilterOffers);
   apiRoutes.post('/offers/path', OfferController.Upload);
  

    //Categories
    apiRoutes.post('/categories', CategoryController.CreateCategories);
    apiRoutes.put('/categories/:id', CategoryController.UpdateCategory);
    apiRoutes.get('/categories/:id', CategoryController.GetCategories);
    apiRoutes.get('/categories', CategoryController.Categories);
    apiRoutes.delete('/categories/:id', CategoryController.DeleteCategory);
    apiRoutes.post('/filtercategories', CategoryController.FilterCategories);
    apiRoutes.post('/categories/path', CategoryController.Upload);
    apiRoutes.post('/filterContacts', CategoryController.FilterContacts);

    // Mobile Users
    apiRoutes.post('/mobile-users', UserController.Users);

    //Countries
    apiRoutes.post('/countries', CountriesController.Createcountries);
    apiRoutes.get('/countries/:id', CountriesController.GetCountry);
    apiRoutes.put('/countries/:id', CountriesController.UpdateCountry);
    apiRoutes.delete('/countries/:id', CountriesController.DeleteCountry);
    apiRoutes.post('/filterCountries', CountriesController.FilterCountries);
    //States
    apiRoutes.post('/states', StatesController.Createstates);
    apiRoutes.get('/states/:id', StatesController.GetState);
    apiRoutes.put('/states/:id', StatesController.UpdateState);
    apiRoutes.post('/filterStates', StatesController.FilterStates);
    apiRoutes.delete('/states/:id', StatesController.DeleteState);

    //SubSector
   apiRoutes.get('/subcategory/:id', SubcategoryController.GetSubcategory);
   apiRoutes.post('/subcategory', SubcategoryController.CreateSubCategory);
   apiRoutes.put('/subcategory/:id', SubcategoryController.UpdateSubCategory);
   apiRoutes.delete('/subcategory/:id', SubcategoryController.DeleteSubCategory);
   apiRoutes.post('/filterSubCategory', SubcategoryController.FilterSubCategories);
   apiRoutes.get('/subcategories', SubcategoryController.Subcategory);
   apiRoutes.post('/subcategories/path', SubcategoryController.Upload);

    //apiRoutes.get('/subcategories/:category_id', SubcategoryController.Subsector);
    apiRoutes.get('/countries', CountriesController.Countries);
    apiRoutes.get('/states', StatesController.States);
    apiRoutes.get('/categories', CategoryController.Categories);
    apiRoutes.get('/subcategories', SubcategoryController.SubCategories);
    

   //Problems
   apiRoutes.post('/problems', HelpController.CreateHelp);
   apiRoutes.post('/problem_comments/:id', HelpController.CreateHelpComment);
   apiRoutes.get('/problems/:id', HelpController.GetProblems);
   apiRoutes.post('/problems_commentsreply/:id',HelpController.GetReplyProblems);
   apiRoutes.get('/problem-comment/:id',HelpController.GetComment);
   apiRoutes.post('/filterProblems', HelpController.FilterProblems);
   apiRoutes.post('/problems/path', HelpController.Upload);
   apiRoutes.post('/help/files', HelpController.UploadImage);
   apiRoutes.delete('/problems/remove-file', HelpController.RemoveFile);
   apiRoutes.post('/fetch-helpcounts/:id', HelpController.fetchCounts);
   apiRoutes.put('/problems-comments', HelpController.UpdateUnread);
  
   //Admin Dashboard
    apiRoutes.post('/fetch-counts', AdminController.GetchCounts);
    apiRoutes.post('/daywise-counts', AdminController.DayWiseCounts);
    //apiRoutes.get('/subsector', SubsectorController.Subsector);

    apiRoutes.get('/get-all-aprods',ProductController.getAllActiveProducts);
    apiRoutes.get('/get-all-acats',CategoryController.getAllActiveCats);
    apiRoutes.post('/banners/path', banners.uploadBanner);
    apiRoutes.post('/add-banner', banners.addBanner);
    apiRoutes.post('/get-banners',banners.getBanners);

    
    
    //Middleware function to authentication
    apiRoutes.use(UserController.authenticate);
  
    //Dashboard 
    apiRoutes.get('/trending-insights',DashboardController.TrendingInsights);
    apiRoutes.get('/new-insights',DashboardController.NewInsights);
    apiRoutes.get('/research-insights',DashboardController.ResearchInsights);
    apiRoutes.post('/watch-list',DashboardController.MyWatchlist);
    apiRoutes.post('/privillages',DashboardController.Privillagelist);

    




    app.use('/v1', apiRoutes);
};
