const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const movieSchema = new Schema({
  image: {
    type: String,
    require: true,
  },
  title: {
    type: String,
    require: true,
  },
  Description: {
    type: String,
    require: true,
  },
  Rating: {
    type: Number,
  },
  Duration: {
    type: String,
    require: true,
  },

});

const Movie = mongoose.model("Movie", movieSchema);
module.exports = { Movie };