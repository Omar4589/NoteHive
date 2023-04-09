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
const PORT = 3001;

//add middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

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

//GET request for /api/notes
app.get("/api/notes", (req, res) => {
  console.info(`${req.method} request received to get notes`);
  res.json(notes);
});

//POST request for /api/notes
app.post("/api/notes", (req, res) => {
  console.info(`${req.method} request received to post notes`);
  //destruct items in request body
  const { title, text } = req.body;
  //if all required properties are present
  if (title && text) {
    const newNote = {
      id: uuidv4(),
      title,
      text,
    };
    //add new note to notes array
    notes.push(newNote);
    //create response
    const response = {
      status: "success",
      body: newNote,
    };
    //console log success response
    console.log(response);
    res.status(201).json(response);
    //write new note to db.json
    fs.writeFile(
      path.join(__dirname, "/db/db.json"),
      JSON.stringify(notes),
      (err) =>
        err
          ? console.error(err)
          : console.log(`New note: ${title}, has been written to JSON file`)
    );
  } //else return 500 status and return an error
  else {
    res.status(500).json("Error in posting new note");
  }
});

//DELETE request for /api/notes
app.delete("/api/notes/:id", (req, res) => {
  console.info(`${req.method} request received to delete note`);

  const noteId = req.params.id;

  // Read notes from db.json file
  fs.readFile(path.join(__dirname, "/db/db.json"), "utf-8", (err, data) => {
    if (err) {
      console.error(err);
      res
        .status(500)
        .json({ status: "failure", message: "Error reading notes file" });
    } else {
      let notes = JSON.parse(data);
      const noteIndex = notes.findIndex((note) => note.id === noteId);

      if (noteIndex !== -1) {
        // Remove the note with the specified ID
        notes.splice(noteIndex, 1);

        // Rewrite the remaining notes back to the db.json file
        fs.writeFile(
          path.join(__dirname, "/db/db.json"),
          JSON.stringify(notes),
          (err) => {
            if (err) {
              console.error(err);
              res.status(500).json({
                status: "failure",
                message: "Error updating notes file",
              });
            } else {
              console.log(
                `Note with ID ${noteId} has been deleted from JSON file`
              );
              res
                .status(200)
                .json({ status: "success", message: "Note deleted" });
            }
          }
        );
      } else {
        res.status(404).json({ status: "failure", message: "Note not found" });
      }
    }
  });
});

//Listen to port. This starts server
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
