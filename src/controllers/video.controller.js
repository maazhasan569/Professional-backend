import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import fileUpload from "../utils/fileupload.js"


async function findVideo(id) {
    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid objectId")
    }
    const findVideo = await Video.findById({ _id: id })
    if (!findVideo) {
        throw new ApiError(400, "Video not found or has been deleted")
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
    } else {
        sortObj.createdAt = -1
    }
    const totalDoc = await Video.countDocuments(filter)
    const totalPages = Math.ceil(totalDoc / limit)
    if (!totalDoc) return {}
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

    // TODO: get video, upload to cloudinary, create video
    const videoPath = req.file.path;
    if (!videoPath) {
        throw new ApiError(400, "No Video file added")
    }

    const videoFileUrl = await fileUpload(videoPath)
    const saveVideo = await Video.create({
        videoFileUrl
    })
    if (!saveVideo) {
        throw new ApiError(500, "failed to save video in db")
    }
    return res.status(200)
    .json(
        new ApiResponse(200, "video sucessfully saved!", {videoFileUrl})
    )

})

const uploadVideoThumbnail = asyncHandler(async (req, res) => {

    const thumbnailPath = req.file.path;
    const { videoId } = req.params
    if (!thumbnailPath) {
        throw new ApiError(400, "thumbnail file is required")
    }
    const thumbnailFileUrl = await fileUpload(thumbnailPath)
    const findAndAddThumbnail = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: thumbnailFileUrl
            }
        },
        { new: true }
    )

    if (!findAndAddThumbnail) {
        throw new ApiError(500, "thumbnail failed to be uploaded in db")
    }
    return res.status(200).json(
        new ApiResponse(200, "Thummnail file uploaded in db",{thumbnailFileUrl})
    )



})
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    //frontend would send the choosed video along with its data
    //fetch out the id from data and match
    const videoData = await findVideo(videoId)
    return res.status(200)
        .json(
            new ApiResponse(200, "video found", videoData)
        )
})

const AddVideoDetails = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body
    const { videoId } = req.params
    if (!title || !description) {
        throw new ApiError(400, "title and description required")
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
            $set: {
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
