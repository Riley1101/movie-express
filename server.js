require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const { User } = require("./models/user");
const { Movie } = require("./models/createmovie");
const session = require("express-session");
const passUserToView = require("./middlewares/pass-user-to-view.js");
// const { auth_middleware } = require("./middlewares/auth");

const app = express();

// DB_URL import here
const DB_URL = process.env.DB_URL;

mongoose
  .connect(DB_URL)
  .then(() => console.log("DB Connected"))
  .catch((e) => {
    console.log(e);
    console.log("DB connection failed!");
  });

//////////////////////////////////////////

//static folder in css /// using use key word all are middleware....
app.use(express.static("static"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passUserToView);
// app.use(auth_middleware);

// update your call back to async to start using db calls
app.get("/", async (req, res) => {
  // get all movies from database
  const movies = await Movie.find();
  res.render("home.ejs", {
    movies,
  });
});

// movie details page with dynamic param
app.get("/movie/:id", async (req, res) => {
  // Get the ID from the URL
  try {
    // Get the ID from the URL
    const paramId = req.params.id;
    // Fetch movie with id from the database
    const movie = await Movie.findById(paramId);
    if (!movie) {
      return res.send("Movie not found");
    }
    // Send the movie to ejs and render on the page )
    res.render("detailView.ejs", { movie });
  } catch (error) {
    console.error("Error fetching movie details:", error);
    res.send("Internal Server Error");
  }
});

// edit movie path
app.get("/movie/edit/:id", async (req, res) => {
  // Get the ID from the URL
  try {
    // Get the ID from the URL
    const paramId = req.params.id;
    // Fetch movie with id from the database
    const movie = await Movie.findById(paramId);
    if (!movie) {
      return res.send("Movie not found");
    }
    // Send the movie to ejs and render on the page )
    res.render("editView.ejs", { movie });
  } catch (error) {
    res.send("Internal Server Error");
  }
});

//Sign-in
app.get("/sign-in", (req, res) => {
  res.render("signIn.ejs");
});

app.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;
  let exists = await User.findOne({ email });

  if (!exists) {
    return res.send("User does not exists");
  }

  const validPassword = bcrypt.compareSync(password, exists.password);

  if (!validPassword) {
    return res.send("Wrong password");
  }
  req.session.user = {
    username: exists.username,
    _id: exists._id,
  };

  res.redirect("/");
});

//Sign-up
app.get("/sign-up", (req, res) => {
  res.render("signUp.ejs");
});

app.post("/user", async (req, res) => {
  console.log(req.body);
  const email = req.body.email;
  const username = req.body.username;
  const password1 = req.body.password1;
  const password2 = req.body.password2;

  let exists = await User.findOne({ email });

  if (exists) {
    // add return to exit the callback
    return res.send(`User already exists!`);
  }

  if (password1 !== password2) {
    // add return to exit the callback
    return res.send("Password do not match!");
  }

  const hashedPassword = bcrypt.hashSync(password1, 10);

  const user = await User.create({
    email,
    password: hashedPassword,
    username: username,
  });

  req.session.user = {
    username: user.username,
    _id: user._id,
  };

  // add return to exit the callback
  return res.redirect("/");
});
/////////signup////////
/// Create movie ///
app.get("/create/movies", (req, res) => {
  res.render("createmovie.ejs");
});

app.post("/update/movies/:id", async (req, res) => {
  const { id } = req.params; // Get the ID from the URL parameters

  const { title, image, Description, Duration, Rating } = req.body; // Extract other fields from the request body

  try {
    // Find the movie by ID and update it
    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      {
        title,
        image,
        description: Description,
        duration: Duration,
        rating: Rating,
      },
      { new: true }, // Return the updated document
    );

    if (!updatedMovie) {
      return res.status(404).send("Movie not found");
    }

    // Redirect or respond with the updated movie
    res.redirect(`/movie/${id}`); // Redirect to updated page
  } catch (error) {
    console.error("Error updating movie:", error);
    res.status(500).send("Internal server error");
  }
});

// we need a async function as this involves db queries
app.post("/create/movies", async (req, res) => {
  // receive form data form the body
  let { image, title, Description, Rating, Duration } = req.body;

  let result = await Movie.create({
    title,
    image,
    Description,
    Duration,
    Rating,
  });

  return res.json({
    message: "created movie",
    result,
  });
});

app.listen(3200);
