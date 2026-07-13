import mongoose, { get, isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/videos.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description , videoIds } = req.body
    
    if(!name){
        throw new ApiError(400,"Name of playlist is required")
    }
    if(!description){
        throw new ApiError(400 , "Description of playlist is requires")
    }
    if (!videoIds?.length) {
        throw ApiError(400, "Video required to create playlist")
    }
    const invalidVideoIds = videoIds.filter(ids => !isValidObjectId(ids))
    if (invalidVideoIds?.length) {
        throw new ApiError(400, "Invalid ObjId of video")
    }
    const playlistVideo = await Video.aggregate([
        {
            $match: {
                _id: { $in : videoIds.map(id => new mongoose.Types.ObjectId(id)) }
            }
        },
        {
            $project: {
                _id: 1
            }
        }
    ])
    const availableVideo = playlistVideo.map((ids) => {
        return ids;

    })
    const UnAvailableVideo = videoIds.filter((Ids) => {
        return !availableVideo.includes(ids.toString())
    })

    const playlist = await Playlist.create({
        name,
        description,
        videos: availableVideo,
        owner: req.user
    })

    if (!playlist) {
        throw new ApiError(500, "failed to create the playlist")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, "Playlist created", {
                availableVideo, UnAvailableVideo, playlist,
            })
        )
    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {

    const userPlaylists = await User.find({
        "owner._id": req.user._id
    })
    //TODO: get user playlists
    return res.status(
        new ApiResponse(200, userPlaylists ? "Playlist fetched" : "No playlist created", userPlaylists)
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
    const getPlaylist = await Playlist.findById(playlistId)
    if (!getPlaylist) {
        throw new ApiError(400, "Playlist not found!")
    }
    return res.status(200)
        .json(
            new ApiResponse(200, "user Playlist fetched", getPlaylist)
        )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!playlistId) {
        throw new ApiError(400, "Playlist required")
    }
    if (!videoId) {
        throw new ApiError(400, "Video required")
    }
    const getPlaylist = await Playlist.findById(playlistId)
    const findVideo = await Video.findById(videoId)
    if (!findVideo) {
        throw new ApiError(400, "Video not found")
    }
    if (!playlistId) {
        throw new ApiError(400, "Playlist not found")
    }
    const addVideo = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {
                videos: { videoId }
            }
        },
        { new: true }
    )
    if (!addVideo) {
        throw new ApiError(400, "An error occured while removing video - playlist not found")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, "Video added succesfully", addVideo)
        )


})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist
    if (!videoId) {
        throw new ApiError(400, "video required")
    }
    if (!playlistId) {
        throw new ApiError(400, "Playlist required")
    }
    const findVideo = await Video.findById(videoId)
    if (!findVideo) {
        throw new ApiError(400, "Video not found")
    }

    const removeVideo = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: { videoId }
            }
        },
        { new: true }
    )
    if (!removeVideo) {
        throw new ApiError(400, "An error  occured while removing video - playlist not found")
    }

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!playlistId) {
        throw new ApiError(400, "Playlist required")
    }
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)
    if (!deletedPlaylist) {
        throw new ApiError(400, "An error occured while removing video - playlist not found")
    }

    return res.status(200)
        .json(
            new ApiResponse(
                200, "Playlist deleted", deletePlaylist
            )
        )
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
    if (!name) {
        throw new ApiError(400, "Playlist name is required");
    }

    if (!description) {
        throw new ApiError(400, "Playlist description is required");
    }
    const updatedDoc = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set : {
                name,
                description,
            }
        },
        {new : true}
    )
    if(!updatedDoc){
        throw new ApiError(400 , "Playlist not found")
    }
    return res.status(200)
    .json(
        new ApiResponse(200 , "PlayList updated" , updatedDoc)
    )

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
