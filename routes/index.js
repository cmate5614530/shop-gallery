var express = require('express');
var router = express.Router();
var mainController = require('../controllers/main.controller')
var main = new mainController();
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer({ dest: 'temp/', })

router.use(bodyParser.json());
/* GET home page. */
router.get('/', isLoggedIn, main.index);

router.get('/signin', function (req, res, next) {
  res.render('auth/signin');
});

router.get('/signup', function (req, res, next) {
  // let messages = req.flash('error')
  // console.log("messages", messages)
  // res.render('auth/signup', { messages: messages, hasError: messages.length > 0 });
  res.redirect('/signin');
});

// POST
router.post('/createCategory', isLoggedIn, upload.single('categoryImage'), main.createCategory)
router.post('/getProducts', isLoggedIn, main.getProducts);
//router.post('/getAllProducts', isLoggedIn, main.getAllProducts);
router.post('/viewProductDetail', isLoggedIn, main.viewProductDetail);
router.post('/category/createSubCategory', upload.single('subCategoryImage'), isLoggedIn, main.createSubCategory)

/* SEEDs */
router.get('/seeds', isLoggedIn, main.seeds)
//GET 
router.get('/getCategory', isLoggedIn, main.getCategory);
router.get('/deleteCategory/:id', isLoggedIn, main.deleteCategory);
router.get('/category/:categoryID/subCategory/:subCategoryID/subSubCategory/deleteAlbum/:id', isLoggedIn, main.deleteAlbum);
router.get('/category/:categoryID', isLoggedIn, main.subCategory);
router.get('/category/deleteSubCategory/:id', isLoggedIn, main.deleteSubCategory);

router.post('/category/:categoryID/subCategory/createSubSubCategory', upload.single('subSubCategoryImage'), isLoggedIn, main.createSubSubcategory)
router.post('/getSubSubCategory', main.getSubSubCategory);
router.get('/category/:categoryID/subCategory/:subCategoryID', isLoggedIn, main.subSubCategory);
router.get('/category/:categoryID/subCategory/:subCategoryID/subSubCategory/:subSubCategoryID', main.productPage);
router.get('/category/:categoryID/subCategory/deleteSubSubCategory/:id', isLoggedIn, main.deleteSubSubCategory);

router.get('/create-invoice', isLoggedIn, main.createInvoice);
router.post('/create-invoice', isLoggedIn, main.createInvoice);
router.post('/editProduct', isLoggedIn, main.editProduct);
router.post('/editProductPath', isLoggedIn, main.editProductPath);
router.post('/setAlbumName', isLoggedIn, main.setProductName);

router.get('/getCategories', main.getCategories)
router.post('/createProductDB', main.createProductDB);
router.post('/getSubCategory', main.getSubCategory);
router.post('/setCover', isLoggedIn, main.setCover);
router.get('/invoice/:id', isLoggedIn, main.download);
router.post('/searchByTag', main.searchByTag);
router.get('/search', main.searchAlbum);
module.exports = router;

function isLoggedIn(req, res, next, next2) {
  if (req.isAuthenticated()) {
    return next();
  }else{
    return next2();
  }
}