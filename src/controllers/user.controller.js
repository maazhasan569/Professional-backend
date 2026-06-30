import asynchandler from "../utils/asynhandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import fileUpload from "../utils/fileupload.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (err) {
        throw new ApiError(500, "something went wrong while generating access and refresh incomingRefreshToken",
            err.message
        )
    }
}

const registerUser = asynchandler(async (req, res, next) => {

    //get user data 
    const { username, email, fullName, passcode } = req.body

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
    }


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
        "-passcode -refreshincomingRefreshToken"
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

const logInUser = asynchandler(async (req, res, next) => {
    //req body => data
    //email , pass , username
    //if data arrives
    // hand over incomingRefreshToken
    //thro refresh incomingRefreshToken
    //send cookies
    //send response

    const { email, passcode, username } = req.body

    if (!email || !username) {
        throw new ApiError(400, "Pls enter either email or username")
    }

    const isUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!isUser) {
        throw new Error(400, "User not registered")
    }

    const isPasswordValid = await isUser.isPassword(passcode)

    if (!isPasswordValid) {
        throw new ApiError(400, "Password not found")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(isUser._id)

    //optional 
    const loggedInUser = await User.findById(isUser._id).select(
        "-passcode -refreshincomingRefreshToken"
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
        .cookie("accessincomingRefreshToken", accessincomingRefreshToken, options)//15d
        .cookie("refreshincomingRefreshToken", refreshincomingRefreshToken, options)//60d
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessincomingRefreshToken, refreshincomingRefreshToken
                },
                "User logged in successfully"
            )
        )
})

const logOut = asynchandler(async (req, res) => {
    await req.user.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshincomingRefreshToken: undefined
            }
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
        .clearCookie("accessincomingRefreshToken", options)
        .clearCookie("refreshincomingRefreshToken", options)
        .json(
            new ApiResponse(
                200,
                "successfuly logged out",
                {}
            )
        )
})

const refreshAccessincomingRefreshToken = asynchandler(async (req, res) => {
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

        const decodedToken = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET)
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
export { registerUser, logInUser, logOut }