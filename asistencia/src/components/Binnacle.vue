<template>
  <div style="background-color: white;">
    <div style="margin: 10px;">
      <!-- Contenedor general con flex -->
      <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
        
        <!-- Filtro tipo de filtro -->
        <q-select
          v-model="tipoFiltro"
          :options="filtroOptions"
          label="Selecciona tipo de filtro"
          style="width: 300px;"
          emit-value
        />

        <!-- Filtro por Aprendiz -->
        <q-select
          v-show="tipoFiltro === 'porAprendis'"
          v-model="aprendizSeleccionado"
          :options="aprendicesOptions"
          label="Selecciona un aprendiz"
          style="width: 300px;"
          emit-value
          option-label="nombre"
          option-value="_id"
          use-input
          @filter="filtrarAprendices"
          map-options
        />

        <!-- Filtro por Ficha -->
        <q-select
          v-show="tipoFiltro === 'porFicha'"
          v-model="fichaSeleccionada"
          :options="fichasOptions"
          label="Selecciona una ficha"
          style="width: 300px;"
          emit-value
          option-label="nombre"
          option-value="_id"
          use-input
          @filter="filtrarFichas"
          map-options
        />

        <!-- Campos de fecha -->
        <q-input
          v-model="fechaInicio"
          label="Fecha Inicio"
          type="date"
          style="width: 150px;"
        />
        
        <q-input
          v-model="fechaFin"
          label="Fecha Fin"
          type="date"
          style="width: 150px;"
        />

        <!-- Botones en línea -->
        <div style="display: flex; gap: 10px;">
          <!-- Botón Filtrar -->
          <q-btn
            @click="obtenerBitacoras"
            color="green-8"
            style="border-radius: 8px; min-width: 120px; height: 40px;"
            icon="add"
          >
            <span>Filtrar</span>
          </q-btn>

          <!-- Botón Descargar PDF -->
          <q-btn
            @click="generarPDF"
            color="green-8"
            style="border-radius: 8px; min-width: 120px; height: 40px;"
            icon="file_download"
          >
            <span>DESCARGAR PDF</span>
          </q-btn>
        </div>
      </div>

      <!-- Spinner -->
      <div v-if="isLoading" class="q-pa-md">
        <q-spinner color="primary" size="50px" />
      </div>

      <!-- Tabla -->
      <q-table
        v-if="!isLoading && rows.length > 0"
        title="Bitácoras"
        :rows="rows"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :dense="true"
      >
        <!-- Estado Dropdown -->
        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-select
              v-model="props.row.estado"
              :options="estadoOptions"
              @update:model-value="(val) => actualizarEstado(props.row._id, val)"
              outlined
              dense
              emit-value
              map-options
            />
          </q-td>
        </template>
      </q-table>

      <!-- Mostrar mensaje cuando no hay resultados -->
      <div v-if="!isLoading && rows.length === 0" class="q-pa-md">
        <p>No se encontraron bitácoras.</p>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onBeforeMount, watch } from 'vue';
import { useBitacoraStore } from '../stores/Binnacle';
import { Notify, useQuasar, Dark } from 'quasar';

const bitacoraStore = useBitacoraStore();
const $q = useQuasar();
const isDark = ref(Dark.isActive);
const isLoading = ref(false);

watch(isDark, (val) => {
  Dark.set(val);
});

const tipoFiltro = ref('');
const fechaInicio = ref('');
const fechaFin = ref('');
const aprendizSeleccionado = ref('');
const fichaSeleccionada = ref('');
const rows = ref([]);

const filtroOptions = [
  { label: 'Todas las Bitácoras', value: 'todas' },
  { label: 'Por Aprendiz', value: 'porAprendis' },
  { label: 'Por Ficha', value: 'porFicha' }
];

const estadoOptions = ref([
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Asistió', value: 'asistió' },
  { label: 'Faltó', value: 'faltó' },
  { label: 'Excusa', value: 'excusa' }
]);

const columns = ref([
  { name: 'fecha', required: true, label: 'Fecha', align: 'center', field: row => row.fecha, format: val => new Date(val).toLocaleDateString(), sortable: true },
  { name: 'nombre', align: 'center', label: 'Nombre del Aprendiz', field: row => row.IdAprendis?.nombre || '', sortable: true },
  { name: 'cc', align: 'center', label: 'CC', field: row => row.IdAprendis?.cc || '', sortable: true },
  { name: 'idficha', align: 'center', label: 'Ficha', field: row => row.IdAprendis?.IdFicha?.nombre || '', sortable: true },
  { name: 'estado', align: 'center', label: 'Estado', field: 'estado', sortable: true }
]);

