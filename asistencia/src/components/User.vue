<template>
  <div style="background-color: white;">
    <div style="margin: 10px;">
      <div style="display:flex; justify-content: space-between; align-items: center;">
        <h2 style="color: #3a9a42; margin: 0;">Usuarios</h2>
       
        <q-btn 
          @click="abrirDialogoCrear" 
          color="green" 
          icon="add" 
          label="CREAR" 
          text-color="white"
          dense
        />
      </div>
      <q-table
        title=""
        :rows="rows"
        :columns="columns"
        row-key="name"
        flat
        bordered
        dense
      >
        <template v-slot:body-cell-opciones="props">
          <q-td :props="props" align="center">
            <q-btn 
              @click="traerDatos(props.row)" 
              color="green" 
              icon="edit" 
              size="sm" 
              dense
            />
            <q-btn 
              @click="activar(props.row._id)" 
              class="q-ml-sm" 
              :color="props.row.estado === 1 ? 'red' : 'green'" 
              :icon="props.row.estado === 1 ? 'cancel' : 'check_circle'" 
              size="sm" 
              dense
            />
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
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ b ? "Editar Usuario" : "Guardar Usuario" }}</div>
          </q-card-section>

          <q-separator />

          <q-card-section style="max-height: 50vh" class="scroll">
            <q-input filled v-model="ema" label="Email usuario" dense           clearable
            :rules="[val => !!val || 'Este campo es requerido']"/>
            <q-input filled v-model="nom" label="Nombre usuario" dense           clearable
            :rules="[val => !!val || 'Este campo es requerido']" />
            <!-- Solo muestra el campo de contraseña si estás creando un usuario nuevo -->
            <q-input v-if="!b" filled v-model="pass" label="Contraseña" dense type="password"           clearable
            :rules="[val => !!val || 'Este campo es requerido']" />
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
  <q-btn 
    flat 
    label="" 
    color="red" 
    v-close-popup 
    @click="cerrarDialogo" 
    :disable="loadingCerrar" 
    dense
  >
    <template v-if="loadingCerrar">
      <q-spinner-dots color="white" size="20px" />
    </template>
    <template v-else>
      <span>Cerrar</span>
    </template>
  </q-btn>

  <q-btn 
    flat 
    label="" 
    color="primary" 
    @click="crearFicha" 
    :disable="loadingGuardar" 
    dense
  >
    <template v-if="loadingGuardar">
      <q-spinner-dots color="white" size="20px" />
    </template>
    <template v-else>
      <span>Guardar</span>
    </template>
  </q-btn>
</q-card-actions>

        </q-card>
      </q-dialog>

      <q-dialog v-model="confirm" persistent :backdrop-filter="'blur(4px) saturate(150%)'" transition-show="rotate" transition-hide="rotate">
        <q-card>
          <q-card-section class="row items-center">
            <span class="q-ml-sm">Seguro Quieres Eliminar el usuario</span>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="primary" v-close-popup dense />
            <q-btn @click="eliminarFicha" flat label="Aceptar" color="primary" v-close-popup dense />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-toggle v-model="isDark" label="Modo Oscuro" />
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, watch } from "vue";
import { Notify, useQuasar, Dark } from 'quasar';
import { useUsuariosStore } from "../stores/usuarios.js";

const useUsuario = useUsuariosStore();
const $q = useQuasar();
const confirm = ref(false);
const fixed = ref(false);
const ema = ref("");
const nom = ref("");
const pass = ref(""); // Nueva referencia para la contraseña
const b = ref(false);
const id = ref("");
const isDark = ref(Dark.isActive);
const loadingCerrar = ref(false);
const loadingGuardar = ref(false);

watch(isDark, (val) => {
  Dark.set(val);
});

const rows = ref([]);

onBeforeMount(() => {
  traer();
});

function abrirDialogoCrear() {
    // Limpiar los campos antes de abrir el diálogo
  ema.value = ""; 
  nom.value = ""; 
  pass.value = ""; // Limpiar el campo de la contraseña

  fixed.value = true;
  b.value = false;
}

async function traer() {
  let res = await useUsuario.listarUsuarios();
  rows.value = res.data;
}

function traerDatos(datos) {
  id.value = datos._id;
  fixed.value = true;
  b.value = true;
  ema.value = datos.email;
  nom.value = datos.nombre;
}

function cerrarDialogo() {
  loadingCerrar.value = true;
  setTimeout(() => {
    // Simulando una operación de cierre
    b.value = false;
    ema.value = "";
    nom.value = "";
    pass.value = ""; // Limpiar la contraseña al cerrar
    loadingCerrar.value = false;
    fixed.value = false;
  }, 1000); // Puedes ajustar este tiempo según lo necesites
}

async function activar(id) {
  let res = await useUsuario.activarDesactivarUsuarios(id);
  await traer();
}

async function crearFicha() {
  loadingGuardar.value = true; // Inicia el spinner del botón "Guardar"
  try {
    if (b.value === true) {
      const res = await editarFicha();
      if (res?.response?.data?.errors) {
        fixed.value = true;
      } else {
        await traer();
        fixed.value = false;
      }
    } else {
      let res = await useUsuario.guardarFicha(ema.value, nom.value, pass.value);
      if (res?.response?.data?.errors) {
        fixed.value = true;
      } else {
        await traer();
        fixed.value = false;
      }
    }
  } catch (error) {
    console.error('Error al guardar:', error);
  } finally {
    loadingGuardar.value = false; // Detiene el spinner después de guardar
  }
}

async function editarFicha() {
  // No enviar la contraseña al editar el usuario
  let res = await useUsuario.editarUsuario(id.value, ema.value, nom.value);
  await traer();
  return res;
}

const columns = ref([
  {
    name: 'nombre1', required: true, label: 'Nombre usuario',
    align: 'center',
    field: "nombre",
    sortable: true
  },
  { name: 'codigo1', align: 'center', label: 'Email', field: 'email', sortable: true },
  { name: 'estado1', align: 'center', label: 'Estado', field: 'estado', sortable: true },
  { name: 'opciones', label: 'Opciones', align: 'center' },
]);

</script>
