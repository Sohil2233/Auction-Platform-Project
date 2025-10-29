import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    finalPrice: { type: Number, required: true },
    status: { 
      type: String, 
      enum: [
        'pending_payment',
        'paid',
        'shipped',
        'delivered',
        'completed',
        'cancelled',
        'disputed',
        'refunded'
      ],
      default: 'pending_payment'
    },
    paymentMethod: { type: String },
    paymentId: { type: String },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    trackingNumber: { type: String },
    estimatedDelivery: { type: Date },
    actualDelivery: { type: Date },
    notes: { type: String },
    disputeReason: { type: String },
    refundAmount: { type: Number },
    refundReason: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
