const express = require("express");
const router = express.Router();
const db = require("../../database");

// Student List Page
router.get("/", async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM users");
    const students = result;

    res.render("student/students_view", {
      title: "Student Management System",
      content: "Manage and view details of the students.",
      students,
    });
  } catch (err) {
    console.error(err);
  }
});

// Render Form Page
function renderFormPage(res, error = null, student = null) {
  const isUpdate = !!student;
  res.render("student/student_form", {
    title: "Student Managament System",
    content: isUpdate
      ? "Update Student Details"
      : "Add a New Student to the System",
    error,
    formAction: isUpdate
      ? `/students/update/${student.id}?_method=PUT`
      : "/students/add",
    student,
  });
}

router.get("/update/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) return res.status(404).send("Student not found");
    const student = rows[0];
    renderFormPage(res, null, student);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// Add Student Form
router.get("/add", (req, res) => renderFormPage(res));

// Handle Add Student
router.post("/add", async (req, res) => {
  const { name, student_no, email, phone, type } = req.body;

  // Validation
  if (!name || name.trim() === "") {
    return renderFormPage(res, "Name cannot be empty.");
  }

  if (!student_no || !/^\d+$/.test(student_no)) {
    return renderFormPage(
      res,
      "Student number must contain numbers only and cannot be empty."
    );
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return renderFormPage(
      res,
      "Please enter a valid email address and cannot be empty."
    );
  }
  if (!phone || !/^\d+$/.test(phone)) {
    return renderFormPage(
      res,
      "Phone number must contain numbers only and cannot be empty."
    );
  }

  try {
    // Insert New Student Into Database
    await db.query(
      "INSERT INTO users (name, email, student_no, phone, type) VALUES (?, ?, ?, ?, ?)",
      [name, email, student_no, phone, "student"]
    );

    // Redirect Back
    res.redirect("/students");
  } catch (err) {
    console.error(err);
    renderFormPage(res, "Database error. Failed to add student.");
  }
});

// Student Details
router.get("/:id", async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);
    const student = result[0];

    if (!student) {
      return res.status(404).send("Student not found");
    }

    res.render("student/student_details", {
      title: "Student Details",
      content: "View detailed information about this student.",
      student,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

function runValidation(res, name, student_no, email, phone) {
  // Validation
  if (!name || name.trim() === "") {
    return renderFormPage(res, "Name cannot be empty.");
  }

  if (!student_no || !/^\d+$/.test(student_no)) {
    return renderFormPage(
      res,
      "Student number must contain numbers only and cannot be empty."
    );
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return renderFormPage(
      res,
      "Please enter a valid email address and cannot be empty."
    );
  }
  if (!phone || !/^\d+$/.test(phone)) {
    return renderFormPage(
      res,
      "Phone number must contain numbers only and cannot be empty."
    );
  }
}

router.put("/update/:id", async (req, res) => {
  const { name, student_no, email, phone } = req.body;

  runValidation(res, name, student_no, email, phone);
  try {
    // Update Student In Database
    const [result] = await db.query(
      "UPDATE users SET name = ?, email = ?, student_no = ?, phone = ? WHERE id = ?",
      [name, email, student_no, phone, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).send("Student not found");
    }

    // Redirect Back
    res.redirect("/students");
  } catch (err) {
    console.error(err);
    renderFormPage(res, "Database error. Failed to update student.");
  }
});

module.exports = router;
