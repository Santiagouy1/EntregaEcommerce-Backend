const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    minLength: [3, 'El nombre debe tener al menos 3 caracteres'],
    maxLength: [35, 'El nombre no puede exceder los 35 caracteres'],
    trim: true,
    validate: {
      validator: function (value) {
        return /^[a-zA-Z ]+$/.test(value)
      },
      message: (props) => `${props.value} no es válido. El nombre solo puede contener letras`
    }
  },
  email: {
    type: String,
    required: [true, 'El correo electrónico es obligatorio'],
    unique: true,
    index: true,
    minLength: [5, 'El correo debe tener al menos 5 caracteres'],
    maxLength: [100, 'El correo no puede exceder los 100 caracteres'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function (value) {
        return /[A-Za-z0-9._+\-']+@[A-Za-z0-9.]+\.[A-Za-z]{2,}$/.test(value)
      },
      message: (props) => `${props.value} no es un correo electrónico válido`
    }
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minLength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    maxLength: [100, 'La contraseña no puede exceder los 100 caracteres'],
    trim: true,
    validate: {
      validator: function (value) {
        return /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,}$/.test(value)
      },
      message: (props) =>
        'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'
    }
  },
  department: {
    type: String,
    required: [true, 'Debe seleccionar un departamento'],
    trim: true,
    enum: [
        'artigas', 'canelones', 'cerro-largo', 'colonia', 'durazno', 
        'flores', 'florida', 'lavalleja', 'maldonado', 'montevideo',
        'paysandu', 'rio-negro', 'rivera', 'rocha', 'salto',
        'san-jose', 'soriano', 'tacuarembo', 'treinta-y-tres'
    ],
    default: 'General'
  },
  birthDate: {
    type: Date,
    required: [true, 'La fecha de nacimiento es obligatoria'],
    validate: {
      validator: function(value) {
        return value <= new Date();
      },
      message: 'La fecha de nacimiento no puede ser una fecha futura'
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('User', userSchema)
