import request from 'request-promise';
import { ebsco } from 'config';

import { ebscoLogger } from './logger';

export function handleEbscoError(error) {
    if (!error.error) {
        throw error;
    }
    // 109 = Invalid Session Token. Please generate a new one.
    if (error.error.ErrorNumber === '109') {
        ebscoLogger.info(error.error.ErrorDescription, error.error);
        throw new Error('retry');
    }
    // on retrieve api error 132 is wrong 'an' and 135 is wrong 'dbId'
    if (
        error.error.ErrorNumber === '132' ||
        error.error.ErrorNumber === '135'
    ) {
        ebscoLogger.info(error.error.ErrorDescription, error.error);
        let newError = new Error('Not Found');
        newError.status = 404;
        throw newError;
    }
    ebscoLogger.error(
        error.error.ErrorDescription || 'ebsco error',
        error.error,
    );
    let newError = new Error(
        error.error.ErrorDescription ||
            error.error.Reason ||
            JSON.stringify(error.error),
    );

    newError.status = error.statusCode || 500;
    throw newError;
}

export default async function ebscoRequest(url, json, authToken, sessionToken) {
    const requestData = {
        url: `${ebsco.host}${ebsco.port ? `:${ebsco.port}` : ''}${url}`,
        json,
        proxy: ebsco.proxy,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-authenticationToken': authToken,
            'x-sessionToken': sessionToken,
        },
    };

    const start = Date.now();
    const result = await request
        .post(requestData)
        .catch(handleEbscoError)
        .catch((error) => {
            const end = Date.now();
            ebscoLogger.info(
                `POST ${requestData.url} - ${error.statusCode} Failure`,
                {
                    json,
                    authToken,
                    sessionToken,
                    time: `took ${end - start}ms`,
                },
            );
            throw error;
        });
    const end = Date.now();

    ebscoLogger.info(`POST ${requestData.url} - 200 SUCCESS`, {
        json,
        authToken,
        sessionToken,
        time: `took ${end - start}ms`,
    });

    return result;
}
