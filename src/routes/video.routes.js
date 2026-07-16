import { Router } from 'express';
import {
    getAllVideos,
    publishAVideo,
    getVideoById,  
    AddVideoDetails,
    uploadVideoThumbnail,
    deleteVideo,
} from "../controllers/video.controller.js"
import { verifyJwt } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.middleware.js';
import { uploadVideo } from '../middleware/videomulter.middlware.js';
const router = Router();
router.use(verifyJwt); // Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .get(getAllVideos)
    .post(
        uploadVideo.single("videoFile"),
        publishAVideo
    );

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)

   router.post("/:videoId/thumbnail", upload.single("thumbnail") , uploadVideoThumbnail);
   router.post("/:videoId/details", AddVideoDetails);




export default router