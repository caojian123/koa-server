import db from '../db/db'
import joi from 'joi'
import jsonwebtoken from 'jsonwebtoken'
import fse from 'fs-extra'
import dateFormat from 'date-fns/format'
import dateCompareAsc from 'date-fns/compare_asc'
import userService from '../service/User'

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

class UserController {
    async getMemberById(ctx) {
        const id = ctx.params.id
        const data = await userService.findById(id)
        ctx.body = {
            data,
        }
    }

    async signup(ctx) {
        //First let's save off the ctx.request.body. Throughout this project
        //we're going to try and avoid using the ctx.request.body and instead use
        //our own object that is seeded by the ctx.request.body initially
        const request = ctx.request.body

        //Next do validation on the input
        const validator = joi.validate(request, userSchemaSignup)
        if (validator.error) {
            ctx.throw(400, validator.error.details[0].message)
        }

        //Now let's check for a duplicate username
        var [result] = await db('users')
            .where({
                username: request.username,
            })
            .count('id as id')
        if (result.id) {
            ctx.throw(400, 'DUPLICATE_USERNAME')
        }

        //..and duplicate email
        var [result] = await db('users')
            .where({
                email: request.email,
            })
            .count('id as id')
        if (result.id) {
            ctx.throw(400, 'DUPLICATE_EMAIL')
        }

        //Now let's generate a token for this user
        request.token = await this.generateUniqueToken()

        //Let's grab their ipaddress
        //TODO: This doesn't work correctly because of the reverse-proxy
        request.ipAddress = ctx.request.ip

        //Ok, at this point we can sign them up.
        try {
            var [result] = await db('users')
                .insert(request)
                .returning('id')

            //Let's send a welcome email.
            if (process.env.NODE_ENV !== 'testing') {
                //Let's turn off welcome emails for the moment
                // let email = await fse.readFile(
                //     './src/email/welcome.html',
                //     'utf8'
                // )
                // const emailData = {
                //     to: request.email,
                //     from: process.env.APP_EMAIL,
                //     subject: 'Welcome To Koa-Vue-Notes-Api',
                //     html: email,
                //     categories: ['koa-vue-notes-api-new-user'],
                //     substitutions: {
                //         appName: process.env.APP_NAME,
                //         appEmail: process.env.APP_EMAIL,
                //     },
                // }
                // await sgMail.send(emailData)
            }

            //And return our response.
            ctx.body = {
                message: 'SUCCESS',
                id: result,
            }
        } catch (error) {
            ctx.throw(400, 'INVALID_DATA')
        }
    }

    async authenticate(ctx) {
        const request = ctx.request.body

        if (!request.username || !request.password) {
            ctx.throw(404, 'INVALID_DATA')
        }

        ctx.body = {
            accessToken: 'token',
            refreshToken: 'refreshTokenData.refreshToken',
        }
    }

    async refreshAccessToken(ctx) {
        const request = ctx.request.body
        if (!request.username || !request.refreshToken) {
            ctx.throw(401, 'NO_REFRESH_TOKEN')
        }

        ctx.body = {
            accessToken: 'token',
            refreshToken: 'refreshTokenData.refreshToken',
        }
    }

    async invalidateAllRefreshTokens(ctx) {
        const request = ctx.request.body
        try {
            await db('refresh_tokens')
                .update({
                    isValid: false,
                    updatedAt: dateFormat(new Date(), 'YYYY-MM-DD HH:mm:ss'),
                })
                .where({
                    username: request.username,
                })
            ctx.body = {
                message: 'SUCCESS',
            }
        } catch (error) {
            ctx.throw(400, 'INVALID_DATA')
        }
    }

    async invalidateRefreshToken(ctx) {
        const request = ctx.request.body
        if (!request.refreshToken) {
            ctx.throw(404, 'INVALID_DATA')
        }
        try {
            await db('refresh_tokens')
                .update({
                    isValid: false,
                    updatedAt: dateFormat(new Date(), 'YYYY-MM-DD HH:mm:ss'),
                })
                .where({
                    username: ctx.state.user.username,
                    refreshToken: request.refreshToken,
                })
            ctx.body = {
                message: 'SUCCESS',
            }
        } catch (error) {
            ctx.throw(400, 'INVALID_DATA')
        }
    }

    async checkPasswordResetToken(ctx) {
        const request = ctx.request.body

        if (!request.passwordResetToken || !request.email) {
            ctx.throw(404, 'INVALID_DATA')
        }

        let [passwordResetData] = await db('users')
            .select('passwordResetExpiration')
            .where({
                email: request.email,
                passwordResetToken: request.passwordResetToken,
            })
        if (!passwordResetData.passwordResetExpiration) {
            ctx.throw(404, 'INVALID_TOKEN')
        }

        //Let's make sure the refreshToken is not expired
        var tokenIsValid = dateCompareAsc(
            dateFormat(new Date(), 'YYYY-MM-DD HH:mm:ss'),
            passwordResetData.passwordResetExpiration
        )
        if (tokenIsValid !== -1) {
            ctx.throw(400, 'RESET_TOKEN_EXPIRED')
        }

        ctx.body = {
            message: 'SUCCESS',
        }
    }

    async private(ctx) {
        ctx.body = {
            user: ctx.state.user,
        }
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

export default UserController
