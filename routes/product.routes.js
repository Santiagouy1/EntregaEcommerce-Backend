const router = require('express').Router()
const porductController = require('../controllers/product.controller')
const upload = require('../middlewares/uploadFile')

//# Ruta para obtener todos los productos
router.get('/products', porductController.getProducts)

//# Ruta para obtener un producto por ID
router.get('/products/:id', porductController.getProductById)

//# Ruta para crear un nuevo producto
router.post('/products', upload, porductController.createProduct)

//# Ruta para eliminar un producto por ID
router.delete('/products/:id', porductController.deleteProductById)

//# Ruta para actualizar un producto por ID
router.put('/products/:id', upload, porductController.updateProductById)

module.exports = router