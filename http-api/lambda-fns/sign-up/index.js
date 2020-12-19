exports.handler = async (event) => {

    const { username, email } = JSON.parse(event.body)

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'sign up success'})
    }
}