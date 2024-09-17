import { Router } from "express";
import { register, login, logout } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//signup route
router.route("/register").post(register);

//login route
router.route("/login").post(login);

//logout route
router.route("/logout").post(verifyJWT, logout);

export default router;
