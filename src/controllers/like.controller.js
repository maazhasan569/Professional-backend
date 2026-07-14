import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {isLike} = req.body
    //TODO: toggle like on video
    //check if id valid
    //create like
    //add video
    //btn of like clicked -> true
    //call the api with islike boolean val
    if(!isValidObjectId(videoId)){
        throw new ApiError(400 , "Invalid videoId")
    }
    let toggleLike;
    if(isLike){
      toggleLike = await Like.create({
        video : videoId,
        likedBy : req.user._id
    })

    if(!toggleLike){
        throw new ApiError(500 , "An error occured while saving video Like")
    }
    }else{
        const likedVideo = await Like.find({video : videoId})
        toggleLike = await likedVideo.deleteOne()
        

    }
    return res.status(200)
    .json(
        new ApiResponse(200,isLike? "Video Liked generated" : "Video unliked " , toggleLike)
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!isValidObjectId(commentId)){
        throw new ApiError(400 , "Invalid commendId")
    }
    let toggleLike;
    if(isLike){
      toggleLike = await Like.create({
        comment : commentId,
        likedBy : req.user._id
    })

    if(!toggleLike){
        throw new ApiError(500 , "An error occured while saving comment Like")
    }
    }else{
        const likedComment = await Like.find({comment : commentIdId})
        toggleLike = await likedComment.deleteOne()
    }
    
     return res.status(200)
    .json(
        new ApiResponse(200,isLike? "Comment Liked generated" : "Comment unliked " , toggleLike)
    )
})



const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos by the user
    //get authenticated user comming from middleware
    //query to check if the userId matches in likeschema

    const userLike = await Like.find({
        likedBy : req.user._id
    })

    const likedVideos = userLike.filter((videoLikes) =>{ 
        return videoLikes.video
    })
    //[{videos : }]
    if(!likedVideos?.length){
        return res.status(200)
        .json(
            new ApiResponse(200 , "No liked videos" , [])
        )
    }
    return res.status(200)
    .json(
        new ApiResponse(200 , "Liked video of user fetched" , likedVideos)
    )

})

export {
    toggleCommentLike,
    toggleVideoLike,
    getLikedVideos
}