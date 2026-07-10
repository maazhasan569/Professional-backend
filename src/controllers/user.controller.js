import asynchandler from "../utils/asynhandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import fileUpload from "../utils/fileupload.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        console.log(userId)
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        console.log({accessToken , refreshToken})
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        
        return { accessToken, refreshToken }
    } catch (err) {
        throw new ApiError(500,err.message
        )
    }
}

const registerUser = asynchandler(async (req, res, next) => {

    //get user data 
    const { username, email, fullName, passcode } = req.body;

    console.log("req object : ", req.body)
    const fieldCheck = [username, email, fullName, passcode].some((field) => {
        return !field || field.trim() === ""
    })

    if (fieldCheck) {
        throw new ApiError(400, "All fields are required")
    }

    const exitedUser = await User.findOne({
        $or: [{ email }, { passcode }]
    })

    if (exitedUser) {
        throw new ApiError(400, "Email or Password is already used")
    }

    // Diffrent approach

    // const checkEmail = await User.findOne({email}) this would return an null if nothin found
    //const checkPasscode = await User.find({passcode})
    //if(checkEmail && checkPasscode){
    // throw new ApiError(400 , "Email and Password is already used")}
    //else if (checkPasscode){
    // throw new ApiError(400 , "Passcode already in use" )}
    // else if (checkEmail ) {
    //   throw new ApiError(400 , "email already in use")}

    const avatarImgPath = req.files?.avatar[0]?.path
    let coverImgPath;

    if (Array.isArray(req.files.coverImg) && req.files.coverImg.length > 0) {
        coverImgPath = req.files.coverImg[0].path
    }//check if there is an cover Img


    console.log("file OBJ", req.files)
    if (!avatarImgPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    const avatarUrl = await fileUpload(avatarImgPath)
    console.log("avatar url : ", avatarUrl)

    const coverImgUrl = await fileUpload(coverImgPath)
    if (!avatarUrl) {
        throw new ApiError(400, "Avatar file is required")
    }

    // Create new user
    const createUser = new User({
        username: username,
        email: email,
        fullName: fullName,
        avatar: avatarUrl,
        coverImg: coverImgUrl || "",
        passcode: passcode,
    })

    await createUser.save()
    // const isCorrectPassword = createUser.isPassword(passcode)
    // if () {
    //     throw new ApiError(500, "Unsucussful password encyption")
    // }

    const isCreatedUser = await User.findById(createUser._id).select(
        "-passcode "
    )

    if (!isCreatedUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    res.status(201).json(
        new ApiResponse(
            201,
            "User registered successfully",
            isCreatedUser)

    )
})

const logInUser = asynchandler(async (req, res) => {
    //req body => data
    //email , pass , username
    //if data arrives
    // hand over incomingRefreshToken
    //thro refresh incomingRefreshToken
    //send cookies
    //send response

    const { email, passcode, username } = req.body;
    //
    if (!email && !username) {
        throw new ApiError(400, "Pls enter either email or username")
    }
    const isUser = await User.findOne({
        $or : [{username} , {email}]
    })
    console.log(isUser)
    const isPasswordValid = await isUser.isPassword(passcode)

    if (!isPasswordValid) {
        throw new ApiError(400, "Password not found")
    }
    
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(isUser._id)
    console.log(`accesstoken = ${accessToken}`)
    console.log(`refreshToken = ${refreshToken}`)
    //optional 
    const loggedInUser = await User.findById(isUser._id).select(
        "-passcode -refreshToken"
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)//15d
        .cookie("refreshToken", refreshToken, options)//60d
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser
                },
                "User logged in successfully"
            )
        )
})

const logOut = asynchandler(async (req, res) => {

    if(!req.user){
        throw new ApiError(400 , "user not registered")
    }
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: 1
            }
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                "successfuly logged out",
                {}
            )
        )
})

const refreshAccessToken = asynchandler(async (req, res) => {
    //recieve incomingRefreshToken from refreshincomingRefreshToken
    //check if there is a incomingRefreshToken
    //if incomingRefreshToken validate
    //check if it matches with user db
    // generate a new access incomingRefreshToken

    try {
        const incomingRefreshToken = req.cookie?.refreshToken
        if (!incomingRefreshToken) {
            throw new ApiError(400, "Unauthorized user")
        }

        const decodeToken = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken._id)
        if (!user) {
            throw new ApiError(400, "Invalid refreshToken")
        }
        if (!(incomingRefreshToken === user?.refreshToken)) {
            throw new ApiError(400, "RefreshToken Expired or already used")
        }

        const { accessToken, newRefreshToken } = generateAccessAndRefreshToken()

        const options = {
            httpOnly: true,
            secure: true,
        }

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, "access token and new RefreshToken generated",
                    { accessToken, refreshToken: newRefreshToken }
                )
            )
    } catch (error) {
        throw new ApiError(500, error?.message || "invalid refresh token")
    }
})

