const mongoose = require('mongoose')

const userschema = mongoose.Schema({
    username:String,password:String,email:String
})

module.exports = mongoose.model('users',userschema)