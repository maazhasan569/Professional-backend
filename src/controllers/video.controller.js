import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


async function findVideo(id) {
    if(!isValidObjectId(id)){
        throw new ApiError(400,"Invalid objectId")
    }
    const findVideo = await Video.findById({_id : id})
    if(!findVideo){
        throw new ApiError(400 , "Video not found or has been deleted")
    }
    return findVideo
}
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on 
    // query, sort, pagination

    //check if query matches with video title
    //sortby createdAt and sortType desc
    //req.user.id === userId
    let filter = {}
    let sortObj = {}
    if (query) {
        filter = {
            $or: [{
                title: { $regex: query, $options: "i" }
            }, {
                description: { $regex: query, $options: "i" }
            }]
        }
    }

    const skip = (page - 1) * limit
    if (sortBy) {
        const sortDirection = sortType === "desc" ? -1 : 1;
        sortObj[sortBy] = sortDirection
    }else{
        sortObj.createdAt = -1
    }
    const totalDoc = await Video.countDocument(filter)
    const totalPages = Math.ceil(totalDoc / limit)
    if (!totalDoc) {
        throw new ApiError(400, `can't find videos of ${query}`)
    }

    const fetchedVideos = await Video
        .find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .exec()

    return res.status(200)
        .json(
            new ApiResponse(200, "Videos fetched", {
                totalDoc, totalPages, fetchedVideos, page, limit
            })
        )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    //frontend would send the choosed video along with its data
    //fetch out the id from data and match
    const videoData = await findVideo(videoId)
    return res.status(200)
    .json(
        new ApiResponse(200,"video found" , videoData)
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title, description} = req.body

    if(!title && !description) {
        throw new ApiError(400 , "title and description required")
    }
    const videoData = await findVideo(videoId)
    const update = await Video.findByIdAndUpdate(
         videoData._id,
        {
            $set: {
                title,
                description,
            }
        },
        { new: true }

    )
    
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const videoData = await findVideo(videoId)
    findByIdAndDelete(
        videoData._id,
        {
            $set : {
                videoData
            }
        },
        
    )
})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
