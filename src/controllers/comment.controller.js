import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asynhandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    //check if id is valid
    //sort the comments
    //
    const {videoId} = req.params
    const {page = 1, limit = 10 , sortBy , sortType} = req.query
    
   
    const totalComments = await Comment.countDocuments({video : videoId})
    if(!totalComments){
       return res.status(200)
       .json(
        new ApiResponse(
            200 , "No comments yet" , []
        )
       )
    }
    let sortObj = {}
    if(sortBy){
        const sortDirection = sortType === "desc"? -1 : 1
        sortObj[sortBy] = sortDirection
    }else {
        sortObj.createdAt = -1
    }
    const skip = (page - 1)*limit

    const fetchedComments = await Comment
    .find({video : videoId})
    .sort(sortObj)
    .skip(skip)
    .limit(limit)
    .exec()

    
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    //get videoId from url
    //get content of comment
    //get authenticated user

    const {videoId} = req.params
    const {content} = req.body
    if(!isValidObjectId(videoId)){
        throw new ApiError(400 , "Invalid video Id")
    }
    if(!content){
        throw new ApiError(400 , "Comment content is required")
    }

    const createComment = await Comment.create({
        content,
        video : videoId,
        owner : req.user._id
    })
    if(!createComment){
        throw new ApiError(500 , "Error occured while creating the comment")
    }

    res.status(200)
    .json(
        new ApiResponse(200 , "Comment created!" , createComment)
    )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body
    if(!isValidObjectId(commentId)){
        throw new ApiError(400 , "Invalid comment Id")
    }
   if(!content){
    throw new ApiError(400 , "Comment content required")
   }

   const comment = await Comment.findById(commentId);
   if(!comment){
    throw new ApiError(400 , "Comment not found")
   }

   if(req.user._id.toString() !== comment.owner.toString() ){
    throw new ApiError(400 , "user dont have permission to edit this comment")
   }
   comment.content = content
   const updated = await comment.save({ValidiateBeforeSave : true})
   return res.status(200)
   .json(
    new ApiResponse(200,
        "Comment updated",
        updated
    )
   )


})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
     const {commentId} = req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400 , "Invalid comment Id")
    }

   const comment = await Comment.findById(commentId);
   if(!comment){
    throw new ApiError(400 , "Comment not found")
   }

   if(req.user._id.toString() !== comment.owner.toString() ){
    throw new ApiError(400 , "user dont have permission to edit this comment")
   }
   const delComment = await Comment.findByIdAndDelete(commentId)
   return res.status(200)
   .json(
    new ApiResponse(200,
        "Comment deleted",
        delComment
    )
   )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
