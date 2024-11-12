<template>
  <div style="background-color: white">
    <div style="margin: 10px">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
      >
        <h2 style="color: #3a9a42; margin: 0">Aprendices</h2>
        <q-btn
          @click="fixed = true"
          icon="add"
          label="CREAR"
          style="background-color: #3a9a42; color: white"
        ></q-btn>
      </div>
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="name"
        flat
        bordered
        :dense="true"
      >
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props" align="center">
            <q-btn
              @click="traerDatos(props.row)"
              color="green"
              icon="edit"
              size="sm"
            ></q-btn>
            <q-btn
              @click="activar(props.row._id)"
              class="q-ml-sm"
              :color="props.row.estado === 1 ? 'red' : 'green'"
              :icon="props.row.estado === 1 ? 'cancel' : 'check_circle'"
              size="sm"
            ></q-btn>
          </q-td>
        </template>
        <template v-slot:body-cell-firma="props">
          <q-td :props="props" align="center">
            <q-img
              v-if="props.row.firma"
              :src="props.row.firma"
              alt="Firma del aprendiz"
              style="max-width: 50px; max-height: 50px"
            />
            <span v-else>No disponible</span>
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

      <q-dialog
        v-model="fixed"
        :backdrop-filter="'blur(4px) saturate(150%)'"
        transition-show="rotate"
        transition-hide="rotate"
        persistent
      >
        <q-card style="border: 2px solid #4caf50; border-radius: 8px">
          <q-card-section
            class="bg-green text-white q-chip--colored q-chip--square"
          >
            <div class="text-center text-h6">
              {{ b == true ? "Editar Aprendiz" : "Guardar Aprendiz" }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-select
              filled
              v-model="num"
              label="Nombre programa"
              prepend-icon="school"
              :rules="[(val) => !!val || 'Este campo es requerido']"
              @input="filtrarFichas"
              :options="fichasOptionsFiltradas"
              option-label="nombre"
              option-value="nombre"
            />

            <q-input
              filled
              v-model="doc"
              label="Cedula o tarjeta del aprendiz"
              :dense="dense"
              prepend-icon="badge"
              :rules="[
                (val) => /^\d*$/.test(val) || 'Solo se permiten números'
              ]"
              type="number"
            />
            <q-input
              filled
              v-model="nom"
              label="Nombre del aprendiz"
              :dense="dense"
              prepend-icon="person"
              :rules="[(val) => !!val || 'Este campo es requerido']"
            />

            <q-input
              filled
              v-model="ema"
              label="Email del aprendiz"
              :dense="dense"
              prepend-icon="email"
              :rules="[(val) => !!val || 'Este campo es requerido']"
            />

            <q-input
              filled
              v-model="tel"
              label="Teléfono del aprendiz"
              :dense="dense"
              prepend-icon="phone"
              :rules="[
                (val) => /^\d*$/.test(val) || 'Solo se permiten números'
              ]"
              type="number"
            />

            <!-- Input para subir la firma -->
            <input
  type="file"
  ref="fileInput"
  @change="handleFileSelect"
  style="display: none"
/>


<q-btn
  color="green-7"
  icon="upload"
  label="Subir Firma"
  @click="triggerFileUpload"
  style="margin-top: 5px"
/>

<div v-if="firmaUrl" style="margin-top: 10px">
  <a :href="firmaUrl" target="_blank">Ver Firma Cargada</a>
</div>

            
          </q-card-section>

          <q-separator />
          <q-card-actions align="right">
            <q-btn
              flat
              label="Cerrar"
              color="grey-8"
              icon="cancel"
              v-close-popup
              @click="cerrar()"
            />
            <!-- Botón Guardar con spinner -->
            <q-btn
              flat
              :disable="loadingSave"
              color="green-7"
              @click="crearFicha"
            >
              <template v-if="loadingSave">
                <q-spinner-dots color="white" size="20px" />
                <!-- Spinner durante la carga -->
              </template>
              <template v-else>
                <span>Guardar</span>
                <!-- Texto normal cuando no hay carga -->
              </template>
            </q-btn>
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
import { Dark } from "quasar";
import { useAprendizStore } from "../stores/Aprendiz.js";

const useAprendiz = useAprendizStore();
let firmaUrl = ref("");
let firmaArchivo = ref(null);
let fixed = ref(false);
let confirm = ref(false);
let num = ref("");
let doc = ref("");
let nom = ref("");
let ema = ref("");
let tel = ref("");
let b = ref(false);
let id = ref("");
let loadingSave = ref(false); // Estado de carga para el botón Guardar

const fichasOptions = ref([]);
const fichasOptionsFiltradas = ref([]);
const rows = ref([]);
const dense = ref(false);

const isDark = ref(Dark.isActive);
watch(isDark, (val) => Dark.set(val));


const fileInput = ref(null);


