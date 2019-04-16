import Router from 'koa-router'
import jwt from '../middleware/jwt'
import logger from '../logs/log'
import ApplicationController from '../controllers/ApplicationController'

const router = new Router()
const jwtMiddleware = jwt({ secret: process.env.JWT_SECRET })

router.get('/', async (ctx, next) => {
    ctx.body = { message: 'Hi there. ' + process.env.npm_package_version }
})

//Initial controller once for all routes
const applicationController = new ApplicationController()

router.get('/api/v1/application', async (ctx) => await applicationController.applicationController(ctx));

export default router
