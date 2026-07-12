import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


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
    if (sort) {
        const sortDirection = sortType === "desc" ? -1 : 1;
        sortObj[sortBy] = sortDirection
        sortObj[sortType] = "createdAt"
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
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
