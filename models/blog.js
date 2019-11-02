const mongoose=require("mongoose");

const blogSchema=new mongoose.Schema({
    photo:String,
    photoId:String,
    title:String,
    created:{type:Date,default:Date.now},
    body:String,
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username:String,
    },
    comments: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"blogcomment"
        }
    ],
});

module.exports=mongoose.model("blog",blogSchema);