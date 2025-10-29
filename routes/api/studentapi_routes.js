const express = require("express");
const router = express.Router();
const db = require("../../database");
const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token is missing",
    });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid access token",
      });
    }
    req.user = user;
    next();
  });
}

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, student_no, phone FROM users"
    );
    res.json({
      success: true,
      message: "Student List Retrieved Successfully",
      data: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Users retrieval failed",
      error: err.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, student_no, phone FROM users WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json({
      success: true,
      message: "User detail retrieved successfully",
      data: rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "User detail retrieval failed",
      error: err.message,
    });
  }
});

router.post("/add", verifyToken, async (req, res) => {
  const data = { ...req.body, ...req.query };
  const { name, student_no, email, phone } = data;
  var error = [];
  if (!name || name.trim() === "") error.push("Name cannot be empty.");
  if (!student_no || !/^\d+$/.test(student_no)) {
    error.push("Student Number must contain numbers only and cannot be empty.");
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    error.push("Please enter a valid email address and cannot be empty.");
  }
  if (!phone || !/^\d+$/.test(phone)) {
    error.push("Phone number must contain numbers only and cannot be empty.");
  }

  if (error.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error,
    });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO users (name, student_no, email, phone, type) VALUES (?, ?, ?, ?, ?)",
      [name, student_no, email, phone, "student"]
    );
    res.status(201).json({
      success: true,
      message: "User added successfully",
      data: {
        id: result.insertId,
        name,
        student_no,
        email,
        phone,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "User addition failed",
      error: err.message,
    });
  }
});

router.put("/update/:id", async (req, res) => {
  const data = { ...req.body, ...req.query };
  const { name, student_no, email, phone } = data;
  var error = [];
  if (!name || name.trim() === "") error.push("Name cannot be empty.");
  if (!student_no || !/^\d+$/.test(student_no)) {
    error.push("Student Number must contain numbers only and cannot be empty.");
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    error.push("Please enter a valid email address and cannot be empty.");
  }
  if (!phone || !/^\d+$/.test(phone)) {
    error.push("Phone number must contain numbers only and cannot be empty.");
  }

  if (error.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error,
    });
  }

  try {
    const [result] = await db.query(
      "UPDATE users SET name = ?, student_no = ?, email = ?, phone = ? WHERE id = ?",
      [name, student_no, email, phone, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: {
        id: req.params.id,
        name,
        student_no,
        email,
        phone,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "User update failed",
      error: err.message,
    });
  }
});

router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "User deletion failed",
      error: err.message,
    });
  }
});

module.exports = router;
