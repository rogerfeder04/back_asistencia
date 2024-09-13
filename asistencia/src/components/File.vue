<template>
  <div style="background-color: white;"> <!-- Fondo blanco como en la imagen -->
    <div style="margin: 10px;">
      <div style="display:flex; justify-content: space-between; align-items: center;">
        <h2 style="color: #3a9a42; margin: 0;">Fichas</h2> <!-- Título similar al de la imagen -->
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
            <q-btn @click="activar(props.row._id)" v-if="props.row.estado==0" class="q-ml-sm" color="red" icon="cancel" size="sm"></q-btn>
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
  <!-- Cabecera con fondo verde y texto centrado -->
  <q-card-section class="bg-green text-white q-chip--colored q-chip--square">
    <div class=" text-center text-h6">{{ b == true ? "Editar Ficha" : "Guardar Ficha" }}</div>
  </q-card-section>

  <q-separator />

  <!-- Sección del formulario con iconos en los inputs -->
  <q-card-section style="max-height: 50vh" class="scroll">
    <q-input filled v-model="num" label="Nombre De La Ficha" :dense="dense" 
             prepend-icon="assignment"
             :rules="[val => !!val || 'Este campo es requerido']" />
    
    <q-input filled v-model="cod" label="Código De La Ficha" :dense="dense"
             prepend-icon="code"
             :rules="[val => !!val || 'Este campo es requerido']" />
  </q-card-section>

  <q-separator />

  <!-- Botones con estilos personalizados -->
  <q-card-actions align="right">
    <q-btn flat label="Cerrar" color="grey-8" icon="cancel" v-close-popup @click="cerrar()" />
    <q-btn flat label="Guardar" color="green-7" icon="save" @click="crearFicha()" />
  </q-card-actions>
</q-card>

      </q-dialog>

      <q-dialog v-model="confirm" persistent :backdrop-filter="'blur(4px) saturate(150%)'" transition-show="rotate" transition-hide="rotate">
        <q-card>
          <!-- <q-card-section class="row items-center">
            <span class="q-ml-sm">Seguro Quieres Eliminar La Ficha</span>
          </q-card-section> -->

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="primary" v-close-popup />
            <!-- <q-btn @click="eliminarFicha()" flat label="Aceptar" color="primary" v-close-popup /> -->
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-toggle v-model="isDark" label="Modo Oscuro" />
    </div>
  </div>
</template>

<script setup>
import axios from "axios"
import { onBeforeMount, ref, watch } from "vue";
import { Notify } from 'quasar'
import { useQuasar } from 'quasar'
import {useFichaStore} from "../stores/fichas.js"
import { Dark } from 'quasar'

const useFicha = useFichaStore()

const $q = useQuasar()
let confirm = ref(false)
let r = ref("")
let fixed = ref(false)
let num = ref("")
let cod = ref("")
let error =ref("")
let b = ref(false)
let id = ref("")

const isDark = ref(Dark.isActive);
watch(isDark, (val) => {
  Dark.set(val);
});

const rows = ref([])

onBeforeMount(()=>{
  traer()
})

function ides (ids){
  id.value = ids
  confirm.value = true
}

async function traer(){
  let res = await useFicha.listarFichas()
  rows.value = res.data
}

function traerDatos (datos){
  id.value = datos._id
  fixed.value = true
  b.value=true
  num.value = datos.nombre
  cod.value = datos.codigo
}

function cerrar (){
  b.value=false
  num.value = ""
  cod.value = ""
}

async function activar(id){
  let res = await useFicha.activarDesactivarFichas(id)
   await traer()
}

async function crearFicha(){
 console.log(b.value);
  if (b.value==true){
    const res = await editarFicha(id)
    if(res?.response?.data?.errors){
      fixed.value=true
    }else{
      await traer()
      fixed.value=false
    }
  }else{
    let res = await useFicha.guardarFicha(cod.value, num.value)
    if(res?.response?.data?.errors){
      fixed.value=true
    }else{
      await traer()
     fixed.value=false
   
    } 
  }
}

async function editarFicha(){
  let res = await useFicha.editarFicha(id.value,  cod.value, num.value)
  await traer()
  return res
}

const columns = ref([
  {
    name: 'nombre1', required: true, label: 'Nombre del programa',
    align: 'center',
    field: "nombre",
    sortable: true
  },
  { name: 'codigo1', align: 'center', label: 'Numero de ficha', field: 'codigo', sortable: true },
  { name: 'estado1', align: 'center', label: 'Estado', field: 'estado', sortable: true },
  { name: 'opciones', label: 'Opciones', align: 'center' },
])
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
