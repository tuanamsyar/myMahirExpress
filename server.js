// import express from "express";
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
require("dotenv").config();

app.engine("ejs", require("ejs").__express);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));

// Middleware For Parsing JSON and Form Data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  res.send("Hello Express!");
});

app.get("/about", (req, res) => {
  res.send("About Us Page");
});

app.get("/search", (req, res) => {
  const { q, page } = req.query;
  res.send(`Search keyword: ${q}, Page number: ${page || 1}`);
});

const blogRoutes = require("./routes/blogRoutes");
app.use("/posts", blogRoutes);

const posts = [
  { id: 1, title: "Hello Express" },
  { id: 2, title: "Hello Express JS" },
];

app.get("/posting", (req, res) => {
  res.render("index", {
    title: "My Posting",
    posting: posts,
    message: "Welcome to my posting!",
  });
});

app.get("/posting/:id", (req, res) => {
  const post = posts.find((p) => p.id === Number(req.params.id));
  if (!post) return res.status(404).send("Post not found");
  res.render("post", { post });
});

const contactRoutes = require("./routes/contacts/contact_routes");
app.use("/contacts", contactRoutes);

const studentRoutes = require("./routes/students/student_routes");
app.use("/students", studentRoutes);

const apiRoutes = require("./routes/api/studentapi_routes");
app.use("/api/students", apiRoutes);

const authApiRoutes = require("./routes/api/authapi_routes");
app.use("/api/auth", authApiRoutes);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
