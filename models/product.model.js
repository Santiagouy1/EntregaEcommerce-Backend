const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const productSchema = new Schema({
    product: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minLength: [5, 'La descripcion debe tener al menos 5 caracteres'], 
        maxLength: [500, 'La descripcion debe tener maximo 500 caracteres'] 
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    image: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    dateCreate: {
        type: Date,
        required: true,
        validate: {
            validator: function(date) {
                return date <= new Date();  // Validar que no sea una fecha futura
            },
            message: 'La fecha de creación no puede ser futura'
        }
    }
}, {
    timestamps: true  // Agregar createdAt y updatedAt
});

module.exports = mongoose.model("Product", productSchema);