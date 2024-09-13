import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { Notify } from "quasar";

// import { useUsuariosStore } from "../stores/usuarios";



export const useUsuariosStore = defineStore("usuario", () => {
    let usuario = ref("")
    let xtoken = ref("")

    const listarUsuarios = async () => {
      console.log(xtoken.value);
      try {
        let r = await axios.get("http://localhost:5037/api/Usuarios/listar",

          {headers: {
            "x-token": xtoken.value,
          },
          }
        );
        
        return r;
      } catch (error) {
        console.log(error);
        return error;
      }
    };

    const editarUsuario = async (id, ema, nom) => {
      console.log(id);
      try {
        let r = await axios.put(
          `http://localhost:5037/api/Usuarios/editar/${id}`,
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

    const login = async (email, password) => {
      try {
        let r = await axios.post("http://localhost:5037/api/Usuarios/login", {
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
    const guardarFicha = async (ema, nom) => {
      try {
        let r = await axios.post(
          "http://localhost:5037/api/Usuarios/insertarUsuario",
          {
            email: ema,
            nombre: nom,
          }
        );
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

    const activarDesactivarUsuarios = async (id) => {
      try {
        let r = await axios.put(
          `http://localhost:5037/api/Usuarios/activarDesactivar/${id}`,
          // {
          //   headers: {
          //     "x-token": useUsuarios.xtoken,
          //   },
          // }
        );
        console.log("Respuesta del servidor:", r);

        // Suponiendo que el mensaje indica si la ficha se activó o desactivó
        const mensaje = r.data.msg;

        if (mensaje.includes("Usuario activado correctamente")) {
          Notify.create({
            color: "positive",
            message: mensaje,
            icon: "check_circle",
            timeout: 2500,
          });
          console.log(mensaje);
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
    };
  },
  { persist: true }
);
