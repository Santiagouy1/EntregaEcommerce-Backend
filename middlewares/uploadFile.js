const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { v4 } = require('uuid')

// Configurar almacenamiento de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir

        if(req.path.includes('/products')) {
            dir = path.join(__dirname, '../uploads/products')
        }
        else if(req.path.includes('/users')) {
            dir = path.join(__dirname, '../uploads/users')
        }
        else {
            dir = path.join(__dirname, '../uploads/others')
        }

        // Asegurar que la carpeta existe
        if(!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        
        cb(null, dir)
    },

    filename: (req, file, cb) => {
        // Obtener la extensión del archivo
        const ext = path.extname(file.originalname).toLowerCase()
        
        // Generar nombre único con UUID
        const uniqueName = v4() + ext;
        
        cb(null, uniqueName)
    }
})

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
    // Verificar tipo de archivo (solo aceptar imágenes)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no soportado. Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)'), false);
    }
};

// Configurar multer con límites
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limitar a 5MB
    }
}).single('image')

// Middleware con manejo de errores
const uploadMiddleware = (req, res, next) => {
    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            // Error de multer (tamaño, etc.)
            console.error("Error de Multer:", err);
            return res.status(400).json({ 
                message: `Error al subir archivo: ${err.message}` 
            });
        } else if (err) {
            // Otro tipo de error
            console.error("Error en uploadFile:", err);
            return res.status(400).json({ 
                message: `Error al procesar archivo: ${err.message}` 
            });
        }
        
        // Si todo está bien, continuar
        next();
    });
};

module.exports = uploadMiddleware