'use strict';
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var teamSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    inviteCode: {
        type: String,
        required: true
    },
    users: {
        bsonType: "array",
        minItems: 0,
        maxItems: 4,
        uniqueItems: true,
        required: true,
    },

});

function teamLimit(val) {
    return val.length <= 4;
}

module.exports = mongoose.model('Teams', teamSchema);