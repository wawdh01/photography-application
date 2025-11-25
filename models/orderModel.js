const mongoose = require('mongoose');
const { catalogueSchema } = require('./catalogueModel');

const orderSchema = mongoose.Schema({
    email: { type: String, required: true },
    orderId: { type: Number, required: true },
    CatalogueIdDetails:[catalogueSchema],
    date: {type: String, required: true},
    price: {type: Number, required: true},
    payment_status: {type: String, required: true}
})

const Order = mongoose.model("order", orderSchema);

module.exports = Order;