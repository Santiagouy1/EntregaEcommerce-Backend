const express = require('express');
const cors = require("cors")
const routes = require("./routes/index")
const app = express();

// Middlewares
// Middleware para manejar el body de las peticiones
app.use(express.json())

// Leer archivos carpeta publcia uploads
app.use(express.static("uploads"))

// Habilitamos CORS
app.use(cors())

app.use("/api", routes)

module.exports = app;