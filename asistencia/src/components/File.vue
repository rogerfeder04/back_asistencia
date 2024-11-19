<template>
  <div style="background-color: white;">
    <div style="margin: 10px;">
      <div style="display:flex; justify-content: space-between; align-items: center;">
        <h2 style="color: #3a9a42; margin: 0;">Fichas</h2>
        <q-btn @click="abrirModal()" icon="add" label="CREAR" style="background-color: #3a9a42; color: white;"></q-btn>
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
            <q-btn 
              @click="activar(props.row._id)" 
              class="q-ml-sm" 
              :color="props.row.estado === 1 ? 'red' : 'green'" 
              :icon="props.row.estado === 1 ? 'cancel' : 'check_circle'" 
              size="sm" 
            ></q-btn>
            
          </q-td>
        </template>
        <template v-slot:body-cell-estado1="props">
          <q-td :props="props" align="center">
            <q-chip
              :color="props.row.estado === 1 ? 'green' : 'red'"
              text-color="white"
              square
              :label="props.row.estado === 1 ? 'Activo' : 'Inactivo'"
            />
          </q-td>
        </template>
      </q-table>
      
      <q-dialog v-model="fixed" :backdrop-filter="'blur(4px) saturate(150%)'" transition-show="rotate" transition-hide="rotate" persistent>
        <q-card style="border: 2px solid #4CAF50; border-radius: 8px;">
          <q-card-section class="bg-green text-white q-chip--colored q-chip--square">
            <div class="text-center text-h6">{{ b == true ? "Editar Ficha" : "Guardar Ficha" }}</div>
          </q-card-section>

          <q-separator />

          <q-card-section style="max-height: 50vh" class="scroll">
            <q-input filled v-model="num" label="Nombre De La Ficha" :dense="dense" 
                     prepend-icon="assignment"
                     :rules="[val => !!val || 'Este campo es requerido']" />
            
            <q-input filled v-model="cod" label="Código De La Ficha" :dense="dense"
                     prepend-icon="code"
                     :rules="[val => !!val || 'Este campo es requerido']" />
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn flat label="Cerrar" color="grey-8" icon="cancel" v-close-popup @click="cerrar()" />
            <!-- Botón Guardar con spinner -->
            <q-btn flat :disable="loadingSave" color="green-7" @click="crearFicha">
              <template v-if="loadingSave">
                <q-spinner-dots color="white" size="20px" /> <!-- Spinner durante la carga -->
              </template>
              <template v-else>
                <span>Guardar</span> <!-- Texto normal cuando no hay carga -->
              </template>
            </q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="confirm" persistent :backdrop-filter="'blur(4px) saturate(150%)'" transition-show="rotate" transition-hide="rotate">
        <q-card>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-toggle v-model="isDark" label="Modo Oscuro" />
    </div>
  </div>
</template>

<script setup>
import { onBeforeMount, ref, watch } from "vue";
import { Notify, useQuasar, Dark } from 'quasar';
import { useFichaStore } from "../stores/fichas.js";
const loadingGuardar = ref(false);
const useFicha = useFichaStore();
const $q = useQuasar();
let confirm = ref(false);
let fixed = ref(false);
let num = ref("");
let cod = ref("");
let b = ref(false);
let id = ref("");
let loadingSave = ref(false); // Estado de carga para el botón Guardar

const isDark = ref(Dark.isActive);
watch(isDark, (val) => {
  Dark.set(val);
});

const rows = ref([]);

onBeforeMount(() => {
  traer();
});

function abrirModal() {
  fixed.value = true;
  b.value = false;
  num.value = "";
  cod.value = "";
}

function traerDatos(datos) {
  id.value = datos._id;
  fixed.value = true;
  b.value = true;
  num.value = datos.nombre;
  cod.value = datos.codigo;
}

function cerrar() {
  b.value = false;
  num.value = "";
  cod.value = "";
}

async function traer() {
  let res = await useFicha.listarFichas();
  rows.value = res.data;
}

async function activar(id) {
  await useFicha.activarDesactivarFichas(id);
  await traer();
}

async function crearFicha() {
  loadingSave.value = true; // Inicia el spinner del botón "Guardar"
  try {
    if (b.value == true) {
      const res = await editarFicha(id);
      if (res?.response?.data?.errors) {
        fixed.value = true;
      } else {
        await traer();
        fixed.value = false;
      }
    } else {
      let res = await useFicha.guardarFicha(cod.value, num.value);
      if (res?.response?.data?.errors) {
        fixed.value = true;
      } else {
        await traer();
        fixed.value = false;
      }
    }
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Error al guardar la ficha.' });
  } finally {
    loadingSave.value = false;  // Desactivar el spinner al finalizar
  }
}

async function editarFicha() {
  let res = await useFicha.editarFicha(id.value, cod.value, num.value);
  await traer();
  return res;
}

const columns = ref([
  { name: 'nombre1', required: true, label: 'Nombre del programa', align: 'center', field: "nombre", sortable: true,
  headerStyle: 'font-size: 18px; font-weight: bold; color: #3a9a42; background-color: #f5f5f5; text-align: center;',
  style:"font-size:16px"
   },
  { name: 'codigo1', align: 'center', label: 'Numero de ficha', field: 'codigo', sortable: true,
    headerStyle: 'font-size: 18px; font-weight: bold; color: #3a9a42; background-color: #f5f5f5; text-align: center;',
    style:"font-size:16px"
  },
  { name: 'estado1', align: 'center', label: 'Estado', field: 'estado', sortable: true,
    headerStyle: 'font-size: 18px; font-weight: bold; color: #3a9a42; background-color: #f5f5f5; text-align: center;',
    
   },
  { name: 'opciones', label: 'Opciones', align: 'center',
    headerStyle: 'font-size: 18px; font-weight: bold; color: #3a9a42; background-color: #f5f5f5; text-align: center;'
   },
]);
</script>


<style scoped>
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