async function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) {
    Notify.create({
      color: "negative",
      message: "No se seleccionó ningún archivo",
      icon: "error",
      timeout: 2500,
    });
    return;
  }

  firmaArchivo.value = file;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "firmaAprendiz");

  try {
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/dfwlienjy/image/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    firmaUrl.value = res.data.secure_url;
    Notify.create({
      color: "positive",
      message: "Firma subida con éxito",
      icon: "check_circle",
      timeout: 2500,
    });
  } catch (error) {
    Notify.create({
      color: "negative",
      message: error.response?.data.error?.message || "Error al subir la firma",
      icon: "error",
      timeout: 2500,
    });
  }
}

function triggerFileUpload() {
  fileInput.value.click();
}
async function cargarFichas() {
  try {
    const fichas = await useAprendiz.obtenerFichas();
    fichasOptions.value = fichas.map((ficha) => ({
      nombre: ficha.nombre,
      _id: ficha._id,
    }));
    fichasOptionsFiltradas.value = [...fichasOptions.value];
  } catch (error) {
    console.error("Error al cargar fichas:", error);
  }
}

async function traer() {
  let res = await useAprendiz.listarAprendices();
  rows.value = res.data;
}

function filtrarFichas(val) {
  const searchTerm = val.toLowerCase();
  fichasOptionsFiltradas.value = fichasOptions.value.filter((ficha) =>
    ficha.nombre.toLowerCase().includes(searchTerm)
  );
}

function traerDatos(datos) {
  id.value = datos._id;
  fixed.value = true;
  b.value = true;
  num.value = { nombre: datos.IdFicha.nombre, _id: datos.IdFicha._id }; // Asegúrate de que sea un objeto con nombre e ID
  doc.value = datos.cc;
  nom.value = datos.nombre;
  ema.value = datos.email;
  tel.value = datos.telefono;
  firmaUrl.value = datos.firma || "";
}

function cerrar() {
  b.value = false;
  num.value = "";
  doc.value = "";
  nom.value = "";
  ema.value = "";
  tel.value = "";
  firmaUrl.value = "";
  fixed.value = false;
}

async function activar(id) {
  await useAprendiz.activarDesactivar(id);
  await traer();
}

async function crearFicha() {
  loadingSave.value = true; // Activa el estado de carga antes de empezar la solicitud
  try {
    const fichaRes = await axios.get(
      `https://back-asistenciadespliegue.onrender.com/api/Aprendices/ListarIdNombre/${num.value.nombre}`
    );
    const fichaId = num.value._id || num.value;

    if (!fichaId) {
      Notify.create({
        color: "negative",
        message: "Ficha no encontrada",
        icon: "error",
        timeout: 2500,
      });
      loadingSave.value = false; // Desactiva el estado de carga si hay un error
      return;
    }

    let res;
    if (b.value === true) {
      res = await useAprendiz.editarAprendiz(
        id.value,
        fichaId,
        doc.value,
        nom.value,
        ema.value,
        tel.value,
        firmaArchivo.value // Pasar el archivo de firma seleccionado
      );
    } else {
      res = await useAprendiz.guardarAprendiz(
        fichaId,
        doc.value,
        nom.value,
        ema.value,
        tel.value,
        firmaArchivo.value // Pasar el archivo de firma seleccionado
      );
    }

    //   if (!res?.response?.data?.errors) {
    //     Notify.create({
    //       // color: "positive",
    //       message: b.value ? "Aprendiz editado con éxito" : "",
    //       // icon: "check_circle",
    //       timeout: 2500,
    //     });
    await traer();
    cerrar();
    //   }
    // } catch (error) {
    //   Notify.create({
    //     color: "negative",
    //     message: "Error al crear/editar el aprendiz",
    //     icon: "error",
    //     timeout: 2500,
    //   });
  } finally {
    loadingSave.value = false; // Desactiva el estado de carga al finalizar la solicitud
  }
}

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
    label: "Teléfono",
    field: "telefono",
    sortable: true,
  },
  {
    name: "firma",
    align: "center",
    label: "Firma",
    field: "firma",
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

onBeforeMount(async () => {
  await traer();
  await cargarFichas();
});
</script>

<style scoped>
.q-btn {
  border-radius: 5px;
  font-size: 14px;
}

@media (min-width: 650px) {
    .q-dialog__inner--minimized > div {
        max-width: 600px;
    }
}
.q-table {
  border: 1px solid #ddd;
  background-color: white;
}

.q-td {
  padding: 8px;
}

.q-th,
.q-td {
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
.q-card > div:not(.q--avoid-card-border) {
    border-left: 0;
    text-align: center;
    border-right: 0;
  box-shadow: none;
}

.q-card > div[data-v-3f72a723]:not(.q--avoid-card-border) {
    border-left: 0;
    text-align: center;
    border-right: 0;
    width: -webkit-fill-available;
    box-shadow: none;
}
h2 {
  font-size: 24px;
  color: #3a9a42;
}
</style>
