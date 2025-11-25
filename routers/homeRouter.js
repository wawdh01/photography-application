const router = require('express').Router();

router.get("/", (req, res)=>{
    res.render("components/home")
})

module.exports = router;