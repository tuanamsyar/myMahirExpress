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
      message: "Access denied. No token provided",
    });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({
        success: false,
        message: "Invalid token",
      });
    req.user = user;
    next();
  });
}

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, student_no, email, phone FROM users"
    );
    res.json({
      success: true,
      message: "Users retrieval successfully",
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
      "SELECT id, name, student_no, email, phone FROM users WHERE id=?",
      [req.params.id]
    );
    if (rows.length == 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }
    res.json({
      success: true,
      message: "User detail retrieval successfully",
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
  var errors = [];

  if (!name || name.trim() == "") errors.push("Name cannot be empty");
  if (!student_no || !/^\d+$/.test(student_no)) {
    errors.push("Student no is required and must be in number format");
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Email is required and must be in email format");
  }
  if (!/^\d+$/.test(phone)) {
    errors.push("Phone must be in number format");
  }
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }
  try {
    const [result] = await db.query(
      "INSERT INTO users (name, student_no, email, phone, type) VALUES (?,?,?,?,?)",
      [name, student_no, email, phone, "student"]
    );
    res.status(201).json({
      success: true,
      message: "Added successfully",
      data: {
        id: result.insertId,
      },
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

router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows == 0) {
      return res.status(404).json({
        success: false,
        message: "Users not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Use deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "User delete failed",
      error: err.message,
    });
  }
});

router.put("/update/:id", async (req, res) => {
  const data = { ...req.body, ...req.query };
  const { name, student_no, email, phone } = data;
  var errors = [];

  if (!name || name.trim() == "") errors.push("Name cannot be empty");
  if (!student_no || !/^\d+$/.test(student_no)) {
    errors.push("Student no is required and must be in number format");
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Email is required and must be in email format");
  }
  if (!/^\d+$/.test(phone)) {
    errors.push("Phone must be in number format");
  }
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }
  try {
    const [result] = await db.query(
      "UPDATE users SET name = ?, student_no = ?, email = ?, phone = ? WHERE id = ?",
      [name, student_no, email, phone, req.params.id]
    );
    if (result.affectedRows == 0) {
      return res.status(404).json({
        success: false,
        message: "Users not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "User updated successfully",
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

module.exports = router;
