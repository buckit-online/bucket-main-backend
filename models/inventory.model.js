import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema({
    cafeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Cafe',
    },
    month: { 
        type: String, 
        required: true, 
    }, 
    items: {
        type: [
            {
                item: { type: String, required: true },
                qty: { type: Number, required: true },
                unit: { type: String, required: true },
                amount: { type: Number, required: true },
                tax: { type: Number, required: true },
                total: { type: Number, required: true },
                date: { type: String, required: true },
                by: { type: String, required: true },
            }
        ],
    }
}, { timestamps: true });

const Inventory = mongoose.model('Inventory', InventorySchema);

export default Inventory;
