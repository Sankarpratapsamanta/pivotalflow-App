const express=require("express");
const router=express.Router();
const product=require("../models/product");
const comment=require("../models/productcomment");
const middleware=require("../middlewares/productmiddleware");
const multer=require("multer");
const cloudinary = require("cloudinary").v2;


//Multer
//===============================================================
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
//========================================================================



router.get("/pivotalflow/product",function(req,res){
    res.redirect("/pivotalflow/products/"+ req.params._page)
});

router.get("/pivotalflow/products/:page",function(req,res){
    var perPage = 6
    var page = req.params.page || 1
    product.find({}).skip((perPage * page) - perPage).limit(perPage).exec(function(err, products) {
        product.count().exec(function(err, count) {
            if (err) return next(err)
            res.render("products/product", {
                product: products,
                current: page,
                pages: Math.ceil(count / perPage)
            });
        });
    });
});

router.get("/pivotalflow/addproduct",middleware.isLogged,function(req,res){
    res.render("products/addproduct");
});


router.post("/pivotalflow/addproduct",middleware.isLogged,function(req,res){
    upload(req,res,function(err){
        if(err){
            req.flash("error",err.message);
            res.redirect("back");
        }else{
            cloudinary.uploader.upload(req.file.path,function(err,result){
                if(err){
                req.flash("error","something wents wrong..");
                }else{
                    const photo=result.secure_url;
                    const photoId=result.public_id;
                    const title=req.body.title;
                    const price=req.body.price;
                    const body=req.body.description;
                    const author={
                        id:req.user._id,
                        username:req.user.username
                    }
                const products={title:title,photo:photo,photoId:photoId,price:price,description:body,author:author};
                product.create(products,function(err,products){
                    if(err){
                        req.flash("error","Something wents wrong..");
                        res.redirect("back");
                    }else{
                        req.flash("success","Your product is ready to go..");
                        res.redirect("/pivotalflow/product");
                    }
                });
            }
        });

        }
    })
});

router.get("/pivotalflow/product/:id",function(req,res){
    product.findById(req.params.id).populate("comments").exec(function(err,findproduct){
        if(err){
            req.flash("error","Something wents wrong..");
            res.redirect("back");
        }else{
            res.render("products/showproduct",{product:findproduct});
        }
    });
});

router.get("/pivotalflow/product/:id/edit",middleware.checkProductOwnership,function(req,res){
    product.findById(req.params.id,function(err,toedit){
        if(err){
            req.flash("error","Something wents wrong..");
            res.redirect("back");
        }else{
            res.render("products/edit",{edit:toedit});
        }
    });
});

router.put("/pivotalflow/product/:id",middleware.checkProductOwnership,function(req,res){
    upload(req,res,function(err){
        if(err){
            req.flash("error",err.message);
            res.redirect("back");
        }else{
   
    product.findById(req.params.id,function(err,product){
        if(err){
            req.flash("error",err.message);
            res.redirect("back");
            return;
        }else{
            if(req.file){
                cloudinary.uploader.destroy(product.photoId,function(err){
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
                                product.photoId=result.public_id;
                                product.photo=result.secure_url;
                                product.title=req.body.title;
                                product.price=req.body.price;
                                product.description=req.body.description;
                                product.save();
                                req.flash("success","your product is successfully updated");
                                res.redirect("/pivotalflow/product");
                               
                                return;
                            }
                        })
                    }
                })
            }else{
                product.title=req.body.title;
                product.price=req.body.price;
                product.description=req.body.description;
                product.save();
                req.flash("success","your product is successfully updated");
                res.redirect("/pivotalflow/product");
               
            }
        }
    });
    }
});
});

router.delete("/pivotalflow/product/:id",middleware.checkProductOwnership,function(req,res){
    product.findById(req.params.id,function(err,product){
        if(err){
            req.flash("error",err.message);
            res.redirect("back");
            return;
        }else{
            cloudinary.uploader.destroy(product.photoId,function(err,result){
                if(err){
                    req.flash("error",err.message);
                    res.redirect("back");
                }else{
                    product.remove();
                    req.flash("success","You successfully delete your product..");
                    res.redirect("/pivotalflow/product");
                }
            })
        }
    })
});

router.post("/pivotalflow/product/:id",middleware.isLogged,function(req,res){
    product.findById(req.params.id,function(err,comments){
        if(err){
            res.redirect("back");
        }else{
            const newcomment=req.body.comment
            comment.create(newcomment,function(err,commentcreate){
                if(err){
                   req.flash("error","Something wents wrong..");
                   res.redirect("back");
                }else{
                    commentcreate.author.id=req.user._id,
                    commentcreate.author.username=req.user.username;
                    commentcreate.save();
                    comments.comments.push(commentcreate);
                    comments.save();
                    req.flash("success","You successfully send your review..");
                    res.redirect("/pivotalflow/product/" + comments._id);
                }
            });  
        }
    });
});
module.exports=router;