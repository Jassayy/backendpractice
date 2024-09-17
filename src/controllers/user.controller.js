import { User } from "../models/user.model.js";

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
    .json({ message: "User created successfully" })
    .json(createdUser);
};

export { register };
