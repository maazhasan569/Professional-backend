class ApiResponse {
    constructor(
        statuscode,
        message = "Success",
        data,
    ) 
    {
        this.statuscode = statuscode
        this.message = message
        this.success = statuscode
        this.data = data
    }
}

export default ApiResponse