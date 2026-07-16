import multer from "multer";
import ApiError from "../utils/ApiError.js";

const storage = multer.diskStorage({
    destination : function (req , file , cb) {
        cb(null , "./public/temp") 
        // 1. null -> no error 
        // 2. "./public/temp -> folder where file saved
    },
    filename : function(req, file , cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        
        cb(null , file.fieldname + '-' + uniqueSuffix)
    }
})

const videoFilter = (req, file, cb) => {
    if(file.mimetype.startsWith("video/")){
        cb(null,true)
    }else{
        cb( new ApiError(400,"A video file is required") , false)
    }
}

export const uploadVideo = multer({
    storage,
    fileFilter : videoFilter,
})