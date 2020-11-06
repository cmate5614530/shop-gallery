var mongoose = require('mongoose');

var Invoice = mongoose.Schema({
    userID: {
        type:String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    }
}
)
module.exports = mongoose.model('invoice', Invoice);