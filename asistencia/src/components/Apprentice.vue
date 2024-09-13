<template>
  <div style="background-color: white;"> <!-- Fondo blanco como en la imagen -->
    <div style="margin: 10px;">
      <div style="display:flex; justify-content: space-between; align-items: center;">
        <h2 style="color: #3a9a42; margin: 0;">Aprendices</h2> <!-- Título similar al de la imagen -->
        <q-btn @click="fixed = true" icon="add" label="CREAR" style="background-color: #3a9a42; color: white;"></q-btn>
      </div>
      <q-table
        title=""
        :rows="rows"
        :columns="columns"
        row-key="name"
        flat
        bordered
        :dense="true"
      >
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props" align="center">
            <q-btn @click="traerDatos(props.row)" color="green" icon="edit" size="sm"></q-btn>
            <q-btn @click="activar(props.row._id)" v-if="props.row.estado == 0" class="q-ml-sm" color="red" icon="cancel" size="sm"></q-btn>
            <q-btn @click="activar(props.row._id)" v-else class="q-ml-sm" color="red" icon="cancel" size="sm"></q-btn>
          </q-td>
        </template>
        <template v-slot:body-cell-estado1="props">
          <q-td :props="props" align="center">
            <q-chip
              :color="props.row.estado === 1 ? 'green' : 'red'"
              text-color="white"
              square
              label="Activo"
              v-if="props.row.estado === 1"
            />
            <q-chip
              :color="props.row.estado === 0 ? 'red' : 'green'"
              text-color="white"
              square
              label="Inactivo"
              v-if="props.row.estado === 0"
            />
          </q-td>
        </template>
      </q-table>
      <q-dialog v-model="fixed" :backdrop-filter="'blur(4px) saturate(150%)'" transition-show="rotate" transition-hide="rotate" persistent>
        <q-card style="border: 2px solid #4CAF50; border-radius: 8px;">
  <!-- Cabecera verde para el título -->
  <q-card-section class="bg-green text-white q-chip--colored q-chip--square">
    <div class="text-center text-h6">{{ b == true ? "Editar Aprendiz" : "Guardar Aprendiz" }}</div>
  </q-card-section>

  <q-separator />

  <!-- Sección del formulario con iconos en los inputs -->
  <q-card-section > 
    <!-- style="max-height: 50vh" class="scroll" -->
    <q-input filled v-model="num" label="Nombre programa" :dense="dense" 
             prepend-icon="school"
             :rules="[val => !!val || 'Este campo es requerido']" />
    
    <q-input filled v-model="doc" label="Cedula o tarjeta del aprendiz" :dense="dense"
             prepend-icon="badge"
             :rules="[val => !!val || 'Este campo es requerido']" />
    
    <q-input filled v-model="nom" label="Nombre del aprendiz" :dense="dense" 
             prepend-icon="person"
             :rules="[val => !!val || 'Este campo es requerido']" />
    
    <q-input filled v-model="ema" label="Email del aprendiz" :dense="dense"
             prepend-icon="email"
             :rules="[val => !!val || 'Este campo es requerido']" />
    
    <q-input filled v-model="tel" label="Teléfono del aprendiz" :dense="dense" 
             prepend-icon="phone"
             :rules="[val => !!val || 'Este campo es requerido']" />
  </q-card-section>

  <q-separator />

  <!-- Botones con estilos modificados -->
  <q-card-actions align="right">
    <q-btn flat label="Cerrar" color="grey-8" icon="cancel" v-close-popup @click="cerrar()" />
    <q-btn flat label="Guardar" color="green-7" icon="save" @click="crearFicha()" />
  </q-card-actions>
</q-card>


      </q-dialog>

      <q-dialog v-model="confirm" persistent :backdrop-filter="'blur(4px) saturate(150%)'" transition-show="rotate" transition-hide="rotate">
        <q-card>
          <q-card-section class="row items-center">
            <!-- <span class="q-ml-sm">Seguro Quieres Eliminar al aprendiz?</span> -->
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="primary" v-close-popup />
            <!-- <q-btn @click="eliminarAprendiz()" flat label="Aceptar" color="primary" v-close-popup /> -->
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-toggle v-model="isDark" label="Modo Oscuro" />
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { onBeforeMount, ref, watch } from "vue";
import { Notify } from "quasar";
import { useQuasar } from "quasar";
import { useAprendizStore } from "../stores/Aprendiz.js";
import { Dark } from "quasar";

const useAprendiz = useAprendizStore();

