import multer from "multer"

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

export const upload = multer({
    storage, // short hand for storage : storage
})