import db from '../db/db';
import ModelError from '../models/modelError';
import isEmpty from 'lodash/isEmpty';

class ApplicationService {
    static async queryApplicationList(params) {
        // let sql = `select id, app_sn, app_name, source, dept_code, inchare_email, incharge_name, inchage_phone, incharge_contry_code, reason, sensltive_code from sms_app `;
        // if(!isEmpty(params)) {
        //     sql += 'where ';
        //     Object.keys(params).forEach((key,index)=> {
        //         if(index === 0){
        //             sql += ` ${key} = ${params[key]}`;
        //         }else{
        //             sql += ` and ${key} = ${params[key]}`
        //         }
               
        //     });
        // }
        try {
            const data = await db('sms_app')
            .select('select id', 'app_sn', 'app_name', 'source', 'dept_code', 'inchare_email', 'incharge_name', 'inchage_phone', 'incharge_contry_code', 'reason', 'sensltive_code')
            .where(params)
            return data;
        } catch (e) {
            switch (e.code) { // just use default MySQL messages for now
                case 'ER_BAD_NULL_ERROR':
                case 'ER_NO_REFERENCED_ROW_2':
                case 'ER_NO_DEFAULT_FOR_FIELD':
                    throw new ModelError(403, e.message); // Forbidden
                case 'ER_DUP_ENTRY':
                    throw new ModelError(409, e.message); // Conflict
                case 'ER_BAD_FIELD_ERROR':
                    throw new ModelError(500, e.message); // Internal Server Error for programming errors
                default:
                    throw new ModelError(500, e.message); // Internal Server Error for uncaught exception
            }
        }
    }
}

export default ApplicationService;