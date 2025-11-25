const router = require('express').Router();

const Login = require('../models/userModel');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const auth = require('../middleware/auth');


router.get("/login", async(req, res)=>{
    res.render("login")
})

router.get("/register", async(req, res)=>{
    res.render("register")
})

router.post("/register", async (req, res)=> {
    try {
        const {email, name, mbNum, password, passwordVerify} = req.body;
        if (!email || !name || !mbNum || !password || !passwordVerify) {
            req.flash("error", "Please enter all the Required fields.")
            return res.redirect("register")
        }
        if (password.length <= 6) {
            req.flash("error", "Please enter a password more than 6 characters.")
            return res.redirect("register")
        }
        if (password != passwordVerify) {
            req.flash("error", "Password and Re-enter Password doesn't Match.")
            return res.redirect("register")
        }
        if (mbNum.toString().length !== 10) {
            req.flash("error", "Mobile Number should be 10 digit.")
            return res.redirect("register")
        }
        const existingUser = await Login.findOne({email});
        if (existingUser) {
            req.flash("error", "This Email already Exists.")
            return res.redirect("register")
        }
        const hashPassword = password;
        //add a new user
        const login_type = 1
        const newUser = new Login({
            email, name, mbNum, hashPassword, login_type
        });

        const savedUser = await newUser.save();

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
            subject: 'Welcome to Photography System',
            html: "<p>Dear User,<br>Welcome to this Photography Management System.<br>Your Details are as Follows:<br>Name:<b style='color: green;'>"+ name +"</b><br>Mobile Number:<b style='color: green;'>"+ mbNum +"</b><br>Password:<b style='color: red;'>"+ password +"</b><br><br><br><br><br>Thanks,<br>Apartment Management System<br></p>"
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        res.json(savedUser);
        res.redirect("auth/login")
    }
    catch(err) {
        console.error(err);
        res.status(500).send();
    }
});

//login
router.post("/login", async (req, res) => {
    try{
        const {email, password} = req.body;
        //validate

        if (!email || !password) {
           req.flash("error", "Please enter all required fields.")
           return res.redirect("login")
        }
        const existingUser = await Login.findOne({email});
        if (!existingUser) {
            req.flash("error", "Email or Password is Wrong.")
            return res.redirect("login")
        }
        const passwordCorrect = (password === existingUser.hashPassword) ? true:false;
        if (!passwordCorrect) {
            req.flash("error", "Email or Password is Wrong.")
            return res.redirect("login")
        }

        //Sign in the user
        const token = jwt.sign({
            user : {id: existingUser._id, email: existingUser.email, login_type: existingUser.login_type, name: existingUser.name}
        }, process.env.JWT_SECRET, { expiresIn: '1h' });

        //send a token in HTTP-cookie only
        res.cookie("token", token, {
            httpOnly: true,
        }).render("home").send();

    }
    catch(err) {
        console.error(err);
        res.status(500).send();
    }
})


router.get("/logout", (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
    }).redirect("login").send();
});



router.get("/loggedIn", (req, res)=> {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.json(false);
        }

        jwt.verify(token, process.env.JWT_SECRET);
        res.send(true);
    }
    catch (err) {
        console.error(err);
        res.json(false);
    }
});

router.get('/logintype', auth, async (req, res)=>{
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({error:"Unauthorized"});
        }
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const _id = verified.user;
        const existingUser = await Login.findOne({_id});
        res.send(existingUser);
    }
    catch(e) {
        console.log(e);
        res.status(500).send();
    }
})


router.post('/resetpassword', async (req, res)=>{
    try {
        const {resetemail,oldPassword,newPassword} = req.body;
        if (!resetemail || !oldPassword || !newPassword) {
            return res.status(400).json({error: "Please enter all Required fields."});
        }
        const existingUser = await Login.findOne({email: resetemail});
        console.log(existingUser);
        if (!existingUser) {
            return res.status(401).json({error: "Email or Old password is wrong."});
        }
        const passwordCorrect = (oldPassword === existingUser.hashPassword) ? true: false;
        if (!passwordCorrect) {
            return res.status(401).json({error: "Email or Old Password is Wrong."});
        }
        const id = existingUser._id;
        const user = await Login.findByIdAndUpdate(
            {_id: id},
            {
                hashPassword: newPassword
            },
            function (err, result){
                if (err) {
                    res.send(err);
                }
                else {
                    res.send(result);
                }
            }
        );
        console.log(user);
    }
    catch(e) {
        console.log(e);
        res.status(500).send();
    }
})


router.post('/forgotpassword', async(req, res)=>{
    try{
        const {forgotemail, forgotmobile} = req.body;
        if (!forgotemail || !forgotmobile) {
            return res.status(400).json({error: "Please enter all Required fields."});
        }
        const existingUser = await Login.findOne({email: forgotemail});
        if (!existingUser) {
            return res.status(401).json({error: "Email or Phone Number is wrong."});
        }
        const mbChecker = (parseInt(forgotmobile) === existingUser.mbNum) ? true:false;
        if (!mbChecker){
            return res.status(401).json({error: "Email or Phone Number is wrong."});
        }
        const password = existingUser.hashPassword;
        //console.log(password);

        //Code to send a mail is from here
        console.log(password);
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL,
              pass: process.env.PASSWORD
            }
          });
          var mailOptions = {
            from: 'apartmentsystem130@gmail.com',
            to: existingUser.email,
            subject: 'Forgot Password Recovery',
            text: 'Dear User, \n Your password is "' + password + '". Please, Reset your password.\n\n\n\nThank You,\nApartment Management System'
          };
          //console.log("Comes Here....");
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
          return res.status(401).json({error: "Mail has been sent to your registered Mail Id. (If not in Inbox check spam folder)"});
    }
    catch(e) {
        console.log(e);
        res.status(500).send();
    }
})

module.exports = router;