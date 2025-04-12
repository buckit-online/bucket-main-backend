import cron from 'node-cron';
import nodemailer from 'nodemailer';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import Inventory from '../models/inventory.model.js';
import Cafe from '../models/cafe.model.js'; 
import dotenv from 'dotenv';

dotenv.config();

// Configure Nodemailer (using environment variables)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to generate and email inventory report
const sendMonthlyInventoryReport = async () => {
    try {
        // Get previous month and year
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        const prevMonthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });

        // Fetch all cafes
        const cafes = await Cafe.find();
        if (!cafes.length) return;

        for (const cafe of cafes) {
            const { _id, email, name } = cafe;

            // Fetch inventory for the previous month
            const inventory = await Inventory.findOne({ cafeId: _id, month: prevMonthYear });

            if (!inventory || inventory.items.length === 0) {
                console.log(`No inventory data for ${name} (${prevMonthYear})`);
                continue;
            }

            // Convert data to Excel format
            const tableData = inventory.items.map((item, index) => ({
                "S.No": index + 1,
                "Item": item.item,
                "Quantity": item.qty,
                "Unit": item.unit,
                "Amount (Without Tax)": item.amount,
                "Tax %": item.tax,
                "Total": item.total,
                "Date": item.date,
                "By": item.by
            }));

            // Create workbook
            const worksheet = XLSX.utils.json_to_sheet(tableData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

            // Ensure reports directory exists
            const reportsDir = path.join(process.cwd(), 'reports');
            if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir, { recursive: true });
            }

            // Save file temporarily
            const filePath = path.join(reportsDir, `Inventory_${prevMonthYear}_${name}.xlsx`);
            XLSX.writeFile(workbook, filePath);

            // Send email with attachment
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: `Monthly Inventory Report - ${prevMonthYear}`,
                text: `Hello ${name},\n\nPlease find attached the inventory report for ${prevMonthYear}.\n\nRegards,\nBuckit`,
                attachments: [{ filename: `Inventory_${prevMonthYear}.xlsx`, path: filePath }]
            };

            await transporter.sendMail(mailOptions);

            // Delete the temporary file after sending
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error("Error sending inventory report:", error);
    }
};

cron.schedule('05 00 1 * *', () => {
    console.log('Running monthly inventory report job...');
    sendMonthlyInventoryReport();
});

export default sendMonthlyInventoryReport;
