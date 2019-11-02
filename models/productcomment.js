const mongoose=require("mongoose");

const productCommentSchema= new mongoose.Schema({
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

module.exports=mongoose.model("productcomment",productCommentSchema);