import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const usersSchema = new mongoose.Schema({
    // watchHistory{

    // },
    username: {
        type: String,
        required: true,
        unique: true,
        lowerCase: true,
        index: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowerCase: true,
    },
    fullName: {
        type: String,
        required: true,
        lowercase: true,
    },
    avatar: {
        type: String, // cloudinary url
        required: true
    },
    coverImg: {
        type: String, // cloudinary url
    },
    passcode: {
        type: String,
        required: [true, 'Pls enter the password']
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    refreshToken : {
        type : String,
    }
}, {
    timestamps: true
})

usersSchema.pre("save", async function () {
    if (!this.isModified("passcode")) return ;
    this.passcode = await bcrypt.hash(this.passcode, 10)
})

usersSchema.methods.isPassword = async function (passcode) {
    return await bcrypt.compare(passcode, this.passcode)
}

usersSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        
        {
            _id : this._id,
            email : this.email,
            username : this.username,
            fullname : this.fullNamen
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

usersSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User", usersSchema)