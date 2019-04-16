import db from '../db/db'
import { handleError } from '../models/modelError'

class ApplicationService {
    static async queryApplicationList(params) {
        try {
            const data = await db('sms_app')
                .select(
                    'id',
                    'app_sn',
                    'app_name',
                    'source',
                    'dept_code',
                    'inchare_email',
                    'incharge_name',
                    'inchage_phone',
                    'incharge_contry_code',
                    'reason',
                    'sensltive_code'
                )
                .where(params)
            return data
        } catch (e) {
            handleError(e)
        }
    }
}

export default ApplicationService
