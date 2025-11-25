const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    email: { type: String, required: true },
    catalogueIds: [{ type: String, required: true }]
})

const cart = mongoose.model("cart", cartSchema);

module.exports = cart;