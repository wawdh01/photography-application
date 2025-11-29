const router = require('express').Router();
const auth = require('../middleware/auth');
const Cart = require('../models/cartModel');
const Catalogue = require('../models/catalogueModel');
const Order = require('../models/orderModel')
const { ulid } = require('ulid');

function generateOrderId() {
  return ulid();
}

router.get('/createOrder', auth, async(req, res)=>{
    try {
        const email = req.user.email;
        const cartItems = Cart.findOne({email:email})
        let catalogueList = []
        let price = 0
        if (cartItems) {
            catalogueIds = cartItems.catalogueIds
            for(const item of catalogueIds) {
                const catalogueDetails = Catalogue.findOne({catalogueId: item})
                if (catalogueDetails) {
                    catalogueList.push(catalogueDetails)
                    price = price + catalogueDetails.price
                }
                else {
                    res.status(200).json({errorMessage:"Unable to find the catalogue present in your cart. Please check cart details."})
                }
            }
            const OrderId = generateOrderId()
            const newOrder = new Order({
                email: email,
                orderId: orderId,
                CatalogueIdDetails: catalogueList, 
                date: new Date(),
                price: price,
                payment_status: "Pending"
            });

            const savedOrder = await newOrder.save();

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                }
            });
            var mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: `Your Order is created - ${OrderId}`,
                        html: "<p>Dear User, <br>Your order has been created,<br>Thank you."
                      };
                      //console.log("Comes Here....");
                      transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                          console.log(error);
                        } else {
                          console.log('Email sent: ' + info.response);
                        }
                      });
                    res.status(200).json(savedOrder);
        }
        else {
            res.send(200).json({message:"Unable to create the order as cart is empty."})
        }

    }
    catch(e) {
        console.error(e);
        res.status(500).send();
    }
})

router.post('/getAllOrder', auth, async(req, res)=>{
    try {
        const email = req.user.email;
        const orderData = await Order.find({email:email});
        if(orderData) {
            res.status(200).send(catalogueData)
        }
        else {
            res.status(200).json({message:"No Order Found for your account."})
        }
        
    }
    catch(e) {
        console.error(e)
        res.status(500).send();
    }
})


module.exports = router;