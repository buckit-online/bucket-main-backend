import express from 'express';
import { getAllUsers, postUserDetails } from '../controllers/user.controller.js'; 

const router = express.Router();

router.post('/postUserDetails/:cafeId', postUserDetails);
router.get('/getAllUsers/:cafeId', getAllUsers);

export default router;
