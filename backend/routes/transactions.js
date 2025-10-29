import express from "express";
import Transaction from "../models/transaction.js";
import Listing from "../models/listing.js";
import User from "../models/user.js";
import Notification from "../models/notification.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get transactions for authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const userId = req.user.id;

    let query = { $or: [{ buyer: userId }, { seller: userId }] };
    
    if (status) {
      query.status = status;
    }

    if (type === 'buying') {
      query = { buyer: userId };
    } else if (type === 'selling') {
      query = { seller: userId };
    }

    const transactions = await Transaction.find(query)
      .populate('buyer', 'name email profileImage')
      .populate('seller', 'name email profileImage')
      .populate('listing', 'title image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific transaction
router.get("/:transactionId", auth, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    const transaction = await Transaction.findOne({
      _id: transactionId,
      $or: [{ buyer: userId }, { seller: userId }]
    })
      .populate('buyer', 'name email profileImage phone')
      .populate('seller', 'name email profileImage phone')
      .populate('listing', 'title image description');

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create transaction (when auction ends)
router.post("/", auth, async (req, res) => {
  try {
    const { listingId, finalPrice, shippingAddress } = req.body;
    const buyerId = req.user.id;

    const listing = await Listing.findById(listingId)
      .populate('seller', 'name email');

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.status !== 'ended') {
      return res.status(400).json({ message: "Auction must be ended to create transaction" });
    }

    if (listing.winner.toString() !== buyerId) {
      return res.status(403).json({ message: "Only the winner can create transaction" });
    }

    // Check if transaction already exists
    const existingTransaction = await Transaction.findOne({
      listing: listingId,
      buyer: buyerId
    });

    if (existingTransaction) {
      return res.status(400).json({ message: "Transaction already exists" });
    }

    const transaction = new Transaction({
      buyer: buyerId,
      seller: listing.seller._id,
      listing: listingId,
      finalPrice,
      shippingAddress,
      status: 'pending_payment'
    });

    await transaction.save();

    // Create notifications
    await createNotification(
      listing.seller._id,
      'auction_won',
      'Auction Won!',
      `Your auction "${listing.title}" has been won. Payment is pending.`,
      listingId,
      buyerId
    );

    await createNotification(
      buyerId,
      'payment_required',
      'Payment Required',
      `Please complete payment for "${listing.title}" to proceed with the transaction.`,
      listingId,
      listing.seller._id
    );

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update transaction status
router.put("/:transactionId/status", auth, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { status, notes, trackingNumber, estimatedDelivery } = req.body;
    const userId = req.user.id;

    const transaction = await Transaction.findById(transactionId)
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('listing', 'title');

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Check if user is part of this transaction
    if (transaction.buyer._id.toString() !== userId && transaction.seller._id.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to update this transaction" });
    }

    const oldStatus = transaction.status;
    transaction.status = status;

    if (notes) transaction.notes = notes;
    if (trackingNumber) transaction.trackingNumber = trackingNumber;
    if (estimatedDelivery) transaction.estimatedDelivery = new Date(estimatedDelivery);

    if (status === 'completed') {
      transaction.completedAt = new Date();
      
      // Update user transaction counts
      await User.findByIdAndUpdate(transaction.buyer._id, {
        $inc: { completedTransactions: 1, successfulTransactions: 1 }
      });
      await User.findByIdAndUpdate(transaction.seller._id, {
        $inc: { completedTransactions: 1, successfulTransactions: 1 }
      });
    }

    await transaction.save();

    // Create appropriate notifications
    const otherUserId = transaction.buyer._id.toString() === userId 
      ? transaction.seller._id 
      : transaction.buyer._id;

    let notificationType, title, message;
    
    switch (status) {
      case 'paid':
        notificationType = 'payment_required';
        title = 'Payment Received';
        message = `Payment has been received for "${transaction.listing.title}". Please ship the item.`;
        break;
      case 'shipped':
        notificationType = 'item_shipped';
        title = 'Item Shipped';
        message = `Your item "${transaction.listing.title}" has been shipped.`;
        break;
      case 'delivered':
        notificationType = 'item_delivered';
        title = 'Item Delivered';
        message = `Your item "${transaction.listing.title}" has been delivered.`;
        break;
      case 'completed':
        notificationType = 'auction_won';
        title = 'Transaction Completed';
        message = `Transaction for "${transaction.listing.title}" has been completed successfully.`;
        break;
      default:
        return res.json(transaction);
    }

    await createNotification(
      otherUserId,
      notificationType,
      title,
      message,
      transaction.listing._id,
      userId
    );

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to create notifications
async function createNotification(userId, type, title, message, relatedListing, relatedUser) {
  const notification = new Notification({
    user: userId,
    type,
    title,
    message,
    relatedListing,
    relatedUser
  });

  await notification.save();
}

export default router;
