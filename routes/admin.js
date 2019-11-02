const express=require("express");
const router=express.Router();
const user=require("../models/user");



router.get("/pivotalflow/account/:account_id",function(req,res){
    user.findById(req.params.account_id,function(err,account){
        if(err){
            console.log("err")
        }else{
            res.render("user/account",{user:account})
        }
    })
});














module.exports=router;