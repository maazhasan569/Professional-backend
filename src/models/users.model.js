import mongoose from "mongoose"

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
        lowerCase: true,
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
    timeStamps: true
})

usersSchema.pre("save", async function (next) {
    if (!this.isModified("passcode")) return next();
    this.passcode = await bcrypt.hash(this.passcode, 10)
    next()
})

usersSchema.methods.isPassword = async function (passcode) {
    return await bcrypt.compare(passcode, this.passcode)
}

usersSchema.methods.generateAccessToken = function () {
    jwt.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username,
            fullname : this.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

usersSchema.methods.generateRefreshTokens = function(){
    jwt.signjwt.sign(
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