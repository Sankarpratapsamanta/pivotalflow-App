const express=require("express");
const router=express.Router();
const passport=require("passport");
const User=require("../models/user");
const multer=require("multer");
const path=require("path");
const middleware=require("../middlewares/productmiddleware");
const cloudinary = require("cloudinary").v2;


//MULTER
//===============================================
const storage=multer.diskStorage({
    filename:function(req,file,cb){
        cb(null,+ Date.now() + file.originalname);
    }
});
const upload=multer({
    storage:storage,
    limits:{fileSize:1000000},
    fileFilter:function(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
            cb("error");
        }
        cb(null,true);
    }
}).single('photo');

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_USERNAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET_KEY
});

//=========================================

router.get("/signup",function(req,res){
    res.render("signup");
});

router.post("/signup",function(req,res){
    upload(req,res,function(err){
        if(err){
            req.flash("error",err.message);
        }else{
            cloudinary.uploader.upload(req.file.path,function(err,result){
                if(err){
                    console.log(err)
                }else{
                const photo=result.secure_url;
                const photoId=result.public_id;
                const newuser=new User({username:req.body.username,photo:photo,photoId:photoId,email:req.body.email,gender:req.body.gender,birthday:req.body.birthday});
                if(req.body.adminCode===process.env.CODE){
                    newuser.adminCode=true;
                } 
                User.register(newuser,req.body.password,function(err,user){
                    if(err){
                        req.flash("error",err.message);
                        res.redirect("back");
                    }else{
                        passport.authenticate("local")(req,res,function(){
                            if(user.adminCode){
                                req.flash("success","Admin logged in");
                                res.redirect("/pivotalflow");
                                return;
                            }
                            req.flash("success","Welcome to Pivotalflow" + " " +user.username.toUpperCase() + "... " + "Have a Good day!");
                            res.redirect("/pivotalflow");
                        });
                    }
                });
            }
            })
        }
    })
});

router.put("/signup/:account_id",middleware.isLogged,function(req,res){
    upload(req,res,function(err){
        if(err){
            req.flash("error",err.message);
            res.redirect("back");
        }else{
   
    User.findById(req.params.account_id,function(err,User){
        if(err){
            req.flash("error",err.message);
            res.redirect("back");
            return;
        }else{
            if(req.file){
                cloudinary.uploader.destroy(User.photoId,function(err){
                    if(err){
                        req.flash("error",err.message);
                        res.redirect("back");
                    }else{
                        cloudinary.uploader.upload(req.file.path,function(err,result){
                            if(err){
                                req.flash("error",err.message);
                                res.redirect("back");
                                return;
                            }else{
                                User.photoId=result.public_id;
                                User.photo=result.secure_url;
                                User.username=req.body.username;
                                User.email=req.body.email;
                                User.birthday=req.body.birthday;
                                User.save();
                                req.flash("success","your profile is successfully updated ! ");
                                res.redirect("/pivotalflow");
                                return;
                            }
                        })
                    }
                })
            }else{
                User.username=req.body.username;
                User.email=req.body.email;
                User.birthday=req.body.birthday;
                User.save();
                req.flash("success","your profile is successfully updated ! ");
                res.redirect("/pivotalflow");
            }
        }
    });
    }
});
});

router.get('/forgot', function(req, res) {
    res.render('forgot');
  });

router.post("/forgot",function(req,res){
  User.findByUsername(req.body.username).then(function(sanitizedUser){
    if (sanitizedUser){
        sanitizedUser.setPassword(req.body.password, function(){
            sanitizedUser.save();
            req.flash("success","your password is successfully changed ! ");
            res.redirect("/pivotalflow")
        });
    } else {
      req.flash("error","This user does not exist !");
      res.redirect("back");
    }
},function(err){
    res.redirect("back");
})
});


router.get("/login",function(req,res){
    res.render("login");
});



router.post("/login",passport.authenticate("local",
{successFlash: 'Welcome !',
successRedirect:"/pivotalflow",
failureRedirect:"/login",
failureFlash: true })
,function(req,res){
 
});



router.get("/logout",function(req,res){
    req.logOut();
    req.flash("success","Successfully Logged out");
    res.redirect("/pivotalflow");
});


module.exports=router;