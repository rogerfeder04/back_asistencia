import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, default: "",},
    nombre: { type: String, required: true },
    estado: { type: Number, required: true, default: 1 },
    resetToken: { type: String }, // Campo para almacenar el token
    resetTokenExpira: { type: Date }, // Campo para almacenar la fecha de expiración del token
}, { timestamps: true });


export default mongoose.model("Usuarios", usuarioSchema);

// crear nuevo usuario
// listar todo 
// editar
// cambiar contraseña
// borrar
// activar/desactivar