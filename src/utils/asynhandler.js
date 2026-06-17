// const asyncHandler = (fn) => async(req , res , next) => {
//     try {
//         await fn(req , res , next) 
//     }catch(error) {
//         res.status(error.status || 500).json({
//             success : false,
//             message : error.message
//         })
//     }
// }

//method 2

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) =>
            next(error)
        )
    }
}

export default asynchandler



// const asyncHandler = ( /* requestHandler is now your registerUser function */ ) => {
//   return (req, res, next) => {
//         Promise.resolve(
//             // 👇 "requestHandler" becomes your actual code!
//             (async (req, res) => { 
//                 res.status(200).json({ message: "ok" }) 
//             })(req, res, next) // 🏃‍♂️ The inner function fires it right here!
//         ).catch(next)
//     }
// } extended code