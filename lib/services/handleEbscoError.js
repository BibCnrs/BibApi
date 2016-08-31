import { ebscoLogger } from './logger';

export default function (error) {
    if (!error.error) {
        throw error;
    }
    // on retrieve api error 132 is wrong 'an' and 135 is wrong 'dbId'
    if (error.error.ErrorNumber === '132' || error.error.ErrorNumber === '135') {
        ebscoLogger.info(error.error.ErrorDescription, error.error);
        let newError = new Error('Not Found');
        newError.status = 404;
        throw newError;
    }
    ebscoLogger.error(error.error.ErrorDescription || 'ebsco error', error.error);
    let newError = new Error(error.error.ErrorDescription || error.error);
    newError.status = error.statusCode || 500;
    throw newError;
}
