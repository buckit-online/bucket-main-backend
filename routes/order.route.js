import express from 'express';
import {
  deleteOrder,
  getOrders,
  placeOrder,
  updateItemStatus,
  removeItem,
  removeAddon,
  updateItemQuantity,
} from '../controllers/order.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/placeOrder/:cafeId/:tableId', placeOrder);
router.get('/getOrders/:cafeId', authenticateJWT, getOrders);
router.delete('/deleteOrder', authenticateJWT, deleteOrder);
router.put('/updateItemStatus', authenticateJWT, updateItemStatus);
router.put('/updateItemQuantity', authenticateJWT, updateItemQuantity);
router.delete('/removeItem', authenticateJWT, removeItem);
router.delete('/removeAddon', authenticateJWT, removeAddon);

export default router;
