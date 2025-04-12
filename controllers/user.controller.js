import mongoose from "mongoose";
import User from "../models/user.model.js";

export const postUserDetails = async (req, res) => {
    const { name, phone } = req.body;
    const { cafeId } = req.params;

    // Check if cafeId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(cafeId)) {
        return res.status(400).json({ message: 'Invalid cafe ID format' });
    }

    try {
        const newUser = new User({
            name,
            phone,
            cafeId,
        });

        await newUser.save();
        res.status(201).json({ message: 'User details saved successfully', user: newUser });
    } catch (err) {
        console.error('Error saving user details:', err.message);
        res.status(500).json({ message: 'Error saving user details', error: err.message });
    }
};

export const getAllUsers = async (req, res) => {
    const { cafeId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(cafeId)) {
            return res.status(400).json({ message: 'Invalid cafe ID' });
        }

        const users = await User.find({ cafeId });

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found for this cafe' });
        }

        res.status(200).json({ users });
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};


  