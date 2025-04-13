import express from "express";
import mongoose from "mongoose";
import cafeRouter from "./routes/cafe.route.js";
import menuRouter from "./routes/menu.router.js";
import orderRouter from "./routes/order.route.js";
import userRouter from "./routes/user.route.js";
import inventoryRouter from "./routes/inventory.route.js";
import './services/inventoryReport.job.js'; 
import cors from 'cors';
import path from 'path';
import bodyParser from 'body-parser';
import fileUpload from "express-fileupload";
import dotenv from 'dotenv';
dotenv.config();

mongoose
  .connect(process.env.MONGO_DB_URL)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB', error)
  })

const __dirname = path.resolve()

const app = express()
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cors({ origin: '*' }))
app.use(bodyParser.json())
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
  })
)

app.use('/server/cafeDetails', cafeRouter)
app.use('/server/menuDetails', menuRouter)
app.use('/server/orderDetails', orderRouter)
app.use('/server/userDetails', userRouter)
app.use('/server/inventoryDetails', inventoryRouter)


// app.use(express.static(path.join(__dirname, '/client/dist')))

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'))
// })

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