const $q = useQuasar();
let confirm = ref(false);
let r = ref("");
let fixed = ref(false);
let num = ref("");
let doc = ref("");
let nom = ref("");
let ema = ref("");
let tel = ref("");
let error = ref("");
let b = ref(false);
let id = ref("");

const isDark = ref(Dark.isActive);
watch(isDark, (val) => {
  Dark.set(val);
});

const rows = ref([]);

onBeforeMount(() => {
  traer();
});

function ides(ids) {
  id.value = ids;
  confirm.value = true;
}

async function traer() {
  let res = await useAprendiz.listarAprendices();
  rows.value = res.data;
}

function traerDatos(datos) {
  console.log(datos);
  id.value = datos._id;
  fixed.value = true;
  b.value = true;
  num.value = datos.IdFicha.nombre;
  doc.value = datos.cc;
  nom.value = datos.nombre;
  ema.value = datos.email;
  tel.value = datos.telefono;
}

function cerrar() {
  b.value = false;
  num.value = "";
  doc.value = "";
  nom.value = "";
  ema.value = "";
  tel.value = "";
}

async function activar(id) {
  let res = await useAprendiz.activarDesactivarAprendiz(id);
  await traer();
}

async function crearFicha() {
  try {
    // Buscar el ID de la ficha usando el nombre
    const fichaRes = await axios.get(`http://localhost:5037/api/Aprendices/ListarIdNombre/${num.value}`);
    const fichaId = fichaRes.data.fichaId;

    // Asegúrate de que la ficha se encontró
    if (!fichaId) {
      Notify.create({
        color: "negative",
        message: "Ficha no encontrada",
        icon: "error",
        timeout: 2500,
      });
      return;
    }

    let res; // Declarar la variable res aquí

    // Ahora guarda el aprendiz con el IdFicha
    if (b.value === true) {
      res = await useAprendiz.editarAprendiz(
        id.value,
        fichaId, // Usar el ID de la ficha encontrado
        doc.value,
        nom.value,
        ema.value,
        tel.value
      );
    } else {
      res = await useAprendiz.guardarAprendiz(
        fichaId, // Usar el ID de la ficha encontrado
        doc.value,
        nom.value,
        ema.value,
        tel.value
      );
    }

    // Revisa si la respuesta contiene errores
    if (res?.response?.data?.errors) {
      fixed.value = true;
    } else {
      await traer();
      fixed.value = false;
    }
  } catch (error) {
    console.error('Error al crear/editar el aprendiz:', error);
    Notify.create({
      color: "negative",
      message: "Error al crear/editar el aprendiz",
      icon: "error",
      timeout: 2500,
    });
  }
}


/* async function editarAprendiz() {
  try {
    let res = await useAprendiz.editarAprendiz(
      id.value,
      IdFicha,  // Enviar el IdFicha correcto al backend
      doc.value,
      nom.value,
      ema.value,
      tel.value
    );
    await traer(); // Actualiza la lista después de editar
    return res;
  } catch (error) {
    console.error('Error al editar el aprendiz:', error);
    // Manejo de errores, puedes mostrar una notificación o mensaje de error aquí
  }
} */
//  async function eliminarAprendiz(){
//    let res = await useAprendiz.eliminar(id.value)
//    await traer()
//    return res
//  }

const columns = ref([
  {
    name: "ficha",
    required: true,
    label: "Nombre del programa",
    align: "center",
    field: (row) => row.IdFicha.nombre,
    sortable: true,
  },
  {
    name: "documento",
    align: "center",
    label: "Documento",
    field: "cc",
    sortable: true,
  },
  {
    name: "nombre",
    align: "center",
    label: "Nombre del aprendiz",
    field: "nombre",
    sortable: true,
  },
  {
    name: "email",
    align: "center",
    label: "Email",
    field: "email",
    sortable: true,
  },
  {
    name: "telefono",
    align: "center",
    label: "Telefono",
    field: "telefono",
    sortable: true,
  },
  {
    name: "estado1",
    align: "center",
    label: "Estado",
    field: "estado",
    sortable: true,
  },
  { name: "opciones", label: "Opciones", align: "center" },
]);
</script>

<style scoped>
/* Estilos para la tabla y botones */
.q-btn {
  border-radius: 5px;
  font-size: 14px;
}

.q-table {
  border: 1px solid #ddd;
  background-color: white;
}

.q-td {
  padding: 8px;
}

.q-th, .q-td {
  text-align: center;
}

.q-chip {
  font-size: 12px;
  text-transform: uppercase;
}

.q-toolbar-title {
  font-size: 24px;
  font-weight: bold;
}

h2 {
  font-size: 24px;
  color: #3a9a42;
}
</style>
