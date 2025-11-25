const router = require('express').Router();
const auth = require('../middleware/auth');
const Catalogue = require('../models/catalogueModel')
const User = require('../models/userModel')
const { ulid } = require('ulid');

function generateProductId() {
  return ulid();
}


router.post('/add', auth, async(req, res)=> {
    try {
        
        const email = req.user.email;
        const {image_link, name, price, description} = req.body;
        catalogueId = generateProductId()
        if (!image_link ||!name ||!price ||!description) {
            return res.status(400).json({errorMessage: "Please enter all Required fields."});
        }
        const catalogueData = new Catalogue({
            email,
            catalogueId,
            name,
            price,
            image_link,
            description
        })
        if (req.user.login_type == 0) {
            //only admin user has access
            const catalogueSavedData = await catalogueData.save()
            res.status(201).send(catalogueSavedData)
        }
        else {
            return res.status(403).json({errorMessage: "You are not authorized to perform operations related to catlogue."});
        }
    }
    catch(e){
        console.log(e);
        res.status(500).send();
    }
})



router.get('/', async(req, res)=>{
    try {
        const catalogueId = req.query.catalogueId;
        let isAdmin = false
        if (res.locals.isLoggedIn) {
            isAdmin = true
        }
        else {
            isAdmin = false
        }
        if (!catalogueId) {
            const catalogueData = await Catalogue.find();
            res.render("components/catalogue", {isAdmin, catalogueData})
            //res.status(200).send(catalogueData)
        }
        else {
            const catalogueData = await Catalogue.findOne({catalogueId: catalogueId})
            if (catalogueData) {
                res.render("components/catalogue", {isAdmin, catalogueData})
                //res.status(200).send(catalogueData)
            }
            else {
                res.status(404).json({errorMessage:"Unable to find the catalogue."})
            }
        }
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
        if (req.user.login_type == 0) {
            const isDeleted = await Catalogue.deleteOne({catalogueId: catalogueId});
            if (isDeleted.n == 0) {
                return res.status(400).json({errorMessage: `Can not find the item ${catalogueId} in your Catalogue`});
            }
        }
        else {
            return res.status(403).json({errorMessage: "You are not authorized to perform operations related to catlogue."});
        }
        res.status(200).send();
    }
    catch(e) {
        console.log(e);
        res.status(500).send();
    }
})

router.post('/update', auth, async (req, res) => {
    try {
        const email = req.user.email;
        const { catalogueId, image_link, price, name, description} = req.body;

        if (!catalogueId || !image_link || !price || !name || !description) {
            return res.status(400).json({
                errorMessage: `Cannot update item ${catalogueId} - Missing fields.`
            });
        }

        const filter = { catalogueId };
        const update = { $set: { image_link, price, name, description} };

        if (req.user.login_type == 0) {
            const result = await Catalogue.updateOne(filter, update);

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: "Catalogue ID not found" });
            }
        }
        else {
            return res.status(403).json({errorMessage: "You are not authorized to perform operations related to catlogue."});
        }

        return res.status(200).json({
            message: "Item updated successfully"
        });

    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

module.exports = router;