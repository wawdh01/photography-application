const router = require('express').Router();

router.get('/', async(req, res)=>{
    res.render("components/contact")
})

module.exports = router