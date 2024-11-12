import mongoose from "mongoose";
import Bitacora from "../models/bitacora.js";
import Aprendices from "../models/Aprendices.js";
import ficha from "../models/fichas.js";

const httpBitacora = {
  
  // Listar todas las entradas de bitácora
  crearBitacoraFron: async (req, res) => {
    try {
      const { cc } = req.body;
  
      // Buscar el aprendiz por la cédula (campo cc en la base de datos)
      const aprendiz = await Aprendices.findOne({ cc });
  
      if (!aprendiz) {
        return res.status(404).json({ error: "Aprendiz no encontrado" });
      }
  
      // Obtener la fecha actual en UTC
      const fechaUTC = new Date();
  
      // Ajustar la hora a la zona horaria de Colombia (COT, UTC -5)
      const fechaColombia = new Date(fechaUTC.setHours(fechaUTC.getHours() - 5)); // Restamos 5 horas para UTC-5
  
      // Obtener los límites del día para la zona horaria de Colombia
      const startOfDay = new Date(fechaColombia);
      startOfDay.setHours(0, 0, 0, 0); // Establecer las horas a 00:00:00
  
      const endOfDay = new Date(fechaColombia);
      endOfDay.setHours(23, 59, 59, 999); // Establecer las horas a 23:59:59
  
      // Verificar si ya existe un registro para el aprendiz en el día actual
      const bitacoraExistente = await Bitacora.findOne({
        IdAprendis: aprendiz._id,
        fecha: {
          $gte: startOfDay, // Mayor o igual al inicio del día
          $lte: endOfDay,   // Menor o igual al final del día
        },
      });
  
      if (bitacoraExistente) {
        return res.status(400).json({ error: "Ya existe un registro de bitácora para este aprendiz en el día de hoy." });
      }
  
      // Si no existe bitácora para hoy, crear el nuevo registro
      const nuevaBitacora = new Bitacora({
        IdAprendis: aprendiz._id, // Usamos el _id del aprendiz
        fecha: fechaColombia,     // Fecha ajustada a la zona horaria de Colombia
      });
  
      await nuevaBitacora.save();
  
      res.status(201).json(nuevaBitacora);
    } catch (error) {
      console.error("Error al insertar la bitácora:", error);
      res.status(500).json({ error: "Error al insertar la bitácora" });
    }
  },

  



  obtenerBitacorasPorIdFicha: async (req, res) => {
    const { IdFicha, fechaInicio, fechaFin } = req.params


    try {
        const fechaInicioDate = new Date(fechaInicio);
        const fechaFinDate = fechaFin ? new Date(fechaFin) : new Date(fechaInicio);

        // Ajustar el inicio del día para incluir todas las bitácoras de esa fecha
        fechaInicioDate.setUTCHours(0, 0, 0, 0); // Inicio del día
        fechaFinDate.setUTCHours(23, 59, 59, 999); // Fin del día

        if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaFinDate.getTime())) {
            return res.status(400).json({ error: 'Fechas inválidas' });
        }

        const bitacoras = await Bitacora.find({
            fecha: { $gte: fechaInicioDate, $lte: fechaFinDate }
        })
        .populate({
            path: 'IdAprendis',
            match: { IdFicha },
            populate: { path: 'IdFicha' }
        })
        .sort({ fecha: -1 });

        const bitacorasFiltradas = bitacoras.filter(b => b.IdAprendis !== null);

        res.json(bitacorasFiltradas);
    } catch (error) {
        console.error(`Error al listar las bitácoras por IdFicha: ${IdFicha}`, error);
        res.status(500).json({ error: 'Error al listar las bitácoras' });
 }
},



  crearBitacora: async (req, res) => {
    try {
      const { IdAprendis, fecha } = req.body;

      const nuevaBitacora = new Bitacora({
        IdAprendis,
        fecha: new Date(fecha), // Convertir la fecha a un objeto de tipo Date
      });

      await nuevaBitacora.save();
      res.status(201).json(nuevaBitacora);
    } catch (error) {
      console.error("Error al insertar la bitácora:", error);
      res.status(500).json({ error: "Error al insertar la bitácora" });
    }
  },
  //Cambiar estado
  actualizarEstado: async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosPermitidos = ["pendiente", "asistió", "faltó", "excusa"];
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ error: "Estado no válido" });
    }

    try {
      const bitacoraActualizada = await Bitacora.findByIdAndUpdate(
        id,
        { estado },
        { new: true }
      );

      if (!bitacoraActualizada) {
        return res.status(404).json({ error: "Bitácora no encontrada" });
      }

      // console.log("Bitácora actualizada:", bitacoraActualizada);
      res.json(bitacoraActualizada);
    } catch (error) {
      console.error("Error al actualizar el estado de la bitácora:", error);
      res
        .status(500)
        .json({ error: "Error al actualizar el estado de la bitácora" });
    }
  },

  listarTodasLasBitacoras: async (req, res) => {
    try {
      const bitacoras = await Bitacora.find().populate({
        path: "IdAprendis",
        populate: { path: "IdFicha" },
      });
      // console.log("Lista de todas las bitácoras:", bitacoras);
      res.json(bitacoras);
    } catch (error) {
      console.error("Error al listar todas las bitácoras:", error);
      res.status(500).json({ error: "Error al listar las bitácoras" });
    }
  },
  // Listar todas las entradas de bitácora en un rango de fechas determinado
  listarBitacoraPorFecha: async (req, res) => {
    try {
        const { inicio, fin } = req.params;

        // Convertir la fecha recibida desde el cliente en su formato original a la zona horaria local
        let inicioDate = new Date(`${inicio}T00:00:00`);  // Se ajusta al inicio del día
        let finDate = fin ? new Date(`${fin}T23:59:59`) : new Date(`${inicio}T23:59:59`);  // Se ajusta al final del día

        console.log(`Rango de fechas ajustado: ${inicioDate} - ${finDate}`); // Verificar las fechas ajustadas

        // Verificar si las fechas son válidas
        if (isNaN(inicioDate.getTime()) || isNaN(finDate.getTime())) {
            return res.status(400).json({ error: 'Fechas inválidas' });
        }

        // Realizar la consulta en la base de datos usando las fechas ajustadas
        const bitacoras = await Bitacora.find({
            fecha: { $gte: inicioDate, $lte: finDate }
        }).populate({ path: 'IdAprendis', populate: { path: 'IdFicha' } });

        res.json(bitacoras);
    } catch (error) {
        console.error('Error al listar las entradas de bitácora:', error);
        res.status(500).json({ error: 'Error al listar las entradas de bitácora' });
    }
},



    listarBitacoraPorAprendis: async (req, res) => {
    const { IdAprendis, fechaInicio, fechaFin } = req.params;
      console.log(fechaInicio);

    try {
        const fechaInicioDate = new Date(fechaInicio);
        const fechaFinDate = fechaFin ? new Date(fechaFin) : new Date(fechaInicio);

        // Ajustar el inicio y fin del día si no se proporciona fecha fin
        fechaInicioDate.setHours(0, 0, 0, 0);
        fechaFinDate.setHours(23, 59, 59, 999);

        if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaFinDate.getTime())) {
            return res.status(400).json({ error: 'Fechas inválidas' });
        }

        const bitacoras = await Bitacora.find({
            IdAprendis,
            fecha: { $gte: fechaInicioDate, $lte: fechaFinDate }
        }).populate({ path: 'IdAprendis', populate: { path: 'IdFicha' } }).sort({ fecha: -1 });

        res.json(bitacoras);
    } catch (error) {
        console.error(`Error al listar las entradas de bitácora para el aprendiz ${IdAprendis}:`, error);
        res.status(500).json({error: `Error al listar las entradas de bitácora para el aprendiz ${IdAprendis}`});
    }
},
  // Listar entradas de bitácora por IDFicha (en un rango de fechas determinado)
  /* obtenerBitacorasPorIdFicha : async (req, res) => {
        const { idFicha } = req.params;
        const { fechaInicio, fechaFin } = req.query;
    
        if (!fechaInicio || isNaN(Date.parse(fechaInicio)) || !fechaFin || isNaN(Date.parse(fechaFin))) {
            return res.status(400).json({ error: 'Fechas de inicio o fin no son válidas' });
        }
    
        try {
            const result = await Bitacora.aggregate([
                {
                    $lookup: {
                        from: 'Aprendices',
                        localField: 'IdAprendis',
                        foreignField: '_id',
                        as: 'aprendiz'
                    }
                },
                { $unwind: '$aprendiz' },
                {
                    $match: {
                        'aprendiz.IdFicha': new mongoose.Types.ObjectId(idFicha),
                        fecha: {
                            $gte: new Date(fechaInicio), // Filtra por fecha de inicio
                            $lte: new Date(fechaFin)     // Filtra por fecha de fin
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        IdAprendis: 1,
                        fecha: 1,
                        aprendiz: {
                            IdFicha: 1,
                            cc: 1,
                            nombre: 1
                        }
                    }
                }
            ]);
    
            console.log(Lista de entradas de bitácora para la ficha ${idFicha} en el rango de fechas ${fechaInicio} a ${fechaFin}:, result);
            res.json(result);
        } catch (error) {
            console.error('Error al listar Bitacora:', error);
            res.status(500).json({ error: 'Error al listar Bitacora' });
        }
    } */

        obtenerBitacorasPorIdFicha: async (req, res) => {
          const { IdFicha, fechaInicio, fechaFin } = req.params;
      // console.log(fechaInicio);
      
          try {
              const fechaInicioDate = new Date(fechaInicio);
              const fechaFinDate = fechaFin ? new Date(fechaFin) : new Date(fechaInicio);
      
              // Ajustar el inicio del día para incluir todas las bitácoras de esa fecha
              fechaInicioDate.setUTCHours(0, 0, 0, 0); // Inicio del día
              fechaFinDate.setUTCHours(23, 59, 59, 999); // Fin del día
      
              if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaFinDate.getTime())) {
                  return res.status(400).json({ error: 'Fechas inválidas' });
              }
      
              const bitacoras = await Bitacora.find({
                  fecha: { $gte: fechaInicioDate, $lte: fechaFinDate }
              })
              .populate({
                  path: 'IdAprendis',
                  match: { IdFicha },
                  populate: { path: 'IdFicha' }
              })
              .sort({ fecha: -1 });
      
              const bitacorasFiltradas = bitacoras.filter(b => b.IdAprendis !== null);
      
              res.json(bitacorasFiltradas);
          } catch (error) {
              console.error(`Error al listar las bitácoras por IdFicha: ${IdFicha}`, error);
              res.status(500).json({ error: 'Error al listar las bitácoras'});
       }
      },
};

export default httpBitacora;
