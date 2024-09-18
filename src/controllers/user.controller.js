import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

//method to generate access and refresh token for user once he signs up
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: true });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("Error generating access and refresh token : " + error.message);
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log(req.body);

    if (!(name && email && password)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //check if user already exists
    const existedUser = await User.findOne({ email });

    if (existedUser) {
      return res
        .status(400)
        .json({ message: "User with Email already exists..try login in!" });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    //user is created now u have to display user details
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      return res.status(500).json({ message: "Failed to create user" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };

    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        message: "User created successfully",
        user: createdUser,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
  } catch (error) {
    throw error;
  }
};

const login = async (req, res) => {
  //take email and password from req.body and compare from db
  //if true..give access

  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      return res.status(400).json("Email and Password are required!");
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json("Invalid Credentials!");
    }

    const isMatch = await user.isPasswordCorrect(password);

    if (!isMatch) {
      return res.status(401).json("Invalid credentials!");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const loggedInUser = await User.findOne(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        message: "Logged in successfully",
        user: loggedInUser,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
  } catch (error) {
    throw error;
  }
};

const logout = async (req, res) => {
  try {
    // Find the user and set refreshToken to null
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      {
        new: true,
      }
    );

    // Options for clearing cookies
    const options = {
      httpOnly: true,
      secure: true, // Set to false if you're not using HTTPS
      sameSite: "None",
    };

    // Clear cookies
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
  //for logout route first we need to check if the user is logged in or no...so we use jwt as middleware
};

const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({ message: "No valid refresh token found" });
    }

    const decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findOne({ _id: decodedRefreshToken?._id });

    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    if (incomingRefreshToken !== user.refreshToken) {
      return res.status(403).json({ message: "Refresh token has expired" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        message: "Access token refreshed successfully",
        user: user,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
  } catch (error) {
    throw error;
  }
};

export { register, login, logout, refreshAccessToken };
