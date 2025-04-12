import express from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { deleteInventory, getInventory, inventorySave } from '../controllers/inventory.controller.js';

const router = express.Router();

router.post('/inventorySave/:cafeId', authenticateJWT, inventorySave);
router.get('/getInventory/:cafeId', authenticateJWT, getInventory);
router.delete('/deleteInventory/:cafeId', authenticateJWT, deleteInventory);

export default router;