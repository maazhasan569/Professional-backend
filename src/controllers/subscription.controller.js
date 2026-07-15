import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/users.model.js"
import { Subscription } from "../models/subscription.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import  asyncHandler from "../utils/asynhandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const { isSubscribed } = req.body
    // TODO: toggle subscription

    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(400, "channel doesnt exist try again")
    }
    const subscriber = isSubscribed ? await Subscription.create({
        subscriber: req.user_id,
        channel: channelId
    }) : await Subscription.findByIdAndDelete(
        channelId
    )

    return res.status(200)
        .json(
            new ApiResponse(200, isSubscribed ? "New subsciber Added in DB" : "User unSubscribed the channel",
                subscriber
            )
        )

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const subscriberLists = await User.aggregate([
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
            $project: {
                username: 1,
                fullname: 1,
                avatar: 1,
                coverImg: 1
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
    const channelList = await User.aggregate([
        {
            $match: {
                subscriberId
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foriegnField: "subscriber",
                as: "channels"
            }
        },
        {
            $project: {
                username: 1,
                fullname: 1,
                avatar: 1,
                coverImg: 1
            }
        }
    ])
    if (!channelList?.length) {
        throw new ApiError(400, "subscriber doesnt exist ")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, "Channel fetched", !channelList.channels?.length ? {} : channelList)
        )

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}