const aprendicesOptions = ref([]);
const fichasOptions = ref([]);

// Cargar aprendices y fichas al montar el componente
onBeforeMount(async () => {
  await cargarAprendices();
  await cargarFichas();
  obtenerBitacoras(); // Cargar todas las bitácoras al inicio
});

// Cargar aprendices
async function cargarAprendices() {
  try {
    const aprendices = await bitacoraStore.obtenerAprendices();
    aprendicesOptions.value = aprendices.map(aprendiz => ({
      nombre: aprendiz.nombre,
      _id: aprendiz._id
    }));
  } catch (error) {
    console.error('Error al cargar aprendices:', error);
  }
}

// Cargar fichas
async function cargarFichas() {
  try {
    const fichas = await bitacoraStore.obtenerFichas();
    fichasOptions.value = fichas.map(ficha => ({
      nombre: ficha.nombre,
      _id: ficha._id
    }));
  } catch (error) {
    console.error('Error al cargar fichas:', error);
  }
}

// Función para filtrar aprendices mientras se escribe
function filtrarAprendices(val, update) {
  update(() => {
    const filtro = val.toLowerCase();
    aprendicesOptions.value = aprendicesOptions.value.filter(aprendiz => aprendiz.nombre.toLowerCase().includes(filtro));
  });
}

// Función para filtrar fichas mientras se escribe
function filtrarFichas(val, update) {
  update(() => {
    const filtro = val.toLowerCase();
    fichasOptions.value = fichasOptions.value.filter(ficha => ficha.nombre.toLowerCase().includes(filtro));
  });
}

// Función para obtener bitácoras filtradas
async function obtenerBitacoras() {
  try {
    isLoading.value = true;
    let response;

    const fechaInicioISO = fechaInicio.value ? new Date(fechaInicio.value).toISOString().split('T')[0] : null;
    const fechaFinISO = fechaFin.value ? new Date(fechaFin.value).toISOString().split('T')[0] : fechaInicioISO;

    if (!fechaInicioISO) {
      Notify.create({ message: 'Por favor, ingresa una fecha de inicio.', color: 'negative' });
      isLoading.value = false;
      return;
    }

    if (tipoFiltro.value === 'todas') {
      response = await bitacoraStore.listarBitacorasXFecha(fechaInicioISO, fechaFinISO);
    } else if (tipoFiltro.value === 'porAprendis') {
      if (!aprendizSeleccionado.value) {
        Notify.create({ message: 'Selecciona un aprendiz.', color: 'negative' });
        isLoading.value = false;
        return;
      }
      response = await bitacoraStore.listarXIdAprendis(aprendizSeleccionado.value, fechaInicioISO, fechaFinISO);
    } else if (tipoFiltro.value === 'porFicha') {
      if (!fichaSeleccionada.value) {
        Notify.create({ message: 'Selecciona una ficha.', color: 'negative' });
        isLoading.value = false;
        return;
      }
      response = await bitacoraStore.listarXIdFicha(fichaSeleccionada.value, fechaInicioISO, fechaFinISO);
    }

    if (Array.isArray(response) && response.length > 0) {
      rows.value = response;
    } else {
      rows.value = [];
      Notify.create({ message: 'No se encontraron bitácoras.', color: 'negative' });
    }
  } catch (error) {
    console.error('Error al obtener las bitácoras:', error);
    Notify.create({ message: 'Error al obtener las bitácoras.', color: 'negative' });
  } finally {
    isLoading.value = false;
  }
}

async function actualizarEstado(id, nuevoEstado) {
  try {
    const res = await bitacoraStore.actualizarEstado(id, nuevoEstado);
    Notify.create({ message: 'Estado actualizado correctamente.', color: 'positive' });
    console.log("Estado actualizado:", res.data);
  } catch (error) {
    console.error("Error al actualizar el estado:", error);
    Notify.create({ message: 'Error al actualizar el estado.', color: 'negative' });
  }
}
</script>

<style scoped>
/* Estilos personalizados para los inputs */
.q-input, .q-select {
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.q-input input, .q-select input {
  padding: 12px;
}

.q-btn.btn-styled {
  background-color: #2F7D32;
  color: white;
  border-radius: 25px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  padding: 10px 20px;
  font-weight: bold;
}

.q-btn.btn-styled:hover {
  background-color: #256b28;
}

/* Estilos adicionales para hacer el diseño más elegante */
.q-table {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.q-select {
  transition: all 0.3s ease;
}

.q-select:hover {
  transform: translateY(-2px);
}

</style>