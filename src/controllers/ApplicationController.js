import db from '../db/db'
import joi from 'joi'
import jsonwebtoken from 'jsonwebtoken'
import applicationService  from '../service/ApplicationService';

const userSchemaSignup = joi.object({
    firstName: joi
        .string()
        .min(1)
        .max(25)
        .alphanum()
        .required(),
    lastName: joi
        .string()
        .min(1)
        .max(25)
        .alphanum()
        .required(),
    username: joi
        .string()
        .min(3)
        .max(100)
        .regex(/[a-zA-Z0-9@]/)
        .required(),
    email: joi
        .string()
        .email()
        .required(),
    password: joi
        .string()
        .min(8)
        .max(35)
        .required(),
})

const userSchemaResetPassword = joi.object({
    email: joi
        .string()
        .email()
        .required(),
    password: joi
        .string()
        .min(8)
        .max(35)
        .required(),
    passwordResetToken: joi.string().required(),
})

class ApplicationController {
    async applicationController(ctx) {
        const id = ctx.params.id;
        const data = await applicationService.queryApplicationList({});
        console.log('data', data);
        ctx.body = {
            data: 'hahah'
        };
    }

    async checkUniqueToken(token) {
        let result = await db('users')
            .where({
                token: token,
            })
            .count('id as id')
        if (result[0].id) {
            return true
        }
        return false
    }
}

export default ApplicationController;
