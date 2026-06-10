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