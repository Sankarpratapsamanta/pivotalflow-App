const mongoose=require("mongoose");

const blogCommentSchema=new mongoose.Schema({
    body:String,
    created:{type:Date,default:Date.now},
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        },
        username:String
    }
});

module.exports=mongoose.model("blogcomment",blogCommentSchema);