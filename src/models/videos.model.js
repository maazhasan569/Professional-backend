import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videosSchema = new mongoose.Schema({
    vidoesFile : {
        type : String, // cloudinary url
        required : true,
    },
    thumbnail : {   // cloudinary url
        type : String,
    },
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    },
    title : {   // cloudinary url
        type : String,
        
    },
    description : {
        type : String,
    },
    
    

} , {
    timeStamps : true
})


export const Video = mongoose.model("Video" , videosSchema)
videosSchema.plugin(mongooseAggregatePaginate)