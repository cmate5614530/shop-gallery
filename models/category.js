var mongoose = require('mongoose');

var category = mongoose.Schema({
    categoryID: {
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
module.exports = mongoose.model('category', category);