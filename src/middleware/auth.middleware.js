import { User } from "../models/users.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asynhandler.js";
import jwt from "jsonwebtoken"

export const verifyJwt = asyncHandler(async (req,res,next) => {
    try{
        const token = req.cookies?.accessToken || req.header("Authorization").replace(
        "Bearer " , "")
        
    if(!token) {
        throw new ApiError(400 , "Unathorized access")
    }

    const decodedToken = jwt.verify(token ,process.env.ACCESS_TOKEN_SECRET )
    const user = await User.findById(decodedToken._id).select(
        "-passcode -refreshToken"
    )

    if(!user) {
        throw new ApiError(400 , "Invalid Access token")
    }
    req.user = user
    next()
    }catch(err) {
        throw new ApiError(500 , err.message || "invalid access Token ")
    }


})