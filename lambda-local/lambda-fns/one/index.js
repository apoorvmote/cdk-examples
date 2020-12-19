exports.handler = async (event) => {

    console.log(event)

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'success' })
    }
}