import express from 'express';
import { check } from 'express-validator';
import httpAprendiz from '../controllers/Aprendices.js';
const router = express.Router();

import { validarJWT } from '../middleware/validarJWT.js';
import { validarCampos } from '../middleware/validar-campos.js';
import { aprendicesHelper } from '../helpers/Aprendices.js';
import { fichasHelper } from '../helpers/Fichas.js';

// Ruta para insertar un aprendiz
router.post('/insertaraprendiz',
    [
        validarJWT,
        check('cc', 'la cc es obligatoria').not().isEmpty(),
        check('cc').custom(aprendicesHelper.existeCc),
        check('nombre', 'El nombre no es válido').not().isEmpty(),
        check('IdFicha').custom(fichasHelper.existeFichaID),
        check('telefono', 'El teléfono debe tener al menos 10 caracteres').isLength({ min: 10 }),
        check('email', 'El email no es válido').isEmail(),
        check('email').custom(aprendicesHelper.existeEmail),
        validarCampos
    ],
    httpAprendiz.crearAprendiz // Cloudinary se encargará de la carga de la firma desde el frontend
);

// Listar todos los aprendices
router.get('/Listar', [
    validarJWT
],  httpAprendiz.listarAprendiz);

// Obtener el ID de una ficha por su nombre
router.get('/ListarIdNombre/:nombreFicha', [
    check('nombreFicha').custom(fichasHelper.existeNombreFicha)
],  httpAprendiz.obtenerFichaIdPorNombre);

// Listar aprendiz por ID
router.get('/Listar2/:id', [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(aprendicesHelper.existeAprendizID),
],  httpAprendiz.listarAprendiz);

// Editar aprendiz
router.put("/editarAprendiz/:id", [
    validarJWT,
    check('id', 'ID inválido').isMongoId(),
    check('cc', 'la cc es obligatoria').not().isEmpty(),
    check('nombre', 'El nombre no es válido').not().isEmpty(),
    check('IdFicha').custom(fichasHelper.existeFichaID),
    check('telefono', 'El teléfono debe tener al menos 10 caracteres').isLength({ min: 10 }),
    check('email', 'El email no es válido').isEmail(),
    validarCampos
], httpAprendiz.EditarAprendiz);

// Activar o desactivar aprendiz
router.put('/activarDesactivar/:id', httpAprendiz.activarDesactivarAprendiz);

// Eliminar aprendiz
router.delete('/Eliminar/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(aprendicesHelper.existeAprendizID),
], httpAprendiz.eliminarAprendiz);

export default router;
