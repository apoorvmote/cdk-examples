const uuid = require('uuid/v4')
const { discountForProduct } = require('./discount')

exports.handler = async(event) => {

    const { productId } = event.queryStringParameters

    return {
        statusCode: 200,
        body: JSON.stringify({ 
            transactionId: uuid(), 
            discount: discountForProduct(productId),
            message: 'from lambda two'
        })
    }
}