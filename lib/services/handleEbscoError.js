export default function (error) {
    if (!error.error || !error.error.ErrorDescription) {
        throw error;
    }
    // on retrieve api error 132 is wrong an and 135 is wrong dbId
    if (error.error.ErrorNumber === '132' || error.error.ErrorNumber === '135') {
        let newError = new Error('Not Found');
        newError.status = 404;
        throw newError;
    }
    let newError = new Error(error.error.ErrorDescription || error.message);
    newError.status = error.statusCode || 500;
    throw newError;
}
