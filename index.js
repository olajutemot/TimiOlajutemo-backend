const express = require("express");
const app = express();

const cors = require("cors");
const bodyParser = require("body-parser");
const PORT = 8000;
const authRoutes = require("./Routes/auth");
const blogRoutes = require("./Routes/blog");
const imageRoutes = require("./Routes/ImageUploadRoutes");
require("dotenv").config();
require("./db");
const Admin = require("./MODELS/AdminSchema");
const cookieParser = require("cookie-parser");

app.use(bodyParser.json());
const allowedOrigins = ["https://timiolajutemo.onrender.com"]; // Add more origins as needed

// Configure CORS with credentials
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow credentials
  })
);
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/blog", blogRoutes);
app.use("/image", imageRoutes);

app.get("/", (req, res) => {
  res.send({
    message: "Api is working",
  });
});

app.get("/blogcategories", async (req, res) => {
  const blogCategories = [
    "Technology Trends",
    "Health and Wellness",
    "Travel Destinations",
    "Food and Cooking",
    "Personal Finance",
    "Career Development",
    "Parenting Tips",
    "Self-Improvement",
    "Home Decor and DIY",
    "Book Reviews",
    "Environmental Sustainability",
    "Fitness and Exercise",
    "Movie and TV Show Reviews",
    "Entrepreneurship",
    "Mental Health",
    "Fashion and Style",
    "Hobby and Crafts",
    "Pet Care",
    "Education and Learning",
    "Sports and Recreation",
  ];
  res.json({
    message: "Categories fetched successfully",
    categories: blogCategories,
  });
});

app.listen(PORT, () => {
  console.log(`server is running on  port ${PORT}`);
});
