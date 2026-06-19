import asynchandler from "../utils/asynhandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import fileUpload from "../utils/fileupload.js";


const registerUser = asynchandler(async (req, res) => {

    //get user data 
    const { username, email, fullname, passcode } = req.body
    console.log(email, password)

    const fieldCheck = [username, email, fullname, passcode].some((field) => {
        !field || field.trim() === ""
    })

    if (fieldCheck) {
        throw new ApiError(400, "All fields are required")
    }

    const exitedUser = await User.find({
        $or: [{ email }, { password }]
    })

    if (exitedUser) {
        throw new ApiError(400, "Email or Password is already used")
    }

    // Diffrent approach

    // const checkEmail = await User.findOne({email}) this would return an null if nothin found
    //const checkPasscode = await User.find({passcode})
    //if(checkEmail && checkPasscode){
    // throw new ApiError(400 , "Email or Password is already used")}
    //else if (checkPasscode){
    // throw new ApiError(400 , "Passcode already in use" )}
    // else if (checkEmail ) {
    //   throw new ApiError(400 , "email already in use")}

    const avatarImgPath = req.files?.avatar[0]?.path
    const coverImgPath = req.files?.coverImg[0]?.path

    if (!avatarImgPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    const avatarUrl = await fileUpload(avatarImgPath)

    let coverImgUrl;
    if (coverImgPath) {
        coverImgUrl = await fileUpload(coverImgPath)
    }

    if (!avatarUrl) {
        throw new ApiError(400, "Avatar file is required")
    }

    // Create new user
    const createUser = new User({
        username: username,
        email: email,
        avatar: avatarUrl,
        coverImg: coverImgUrl || "",
        passcode: passcode,
    })

    await createUser.save()
    if (!createUser.isPassword(passcode)) {
        throw new ApiError(500, "Unsucussful password encyption")
    }

    const isCreatedUser = await User.findById(createUser._id).select(
        "-passcode -refreshToken"
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
export default registerUser