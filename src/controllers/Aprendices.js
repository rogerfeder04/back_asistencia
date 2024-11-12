import Aprendices from '../models/Aprendices.js';
import Ficha from '../models/fichas.js';

const httpAprendiz = {

    // Crear un nuevo aprendiz
    crearAprendiz: async (req, res) => {
        const { cc, nombre, IdFicha, telefono, email, firma } = req.body; // La firma es un enlace de Cloudinary enviado desde el frontend
    
        if (!firma) {
            return res.status(400).json({ error: 'La firma es obligatoria' });
        }
    
        try {
            const nuevoAprendis = new Aprendices({
                cc,
                nombre,
                IdFicha,
                telefono,
                email,
                firma // Guardar la URL de la firma en la base de datos
            });
    
            const resultado = await nuevoAprendis.save();
            console.log('Aprendiz creado:', resultado);
            res.json(resultado);
        } catch (error) {
            console.error('Error al crear aprendiz:', error);
            res.status(500).json({ error: 'Error al crear el aprendiz' });
        }
    },

    // Editar un aprendiz por su ID
    EditarAprendiz: async (req, res) => {
        const { id } = req.params;
        const { cc, nombre, IdFicha, telefono, email, firma } = req.body;
    
        try {
            const aprendiz = await Aprendices.findById(id);

            if (!aprendiz) {
                return res.status(404).json({ error: 'Aprendiz no encontrado' });
            }

            // Actualizar campos
            aprendiz.cc = cc || aprendiz.cc;
            aprendiz.nombre = nombre || aprendiz.nombre;
            aprendiz.IdFicha = IdFicha || aprendiz.IdFicha;
            aprendiz.telefono = telefono || aprendiz.telefono;
            aprendiz.email = email || aprendiz.email;
            

            // Si se proporciona una nueva firma, actualizarla
            if (firma) {
                aprendiz.firma = firma;
            }

            const resultado = await aprendiz.save();
            console.log('Aprendiz editado:', resultado);
            res.json(resultado);
        } catch (error) {
            console.error('Error al editar aprendiz:', error);
            res.status(500).json({ error: 'Error al editar el aprendiz' });
        }
    },

    // Listar todos los aprendices
    listarAprendiz: async (req, res) => {
        try {
            const aprendices = await Aprendices.find().populate('IdFicha', 'nombre');
            console.log('Lista de aprendices:', aprendices);
            res.json(aprendices);
        } catch (error) {
            console.error('Error al listar aprendices:', error);
            res.status(500).json({ error: 'Error al listar los aprendices' });
        }
    },

    // Activar o desactivar aprendiz
    activarDesactivarAprendiz: async (req, res) => {
        const { id } = req.params;

        try {
            const aprendiz = await Aprendices.findById(id);

            if (!aprendiz) {
                throw new Error('Usuario no encontrado');
            }

            aprendiz.estado = aprendiz.estado === 1 ? 0 : 1; // Alternar estado entre 1 y 0
            await aprendiz.save();

            const mensaje = aprendiz.estado === 1 ? 'Aprendiz activado' : 'Aprendiz desactivado';
            console.log(mensaje + ':', aprendiz);
            res.json({ msg: mensaje + ' correctamente' });
        } catch (error) {
            console.error('Error al activar/desactivar aprendiz:', error);
            res.status(500).json({ error: 'Error al activar/desactivar aprendiz' });
        }
    },

    // Eliminar un aprendiz por su ID
    eliminarAprendiz: async (req, res) => {
        const { id } = req.params;
        try {
            const aprendisEliminado = await Aprendices.findByIdAndDelete(id);

            if (!aprendisEliminado) {
                return res.status(404).json({ error: 'Aprendiz no encontrado' });
            }

            console.log('Aprendiz eliminado:', aprendisEliminado);
            res.json({ message: 'Aprendiz eliminado correctamente', aprendisEliminado });
        } catch (error) {
            console.error('Error al eliminar aprendiz:', error);
            res.status(500).json({ error: 'Error al eliminar el aprendiz' });
        }
    },

    // Obtener ficha por nombre
    obtenerFichaIdPorNombre: async (req, res) => {
        try {
            const { nombreFicha } = req.params;
    
            const ficha = await Ficha.findOne({ nombre: nombreFicha }).select('_id');
    
            if (!ficha) {
                return res.status(404).json({ message: 'Ficha no encontrada' });
            }
    
            res.json({ fichaId: ficha._id });
        } catch (error) {
            console.error('Error al buscar la ficha:', error);
            res.status(500).json({ message: 'Error al buscar la ficha' });
        }
    }
};

export default httpAprendiz;
