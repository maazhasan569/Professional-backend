import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const subscriberLists = User.aggregate([
        {
            $match: {
                channelId
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foriegnField: "channel",
                as: "subscribers"
            }
        },
        {
            $project : {
                username : 1,
                fullname : 1,
                avatar : 1,
                coverImg : 1
            }
        }

    ])

    if (!subscriberLists?.length) {
        throw new ApiError(400, "Channel doesnt exist")
    }


    return res.status(200).json(
        new ApiResponse(200, "Subcriber list fetched", !subscriberLists.subscribers.length ? {} : subscriberLists)
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
   
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}