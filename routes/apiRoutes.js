const fs = require("fs");
const path = require("path");
const notes = require("../db/db.json");
const { v4: uuidv4 } = require("uuid");
const express = require("express");
const router = express.Router();

//GET request for /api/notes
router.get("/notes", (req, res) => {
  console.info(`${req.method} request received to get notes`);
  fs.readFile(path.join(__dirname, "../db/db.json"), "utf-8", (err, data) => {
    if (err) {
      console.error(err);
      res
        .status(500)
        .json({ status: "failure", message: "Error reading notes file" });
    } else {
      res.json(JSON.parse(data));
    }
  });
});

//POST request for /api/notes
router.post("/notes", (req, res) => {
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
      path.join(__dirname, "../db/db.json"),
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
router.delete("/notes/:id", (req, res) => {
  console.info(`${req.method} request received to delete note`);

  const noteId = req.params.id;

  // Read notes from db.json file
  fs.readFile(path.join(__dirname, "../db/db.json"), "utf-8", (err, data) => {
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
          path.join(__dirname, "../db/db.json"),
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

module.exports = router;