const changeCurrentPassword = asynchandler(async (req, res) => {
    const { oldPasssword, newPassword } = req.body;
    const user = await User.findById(req.user?._id)
    const isOldPasswordCorrect = await user.isPassword(oldPasssword)
    if (!isOldPasswordCorrect) {
        throw new ApiError(400, "Incorrect old Password")
    }
    user.passcode = newPassword
    user.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, "old password changed", {})
    )

})

const getCurrentUser = asynchandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, "user data found", req.user)
    )
})

const updateUserDetails = asynchandler(async (req, res) => {
    const { fullName, email } = req.body;
    if (!email && !fullName) {
        throw new ApiError(400, "both fullname and email required!")
    }
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullName,
                email,
            }
        },
        { new: true }
    ).select("-passcode -refreshToken")

    return res.status(200).json(
        new ApiResponse(200, "user details updated", updatedUser)
    )
})

const updatedUserAvatar = asynchandler(async (req, res) => {
    const avatarFilePath = req.file?.path
    if (!avatarFilePath) {
        throw new ApiError(400, "avatar required")
    }

    const avatarFileUrl = await fileUpload(avatarFilePath)
    if(!avatarFileUrl){
        throw new ApiError(500 , "cloudinary upload failed , try again")
    }

    const uploadedFile = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatarFileUrl
            }
        },
        { new: true }
    ).select("-passcode")

    return res.status(200).json(
        new ApiResponse(200, "Avatar file uploaded", uploadedFile.avatar)
    )
})

const updatedUserCoverImg = asynchandler(async(req, res) => {
    const coverImgFilePath = req.file?.path
    if (!coverImgFilePath) {
        throw new ApiError(400, "coverImg required")
    }

    const coverImgFileUrl = await fileUpload(coverImgFilePath)
    if(!coverImgFileUrl){
        throw new ApiError(500 , "cloudinary upload failed , try again")
    }

    const uploadedFile = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImg : coverImgFileUrl
            }
        },
        { new: true }
    ).select("-passcode -refreshToken")

    return res.status(200).json(
        new ApiResponse(200, "coverImg file uploaded", uploadedFile.avatar)
    )
})

const getUserChannelProfile = asynchandler(async(req,res) => {
    const {username} = req.params
    if(!username?.trim()) {
        throw new ApiError(400 , "Username not in params")
    }

    const channel = await User.aggregate([
        {
            $match : {
                username : username?.toLowerCase()
            }
        },
        {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "channel", 
                as : "subscribers"
            }
        },
        {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "subscriber",
                as : "subscribedTo"
            }
        },
        {
            $addFields : {
                subscriberCount : {
                    $size : "$subscribers"
                },
                subscribedCount : {
                    $size : "$subscribedTo"  
                },
                isSubscribed : {
                    $cond :{
                        if : {$in : [req.user?._id, "$subscribers.subscriber"]},
                        then : true,
                        else : false,
                    }
                }
            }
        },
        
        {
            $project : {
                fullName : 1,
                avatar : 1,
                coverImg : 1,
                isSubscribed : 1,
                subscriberCount : 1,
                subscribedCount : 1
            }
        }
    ])

    if(!channel?.length) {
        throw new ApiError(400 , "channal not found")
    }

    return res.status(200).json(
        new ApiResponse(200 , "channel fetched successfully" ,
            channel[0]
        )
    )
})

const getHistory = asynchandler( async(req,res) => {
    const user = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "history",
                pipeline : [
                    {
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "owner",
                            pipeline : [
                                {
                                    $project : {
                                        fullName : 1,
                                        avatar : 1,
                                        username : 1
                                    }
                                }
                            ]
                        }
                    }, {
                        $addFields : {
                            owner : {
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200)
    .json(
        new ApiResponse(200 , "Successfull fetched watch history" ,
            user[0].history
        )
    )
})
export {
    registerUser,
    logInUser,
    logOut,
    refreshAccessToken,
    changeCurrentPassword,
    updateUserDetails,
    getCurrentUser,
    updatedUserAvatar,
    updatedUserCoverImg
}