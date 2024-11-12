// stores/useInformeStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import { Notify } from 'quasar';
import { useUsuariosStore } from './usuarios';

export const useInformeStore = defineStore('informe', () => {
  const bitacoras = ref([]);
  const fichas = ref([]); // Estado que almacenará las fichas
const useUsuarios = useUsuariosStore()

  // Función para listar todas las bitácoras
  const listarTodasLasBitacoras = async () => {
    try {
      let r = await axios.get('https://back-asistenciadespliegue.onrender.com/api/Bitacoras/listar',
        {
          headers: {
            "x-token": useUsuarios.xtoken,
          },
        }
      ); // Ajusta la ruta según tu backend
      return r.data;
    } catch (error) {
      console.log(error);
      Notify.create({
        message: 'Error al listar todas las bitácoras.',
        color: 'negative',
      });
      return [];
    }
  };

  // Función para listar bitácoras por IdFicha y Fecha
  const listarBitacorasPorFichaYFecha = async (IdFicha, fecha) => {
    console.log("ficha__"+IdFicha);
    console.log("ficha__"+fecha);
    try {
      let r = await axios.get(`https://back-asistenciadespliegue.onrender.com/api/Bitacoras/ListarBitacoraIdFicha/${IdFicha}/${fecha}/${fecha}`,
        {
          headers: {
            "x-token": useUsuarios.xtoken,
          },
        }
      );
      return r.data;
    } catch (error) {
      console.log(error);
      Notify.create({
        message: 'Error al listar bitácoras por IdFicha y Fecha.',
        color: 'negative',
      });
      return [];
    }
  };

  // Función para obtener todas las fichas
  const obtenerFichas = async () => {
    try {
      const response = await axios.get('https://back-asistenciadespliegue.onrender.com/api/Fichas/listar',
        {
          headers: {
            "x-token": useUsuarios.xtoken,
          },
        }
      );
      if (response.data && Array.isArray(response.data)) {
        fichas.value = response.data;
        return fichas.value;
      } else {
        Notify.create({
          message: 'No se encontraron fichas.',
          color: 'negative',
        });
        return [];
      }
    } catch (error) {
      console.error('Error al obtener las fichas:', error);
      Notify.create({
        message: 'Error al obtener las fichas.',
        color: 'negative',
      });
      return [];
    }
  };

  return {
    fichas,
    listarTodasLasBitacoras,
    listarBitacorasPorFichaYFecha,
    obtenerFichas, // Exportar la función para obtener fichas
  };
});