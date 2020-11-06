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