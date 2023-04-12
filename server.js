//Import Express
const express = require("express");
//
const path = require("path");
//require fs module to read and write from files
const fs = require("fs");
//require UUID to give notes a UID
//we import version 4 of it.
const { v4: uuidv4 } = require("uuid");

//require the notes so we can work with them
const notes = require("./db/db.json");
//new instance of express
const app = express();
//PORT for listening
const PORT = process.env.PORT || 3001;

//require routes
const apiRoutes = require("./routes/apiRoutes");

//add middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
//custome middle ware for routes
app.use("/api", apiRoutes);

//create route handler that listens for GET request.
//when req is received, the res is to send a file, in this case the index.html file
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

//create route handler that listens for Get request.
//when req is received, the res is to send a file, in this case the notes.html file
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/notes.html"))
);


//Listen to port. This starts server
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
