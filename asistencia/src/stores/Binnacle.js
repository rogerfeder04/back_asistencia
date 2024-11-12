// Tienda de bitácoras (stores/bitacoras.js)
import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { Notify } from "quasar";
import { useUsuariosStore } from "../stores/usuarios";

export const useBitacoraStore = defineStore("bitacora", () => {
  const useUsuarios = useUsuariosStore()
  let token = ref("");
  
  // Función para actualizar estado
  const actualizarEstado = async (id, estado) => {  
    try {
      let r = await axios.put(`https://back-asistenciadespliegue.onrender.com/api/Bitacoras/estado/${id}`, { estado },
        {
          headers: {
            "x-token": useUsuarios.xtoken,
          },
        }
      );
      console.log(r);
      return r.data;
    } catch (error) {
      console.error("Error al actualizar el estado de la bitácora:", error);
      Notify.create({
        message: "Error al actualizar el estado de la bitácora.",
        color: "negative",
      });
      return error;
    }
  };

  // Función para listar bitácoras en un rango de fechas
  const listarBitacorasXFecha = async (inicio, fin) => {
    try {
      if (!inicio) {
        throw new Error("La fecha de inicio es obligatoria");
      }

      let url = `https://back-asistenciadespliegue.onrender.com/api/Bitacoras/bitacora/${inicio}`;
      if (fin) {
        url += `/${fin}`;
      }

      let r = await axios.get(url,
        {
          headers: {
            "x-token": useUsuarios.xtoken,
          },
        }
      );
      console.log('Respuesta de la API:', r.data);
      return r.data;
    } catch (error) {
      console.error("Error al listar bitácoras por fecha:", error);
      Notify.create({
        message: "Error al listar bitácoras por fecha.",
        color: "negative",
      });
      return [];
    }
  };

  // Función para listar bitácoras por IdAprendis
  const listarXIdAprendis = async (IdAprendis, fechaInicio, fechaFin) => {
    try {
      let r = await axios.get(`https://back-asistenciadespliegue.onrender.com/api/Bitacoras/listarBitacora/${IdAprendis}/${fechaInicio}/${fechaFin}`,
        {
          headers: {
            "x-token": useUsuarios.xtoken,
          },
        }
      );
      console.log(r);
      return r.data;
    } catch (error) {
      console.log(error);
      Notify.create({
        message: "Error al listar bitácoras por IdAprendis.",
        color: "negative",
      });
      return error;
    }
  };

  // Función para listar bitácoras por IdFicha
  const listarXIdFicha = async (IdFicha, fechaInicio, fechaFin) => {
    try {
        console.log(`Fetching bitacoras for IdFicha: ${IdFicha}, FechaInicio: ${fechaInicio}, FechaFin: ${fechaFin}`);
        let r = await axios.get(`https://back-asistenciadespliegue.onrender.com/api/Bitacoras/listarBitacoraIdFicha/${IdFicha}/${fechaInicio}/${fechaFin}`,
          {
            headers: {
              "x-token": useUsuarios.xtoken,
            },
          }
        );
        console.log(r);
        return r.data;
    } catch (error) {
        console.log(error);
        Notify.create({
            message: "Error al listar bitácoras por IdFicha.",
            color: "negative",
        });
        return error;
    }
  };

  // NUEVA Función para crear un registro de bitácora
  const crearRegistroBitacora = async (cedula) => {
    try {
      const response = await axios.post('https://back-asistenciadespliegue.onrender.com/api/Bitacoras/insertar2', { cc: cedula },
        {
          headers: {
            "x-token": useUsuarios.xtoken,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al crear el registro de bitácora:', error);
      throw error; // Solo lanzamos el error para que sea manejado donde se llame esta función
    }
  };
  
  const obtenerAprendices = async () => {
    try {
      const r = await axios.get('https://back-asistenciadespliegue.onrender.com/api/Aprendices/Listar',
        {
          headers: {
            "x-token": useUsuarios.xtoken,
          },
        }
      );
      console.log('Aprendices obtenidos:', r.data);
      return r.data;
    } catch (error) {
      console.error("Error al obtener los aprendices:", error);
      Notify.create({
        message: "Error al obtener los aprendices.",
        color: "negative",
      });
      return [];
    }
  };

  // Función para obtener todas las fichas
  const obtenerFichas = async () => {
    try {
      const r = await axios.get('https://back-asistenciadespliegue.onrender.com/api/Fichas/listar');
      console.log('Fichas obtenidas:', r.data);
      return r.data;
    } catch (error) {
      console.error("Error al obtener las fichas:", error);
      Notify.create({
        message: "Error al obtener las fichas.",
        color: "negative",
      });
      return [];
    }
  };

  return {
    token,
    listarBitacorasXFecha,
    listarXIdAprendis,
    listarXIdFicha,
    actualizarEstado,
    crearRegistroBitacora, // Añadimos la nueva función aquí
    obtenerAprendices,
    obtenerFichas
  };
}, { persist: true });
