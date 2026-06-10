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
        type : Object.Schema.Types.ObjectId,
        ref : "User",
    },
    title : {   // cloudinary url
        type : String,
        required : true
    },
    description : {
        type : String,
    },
    durations : {
        type : Number,
        required : true,
        
    },
    views : {
        type : Number,
        required : true,
        default : 0
    },
    isPublished : {
        type : Boolean,
        default : true
    }

} , {
    timeStamps : true
})

Video.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video" , videosSchema)