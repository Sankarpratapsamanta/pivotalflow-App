const blog=require("../models/blog");
const comment=require("../models/blogcomment");


const middlewareObj={};
middlewareObj.checkBlogOwnership=function(req,res,next){
    if(req.isAuthenticated()){
        blog.findById(req.params.id,function(err,blogs){
            if(err){
                req.flash("error","Blog not found");
                res.redirect("back");
            }else{
                if(blogs.author.id.equals(req.user.id) || req.user.adminCode){
                    next();
                }else{
                    req.flash("error","permission denied");
                    res.redirect("back");
                }
            }
        });
    }else{
        res.redirect("/login")
    }
}

middlewareObj.checkBlogCommentOwnership=function(req,res,next){
    if(req.isAuthenticated()){
        comment.findById(req.params.comment_id,function(err,checkcomment){
            if(err){
                req.flash("error","Comment not found");
                res.redirect("back");
            }else{
                if(checkcomment.author.id.equals(req.user.id) || req.user.adminCode){
                    next();
                }else{
                    req.flash("error","Permission denied");
                    res.redirect("back");
                }
            }
        })
    }else{
        req.flash("error","You must be Logged in to do that..");
        res.redirect("/login");
    }
}

middlewareObj.isLogged=function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash("error","You must be Logged in to do that..");
        res.redirect("/login")
    }
}


module.exports=middlewareObj;