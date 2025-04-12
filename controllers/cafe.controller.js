import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import Cafe from "../models/cafe.model.js";
import dotenv from "dotenv";
import Menu from "../models/menu.model.js";
import cloudinary from "../cloudinary/cloudinary.js";
import Order from "../models/order.model.js";
dotenv.config();

const JWT_SECRET = process.env.SECRET_KEY;

export const cafeRegister = async (req, res) => {
  const {
    name,
    address,
    tables,
    email,
    phone,
    password,
    instagram,
    logoImg,
    gstNumber,
  } = req.body;

  try {
    // Check if GST number already exists
    const existingGST = await Cafe.findOne({ gstNumber });
    if (existingGST) {
      return res.status(400).json({ message: "GST number already registered" });
    }

    const logoResult = await cloudinary.uploader.upload(logoImg, {
      folder: "logos",
    });

    const hashPassword = bcryptjs.hashSync(password, 10);

    const newCafe = new Cafe({
      name,
      address,
      tables,
      email,
      phone,
      password: hashPassword,
      instagram,
      gstNumber: gstNumber.toUpperCase(), // Ensure GST is stored in uppercase
      logoImg: {
        public_id: logoResult.public_id,
        url: logoResult.secure_url,
      },
    });

    await newCafe.save();

    const token = jwt.sign({ cafeId: newCafe._id }, JWT_SECRET, {
      expiresIn: "48h",
    });

    res
      .status(201)
      .json({
        message: "Cafe registered successfully",
        token,
        cafeId: newCafe._id,
      });
  } catch (error) {
    // Check for specific validation errors
    if (error.code === 11000) {
      // MongoDB duplicate key error
      if (error.keyPattern.gstNumber) {
        return res
          .status(400)
          .json({ message: "GST number already registered" });
      } else if (error.keyPattern.email) {
        return res.status(400).json({ message: "Email already registered" });
      } else if (error.keyPattern.phone) {
        return res
          .status(400)
          .json({ message: "Phone number already registered" });
      }
    }

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      if (error.errors.gstNumber) {
        return res.status(400).json({ message: "Invalid GST number format" });
      }
    }

    return res.status(400).json({ message: error.message });
  }
};

