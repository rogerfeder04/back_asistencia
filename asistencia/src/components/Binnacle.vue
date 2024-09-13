<template>
  <div style="background-color: white;"> <!-- Fondo blanco -->
    <div style="margin: 10px;">
      <!-- Filtros -->
      <q-select
        v-model="tipoFiltro"
        :options="filtroOptions"
        label="Selecciona tipo de filtro"
        style="width: 300px; margin-bottom: 20px;"
        emit-value
      />
      <q-input
        v-show="tipoFiltro === 'porAprendis'"
        v-model="idAprendis"
        label="IdAprendis"
        style="margin-bottom: 20px; width: 200px;" 
      />
      <q-input
         v-show="tipoFiltro === 'porFicha'"
        v-model="idFicha"
        label="IdFicha"
        style="margin-bottom: 20px; width: 200px;" 
      />
      
      <!-- Campos de fechas más pequeños -->
      <div style="display: flex; gap: 10px;">
        <q-input 
          v-model="fechaInicio" 
          label="Fecha Inicio" 
          type="date" 
          style="margin-bottom: 20px; width: 150px;" 
        />
        <q-input 
          v-model="fechaFin" 
          label="Fecha Fin" 
          type="date" 
          style="margin-bottom: 20px; width: 150px;" 
        />
      </div>
      
      <q-btn @click="obtenerBitacoras" label="Filtrar" color="primary" />

      <!-- Spinner -->
      <div v-if="isLoading" class="q-pa-md">
        <q-spinner color="primary" size="50px" />
      </div>

      <!-- Tabla -->
      <q-table
        v-if="!isLoading"
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
const isLoading = ref(false);  // Nuevo estado de carga
watch(isDark, (val) => {
  Dark.set(val);
});



const tipoFiltro = ref('todas');
const fechaInicio = ref('');
const fechaFin = ref('');
const idAprendis = ref('');
const idFicha = ref('');
const rows = ref([]);

const filtroOptions = [
  { label: 'Todas las Bitácoras', value: 'todas' },
  { label: 'Por IdAprendis', value: 'porAprendis' },
  { label: 'Por IdFicha', value: 'porFicha' }
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
  { name: 'idficha', align: 'center', label: 'IdFicha', field: row => row.IdAprendis?.IdFicha.nombre || '', sortable: true },
  { name: 'estado', align: 'center', label: 'Estado', field: 'estado', sortable: true }
]);

onBeforeMount(() => {
  obtenerBitacoras();
});

async function obtenerBitacoras() {
  try {
    // Activar el spinner
    isLoading.value = true;

    // Verificar que las fechas no estén vacías
    if (!fechaInicio.value || !fechaFin.value) {
      Notify.create({
        message: 'Por favor, ingresa un rango de fechas válido.',
        color: 'negative',
      });
      isLoading.value = false;
      return;
    }

    let response;
    if (tipoFiltro.value === 'todas') {
      response = await bitacoraStore.listarBitacorasXFecha(fechaInicio.value, fechaFin.value);
    } else if (tipoFiltro.value === 'porAprendis') {
      if (!idAprendis.value) {  
        Notify.create({
          message: 'Por favor, ingresa un IdAprendis válido.',
          color: 'negative',
        });
        isLoading.value = false;
        return;
      }
      response = await bitacoraStore.listarXIdAprendis(idAprendis.value, fechaInicio.value, fechaFin.value);
    } else if (tipoFiltro.value === 'porFicha') {
      if (!idFicha.value) {
        Notify.create({
          message: 'Por favor, ingresa un IdFicha válido.',
          color: 'negative',
        });
        isLoading.value = false;
        return;
      }
      response = await bitacoraStore.listarXIdFicha(idFicha.value, fechaInicio.value, fechaFin.value);
    }

    // Asegurarse de que response sea un arreglo
    if (Array.isArray(response)) {
      rows.value = response.map(bitacora => ({
        ...bitacora,
        estado: bitacora.estado || 'pendiente'  // Asegúrate de inicializar el estado si no está presente
      }));
    } else {
      rows.value = [];
      Notify.create({
        message: 'No se encontraron bitácoras.',
        color: 'negative',
      });
    }
  } catch (error) {
    console.error('Error al obtener las bitácoras:', error);
    Notify.create({
      message: 'Ocurrió un error al obtener las bitácoras.',
      color: 'negative',
    });
  } finally {
    // Desactivar el spinner
    isLoading.value = false;
  }
}

async function actualizarEstado(id, nuevoEstado) {
  try {
    const res = await bitacoraStore.actualizarEstado(id, nuevoEstado);
    Notify.create({
      message: 'Estado actualizado correctamente.',
      color: 'positive',
    });
    console.log("Estado actualizado:", res.data);
  } catch (error) {
    console.error("Error al actualizar el estado:", error);
    Notify.create({
      message: 'Error al actualizar el estado.',
      color: 'negative',
    });
  }
}

watch(tipoFiltro, (val) => {
  console.log("Valor de tipoFiltro:", val);
});
</script>