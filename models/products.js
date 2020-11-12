var mongoose = require('mongoose');

var products = mongoose.Schema({
    categoryID: {
        type: String,
        required: true
    },
    subCategoryID: {
        type: String,
        required: true
    },
    subSubCategoryID: {
        type:String,
        required: true
    },
    tag:{
        type:String,
        required: false
    },
    cover:{
        type:String,
        required:false
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: {
        type: Array,
        default: []
    }
}, {
    timestamps: {
        createdAt: 'created_at'
    }
}
)
module.exports = mongoose.model('products', products);