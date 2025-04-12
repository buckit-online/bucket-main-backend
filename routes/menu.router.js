import express from 'express'
import {
  getMenu,
  addDish,
  deleteDish,
  updateDishStatus,
  getDishStatus,
  updateDish,
  getDishType,
  getDishDetails,
} from '../controllers/menu.controller.js'
import { authenticateJWT } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/getMenu/:cafeId', getMenu)
router.post('/addDish/:cafeId', authenticateJWT, addDish)
router.delete('/deleteDish/:cafeId', authenticateJWT, deleteDish)
router.get(
  '/getDishStatus/:cafeId/:dishName/:dishCategory',
  authenticateJWT,
  getDishStatus
)
router.post('/updateDishStatus/:cafeId', authenticateJWT, updateDishStatus)
router.put('/updateDish/:cafeId', authenticateJWT, updateDish)
router.get('/getDishType/:cafeId/:dishName', getDishType)
router.get('/getDishDetails/:cafeId/:dishName/:dishCategory', getDishDetails)
export default router
