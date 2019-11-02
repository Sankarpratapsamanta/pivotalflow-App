const express=require("express");
const router=express.Router();
const blog=require("../models/blog");
const comment=require("../models/blogcomment");
const middleware=require("../middlewares/blogmiddleware");
const multer=require("multer");
const cloudinary = require("cloudinary").v2;

//Multer
//=========================================
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


//===========================================

router.get("/pivotalflow/blog",function(req,res){
    res.redirect("/pivotalflow/blogs/"+ req.params._page)
});



router.get("/pivotalflow/blogs/:page",function(req,res){
    var perPage = 6
    var page = req.params.page || 1
    blog.find({}).skip((perPage * page) - perPage).limit(perPage).exec(function(err, findblog) {
        blog.count().exec(function(err, count) {
            if (err) return next(err)
            res.render("./blogs/blog", {
                blog: findblog,
                current: page,
                pages: Math.ceil(count / perPage)
            });
        });
    });
});



router.get("/pivotalflow/addblog",middleware.isLogged,function(req,res){
    res.render("./blogs/addblog");
});



router.post("/pivotalflow/addblog",middleware.isLogged,function(req,res){
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
                    const body=req.body.body;
                    const author={
                        id:req.user._id,
                        username:req.user.username
                    }
                    const oneuser={photo:photo,photoId:photoId,title:title,body:body,author:author};
                    blog.create(oneuser,function(err,newblog){
                        if(err){
                            res.redirect("back");
                        }else{
                            req.flash("success","You successfully created a blog..");
                            res.redirect("/pivotalflow/blog");
                        }
                    });
                }
            })
        }
    });
});



router.get("/pivotalflow/blog/:id",function(req,res){
    blog.findById(req.params.id).populate("comments").exec(function(err,findblog){
        if(err){
            res.redirect("back")
        }else{
            res.render("./blogs/showblog",{myblog:findblog});
        }
    })
});



router.get("/pivotalflow/blog/:id/edit",middleware.checkBlogOwnership,function(req,res){
    blog.findById(req.params.id,function(err,toedit){
        if(err){
            res.redirect("back");
        }else{
            res.render("./blogs/edit",{edit:toedit});
        }
    });
});



router.put("/pivotalflow/blog/:id",middleware.checkBlogOwnership,function(req,res){
    upload(req,res,function(err){
        if(err){
            req.flash("error",err.message);
            res.redirect("back");
        }else{
   
    blog.findById(req.params.id,function(err,blog){
        if(err){
            req.flash("error",err.message);
            res.redirect("back");
            return;
        }else{
            if(req.file){
                cloudinary.uploader.destroy(blog.photoId,function(err){
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
                                blog.photoId=result.public_id;
                                blog.photo=result.secure_url;
                                blog.title=req.body.title;
                                blog.body=req.body.body;
                                blog.save();
                                req.flash("success","your blog is successfully updated");
                                res.redirect("/pivotalflow/blog");
                                return;
                            }
                        })
                    }
                })
            }else{
                blog.title=req.body.title;
                blog.body=req.body.body;
                blog.save();
                req.flash("success","your blog is successfully updated");
                res.redirect("/pivotalflow/blog");
            }
        }
    });
    }
});
});



router.delete("/pivotalflow/blog/:id",middleware.checkBlogOwnership,function(req,res){
    blog.findById(req.params.id,function(err,blog){
        if(err){
            req.flash("error",err.message);
            res.redirect("back");
            return;
        }else{
            cloudinary.uploader.destroy(blog.photoId,function(err,result){
                if(err){
                    req.flash("error",err.message);
                    res.redirect("back");
                }else{
                    blog.remove();
                    req.flash("success","You successfully delete your blog..");
                    res.redirect("/pivotalflow/blog");
                }
            })
        }
    })
});



router.get("/pivotalflow/blog/:id/comment",middleware.isLogged,function(req,res){
    blog.findById(req.params.id,function(err,blogcomment){
        if(err){
            res.redirect("back")
        }else{
            res.render("./blogs/blogcomment",{comment:blogcomment});
        }
    });  
});



router.post("/pivotalflow/blog/:id",middleware.isLogged,function(req,res){
    blog.findById(req.params.id,function(err,comments){
        if(err){
            res.redirect("back");
        }else{
            const newcomment=req.body.comment;
            comment.create(newcomment,function(err,commentcreate){
                if(err){ 
                   res.redirect("back");
                }else{
                    commentcreate.author.id=req.user._id;
                    commentcreate.author.username=req.user.username;
                    commentcreate.save();
                    comments.comments.push(commentcreate);
                    comments.save();
                    req.flash("success","You successfully send your comment..");
                    res.redirect("/pivotalflow/blog/" + comments._id);
                }
            })
        }
    })
});




router.get("/pivotalflow/blog/:id/comment/:comment_id/edit",middleware.checkBlogCommentOwnership,function(req,res){
    comment.findById(req.params.comment_id,function(err,findcomment){
        if(err){
            res.redirect("back");
        }else{
            res.render("./blogs/editcomment",{blogid:req.params.id,edit:findcomment});
        }
    });
});



router.put("/pivotalflow/blog/:id/comment/:comment_id",middleware.checkBlogCommentOwnership,function(req,res){
    comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updated){
        if(err){
            console.log("err");
        }else{
            req.flash("success","You successfully edit your comment..");
            res.redirect("/pivotalflow/blog/" + req.params.id);
        }
    });
});



router.delete("/pivotalflow/blog/:id/comment/:comment_id",middleware.checkBlogCommentOwnership,function(req,res){
    comment.findByIdAndRemove(req.params.comment_id,function(err){
        if(err){
            console.log("err")
        }else{
            req.flash("success","You successfully delete your comment..");
            res.redirect("/pivotalflow/blog/" + req.params.id);
        }
    })
});


module.exports=router;