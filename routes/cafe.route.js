import express from 'express';
import { addAddon, addCategory, cafeLogin, cafeRegister, deleteAddon, deleteCategory, fileComplaint, getCafeDetails, managerLogin, setStaffPin, updateAddOnStatus, updateCafeDetails, updateEarnings, uploadBanner, uploadImages } from '../controllers/cafe.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/cafeRegister', cafeRegister);
router.post('/cafeLogin', cafeLogin);
router.post('/managerLogin', managerLogin);
router.put('/setStaffPin', setStaffPin);
router.put('/updateCafe/:cafeId', authenticateJWT, updateCafeDetails);
router.get('/getCafeDetails/:cafeId', getCafeDetails);
router.post('/postCategory/:cafeId',authenticateJWT, addCategory);
router.delete('/deleteCategory/:cafeId',authenticateJWT, deleteCategory);
router.post('/postAddon/:cafeId', authenticateJWT, addAddon);
router.delete('/deleteAddon/:cafeId', authenticateJWT, deleteAddon);
router.post('/updateEarnings/:cafeId', authenticateJWT, updateEarnings);
router.put('/updateAddonStatus/:cafeId', authenticateJWT, updateAddOnStatus);
router.post('/uploadImages/:cafeId', uploadImages);
router.post('/uploadBanner/:cafeId', uploadBanner);
router.post('/postComplain/:cafeId', fileComplaint);

export default router;