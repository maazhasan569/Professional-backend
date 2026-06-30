import { User } from "../models/users.model";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asynhandler";
import jwt from "jsonwebtoken"

export const verifyJwt = asyncHandler(async (req,res,next) => {
    try{
        const token = req.cookies?.accessToken || req.header("Authorized").replace(
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
    req.body = user
    next()
    }catch(err) {
        throw new ApiError(500 , err.message || "invalid access Token ")
    }


})