const User = require('../models/user.model')
const bcrypt = require('bcryptjs')
const saltRounds = 10
const jwt = require("jsonwebtoken")
const SECRET = process.env.SECRET

//# Obtener todos los usuarios
async function getUsers(req, res) {
  try {
    const users = await User.find({})
                            .select({ password: 0, __v: 0 })
                            .sort({ name: 1 })
                            .collation({ 
                              locale: "es", 
                              strength: 2, 
                              alternate: "shifted"  
                            })
    return res.status(200).send(users)
  } catch (error) {
    console.log(error)
    res.status(500).send('Error al obtener los usarios')
  }
}

//# Obtener usuarios por ID
async function getUserById(req, res) {
  try {
    const id = req.params.id
    const user = await User.findById(id).select({ password: 0, __v: 0 })

    if (!user) {
      return res.status(404).send({
        message: 'No se encontro el usuario'
      })
    }

    return res.status(200).send({
      message: 'Se obtuvo el usuario correctamente',
      user
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      message: 'Error al obtener usuario'
    })
  }
}

//# Creacion de nuevos usuarios
async function createUser(req, res) {
  try {
    const userData = { ...req.body }
    
    if (!userData.role) {
      userData.role = "user"
    }
    
    const user = new User(userData)

    // Encriptar la password
    user.password = await bcrypt.hash(user.password, saltRounds)

    const newUser = await user.save()

    // Eliminar la password del resultado
    const userResponse = newUser.toObject()
    delete userResponse.password

    return res.status(201).send({
      message: 'Usuario creado con exito',
      user: userResponse
    })
  } catch (error) {
    console.log(error)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message)
      return res.status(400).send({
        message: 'Error de validación',
        errors: messages
      })
    }
    
    if (error.code === 11000) {
      return res.status(400).send({
        message: 'El correo electrónico ya está registrado'
      })
    }
    
    res.status(500).send('Error al crear el usuario')
  }
}

//# Eliminar usuario por ID
async function deleteUserById(req, res) {
  try {
    const id = req.params.id
    const userDeleted = await User.findByIdAndDelete(id)

    if (!userDeleted) {
      return res.status(404).send({
        message: 'No se pudo borrar el usuario'
      })
    }

    return res.status(200).send({
      message: `El usuario ${userDeleted.name} fue eliminado correctamente`
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ message: 'Error al borrar el usuario' })
  }
}

//# Actualizar usuario por ID
async function updateUserById(req, res) {
  try {
    const id = req.params.id
    const data = req.body

    // Que no se pueda cambiar la password por esta vía
    data.password = undefined
    // Saber cuando se actualizo por ultima vez
    data.updatedAt = Date.now()

    const userUpdated = await User.findByIdAndUpdate(id, data, { new: true })

    if (!userUpdated) {
      return res.status(404).send({
        message: 'No se pudo actualizar el usuario'
      })
    }

    return res.status(200).send({
      message: 'Usuario actualizado correctamente',
      user: userUpdated
    })
  } catch (error) {
    console.log(error)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message)
      return res.status(400).send({
        message: 'Error de validación',
        errors: messages
      })
    }
    return res.status(500).send({ message: 'No se pudo actualizar el usuario' })
  }
}

//# Hacer el login
async function loginUser(req, res) {
  try {
    // 1. Recibir desde la app un mail y un password
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).send({
        message: 'El email y la contraseña son necesarios'
      })
    }
    // 2. Buscar en la DB si tenemos un usuario con dicho email
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).send({
        message: 'Credenciales Incorrectas'
      })
    }
    // 3. Comparar la password que mando la persona que quiere loguearse con el pass hasheado
    const isVerified = await bcrypt.compare(password, user.password)
    
    if (!isVerified) {
      return res.status(401).send({
        message: 'Credenciales Incorrectas'
      })
    }
    
    // Convertir a objeto para poder modificarlo
    const userObj = user.toObject()
    delete userObj.password
    delete userObj.__v

    const token = jwt.sign(userObj, SECRET, {
      expiresIn: "3h",
      algorithm: "HS256"
    })

    // 4. Retornamos el token y el usuario sin la password
    return res.status(200).send({
      message: "Login exitoso",
      user: userObj,
      token
    })

  } catch (error) {
    console.log(error)
    return res.status(500).send({
      message: 'Error al realizar el login'
    })
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  deleteUserById,
  updateUserById,
  loginUser,
}
