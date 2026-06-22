import { Router } from "express";
import registerUser from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
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

        

export default router