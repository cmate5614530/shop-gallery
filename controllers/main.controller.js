var request = require('request');
var invoiceModel = require('../models/ivoices');
var ejs = require('ejs')
var fs = require('fs');
var AWS = require('aws-sdk');
var bucket = new AWS.S3();
var categoryModel = require('../models/category');
var subCategoryModel = require('../models/subCategory')
var goodsModel = require('../models/goods');
var productsModel = require('../models/products')
const BunnyStorage = require('bunnycdn-storage').default;
const bunnyStorage = new BunnyStorage('2a944ef0-da96-4a87-8201f411dcb2-5fc9-4073', 'fashinbutik/');

class mainController {
    async seeds(req, res) {
        let goods = await goodsModel.find({})
        for (let i = 0; i < goods.length; i++) {
            let good = goods[i];
            let { images, name, description } = good
            let item = {
                images,
                name,
                description,
                categoryID: 'km9UpKcZ',
                subCategoryID: 'Y4s2AX6T'
            }
            await productsModel.create(item);
        }
        res.send('Created');
    }

    index(req, res) {
        res.render('index');
    }
    subCategory(req, res) {
        res.render('pages/subCategory');
    }
    productPage(req, res) {
        res.render('pages/productView')
    }
    async getProducts(req, res) {
        let { categoryID, subCategoryID, page } = req.body;
        page = parseInt(page)
        if (page == 1) {
            let category = await categoryModel.findOne({ categoryID })
            let subCategory = await subCategoryModel.findOne({ subCategoryID });
            let breadcrumb = {
                category,
                subCategory
            }
            let productsCount = await productsModel.find({ categoryID, subCategoryID }).countDocuments()
            let products = await productsModel.find({ categoryID, subCategoryID }).limit(24)
            res.json({ status: true, data: products, productsCount, breadcrumb });
        } else {
            let products = await productsModel.find({ categoryID, subCategoryID }).skip((page - 1) * 24).limit(24)
            res.json({ status: true, data: products });
        }
    }
    async editProduct(req, res) {
        let { name, description, _id } = req.body;
        productsModel.findOneAndUpdate({ _id }, { name, description }, (err, response) => {
            if (err) return res.json({ status: false, msg: "Unknown Error" });
            res.json({ status: true, msg: "Successfully saved." });
        })
    }
    async download(req, res) {
        let { id } = req.params
        let file = `${process.cwd()}/invoices/${id}.pdf`;
        res.download(file)
    }
    async deleteCategory(req, res) {
        let { id } = req.params;
        await categoryModel.deleteOne({ categoryID: id });
        res.json({ status: true, msg: "Category was deleted" });
    }
    async createCategory(req, res) {
        let image = fs.readFileSync(req.file.path)
        let key = `category/${req.file.filename}.${req.file.originalname.split('.')[req.file.originalname.split('.').length - 1]}`
        let response = await bunnyStorage.upload(image, key);
        let { data } = response
        if (data.Message == 'File uploaded.') {
            let categoryID = generateRandomString(8);
            let data = {
                categoryID,
                name: req.body.categoryName,
                imageUrl: `${process.env.PULL_ZONE_URL}${key}`
            }
            await categoryModel.create(data)
            fs.unlinkSync(`${req.file.path}`)
            res.json({ status: true, msg: "Category was Created", data });;
        } else {
            res.json({ status: false, msg: "Some error was caused." });
        }
    }
    async createSubCategory(req, res) {
        let image = fs.readFileSync(req.file.path);
        let key = `category/${req.file.filename}.${req.file.originalname.split('.')[req.file.originalname.split('.').length - 1]}`
        let response = await bunnyStorage.upload(image, key);
        let { data } = response;
        console.log("mainController -> createSubCategory -> data", data)
        if (data.Message == 'File uploaded.') {
            let subCategoryID = generateRandomString(8);
            let subcategory = {
                categoryID: req.body.categoryID,
                subCategoryID,
                name: req.body.subCategoryName,
                imageUrl: `${process.env.PULL_ZONE_URL}${key}`
            }
            await subCategoryModel.create(subcategory)
            fs.unlinkSync(`${req.file.path}`)
            res.json({ status: true, msg: "Subcategory was Created" });;
        } else {
            res.json({ status: false, msg: "Some error was caused." });
        }
    }
    async createProductDB(req, res) {
        let data = req.body;
        console.log("mainController -> createProductDB -> data", data)
        await productsModel.create(data);
        res.json({ status: true });
    }
    async getCategory(req, res) {
        let data = await categoryModel.find({});
        res.json({ status: true, data });
    }
    async getCategories(req, res) {
        let category = await categoryModel.find({});
        let subCategory = await subCategoryModel.find({ categoryID: category[0].categoryID })
        let data = {
            category,
            subCategory
        }
        res.json({ status: true, data });
    }
    async getSubCategory(req, res) {
        let { categoryID } = req.body
        let data = await subCategoryModel.find({ categoryID: categoryID });
        res.json({ status: true, data });
    }
    // async getSubCategories(req, res) {
    //     let categoryID = req.body.category;
    //     let subcategory = await subCategoryModel
    // }
    async createInvoice(req, res) {
        let user = req.user;
        delete user.password
        if (req.method == 'GET') {
            res.render('pages/invoice', { title: 'Create Invoice', user: user });
        } else if (req.method == 'POST') {
            let { invoiceList } = req.body;
            invoiceList = JSON.parse(invoiceList);
            let { data, others } = invoiceList;
            let totalYuan = 0;
            for (let i = 0; i < data.length; i++) {
                totalYuan += parseFloat(data[i].price) * data[i].qty + parseFloat(data[i].shippingCost);
            }
            let totalCommition = (others.commision * totalYuan / 100).toFixed(2);
            let totalNaira = (totalYuan * others.exchangeRate).toFixed(2);
            others.customerInfo.address = others.shipAddress
            let tdata = {
                user: others.customerInfo,
                data,
                totalYuan,
                totalCommition,
                totalNaira,
                currentTime: new Date()
            }
            // res.json({ status: true });
            let nowDate = Date.now();
            let options = { format: 'A4' };
            ejs.renderFile(`${process.cwd()}/views/pages/invoice-template.ejs`, { data: tdata }, function (err, data) {
                pdf.create(data, options).toFile(`${process.cwd()}/invoices/${nowDate}.pdf`, (err, data) => {
                    if (err) {
                        res.json({ status: false });
                    } else {
                        invoiceModel.create({
                            userID: user.userID,
                            name: `${others.customerInfo.firstName} ${others.customerInfo.lastName}`,
                            time: nowDate
                        }, (err, response) => {
                            if (err) {
                                res.json({ status: false });
                            }
                            res.json({ status: true });;
                        })
                    }
                })
            })
        }
    }

