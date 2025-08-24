const http = require("http");
const mysql = require("mysql");

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",      // change if needed
  password: "",      // change if needed
  database: "catdb", // make sure you created this DB
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected...");
});

// Helper to send JSON
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/cats") {
    // Get all cats
    db.query("SELECT * FROM cats", (err, results) => {
      if (err) return sendJSON(res, 500, { error: err.message });
      sendJSON(res, 200, results);
    });
  } 
  
  else if (req.method === "GET" && req.url.startsWith("/cats/")) {
    // Get one cat by ID
    const id = req.url.split("/")[2];
    db.query("SELECT * FROM cats WHERE id = ?", [id], (err, results) => {
      if (err) return sendJSON(res, 500, { error: err.message });
      if (results.length === 0) return sendJSON(res, 404, { message: "Cat not found" });
      sendJSON(res, 200, results[0]); // only one cat
    });
  }

  else if (req.method === "POST" && req.url === "/cats") {
    // Add new cat
    let body = "";
    req.on("data", (chunk) => { body += chunk.toString(); });
    req.on("end", () => {
      const { name, age, breed, color, sex } = JSON.parse(body);
      const sql = "INSERT INTO cats (name, age, breed, color, sex) VALUES (?, ?, ?, ?, ?)";
      db.query(sql, [name, age, breed, color, sex], (err, result) => {
        if (err) return sendJSON(res, 500, { error: err.message });
        sendJSON(res, 201, { 
          message: "Cat added successfully", 
          cat: { id: result.insertId, name, age, breed, color, sex }
        });
      });
    });
  }

  else if (req.method === "PUT" && req.url.startsWith("/cats/")) {
    // Update cat by ID
    const id = req.url.split("/")[2];
    let body = "";
    req.on("data", (chunk) => { body += chunk.toString(); });
    req.on("end", () => {
      const { name, age, breed, color, sex } = JSON.parse(body);
      const sql = "UPDATE cats SET name=?, age=?, breed=?, color=?, sex=? WHERE id=?";
      db.query(sql, [name, age, breed, color, sex, id], (err, result) => {
        if (err) return sendJSON(res, 500, { error: err.message });
        if (result.affectedRows === 0) return sendJSON(res, 404, { message: "Cat not found" });
        sendJSON(res, 200, { 
          message: "Cat updated successfully", 
          cat: { id, name, age, breed, color, sex }
        });
      });
    });
  }

  else if (req.method === "DELETE" && req.url.startsWith("/cats/")) {
    // Delete cat by ID
    const id = req.url.split("/")[2];
    db.query("SELECT * FROM cats WHERE id = ?", [id], (err, results) => {
      if (err) return sendJSON(res, 500, { error: err.message });
      if (results.length === 0) return sendJSON(res, 404, { message: "Cat not found" });

      const cat = results[0]; // keep cat info before deletion
      db.query("DELETE FROM cats WHERE id = ?", [id], (err2) => {
        if (err2) return sendJSON(res, 500, { error: err2.message });
        sendJSON(res, 200, { 
          message: "Cat deleted successfully", 
          cat 
        });
      });
    });
  }

  else {
    sendJSON(res, 404, { message: "Route not found" });
  }
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
