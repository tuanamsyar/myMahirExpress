const express = require("express");
const router = express.Router();
const db = require("../../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  const data = { ...req.body, ...req.query };
  const { name, email, password } = data;
  var error = [];

  if (!name || name.trim() === "") error.push("Name cannot be empty.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    error.push("Please enter a valid email address and cannot be empty.");
  }
  if (!password || !/.{8,}/.test(password)) {
    error.push(
      "Password must be at least 8 characters long and cannot be empty."
    );
  }
  if (error.length > 0) {
    res.status(400).json({
      success: false,
      message: "Validation errors",
      errors: error,
    });
    return;
  }
  try {
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (name, email, hash_password, type) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, "admin"]
    );
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { id: result.insertId },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "User registration failed",
    });
  }
});

router.post("/login", async (req, res) => {
  const data = { ...req.body, ...req.query };
  const { email, password } = data;
  console.log(email);
  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? AND type = ?",
      [email, "admin"]
    );
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed. User not found.",
      });
    }
    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.hash_password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed. Wrong password.",
      });
    }
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );
    res.json({
      success: true,
      message: "Authentication successful",
      token: token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "User login failed",
    });
  }
});

module.exports = router;
