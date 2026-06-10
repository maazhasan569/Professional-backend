class ApiResponse {
    constructor(
        statuscode,
        message = "Success",
        data,
    ) 
    {
        this.statuscode = statuscode
        this.message = message
        this.success = statuscode < 400
        this.data = data
    }
}

export default ApiResponse