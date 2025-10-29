import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  studentId: { type: String, unique: true, sparse: true },
  phone: { type: String },
  profileImage: { type: String },
  joinedAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  trustScore: { type: Number, default: 100, min: 0, max: 100 },
  completedTransactions: { type: Number, default: 0 },
  successfulTransactions: { type: Number, default: 0 },
});

export default mongoose.model("User", userSchema);
