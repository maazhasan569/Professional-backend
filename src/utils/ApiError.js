class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        error = [],
        stack = "",// this tell u the pos of err
    ) {
        super(message)
        this.statusCode = statusCode
        this.error = error
        this.stack = stack
        this.data = null
        this.success = false
        this.error = error

        if(stack) {
            this.stack = stack
        }else {
            Error.captureStackTrace(this ,this.constructor)
        }
        
    }
}

export default ApiError