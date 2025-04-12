import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    cafeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Cafe',
    },
    tableId: {
      type: String,
      required: true,
    },
    customer: {
      type: String,
      required: true,
    },
    orderList: [
      {
        dishName: {
          type: String,
          required: true,
        },
        dishCategory: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        dishPrice: {
          type: Number,
          required: true,
        },
        dishVariants: {
          variantName: { type: String },
          variantPrice: { type: Number },
        },
        dishAddOns: [
          {
            addOnName: { type: String },
            addOnPrice: { type: Number },
          },
        ],
        price: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          enum: ['pending', 'preparing', 'delivered', 'paid'],
          default: 'pending',
        },
      },
    ],
    cookingRequest: {
      type: String,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
