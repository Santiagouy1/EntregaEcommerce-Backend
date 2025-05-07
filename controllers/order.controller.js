const Order = require('../models/order.model')
const Product = require('../models/product.model')

//# Obtener ordenes
async function getOrders(req, res) {
  try {

    const id = req.user._id;
    const user = req.user.role === "admin" ? {} : { user: id };

    const orders = await Order.find(user)
                              .sort({ createdAt: -1 })
                              .populate("user", "name email")
                              .populate("products.product", "product price image")

    return res.status(200).send({
      message: 'Orden obtendia correctaemnte',
      orders
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      message: 'Error al obtener orden'
    })
  }
}

//# Crear ordenes
async function createOrder(req, res) {
  try {
    const data = req.body
    const order = new Order(data)

    await checkedOrderPrices(order.products)

    const newOrder = await order.save()
    return res.status(201).send({
      message: 'Orden creada correctamente',
      order: newOrder
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      message: 'Error al crear orden'
    })
  }
}

//# Funcion para verificar precios
async function checkedOrderPrices(products) {
  for (const product of products) {
    const productDB = await Product.findById(product.product)
    if (!productDB) {
      throw new Error(`Producto con el ID ${product.product} no encontrado`)
    }
    if (productDB.price !== product.price) {
      throw new Error(`Desajuste de precios para el producto con ID ${product.product}`)
    }
  }
}

module.exports = {
  getOrders,
  createOrder
}
