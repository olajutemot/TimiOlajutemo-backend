const express = require("express");
const router = express.Router();
const Admin = require("../MODELS/AdminSchema");
const errorHandler = require("../MIDDLEWARES/errorMiddleware");
const authTokenHandler = require("../MIDDLEWARES/authenticateToken");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

// require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "olajutemot@gmail.com",
    pass: "vbsnsyflwzkvzsjw",
  },
});

function createResponse(ok, message, data) {
  return {
    ok,
    message,
    data,
  };
}

router.get("/", (req, res) => {
  res.json({
    message: "router connected",
  });
});

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingAdmin = await Admin.findOne({ email: email });
    if (existingAdmin) {
      return res
        .status(409)
        .json(createResponse(false, "Email already exists"));
    }

    const newAdmin = new Admin({
      name,
      password,
      email,
    });
    await newAdmin.save();
    res.status(201).json(createResponse(true, "Admin registered successfully"));
  } catch (err) {
    next();
  }
});
router.post("/sendotp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    const mailOptions = {
      from: process.env.COMPANY_EMAIL,
      to: email,
      subject: "OTP for verification",
      text: `Your OTP for verification is ${otp}`,
    };

    transporter.sendMail(mailOptions, async (err, info) => {
      if (err) {
        console.log(err);
        res.status(500).json(createResponse(false, err.message));
      } else {
        res.json(createResponse(true, "OTP sent successfully", { otp }));
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(createResponse(false, err.message));
  }
});
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(409)
        .json(createResponse(false, "Admin not registered"));
    }
    const isPassword = await bcrypt.compare(password, admin.password);
    if (!isPassword) {
      return res.status(409).json(createResponse(false, "Invalid password"));
    }

    const authToken = jwt.sign(
      { adminId: admin._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "10m" }
    );
    const refreshToken = jwt.sign(
      { adminId: admin._id },
      process.env.JWT_REFRESH_SECRET_KEY,
      { expiresIn: "1d" }
    );
    res.cookie("authToken", authToken, { httpOnly: true });
    res.cookie("refreshToken", refreshToken, { httpOnly: true });
    res.status(200).json(
      createResponse(true, "Login successful", {
        authToken,
        refreshToken,
      })
    );
  } catch (err) {
    next();
  }
});
router.get("/checklogin", authTokenHandler, async (req, res) => {
  res.json({
    ok: true,
    message: "User authenticated successfully",
  });
});
router.use(errorHandler);

module.exports = router;
