'use strict'

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from 'kcors';
import logger from './logs/log';
import userAgent from 'koa-useragent';
import error from 'koa-json-error';
import * as Tsp from '@vipabc/node-tsp';

//Routes
import userActionsRouter from './routes/userActions';
import applicationAction from './routes/applicationAction';

import handleMessage from './middleware/handleMessage';

//Initialize app
const app = new Koa()

//Let's log each successful interaction. We'll also log each error - but not here,
//that's be done in the json error-handling middleware
app.use(async (ctx, next) => {
    try {
        await next()
        logger.info(
            ctx.method + ' ' + ctx.url + ' RESPONSE: ' + ctx.response.status
        )
    } catch (error) { }
})

//Apply error json handling
let errorOptions = {
    postFormat: (e, obj) => {
        //Here's where we'll stick our error logger.
        logger.info(obj)
        if (process.env.NODE_ENV !== 'production') {
            return obj
        } else {
            delete obj.stack
            delete obj.name
            return obj
        }
    },
}
app.use(error(errorOptions));
app.use(handleMessage());
// return response time in X-Response-Time header
app.use(async function responseTime(ctx, next) {
    const t1 = Date.now()
    await next()
    const t2 = Date.now()
    ctx.set('X-Response-Time', Math.ceil(t2 - t1) + 'ms')
})

//For cors with options
app.use(cors({ origin: '*' }))

//For useragent detection
app.use(userAgent)

//For managing body. We're only allowing json.
app.use(bodyParser({ enableTypes: ['json'] }))

//For router
app.use(userActionsRouter.routes())
app.use(userActionsRouter.allowedMethods())
app.use(applicationAction.routes())
app.use(applicationAction.allowedMethods())

// TSP
const config = {
    "centralUrl": "http://central.tsp.weitutorstage.com", // TSP注册中心地址
    "provider": {                                         // 服务方
        "heartBeatInterval": 5,                             // 心跳频率，单位秒
        "env": "stage",
        "sgName": "member.sms.config.api",
        "version": "0.0.0.1",
    },
    "consumer": {                                         // 消费方
        "cacheExpire": 10,                                  // TSP服务寻址本地缓存时间，单位秒
    }
}

Tsp.option(config);

export default app
