import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { Notify } from "quasar";
import { useUsuariosStore } from "../stores/usuarios";

export const useAprendizStore = defineStore("aprendiz", () => {
  const useUsuarios = useUsuariosStore();

  // Función para subir la firma a Cloudinary
  const uploadFirmaToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "firmaAprendiz"); // Asegúrate de que el preset esté configurado en Cloudinary

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/dfwlienjy/image/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return res.data.secure_url; // Devuelve la URL de la imagen subida
    } catch (error) {
      console.error("Error al subir imagen a Cloudinary:", error);
      Notify.create({
        color: "negative",
        message: "Error al subir la firma",
        icon: "error",
        timeout: 2500,
      });
      throw error;
    }
  };

  const listarAprendices = async () => {
    try {
      const r = await axios.get("https://back-asistenciadespliegue.onrender.com/api/Aprendices/Listar", {
        headers: { "x-token": useUsuarios.xtoken },
      });
      console.log(r);
      return r;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const listarXId = async (id) => {
    try {
      const r = await axios.get(`https://back-asistenciadespliegue.onrender.com/api/Aprendices/listar2/${id}`, {
        headers: { "x-token": useUsuarios.xtoken },
      });
      console.log(r);
      return r;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const activarDesactivar = async (id) => {
    try {
      const r = await axios.put(
        `https://back-asistenciadespliegue.onrender.com/api/Aprendices/activarDesactivar/${id}`,
        {},
        { headers: { "x-token": useUsuarios.xtoken } }
      );
      console.log("Respuesta del servidor:", r);

      const mensaje = r.data.msg;

      if (mensaje.includes("Aprendiz activado correctamente")) {
        Notify.create({ color: "positive", message: mensaje, icon: "check_circle", timeout: 2500 });
      } else if (mensaje.includes("Aprendiz desactivado correctamente")) {
        Notify.create({ color: "negative", message: mensaje, icon: "cancel", timeout: 2500 });
      } else {
        Notify.create({ color: "info", message: mensaje, icon: "info", timeout: 2500 });
      }

      return r;
    } catch (error) {
      console.log("Error en la solicitud:", error);
      Notify.create({
        color: "negative",
        message: error.response?.data?.errors?.[0]?.msg || "Error desconocido",
        icon: "error",
        timeout: 2500,
      });
      return error;
    }
  };

  // Guardar aprendiz con firma
  const guardarAprendiz = async (num, doc, nom, ema, tel, firmaFile) => {
    try {
      const firmaUrl = await uploadFirmaToCloudinary(firmaFile); // Subir la firma a Cloudinary
      const r = await axios.post(
        "https://back-asistenciadespliegue.onrender.com/api/Aprendices/insertaraprendiz",
        {
          IdFicha: num,
          cc: doc,  
          nombre: nom,
          email: ema,
          telefono: tel,
          firma: firmaUrl, // Guardar la URL de la firma
        },
        { headers: { "x-token": useUsuarios.xtoken } }
      );

      console.log(r);
      Notify.create({
        color: "positive",
        message: "Registro exitoso",
        icon: "check_circle",
        timeout: 2500,
      });
      return r;
    } catch (error) {
      console.log(error);
      Notify.create({
        color: "negative",
        message: error.response?.data?.errors?.[0]?.msg || "Error al guardar aprendiz",
        icon: "error",
        timeout: 2500,
      });
      return error;
    }
  };

  // Editar aprendiz con firma
  const editarAprendiz = async (id, num, doc, nom, ema, tel, firmaFile) => {
    try {
      let firmaUrl = null;
      if (firmaFile) {
        firmaUrl = await uploadFirmaToCloudinary(firmaFile); // Subir la nueva firma si se proporciona un archivo
      }

      const r = await axios.put(
        `https://back-asistenciadespliegue.onrender.com/api/Aprendices/editarAprendiz/${id}`,
        {
          IdFicha: num,
          cc: doc,
          nombre: nom,
          email: ema,
          telefono: tel,
          firma: firmaUrl, // Actualizar la URL de la firma solo si se ha subido una nueva
        },
        { headers: { "x-token": useUsuarios.xtoken } }
      );

      console.log(r);
      Notify.create({
        color: "positive",
        message: "Edición exitosa",
        icon: "check_circle",
        timeout: 2500,
      });
      return r;
    } catch (error) {
      console.log(error);
      Notify.create({
        color: "negative",
        message: error.response?.data?.errors?.[0]?.msg || "Error al editar aprendiz",
        icon: "error",
        timeout: 2500,
      });
      return error;
    }
  };

  const eliminar = async (id) => {
    try {
      const r = await axios.delete(`https://back-asistenciadespliegue.onrender.com/api/Aprendices/Eliminar/${id}`, {
        headers: { "x-token": useUsuarios.xtoken },
      });
      console.log(r);
      Notify.create({
        color: "positive",
        message: "Eliminación exitosa",
        icon: "check_circle",
        timeout: 2500,
      });
      return r;
    } catch (error) {
      console.log(error);
      Notify.create({
        color: "negative",
        message: error.response?.data?.errors?.[0]?.msg || "Error al eliminar aprendiz",
        icon: "error",
        timeout: 2500,
      });
      return error;
    }
  };

  const obtenerFichas = async () => {
    try {
      const r = await axios.get("https://back-asistenciadespliegue.onrender.com/api/Fichas/listar");
      console.log("Fichas obtenidas:", r.data);
      return r.data;
    } catch (error) {
      console.error("Error al obtener las fichas:", error);
      Notify.create({
        color: "negative",
        message: "Error al obtener las fichas.",
        timeout: 2500,
      });
      return [];
    }
  };

  return {
    listarAprendices,
    obtenerFichas,
    listarXId,
    guardarAprendiz,
    activarDesactivar,
    editarAprendiz,
    eliminar,
  };
}, { persist: true });
