const product=require("../models/product");

const middlewareObj={};


middlewareObj.checkProductOwnership=function(req,res,next){
    if(req.isAuthenticated()){
        product.findById(req.params.id,function(err,comments){
            if(err){
                req.flash("error","Product not found");
                res.redirect("back");
            }else{
                if(comments.author.id.equals(req.user.id) || req.user.adminCode){
                    next();
                }else{
                    req.flash("error","Permission denied");
                    res.redirect("back");
                }
            }
        })
    }else{
        res.redirect("/login");
    }
}

middlewareObj.isLogged=function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash("error","You must be Logged in to do that..");
        res.redirect("/login");
    }
}


module.exports=middlewareObj;