const mongoose = require('mongoose');

const catalogueSchema = mongoose.Schema({
    email: {type: String, required: true},
    catalogueId: { type: String, required: true },
    name: {type: String, required: true},
    price: {type: Number, required: true},
    image_link: {type: String, required: true},
    description: {type: String, required: true}
})

const Catalogue = mongoose.model("catalogue", catalogueSchema);

module.exports = Catalogue;
module.exports.catalogueSchema = catalogueSchema;