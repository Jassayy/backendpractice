import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const verifyJWT = async (req, res, next) => {
  try {
    //verify the token
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token || typeof token !== "string") {
      return res.status(401).json({ msg: "Token is not valid" });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findOne({ _id: decodedToken?._id }).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(401).json({ msg: "Token is not valid" });
    }

    req.user = user;
    next();
  } catch (error) {
    throw error;
  }
};
