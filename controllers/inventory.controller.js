import Inventory from '../models/inventory.model.js';

export const inventorySave = async (req, res) => {
    try {
        const { cafeId } = req.params;  
        const { month, newRows } = req.body;  

        let inventory = await Inventory.findOne({ cafeId, month });

        if (inventory) {
            inventory.items.push(...newRows);
        } else {
            inventory = new Inventory({ cafeId, month, items: newRows });
        }

        await inventory.save();
        res.status(200).json({ message: 'Inventory saved successfully', inventory });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getInventory = async (req, res) => {
    try {
        const { cafeId } = req.params;
        const { month } = req.query; 

        const inventory = await Inventory.findOne({ cafeId, month });

        if (!inventory) {
            return res.status(404).json({ message: "No inventory found for this month" });
        }

        res.status(200).json(inventory.items); 
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteInventory = async (req, res) => {
    const { cafeId } = req.params;
    const { month, itemId } = req.query;

    try {
        const result = await Inventory.findOneAndUpdate(
            { cafeId, month },  
            { $pull: { items: { _id: itemId } } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "Item not found in inventory" });
        }

        res.status(200).json({ message: "Item deleted successfully", updatedInventory: result });
    } catch (error) {
        res.status(500).json({ message: "Error deleting item", error });
    }
}