import joi from 'joi';
import jsonwebtoken from 'jsonwebtoken';
import applicationService from '../service/ApplicationService';

const applicationSchema = joi.object({
    appSn: joi
        .string()
        .max(36),
    appName: joi
        .string()
        .min(1)
        .max(32),
    deptCode: joi
        .string()
        .min(3)
        .max(16),
});

const queryParamsMap = {
    appSn: 'app_sn',
    appName: 'app_name',
    deptCode: 'dept_code'
};
class ApplicationController {
    async applicationController(ctx) {
        const request = ctx.request.body;
        const validator = joi.validate(request, applicationSchema);
        let params = {};
        
        if (validator.error) ctx.renderError(400, validator.error.details[0].message);
        Object.keys(request).map(key => {
            params[queryParamsMap[key]] = request[key];
        });
        const data = await applicationService.queryApplicationList(params);

        return ctx.send(data); 
    }
}

export default ApplicationController
