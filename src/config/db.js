require("dotenv").config();
const mongoose = require("mongoose");

const { MONGODB_URI } = process.env;

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(MONGODB_URI);

    if (!connectionInstance) console.error("Couldn't connect to Mongo");

    console.log("MongoDB connected");
  } catch (error) {
    console.log(error.message);
  }
};

connectDB();
