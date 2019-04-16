import joi from 'joi';
import jsonwebtoken from 'jsonwebtoken';
import applicationService from '../service/ApplicationService';

const applicationSchema = joi.object({
    app_sn: joi
        .string()
        .max(36),
    app_name: joi
        .string()
        .min(1)
        .max(32),
    dept_code: joi
        .string()
        .min(3)
        .max(16),
});


class ApplicationController {
    async applicationController(ctx) {
        const request = ctx.request.body;
        const validator = joi.validate(request, applicationSchema);
        
        if (validator.error) ctx.renderError(400, validator.error.details[0].message);
       
        const data = await applicationService.queryApplicationList(request);

        return ctx.send(data); 
    }
}

export default ApplicationController
