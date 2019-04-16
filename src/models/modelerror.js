class ModelError extends Error {
    constructor(status, message) {
        super(message)
        this.success = false
        this.name = this.constructor.name
        this.status = status
    }
}

export const handleError = (e = {}) => {
    switch (
        e.code // just use default MySQL messages for now
    ) {
        case 'ER_BAD_NULL_ERROR':
        case 'ER_NO_REFERENCED_ROW_2':
        case 'ER_NO_DEFAULT_FOR_FIELD':
            throw new ModelError(403, e.message) // Forbidden
        case 'ER_DUP_ENTRY':
            throw new ModelError(409, e.message) // Conflict
        case 'ER_BAD_FIELD_ERROR':
            throw new ModelError(500, e.message) // Internal Server Error for programming errors
        default:
            throw new ModelError(500, e.message) // Internal Server Error for uncaught exception
    }
}

export default ModelError
