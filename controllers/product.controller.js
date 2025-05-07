const Product = require('../models/product.model')
const fs = require('fs')
const path = require('path')

//#Obtener todos los productos
async function getProducts(req, res) {
  try {
    const page = parseInt(req.query.page) || 0
    const limit = parseInt(req.query.limit) || 10

    const products = await Product.find({}).sort({ createdAt: 1 }).limit(limit).skip(page * limit)

    return res.status(200).send({
      message: 'Productos obtenidos correctamente',
      products
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      message: 'Error al obtener los productos'
    })
  }
}

//# Obtener producto por ID
async function getProductById(req, res) {
  try {
    const productId = req.params.id

    if (!productId) {
      return res.status(400).send({
        message: 'ID de producto no proporcionado'
      })
    }

    const product = await Product.findById(productId)

    if (!product) {
      return res.status(404).send({
        message: 'Producto no encontrado'
      })
    }

    return res.status(200).send(product)
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      message: 'Error al obtener el producto'
    })
  }
}

//# Creacion de productos
async function createProduct(req, res) {
  try {
    console.log("Body recibido:", req.body);
    console.log("Archivo recibido:", req.file);
    
    // Verificar que todos los campos requeridos estén presentes
    const requiredFields = ['product', 'description', 'price', 'category', 'dateCreate'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).send({
          message: `El campo ${field} es obligatorio`
        });
      }
    }
    
    // Verificar la longitud de la descripción manualmente
    if (req.body.description && req.body.description.length < 5) {
      return res.status(400).send({
        message: 'La descripción debe tener al menos 5 caracteres'
      });
    }
    
    // Verificar que se haya cargado un archivo
    if (!req.file) {
      return res.status(400).send({
        message: 'Debes seleccionar una imagen para el producto'
      });
    }
    
    // Crear objeto de producto con los datos recibidos
    const product = new Product({
      product: req.body.product,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      dateCreate: req.body.dateCreate,
      image: req.file.filename 
    });
    
    // Intentar guardar el producto
    const newProduct = await product.save();
    
    return res.status(201).send({
      message: 'Producto creado correctamente',
      product: newProduct
    });
  } catch (error) {
    console.error("Error detallado al crear producto:", error);
    
    // Generar mensajes de error más amigables
    let errorMessage = 'Error al crear el producto';
    
    // Si es un error de validación de Mongoose
    if (error.name === 'ValidationError') {
      // Obtener el primer error de validación
      const fieldErrors = Object.keys(error.errors).map(field => {
        const err = error.errors[field];
        
        // Mensajes personalizar para errores
        if (err.kind === 'minlength') {
          return `El campo ${field} debe tener al menos ${err.properties.minlength} caracteres`;
        } else if (err.kind === 'maxlength') {
          return `El campo ${field} no puede exceder los ${err.properties.maxlength} caracteres`;
        } else if (err.kind === 'required') {
          return `El campo ${field} es obligatorio`;
        } else {
          return `Error en el campo ${field}: ${err.message}`;
        }
      });
      
      errorMessage = fieldErrors.join('. ');
    } else if (error.name === 'MongoError' && error.code === 11000) {
      // Error de duplicación
      errorMessage = 'Ya existe un producto con esa información';
    } else {
      // Otros errores
      errorMessage = error.message || 'Error desconocido al crear el producto';
    }
    
    return res.status(400).send({
      message: errorMessage
    });
  }
}

//# Eliminar producto porID
async function deleteProductById(req, res) {
  try {
    const productId = req.params.id

    if (!productId) {
      return res.status(400).send({
        message: 'ID de producto no proporcionado'
      })
    }

    const product = await Product.findById(productId)

    if (!product) {
      return res.status(404).send({
        message: 'Producto no encontrado'
      })
    }

    // Eliminar la imagen asociada al producto si existe
    if (product.image) {
      const imagePath = path.join(__dirname, '../uploads/products', product.image)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    // Eliminar el producto de la base de datos
    await Product.findByIdAndDelete(productId)

    return res.status(200).send({
      message: 'Producto eliminado correctamente'
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      message: 'Error al eliminar el producto'
    })
  }
}

//# Actualizar producto por ID
async function updateProductById(req, res) {
  try {
    const productId = req.params.id
    const updates = req.body

    if (!productId) {
      return res.status(400).send({
        message: 'ID de producto no proporcionado'
      })
    }

    // Buscar el producto primero
    const product = await Product.findById(productId)

    if (!product) {
      return res.status(404).send({
        message: 'Producto no encontrado'
      })
    }

    if (req.file) {
      // Eliminar la imagen anterior si existe
      if (product.image) {
        const oldImagePath = path.join(__dirname, '../uploads/products', product.image)
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      }
      updates.image = req.file.filename
    }

    // Actualizar el producto
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updates,
      { new: true, runValidators: true }
    )

    return res.status(200).send({
      message: 'Producto actualizado correctamente',
      product: updatedProduct
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      message: 'Error al actualizar el producto'
    })
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  deleteProductById,
  updateProductById
}
