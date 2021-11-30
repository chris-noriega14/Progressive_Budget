const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

//The variable PORT is set equal to either an available port or port 3001.
const PORT = process.env.PORT || 3001;

const app = express();

app.use(logger("dev"));

//This sets up the middleware
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

//The port associated with the Mongo DB either connects to 27017 (default) or any available one.
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/budget", {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// routes
app.use(require("./routes/api.js"));

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});