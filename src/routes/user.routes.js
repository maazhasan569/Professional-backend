import { Router } from "express";
import { registerUser , logInUser , logOut, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.controller.js";
const router = Router()

    router.route("/registor").post(
        upload.fields([
            {
                name : "avatar",
                maxCount : 1
            },
            {
                name : "coverImg",
                maxCount : 3
            }
        ])
        ,
        registerUser)

    router.route("/login").post(logInUser)
    router.route("/logout").post(verifyJwt , logOut)
    router.route("refresh-token").post(refreshAccessToken)
export default router