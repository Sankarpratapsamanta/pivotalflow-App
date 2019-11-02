const express=require("express");
const router=express.Router();

router.get("/",function(req,res){
    res.redirect("/pivotalflow");
});
router.get("/pivotalflow",function(req,res){
    res.render("home");
});

router.get("/pivotalflow/about",function(req,res){
    res.render("about");
});
router.get("/pivotalflow/service",function(req,res){
    res.render("service");
});
router.get("/pivotalflow/contact",function(req,res){
    res.render("contact");
});
module.exports=router;