export const cafeLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const cafe = await Cafe.findOne({ email });

    if (!cafe) {
      return res.status(401).json({ message: "Email not registered" });
    }

    const isPasswordValid = bcryptjs.compareSync(password, cafe.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ cafeId: cafe._id }, JWT_SECRET, {
      expiresIn: "48h",
    });

    res.status(200).json({ token, cafeId: cafe._id });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const managerLogin = async (req, res) => {
  const { email, pin } = req.body;

  try {
    const cafe = await Cafe.findOne({ email });

    if (!cafe) {
      return res.status(401).json({ message: "Email not registered" });
    }

    const isPinValid = bcryptjs.compareSync(pin, cafe.pin);
    if (!isPinValid) {
      return res.status(401).json({ message: "Invalid PIN" });
    }

    const token = jwt.sign({ cafeId: cafe._id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({ token, cafeId: cafe._id });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const setStaffPin = async (req, res) => {
  const { cafeId, pin } = req.body;

  try {
    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      return res.status(404).json({ message: "Cafe not found" });
    }

    const hashPin = bcryptjs.hashSync(pin, 10);
    cafe.pin = hashPin;
    await cafe.save();

    res.status(200).json({ message: "Manager PIN set successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateCafeDetails = async (req, res) => {
  const { cafeId } = req.params;
  const { name, address, tables, email, phone, instagram } = req.body;
  const logoImg = req.files?.logoImg;

  try {
    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      return res.status(404).json({ message: "Cafe not found" });
    }

    // Update other cafe details with default fallback
    cafe.name = name || cafe.name;
    cafe.address = address || cafe.address;
    cafe.tables = tables || cafe.tables;
    cafe.email = email || cafe.email;
    cafe.phone = phone || cafe.phone;
    cafe.instagram = instagram || cafe.instagram;

    // Handle logo image if uploaded
    if (logoImg) {
      // Delete old logo if exists
      if (cafe.logoImg?.public_id) {
        await cloudinary.uploader.destroy(cafe.logoImg.public_id);
      }

      // Upload the new logo to Cloudinary
      const logoResult = await cloudinary.uploader.upload(
        logoImg.tempFilePath,
        {
          folder: "logos",
        }
      );

      // Update the cafe's logo information
      cafe.logoImg = {
        public_id: logoResult.public_id,
        url: logoResult.secure_url,
      };
    }

    await cafe.save();
    res.status(200).json({ message: "Cafe updated successfully", cafe });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getCafeDetails = async (req, res) => {
  const { cafeId } = req.params;
  try {
    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      return res.status(404).json({ message: "Cafe not found" });
    }
    res.status(200).json(cafe);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const addCategory = async (req, res) => {
  const { cafeId } = req.params;
  const { category } = req.body;

  try {
    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      return res.status(404).json({ message: "Cafe not found" });
    }
    cafe.categories.push(category);
    await cafe.save();
    res
      .status(200)
      .json({
        message: "Category added successfully",
        categories: cafe.categories,
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  const { cafeId } = req.params;
  const { category } = req.body;

  try {
    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      return res.status(404).json({ message: "Cafe not found" });
    }

    const categoryIndex = cafe.categories.findIndex((cat) => cat === category);

    if (categoryIndex === -1) {
      return res.status(404).json({ message: "Category not found" });
    }

    cafe.categories.splice(categoryIndex, 1);
    await cafe.save();

    const dishes = await Menu.deleteMany({ cafeId, dishCategory: category });

    res
      .status(200)
      .json({
        message: "Category deleted successfully",
        categories: cafe.categories,
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addAddon = async (req, res) => {
  const { cafeId } = req.params;
  const { addon_name, addon_price } = req.body;

  if (!addon_name || addon_price == null) {
    return res.status(400).json({ message: "Invalid add-on data" });
  }

  try {
    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      return res.status(404).json({ message: "Cafe not found" });
    }

    cafe.addons.push({ addon_name, addon_price });
    await cafe.save();

    res
      .status(200)
      .json({ message: "Add-on added successfully", addons: cafe.addons });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAddon = async (req, res) => {
  const { cafeId } = req.params;
  const { addon_name } = req.body;

  try {
    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      return res.status(404).json({ message: "Cafe not found" });
    }

    const addonIndex = cafe.addons.findIndex(
      (add_on) => add_on.addon_name === addon_name
    );
    if (addonIndex === -1) {
      return res.status(404).json({ message: "Add-on not found" });
    }

    cafe.addons.splice(addonIndex, 1);
    await cafe.save();
    await Menu.updateMany(
      { cafeId, "dishAddOns.addOnName": addon_name },
      { $pull: { dishAddOns: { addOnName: addon_name } } }
    );

    res
      .status(200)
      .json({ message: "Add-on deleted successfully", addons: cafe.addons });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAddOnStatus = async (req, res) => {
  const { cafeId } = req.params;
  const { addon_name, addon_price, addon_status } = req.body;

  try {
    const cafe = await Cafe.findById(cafeId);

    if (!cafe) {
      return res.status(404).json({ message: "Cafe not found" });
    }

    const addon = cafe.addons.find(
      (a) => a.addon_name === addon_name && a.addon_price === addon_price
    );

    if (!addon) {
      return res.status(404).json({ message: "Add-On not found" });
    }

    addon.addon_status = addon_status;
    await cafe.save();

    res
      .status(200)
      .json({ message: "Updated the availability of the addon", addon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEarnings = async (req, res) => {
  const { cafeId } = req.params;
  const { orderId, status, method } = req.body;

  try {
    const cafe = await Cafe.findById(cafeId);
    if (!cafe) throw new Error("Cafe not found");

    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    const orderDate = new Date(order.createdAt);
    const monthYear =
      orderDate.toLocaleString("default", { month: "long" }) +
      " " +
      orderDate.getFullYear();

    let monthEntry = cafe.earnings.find(
      (entry) => entry.monthYear === monthYear
    );

    if (!monthEntry) {
      monthEntry = {
        monthYear,
        totalAmount: 0,
        cash: 0,
        upi: 0,
        card: 0,
        paid: 0,
        cancelled: 0,
      };
      cafe.earnings.push(monthEntry);
    }

    if (status === "paid" && method) {
      monthEntry.totalAmount += order.totalPrice;
      monthEntry.paid += 1;

      if (method === "cash") monthEntry.cash += order.totalPrice;
      if (method === "upi") monthEntry.upi += order.totalPrice;
      if (method === "card") monthEntry.card += order.totalPrice;
    } else if (status === "cancelled") {
      monthEntry.cancelled += 1;
    }

    await cafe.save();
    await Order.findByIdAndDelete(orderId);

    res
      .status(200)
      .json(`Earnings updated for ${monthYear} with status ${status}`);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const uploadImages = async (req, res) => {
  const { cafeId } = req.params;
  const { category } = req.body;
  const imageFile = req.files?.imageFile;

  try {
    if (!imageFile) {
      return res.status(400).json({ message: "Image file is missing" });
    }

    const cafe = await Cafe.findById(cafeId);

    if (!cafe) {
      return res.status(404).json({ message: "Cafe not found" });
    }

    const existingCategory = cafe.categoryImgs.find(
      (item) => item.categoryName === category
    );

    if (existingCategory) {
      // If the category has an existing image, delete it from Cloudinary
      if (existingCategory.images?.public_id) {
        try {
          await cloudinary.uploader.destroy(existingCategory.images.public_id);
        } catch (error) {
          console.error("Error deleting old image from Cloudinary", error);
          return res
            .status(500)
            .json({ message: "Error deleting old image from Cloudinary" });
        }
      }

      // Replace the existing image with the new image
      const uploadResponse = await cloudinary.uploader.upload(
        imageFile.tempFilePath,
        {
          folder: "categories",
        }
      );

      const imageUrl = uploadResponse.secure_url;
      const imagePublicId = uploadResponse.public_id;

      // Update the category with the new image details
      existingCategory.images = { public_id: imagePublicId, url: imageUrl };
    } else {
      // If the category doesn't exist, add a new one with the image
      const uploadResponse = await cloudinary.uploader.upload(
        imageFile.tempFilePath,
        {
          folder: "categories",
        }
      );

      const imageUrl = uploadResponse.secure_url;
      const imagePublicId = uploadResponse.public_id;

      cafe.categoryImgs.push({
        categoryName: category,
        images: { public_id: imagePublicId, url: imageUrl },
      });
    }

    await cafe.save();

    res
      .status(200)
      .json({ message: "Category image uploaded/updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error uploading category image" });
  }
};

export const uploadBanner = async (req, res) => {
  const { cafeId } = req.params;
  const bannerFile = req.files?.bannerFile;

  try {
    if (!bannerFile) {
      return res.status(400).json({ message: "Banner image file is missing" });
    }

    const cafe = await Cafe.findById(cafeId);

    if (!cafe) {
      return res.status(404).json({ message: "Cafe not found" });
    }

    // Check if there's an existing banner and delete it from Cloudinary
    if (cafe.banner && cafe.banner.public_id) {
      // Destroy the previous banner image from Cloudinary
      await cloudinary.uploader.destroy(cafe.banner.public_id);
    }

    // Upload the new banner image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(
      bannerFile.tempFilePath,
      {
        folder: "banners",
      }
    );

    const imageUrl = uploadResponse.secure_url;
    const imagePublicId = uploadResponse.public_id;

    // Update the cafe's banner image URL and public_id
    cafe.banner = {
      public_id: imagePublicId,
      url: imageUrl,
    };

    await cafe.save();

    res.status(200).json({ message: "Banner image uploaded successfully" });
  } catch (error) {
    console.error("Error uploading banner image:", error);
    res.status(500).json({ message: "Error uploading banner image" });
  }
};

export const fileComplaint = async (req, res) => {
  const { cafeId } = req.params;
  const { complaint } = req.body;

  if (!cafeId || !complaint) {
    return res
      .status(400)
      .json({ message: "Cafe ID and complaint are required" });
  }

  try {
    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      return res.status(404).json({ message: "Cafe not found" });
    }

    const newComplaint = {
      complain: complaint,
      date: new Date(),
    };

    cafe.complains.push(newComplaint);
    await cafe.save();

    res.status(200).json({ message: "Complaint filed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error, unable to file complaint" });
  }
};
