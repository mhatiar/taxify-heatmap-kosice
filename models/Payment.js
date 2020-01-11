const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  paymentDate: {
    type: Date,
    required: true
  },
  paymentAmount: {
    type: Number,
    required: true
  },
  subscriptionType: {
    type: String,
    enum: ["basic", "advanced"],
    required: true
  },
  subscriptionUntil: {
    type: Date,
    required: true
  },
  
});

const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;