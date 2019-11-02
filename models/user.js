const mongoose=require("mongoose");
const passportLocalMongoose=require("passport-local-mongoose");

const UserSchema =new mongoose.Schema({
    username:{type:String,required:true,unique: true},
    password:String,
    adminCode:{type:Boolean,default:false},
    email:{type: String,index:true, required: true, unique: true,uniqueCaseInsensitive: true },
    gender:String,
    photo:String,
    photoId:String,
    birthday:{
        day:Number,
        month:String,
        year:Number,
    }
});

UserSchema.plugin(passportLocalMongoose,{ usernameUnique: true});

module.exports=mongoose.model("user",UserSchema);