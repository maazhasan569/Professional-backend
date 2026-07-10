import { Router } from "express";
import { registerUser , logInUser , logOut, refreshAccessToken, changeCurrentPassword, updateUserDetails, getCurrentUser, updatedUserAvatar, updatedUserCoverImg } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
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
    router.route("/refresh-token").post(refreshAccessToken)
    router.route("/update-password").put(verifyJwt,changeCurrentPassword)
    router.route("/update-details").put(verifyJwt,updateUserDetails)
    router.route("/currentuser").post(verifyJwt,getCurrentUser)
    router.route("/update-avatarimg").patch(
        verifyJwt,
        upload.single("avatar"),
        updatedUserAvatar)
    router.route("/update-coverImg").patch(
        verifyJwt,
        upload.single("coverImg"),
        updatedUserCoverImg)
export default router