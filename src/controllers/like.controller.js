import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/likes.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import  asyncHandler from "../utils/asynhandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user?._id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }


    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    })

    if (existingLike) {

        await Like.findByIdAndDelete(existingLike._id)
        return res
            .status(200)
            .json(new ApiResponse(200, "Video unliked successfully", null))
    } else {

        const newLike = await Like.create({
            video: videoId,
            likedBy: userId
        })
        return res
            .status(201)
            .json(new ApiResponse(201, "Video liked successfully", newLike))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.user?._id

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId")
    }

    // Check if the user has already liked this comment
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })

    if (existingLike) {
        // Unlike
        await Like.findByIdAndDelete(existingLike._id)
        return res
            .status(200)
            .json(new ApiResponse(200, "Comment unliked successfully", null))
    } else {
        // Like
        const newLike = await Like.create({
            comment: commentId,
            likedBy: userId
        })
        return res
            .status(201)
            .json(new ApiResponse(201, "Comment liked successfully", newLike))
    }
})



const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos by the user
    //get authenticated user comming from middleware
    //query to check if the userId matches in likeschema

    const userLike = await Like.find({
        likedBy: req.user._id,
        video: { $exists: true }
    }).populate("video")

    console.log(userLike)
    const likedVideos = userLike.map((videoLikes) => {
        return videoLikes.video
    })
    console.log(likedVideos)
    if (!likedVideos?.length) {
        return res.status(200)
            .json(
                new ApiResponse(200, "No liked videos", [])
            )
    }
    return res.status(200)
        .json(
            new ApiResponse(200, "Liked video of user fetched", likedVideos)
        )

})

export {
    toggleCommentLike,
    toggleVideoLike,
    getLikedVideos
}