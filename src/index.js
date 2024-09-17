import connectDB from "./Database/db.js";
import { app } from "./app.js";
import dotenv from "dotenv";

dotenv.config({ path: "./env" });

connectDB()
  .then(() => {
    app.listen(3000 || 8000, () => {
      console.log(` \n Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
