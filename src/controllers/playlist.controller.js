import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/videos.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const videoIds = []

    if(!videoIds?.length){
        throw ApiError (400 , "Video required to create playlist")
    }
    const isValidVideoId = videoIds.filter(ids => !isValidObjectId(ids))
    if(isValidObjectId?.length){
        throw new ApiError(500 , "Invalid ObjId of video")
    }
    const playlistVideo = await Video.aggregate([
        {
            $match : {
                _id : {$in : new mongoose.Types.ObjectId(videoIds)}
            }
        },
        {
            $project : {
                id : 1
            }
        }
    ])
    const availableVideo = playlistVideo.map((ids) => {
        return ids;
    
    })
    const UnAvailableVideo = playlistVideo.filter((Ids) => {
        !availableVideo.includes(ids.toString())
    })
    
    const playlist = await Playlist.create({
        name, 
        description, 
        videos  : availableVideo,
        owner : req.user?.username
    })

    if(!playlist) {
        throw new ApiError(500 , "failed to create the playlist")
    }

    return res.status(200)
    .json(
        new ApiResponse(200 , "Playlist created" , {
            availableVideo,UnAvailableVideo,playlist,
        })
    )
    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
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
