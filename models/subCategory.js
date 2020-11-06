var mongoose = require('mongoose');

var subCategory = mongoose.Schema({
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
    imageUrl: {
        type: String,
        required: true
    }
}
)
module.exports = mongoose.model('subCategory', subCategory);