
import dotenv from "dotenv"
import express from "express"
import connectDb from "./db/index.js"
dotenv.config({
    path : "./env"
})
const app = express()
const PORT = process.env.PORT || 8000

connectDb()
.then(() => {
    app.on("error" , (err) => {
        console(`After connection failed ${err}`)
    })

    app.listen( PORT , () => {
        console.log(`App listening at PORT : ${PORT}`)
    } )
})
// const app = express()
//     (async () => {
//         try {
//             await mongoose.connect(`${process.env.Database_URL}/${DB_NAME}`);

//             app.on("error", (error) => {
//                 console.log(error)
//             })

//             app.listen(process.env.PORT, () => {
//                 console.log(`app is listining at ${process.env.PORT}`)
//             })
//         } catch (error) {
//             console.log(`error : ${error}`);
//             throw error;
//         }
//     })();
