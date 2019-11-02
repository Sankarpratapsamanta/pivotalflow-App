const express=require("express");
const router=express.Router();
const product=require("../models/product");
const middleware=require("../middlewares/productmiddleware")
const stripe=require("stripe")(process.env.STRIPESECRETKEY);




router.get("/pivotalflow/product/:id/checkout",middleware.isLogged,function(req,res){
    product.findById(req.params.id,function(err,payment){
        if(err){
          req.flash("error","Something wents wrong..");
            res.redirect("back");
        }else{
            res.render("products/payment",{payment:payment});
        }
    });
});
router.post("/pivotalflow/product/:id/charge",middleware.isLogged,function(req,res){
  const amount = req.body.amount *100;
  stripe.customers.create({
    description:req.body.description,
    email: req.body.email,
    source: req.body.stripeToken
  })
  .then(customer =>  {
    stripe.paymentIntents.create({
    amount,
    description:req.body.name,
    confirmation_method: 'manual',
    currency:'inr',
    payment_method: 'pm_card_visa',
    payment_method_types: ['card'],
    confirm: true,
    customer:customer.id
  })})
  .then(paymentIntents => res.render("products/paymentdone"));
});
module.exports=router;