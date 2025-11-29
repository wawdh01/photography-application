const mongoose = require('mongoose');
const { catalogueSchema } = require('./catalogueModel');

const contactSchema = mongoose.Schema({
    contact_email: {type: String, required: true},
    contact_mbNum: {type: String, required: true},
    contact_name: {type: String, required: true},
    message: {type: String, required: true}
})

const Contact = mongoose.model("contact", contactSchema);

module.exports = Contact;