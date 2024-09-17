import mongoose from "mongoose";

const connectToDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);

    if (!connectionInstance) console.log("error connecting to Mongo");

    console.log("connected successfully");
  } catch (error) {
    console.log("An error occurred while connecting to DB: " + error.message);
    process.exit(1);
  }
};

export default connectToDB;
