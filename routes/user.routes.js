const router = require('express').Router()
const userController = require('../controllers/user.controller')
const { isAuth, isAdmin } = require("../middlewares/isAuth")


//# Ruta para obtener todos los usuarios
router.get('/users', userController.getUsers)

//# Ruta para obtener un usario por ID
router.get('/users/:id', userController.getUserById)

//# Ruta para crear un nuevo usario
router.post('/users', userController.createUser)

//# Ruta para eliminar un usario por ID
router.delete('/users/:id', userController.deleteUserById)

//# Ruta para actualizar un usario por ID
router.put('/users/:id', [isAuth, isAdmin], userController.updateUserById)

//# Ruta para realizar login de un usario
router.post("/login", userController.loginUser)

//# Ruta para modificar la contraseña de un usario
// router.put("/users/:id/change-password", isAuth, userController.changePassword)

module.exports = router
