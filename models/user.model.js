import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    cafeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cafe',
        required: true,
    },
}, {timestamps:true});

const User = mongoose.model('User', userSchema);

export default User;