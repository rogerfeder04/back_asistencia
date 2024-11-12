import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { Notify } from "quasar";

export const useUsuariosStore = defineStore("usuario", () => {
  let usuario = ref("");
  let xtoken = ref("");

  // Función para listar usuarios
  const listarUsuarios = async () => {
    console.log(xtoken.value);
    try {
      let r = await axios.get("https://back-asistenciadespliegue.onrender.com/api/Usuarios/listar", {
        headers: {
          "x-token": xtoken.value,
        },
      });

      return r;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  // Función para editar usuario
  const editarUsuario = async (id, ema, nom) => {
    console.log(id);
    try {
      let r = await axios.put(
        `https://back-asistenciadespliegue.onrender.com/api/Usuarios/editar/${id}`,
        { email: ema, nombre: nom },
        {
          headers: {
            "x-token": xtoken.value,
          },
        }
      );
      console.log(r);
      Notify.create({
        color: "positive",
        message: "Edición exitosa",
        icon: "error",
        timeout: 2500,
      });
      return r;
    } catch (error) {
      console.log(error);
      Notify.create({
        color: "negative",
        message: error.response.data.errors[0].msg,
        icon: "error",
        timeout: 2500,
      });
      return error;
    }
  };

  // Función para login
  const login = async (email, password) => {
    try {
      let r = await axios.post("https://back-asistenciadespliegue.onrender.com/api/Usuarios/login", {
        email: email,
        password: password,
      });
      xtoken.value = r.data.token;
      usuario.value = r.data.usuario;
      Notify.create({
        type: "positive",
        message: "Login exitoso",
      });
      return r;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  // Función para guardar un nuevo usuario
  const guardarFicha = async (ema, nom, pass) => {
    try {
      let r = await axios.post("https://back-asistenciadespliegue.onrender.com/api/Usuarios/insertarUsuario", {
        email: ema,
        nombre: nom,
        password: pass
      },
      {
        headers: {
          "x-token": xtoken.value,
        },
      });
      console.log(r);
      Notify.create({
        color: "positive",
        message: "Registro exitoso",
        icon: "error",
        timeout: 2500,
      });
      return r;
    } catch (error) {
      console.log(error);
      Notify.create({
        color: "negative",
        message: error.response.data.errors[0].msg,
        icon: "error",
        timeout: 2500,
      });

      return error;
    }
  };

  // Función para activar/desactivar usuarios
  const activarDesactivarUsuarios = async (id) => {
    try {
      let r = await axios.put(`https://back-asistenciadespliegue.onrender.com/api/Usuarios/activarDesactivar/${id}`);
      console.log("Respuesta del servidor:", r);

      const mensaje = r.data.msg;

      if (mensaje.includes("Usuario activado correctamente")) {
        Notify.create({
          color: "positive",
          message: mensaje,
          icon: "check_circle",
          timeout: 2500,
        });
      } else if (mensaje.includes("Usuario desactivado correctamente")) {
        Notify.create({
          color: "negative",
          message: mensaje,
          icon: "error",
          timeout: 2500,
        });
      } else {
        Notify.create({
          color: "info",
          message: mensaje,
          icon: "info",
          timeout: 2500,
        });
      }

      return r;
    } catch (error) {
      console.log("Error en la solicitud:", error);
      Notify.create({
        color: "negative",
        message: error.response?.data?.errors[0]?.msg || "Error desconocido",
        icon: "error",
        timeout: 2500,
      });
      return error;
    }
  };

  // Nueva función para enviar el enlace de restablecimiento de contraseña
  const sendPasswordResetLink = async (email) => {
    try {
      const response = await axios.post("https://back-asistenciadespliegue.onrender.com/api/Usuarios/recover-password", { email });
      Notify.create({
        color: "positive",
        message: "Enlace de restablecimiento enviado",
        icon: "email",
        timeout: 2500,
      });
      return response.data;
    } catch (error) {
      console.error("Error al enviar el enlace de restablecimiento:", error); // Agregar log de error en la consola
      Notify.create({
        color: "negative",
        message: error.response?.data?.msg || "Error al enviar el enlace",
        icon: "error",
        timeout: 2500,
      });
      throw error;
    }
  };
  
  // Función para logout
  const logout = async () => {
    xtoken.value = "";
  };

  return {
    listarUsuarios,
    login,
    logout,
    xtoken,
    usuario,
    editarUsuario,
    guardarFicha,
    activarDesactivarUsuarios,
    sendPasswordResetLink, // Añadida la función de restablecimiento
  };
},

{ persist: true }
);
