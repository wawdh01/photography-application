const router = require('express').Router();
const Contact = require('../models/contactModel')
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const nodemailer = require('nodemailer');

router.get('/', async (req, res) => {
    res.render("components/contact")
})


router.post('/', async (req, res) => {
    try {
        const { contact_name, contact_email, contact_mbNum, message } = req.body
        if (!contact_name || !contact_email || !contact_mbNum || !message) {
            res.status(400).json({ "error": "Please enter all required fields." })
        }

        const newContact = new Contact({
            contact_name: contact_name,
            contact_email: contact_email,
            contact_mbNum: contact_mbNum,
            message: message
        });

        const savedContact = await newContact.save();

        let htmlTemplate = fs.readFileSync(path.join(__dirname, '../public/templates/contactTemplate.html'), 'utf8');
        const template = Handlebars.compile(htmlTemplate)

        const htmlData = template({
            name: contact_name,
            mobile: contact_mbNum,
            message: message
        })

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });
        var mailOptions = {
            from: process.env.EMAIL,
            to: contact_email,
            cc: process.env.EMAIL,
            subject: 'Your Contact Details Submitted.',
            html: htmlData,
            attachments: [
                {
                    filename: 'contactEmail.jpg',
                    path: path.join(__dirname, '../public/images/contactEmail.jpg'), // path to your image
                    cid: 'headerImage' // same CID as in <img src="cid:headerImage">
                }
            ]
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        req.flash("success", "Your request has been submitted.")
        return res.redirect("/")
    }
    catch (err) {
        console.error(err)
        req.flash("error", "Unable to submit the request, Please try again after some time.")
        res.redirect("/contact")
    }

})
module.exports = router