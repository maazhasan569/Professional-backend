import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


const fileUpload = async (fileUrl) => { 
    try{
     // Configuration
     if(!fileUrl) return null
    cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.API_KEY, 
        api_secret: process.env.API_SECRET // Click 'View API Keys' above to copy your API secret
    })  

    const upload = await cloudinary.uploader.upload(fileUrl , {
        resource_type : "auto",
    })

    console.log(`file has been uploaded on cloundinary ${fileUrl}`)
    }catch(err) {
        if(fs.existsSync){
            fs.unlinkSync(fileUrl)
        }
        console.log(`cloudinary file upload failed , ${err}`)
        return null
    }
}
export default fileUpload