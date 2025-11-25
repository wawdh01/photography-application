const router = require('express').Router();
const auth = require('../middleware/auth');
const Cart = require('../models/cartModel');


router.post('/add', auth, async(req, res)=> {
    try {
        
        const email = req.user.email;
        const {catalogueId} = req.body;
        if (!catalogueId) {
            return res.status(400).json({errorMessage: "Please enter all Required fields."});
        }
        const existingCart = await Cart.findOne({email:email})
        if (existingCart) {

            catalogueIdsList = existingCart.catalogueIds
            catalogueIdsList.push(catalogueId)
            const filter = {_id: existingCart._id}
            const update = { $set: {catalogueIds: catalogueIdsList}}

             const result = await Cart.updateOne(filter, update);

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: "Not able to update the cart. Please try after some time." });
            }
        }
        else {
            const cartData = new Cart({
                email,
                catalogueIds:[catalogueId]
            })
            const cartSavedData = await cartData.save()
            res.status(201).send(cartSavedData)
        }

        res.status(200).send()
        
    }
    catch(e){
        console.log(e);
        res.status(500).send();
    }
})


router.get('/', auth, async(req, res)=>{
    try {
        const email = req.user.email;
        const cartData = await Cart.find({email:email});
        res.status(200).send(cartData)
    }
    catch(e) {
        console.log(e);
        res.status(500).send();
    }
})

router.post('/delete', auth, async(req, res)=>{
    try {
        const email = req.user.email;
        const {catalogueId} = req.body;
        if (!catalogueId) {
            return res.status(400).json({errorMessage: "Please enter all Required fields."});
        }

        const removedCatalogue = await Cart.updateOne({ email: email },{ $pull: { catalogueIds: catalogueId }});

        if (!removedCatalogue) {
            return res.status(400).json({errorMessage: `Can not find the item ${catalogueId} in your cart`});
        }
        res.status(200).send({message:"Removed the catalogue from the cart."});
    }
    catch(e) {
        console.log(e);
        res.status(500).send();
    }
})


module.exports = router;