    async viewProductDetail(req, res) {
        let { id } = req.body;
        let { SECRET_KEY, API_KEY } = process.env;
        let url = `https://api.onebound.cn/1688/api_call.php?key=${API_KEY}&secret=${SECRET_KEY}&api_name=item_get&num_iid=${id}&lang=en`
        let response = await sendRequest(url)
        response = JSON.parse(response);
        if (response.item) {
            let { detail_url, pic_url, price, express_fee, props } = response.item;
            let productDetail = {
                detail_url, pic_url, price, express_fee
            }
            if (props && props.length > 0) {
                for (let i = 0; i < props.length; i++) {
                    let prop = props[i];
                    if (prop.name == 'color') productDetail.color = prop.value.split(',');
                    if (prop.name == 'size') productDetail.size = prop.value.split(',');
                }
            }
            res.json({ status: true, productDetail });
        } else {
            res.json({ status: false, msg: response.error });
        }
    }
}

function generateRandomString(length) {
    var ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var ID_LENGTH = length;
    var rtn = '';
    for (var i = 0; i < ID_LENGTH; i++) {
        rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    return rtn;
}

function sendRequest(url) {
    return new Promise((resolve, reject) => {
        let options = {
            url: url,
            method: "GET",
            headers: {}
        };
        request(options, (err, res, body) => {
            if (err) console.log(err);
            resolve(body);
        });
    });
}


module.exports = mainController;