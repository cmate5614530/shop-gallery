var mongoose = require('mongoose');

var subSubCategory = mongoose.Schema({
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
module.exports = mongoose.model('subSubCategory', subSubCategory);