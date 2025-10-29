const express = require("express");
const router = express.Router();

const contacts = [
  { id: 1, name: "Alice", phone: "123-456-7890" },
  { id: 2, name: "Bob", phone: "987-654-3210" },
  { id: 3, name: "Charlie", phone: "555-555-5555" },
  { id: 4, name: "David", phone: "444-444-4444" },
  { id: 5, name: "Eve", phone: "333-333-3333" },
  { id: 6, name: "Frank", phone: "222-222-2222" },
];

router.get("/", (req, res) => {
  res.render("contact/contacts", {
    title: "Contact List",
    content: "Manage your contacts",
    contacts,
  });
});

// Render Form Page
function renderFormPage(res, error = null, contact = null) {
  const isUpdate = !!contact;
  res.render("contact/contact_form", {
    title: isUpdate ? "Update Contact" : "Add New Contact",
    content: isUpdate
      ? "Update the details of this contact."
      : "Fill in the details to add a new contact.",
    error,
    contact,
    formAction: isUpdate
      ? `/contacts/update/${contact.id}?_method=PUT`
      : "/contacts/add",
  });
}

// Add Contact Form
router.get("/add", (req, res) => renderFormPage(res));

// Handle Add Contact
router.post("/add", (req, res) => {
  const { name, phone } = req.body;

  // Validation
  if (!name || name.trim() === "") {
    return renderFormPage(res, "Name cannot be empty.");
  }

  if (!phone || !/^\d+$/.test(phone)) {
    return renderFormPage(
      res,
      "Phone number must contain numbers only and cannot be empty."
    );
  }

  // Add New Contact And Redirect Back
  const newContact = {
    id: contacts.length + 1,
    name,
    phone,
  };
  contacts.push(newContact);
  res.redirect("/contacts");
});

router.get("/:id", (req, res) => {
  const contact = contacts.find((c) => c.id == req.params.id);

  if (!contact) {
    return res.status(404).send("Contact not found");
  }

  res.render("contact/contact_details", {
    title: "Contact Detail",
    content: "View contact details below.",
    contact,
  });
});

// Update Contact Form
router.get("/update/:id", (req, res) => {
  const contact = contacts.find((c) => c.id == req.params.id);
  if (!contact) return res.status(404).send("Contact not found");
  renderFormPage(res, null, contact);
});

// Handle Update Contact
router.put("/update/:id", (req, res) => {
  const { name, phone } = req.body;
  const contact = contacts.find((c) => c.id == req.params.id);
  if (!contact) return res.status(404).send("Contact not found");

  // Validation
  if (!name || name.trim() === "") {
    return renderFormPage(res, "Name cannot be empty.", contact);
  }
  if (!phone || !/^\d+$/.test(phone)) {
    return renderFormPage(
      res,
      "Phone number must contain numbers only and cannot be empty.",
      contact
    );
  }

  // Update Values And Redirect Back
  contact.name = name;
  contact.phone = phone;
  res.redirect("/contacts");
});

// Handle Delete Contact
router.post("/delete/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = contacts.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).send("Contact not found");
  }

  // Remove From Array And Redirect Back
  contacts.splice(index, 1);
  res.redirect("/contacts");
});

module.exports = router;
