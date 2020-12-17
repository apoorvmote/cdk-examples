exports.discountForProduct = (productId) => {

    const products = [
        {
            productId: '1',
            discount: '10%'
        },
        {
            productId: '2',
            discount: '20%'
        },
        {
            productId: '3',
            discount: '30%'
        }
    ]

    const item = products.find(element => element.productId === productId)

    return item.discount
}