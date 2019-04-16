import db from '../db/db'
import ModelError from '../models/modelError'

class User {
    static async findById(id) {
        try {
            const [userData] = await db.query(
                'select * from member where MemberId = ?',
                [id]
            )
            return userData[0]
        } catch (error) {
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
                    Log.exception('Member.insert', e)
                    throw new ModelError(500, e.message) // Internal Server Error for uncaught exception
            }
        }
    }
}

export default User
