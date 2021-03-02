exports.handler = async (event, context, callback) => {
    
    const request = event.Records[0].cf.request

    const headers = request.headers

    const user = 'my-username'

    const password = 'my-password'

    const authString = 'Basic ' + Buffer.from(user + ':' + password).toString('base64')

    if (typeof headers.authorization === 'undefined' || headers.authorization[0].value !== authString) {

        const response = {
            status: '401',
            statusDescription: 'Unauthorized',
            body: 'Unauthorized',
            headers: {
                'www-authenticate': [{key: 'WWW-Authenticate', value:'Basic'}]
            }
        }

        callback(null, response)
    }

    callback(null, request)
}