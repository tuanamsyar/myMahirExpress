const mysql = require("mysql2/promise");

const database = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "amsyar123",
  database: "mymahirdb",
});

(async () => {
  try {
    const connection = await database.getConnection();
    console.log("Connected to the database");
    connection.release();
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
})();

module.exports = database;
