const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BlogModel = new Schema({
    title:String,
    email:String,
    name:String,
    blog:String,
    slug:{type: String, required: true, unique: true},
    profilePhotoUrl:String,//for profile photo
    blogImageUrl:String,//for blog image if any
    datePublished:String,
    likes:{
        type:Number,
        default:0,
    },
    // dislikes:{
    //     type:Number,
    //     default:0,
    // },
})

module.exports = mongoose.model('blogs',BlogModel);