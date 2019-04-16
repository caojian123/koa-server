const handleMessage = () => {
    // 处理请求成功方法
    const render = ctx => {
        return (data, msg) => {
            ctx.set('Content-Type', 'application/json');
            ctx.body = {
                success: true,
                code: 200,
                data: data,
                msg: msg || '请求成功'
            }
        }
    }

    // 处理请求失败方法
    const renderError = ctx => {
        return (code, msg) => {
            ctx.set('Content-Type', 'application/json');
            ctx.body = {
                success: false,
                code: code,
                data: null,
                msg: msg || '请求失败'
            }
        }
    }

    return async (ctx, next) => {
        ctx.send = render(ctx);
        ctx.sendError = renderError(ctx);
        await next();
    }
}

export default handleMessage;