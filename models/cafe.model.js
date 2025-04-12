import mongoose from "mongoose";

const cafeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    tables: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: Number,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    pin: {
      type: String,
    },
    categories: {
      type: Array,
      required: true,
      default: [],
    },
    addons: [
      {
        addon_name: {
          type: String,
        },
        addon_price: {
          type: Number,
        },
        addon_status: {
          type: Boolean,
          default: true,
        },
      },
    ],
    instagram: {
      type: String,
    },
    logoImg: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    banner: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    categoryImgs: [
      {
        categoryName: {
          type: String,
        },
        images: {
          public_id: {
            type: String,
          },
          url: {
            type: String,
          },
        },
      },
    ],
    earnings: [
      {
        monthYear: { type: String },
        totalAmount: { type: Number, default: 0 },
        cash: { type: Number, default: 0 },
        upi: { type: Number, default: 0 },
        card: { type: Number, default: 0 },
        paid: { type: Number, default: 0 },
        cancelled: { type: Number, default: 0 },
      },
    ],
    complains: [
      {
        complain: {
          type: String,
        },
        date: {
          type: Date,
        },
      },
    ],
    gstNumber: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
            v
          );
        },
        message: (props) => `${props.value} is not a valid GST number!`,
      },
    },
  },
  { timestamps: true }
);

const Cafe = mongoose.model("Cafe", cafeSchema);

export default Cafe;
