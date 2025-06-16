const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const blogUserSchema = new Schema({
  name: String,
  email: String,
  profilePhotoUrl: String,
  password:String,
  ip: String,//for not registered users
  likedPosts: [Schema.Types.Mixed],
});



module.exports = mongoose.model('blogUser', blogUserSchema);


