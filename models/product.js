const mongoose=require("mongoose");

const productSchema=new mongoose.Schema({
    title:{type:String,required:true},
    photo:{type:String,required:true},
    photoId:String,
    price:{type:Number,required:true},
    description:{type:String,required:true},
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        },
        username:String,
    },
    comments:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"productcomment"
        }
    ]
});

module.exports=mongoose.model("products",productSchema);