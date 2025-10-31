const express = require("express");
const router = express.Router();
const db = require("../../database");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  const data = { ...req.body, ...req.query };
  const { email, password } = data;
  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? AND type = ?",
      [email, "admin"]
    );
    if (rows.length == 0) {
      return res.status(401).json({
        success: true,
        message: "Invalid email or password",
      });
    }
    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.hash_password);
    if (!isMatch) {
      return res.status(401).json({
        success: true,
        message: "Invalid email or password",
      });
    }
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "User login failed",
      error: err.message,
    });
  }
});

router.post("/register", async (req, res) => {
  const data = { ...req.body, ...req.query };
  const { name, email, password } = data;
  var errors = [];

  if (!name || name.trim() == "") errors.push("Name cannot be empty");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Email is required and must be in email format");
  }

  if (!password || !/^.{8,}$/.test(password)) {
    errors.push("Password is required and must be at least 8 characters");
  }
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }
  try {
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (name, email, hash_password, type) VALUES (?,?,?,?)",
      [name, email, hash, "admin"]
    );
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { id: result.insertId },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "User registration failed",
      error: err.message,
    });
  }
});

module.exports = router;
