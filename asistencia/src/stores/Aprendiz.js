import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { Notify } from "quasar";
import {useUsuariosStore} from  '../stores/usuarios'



export const useAprendizStore = defineStore("aprendiz", () => {
  let token = ref("");
  const useUsuarios = useUsuariosStore()
  
  const listarAprendices = async () => {
    try {
      let r = await axios.get("http://localhost:5037/api/Aprendices/listar",
        {headers:{
          "x-token":useUsuarios.xtoken
          }}
      );
      console.log(r);
      return r;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const listarXId = async () => {
    try {
      let r = await axios.get(`http://localhost:5037/api/Aprendices/listar2/${id}`);
      console.log(r);
      return r;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const activarDesactivarAprendiz = async (id) => {
    console.log(id);
    try {
      let r = await axios.put(`http://localhost:5037/api/Aprendices/activarDesactivar/${id}`);
      console.log("Respuesta del servidor:", r);
  
      // Suponiendo que el mensaje indica si la ficha se activó o desactivó
      const mensaje = r.data.msg;
      
      if (mensaje.includes("Aprendiz activado correctamente")) {
        Notify.create({
          color: "positive",
          message: mensaje,
          icon: "check_circle",
          timeout: 2500,
        });
      } else if (mensaje.includes("Aprendiz desactivado correctamente")) {
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

  const guardarAprendiz = async (num,doc,nom,ema,tel) => {
    console.log(num,doc,nom,ema,tel);
    
    try {
      let r = await axios.post("http://localhost:5037/api/Aprendices/insertaraprendiz", {
        IdFicha: num,
        cc: doc,
        nombre: nom,
        email: ema,
        telefono: tel
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

  
  const editarAprendiz = async (id,num,doc,nom,ema,tel) => {
    console.log(id);
    try {
      let r = await axios.put(`http://localhost:5037/api/Aprendices/editarAprendiz/${id}`,
      {IdFicha:num,cc: doc, nombre: nom, email: ema, telefono: tel}
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
  }

  const eliminar = async (id) =>{
    try {
      let r = await axios.delete(`http://localhost:5037/api/Aprendices/Eliminar/${id}`);
      console.log(r);
      Notify.create({
        color: "positive",
        message: "Eliminación exitosa",
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
  }

  return {
    listarAprendices,
    listarXId,
    guardarAprendiz,
    activarDesactivarAprendiz,
    editarAprendiz,
    eliminar
  };
},{ persist : true}   );