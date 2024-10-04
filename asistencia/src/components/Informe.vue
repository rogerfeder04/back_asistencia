<template>
  <div style="background-color: white;">
    <div style="margin: 10px;">
      <!-- Contenedor para los filtros en línea -->
      <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
        <!-- Filtro Ficha -->
        <q-select
          v-model="idFicha"
          :options="fichasOptions"
          label="Selecciona una ficha"
          style="width: 300px;"
          emit-value
          option-label="label"
          option-value="value"
          map-options
        />
        
        <!-- Filtro Fecha -->
        <q-input
          v-model="fecha"
          label="Fecha"
          type="date"
          style="width: 200px;"
        />
        
        <!-- Botón estilo "Crear" -->
        <q-btn 
          @click="obtenerBitacorasFiltradas" 
          color="green-8" 
          style="border-radius: 8px; min-width: 120px; height: 40px;"
          icon="add"
        >
          <span>filtar</span>
        </q-btn>
        
        <!-- Otro botón similar si lo necesitas -->
        <q-btn 
          @click="generarPDF" 
          color="green-8" 
          style="border-radius: 8px; min-width: 120px; height: 40px;" 
          icon="file_download"
        >
          <span>DESCARGAR PDF</span>
        </q-btn>
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
        row-key="_id"
        flat
        bordered
        :dense="true"
      >
        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            {{ props.row.estado }}
          </q-td>
        </template>
      </q-table>

      <div v-if="!isLoading && rows.length === 0" class="q-pa-md">
        <p>No se encontraron bitácoras.</p>
      </div>
    </div>
  </div>
</template>



<script setup>
import { ref, onBeforeMount } from 'vue';
import { useInformeStore } from '../stores/Informe.js'; // Store para bitácoras y fichas
import { Notify } from 'quasar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const informeStore = useInformeStore();
const isLoading = ref(false);
const rows = ref([]);
const idFicha = ref(''); // Aquí el valor será el _id de la ficha seleccionada
const fecha = ref('');

// Definir las columnas de la tabla
const columns = ref([
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true, format: val => new Date(val).toLocaleDateString() },
  { name: 'nombre', label: 'Nombre Aprendiz', field: row => row.IdAprendis?.nombre || 'Desconocido', align: 'left', sortable: true },
  { name: 'cc', label: 'CC', field: row => row.IdAprendis?.cc || 'Desconocido', align: 'left', sortable: true },
  { name: 'IdFicha', label: 'IdFicha', field: row => row.IdAprendis?.IdFicha.nombre || 'No asignada', align: 'left', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left', sortable: true }
]);

// Opciones de fichas (serán cargadas desde la API)
const fichasOptions = ref([]);

// Cargar las fichas y todas las bitácoras al montar el componente
onBeforeMount(async () => {
  await cargarFichas();
  await obtenerTodasLasBitacoras(); // Cargar todas las bitácoras al iniciar
});

// Función para cargar todas las bitácoras al iniciar el componente
async function obtenerTodasLasBitacoras() {
  try {
    isLoading.value = true;
    const response = await informeStore.listarTodasLasBitacoras();

    if (Array.isArray(response) && response.length > 0) {
      rows.value = response;
    } else {
      rows.value = [];
      Notify.create({
        message: 'No se encontraron bitácoras.',
        color: 'negative',
      });
    }
  } catch (error) {
    console.error('Error al obtener todas las bitácoras:', error);
    Notify.create({
      message: 'Ocurrió un error al obtener las bitácoras.',
      color: 'negative',
    });
  } finally {
    isLoading.value = false;
  }
}

// Función para cargar las fichas
async function cargarFichas() {
  try {
    const fichas = await informeStore.obtenerFichas();

    // Verificar si fichas está definido y no es vacío
    if (fichas && fichas.length > 0) {
      fichasOptions.value = fichas.map(ficha => ({
        label: ficha.nombre, // Mostrar el nombre de la ficha
        value: ficha._id     // Guardar el ID de la ficha para usarlo en el backend
      }));
    } else {
      fichasOptions.value = [];
      Notify.create({
        message: 'No se encontraron fichas disponibles.',
        color: 'warning',
      });
    }
  } catch (error) {
    console.error('Error al cargar las fichas:', error);
    Notify.create({
      message: 'Error al cargar las fichas.',
      color: 'negative',
    });
  }
}

// Función para obtener bitácoras filtradas por ficha y fecha
async function obtenerBitacorasFiltradas() {
  try {
    isLoading.value = true;

    if (!idFicha.value || !fecha.value) {
      Notify.create({
        message: 'Por favor, selecciona una ficha y una fecha.',
        color: 'negative',
      });
      isLoading.value = false;
      return;
    }

    // Convertir la fecha a ISO para la consulta
    const fechaISO = new Date(fecha.value).toISOString().split('T')[0];
    const response = await informeStore.listarBitacorasPorFichaYFecha(idFicha.value, fechaISO);

    if (Array.isArray(response) && response.length > 0) {
      rows.value = response;
    } else {
      rows.value = [];
      Notify.create({
        message: 'No se encontraron bitácoras para los filtros seleccionados.',
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
    isLoading.value = false;
  }
}

// Función para generar el PDF
function generarPDF() {
  const doc = new jsPDF();

  // Generar título
  doc.text('Informe de Bitácoras - Solo Asistió', 14, 16);

  // Definir las columnas del PDF
  const columns = [
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Nombre Aprendiz', dataKey: 'nombre' },
    { header: 'CC', dataKey: 'cc' },
    { header: 'IdFicha', dataKey: 'IdFicha' },
    { header: 'Estado', dataKey: 'estado' }
  ];

  // Filtrar solo las bitácoras que tengan el estado "asistió"
  const data = rows.value
    .filter(row => row.estado === 'asistió')  // Filtrar solo los que tienen estado "asistió"
    .map(row => ({
      fecha: new Date(row.fecha).toLocaleDateString(),
      nombre: row.IdAprendis?.nombre || 'Desconocido',
      cc: row.IdAprendis?.cc || 'Desconocido',
      IdFicha: row.IdAprendis?.IdFicha?.nombre || 'No asignada',
      estado: row.estado
    }));

  if (data.length === 0) {
    Notify.create({
      message: 'No se encontraron bitácoras con el estado "asistió".',
      color: 'warning',
    });
    return;
  }

  // Generar la tabla en el PDF
  autoTable(doc, {
    columns,
    body: data,
    startY: 22
  });

  // Descargar el PDF
  doc.save('informe-bitacoras-asistio.pdf');
}
</script>