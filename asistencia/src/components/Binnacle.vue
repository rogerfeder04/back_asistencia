<template>
  <div style="background-color: white">
    <div style="margin: 10px">
      <!-- Contenedor general con flex -->
      <div
        style="
          display: flex;
          align-items: center;
          text-align: center;
          gap: 40px;
          margin: 30px;
          flex-wrap: wrap;
        "
      >
        <!-- Filtro tipo de filtro -->
        <q-select
          v-model="tipoFiltro"
          :options="filtroOptions"
          label="Selecciona tipo de filtro"
          style="width: 320px; font-size: 16px; padding: 12px; height: 50px"
          emit-value
        />

        <!-- Filtro por Aprendiz -->
        <q-select
          v-show="tipoFiltro === 'porAprendis'"
          v-model="aprendizSeleccionado"
          :options="aprendicesOptions"
          label="Selecciona un aprendiz"
          style="width: 320px; font-size: 16px; padding: 12px; height: 50px"
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
          style="width: 320px; font-size: 16px; padding: 12px; height: 50px"
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
          style="width: 320px; font-size: 16px; padding: 12px; height: 50px"
        />

        <q-input
          v-model="fechaFin"
          label="Fecha Fin"
          type="date"
          style="width: 320px; font-size: 16px; padding: 12px; height: 50px"
        />

        <!-- Botones en línea -->
        <div style="display: flex; gap: 10px">
          <!-- Botón Filtrar -->
          <q-btn
            @click="obtenerBitacoras"
            :disable="isLoading"
            color="green-8"
            style="border-radius: 8px; min-width: 120px; height: 40px"
          >
            <template v-if="isLoading">
              <q-spinner-dots color="white" size="40px" />
              <!-- Muestra spinner mientras se carga -->
            </template>
            <template v-else>
              <span>Filtrar</span>
              <!-- Muestra texto normal si no está cargando -->
            </template>
          </q-btn>
        </div>
      </div>

      <!-- Spinner Global -->
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
              @update:model-value="
                (val) => actualizarEstado(props.row._id, val)
              "
              outlined
              dense
              emit-value
              map-options
              :class="getEstadoClass(props.row.estado)"
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
import { ref, onBeforeMount, watch } from "vue";
import { useBitacoraStore } from "../stores/Binnacle";
import { Notify, useQuasar, Dark } from "quasar";

const bitacoraStore = useBitacoraStore();
const $q = useQuasar();
const isDark = ref(Dark.isActive);
const isLoading = ref(false); // Controla el estado de carga para el spinner

watch(isDark, (val) => {
  Dark.set(val);
});

const tipoFiltro = ref("");
const fechaInicio = ref("");
const fechaFin = ref("");
const aprendizSeleccionado = ref("");
const fichaSeleccionada = ref("");
const rows = ref([]);

const filtroOptions = [
  { label: "Todas las Bitácoras", value: "todas" },
  { label: "Por Aprendiz", value: "porAprendis" },
  { label: "Por Ficha", value: "porFicha" },
];

const estadoOptions = ref([
  { label: "Pendiente", value: "pendiente" },
  { label: "Asistió", value: "asistió" },
  { label: "Faltó", value: "faltó" },
  { label: "Excusa", value: "excusa" },
]);

const columns = ref([
  {
    name: "fecha",
    headerStyle:
      "font-size: 18px; font-weight: bold; color: #3a9a42; background-color: #f5f5f5; text-align: center;",
    style: "font-size:16px",
    required: true,
    label: "Fecha",
    headerStyle:
      "font-size: 18px; font-weight: bold; color: #3a9a42; background-color: #f5f5f5; text-align: center;",
    style: "font-size:16px",
    align: "center",
    field: (row) => row.fecha,
    format: (val) => new Date(val).toLocaleDateString(),
    sortable: true,
  },
  {
    name: "hora",
    headerStyle:
      "font-size: 18px; font-weight: bold; color: #3a9a42; background-color: #f5f5f5; text-align: center;",
    style: "font-size:16px",
    align: "center",
    label: "Hora de Creación",
    headerStyle:
      "font-size: 18px; font-weight: bold; color: #3a9a42; background-color: #f5f5f5; text-align: center;",
    style: "font-size:16px",
    field: "createdAt",
    align: "center",
    sortable: true,
    format: (val) =>
      new Date(val).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
  {
    name: "nombre",
    headerStyle:
      "font-size: 18px; font-weight: bold; color: #3a9a42; background-color: #f5f5f5; text-align: center;",
    style: "font-size:16px",
    align: "center",
    label: "Nombre del Aprendiz",
    field: (row) => row.IdAprendis?.nombre || "",
    sortable: true,
  },
  {
    name: "cc",
    headerStyle:
      "font-size: 18px; font-weight: bold; color: #3a9a42; background-color: #f5f5f5; text-align: center;",
    style: "font-size:16px",
    align: "center",
    label: "CC",
    field: (row) => row.IdAprendis?.cc || "",
    sortable: true,
  },
  {
    name: "idficha",
    headerStyle:
      "font-size: 18px; font-weight: bold; color: #3a9a42; background-color: #f5f5f5; text-align: center;",
    style: "font-size:16px",
    align: "center",
    label: "Ficha",
    field: (row) => row.IdAprendis?.IdFicha?.nombre || "",
    sortable: true,
  },
  {
    name: "estado",
    headerStyle:
      "font-size: 18px; font-weight: bold; color: #3a9a42; background-color: #f5f5f5; text-align: center;",
    style: "font-size:16px",
    align: "center",
    label: "Estado",
    field: "estado",
    sortable: true,
  },
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
    aprendicesOptions.value = aprendices.map((aprendiz) => ({
      nombre: aprendiz.nombre,
      _id: aprendiz._id,
    }));
  } catch (error) {
    console.error("Error al cargar aprendices:", error);
  }
}

// Cargar fichas
async function cargarFichas() {
  try {
    const fichas = await bitacoraStore.obtenerFichas();
    fichasOptions.value = fichas.map((ficha) => ({
      nombre: ficha.nombre,
      _id: ficha._id,
    }));
  } catch (error) {
    console.error("Error al cargar fichas:", error);
  }
}

// Función para filtrar aprendices mientras se escribe
function filtrarAprendices(val, update) {
  update(() => {
    const filtro = val.toLowerCase();
    aprendicesOptions.value = aprendicesOptions.value.filter((aprendiz) =>
      aprendiz.nombre.toLowerCase().includes(filtro)
    );
  });
}

// Función para filtrar fichas mientras se escribe
function filtrarFichas(val, update) {
  update(() => {
    const filtro = val.toLowerCase();
    fichasOptions.value = fichasOptions.value.filter((ficha) =>
      ficha.nombre.toLowerCase().includes(filtro)
    );
  });
}

// Función para obtener bitácoras filtradas
async function obtenerBitacoras() {
  try {
    isLoading.value = true; // Inicia el spinner
    let response;

    const fechaInicioISO = fechaInicio.value
      ? new Date(fechaInicio.value).toISOString().split("T")[0]
      : null;
    const fechaFinISO = fechaFin.value
      ? new Date(fechaFin.value).toISOString().split("T")[0]
      : fechaInicioISO;

    // Simular el retardo para mantener el botón bloqueado aunque falten fechas
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 segundos de espera

    if (!fechaInicioISO) {
      Notify.create({
        message: "Por favor, ingresa una fecha de inicio.",
        color: "negative",
      });
    } else {
      if (tipoFiltro.value === "todas") {
        response = await bitacoraStore.listarBitacorasXFecha(
          fechaInicioISO,
          fechaFinISO
        );
      } else if (tipoFiltro.value === "porAprendis") {
        if (!aprendizSeleccionado.value) {
          Notify.create({
            message: "Selecciona un aprendiz.",
            color: "negative",
          });
        } else {
          response = await bitacoraStore.listarXIdAprendis(
            aprendizSeleccionado.value,
            fechaInicioISO,
            fechaFinISO
          );
        }
      } else if (tipoFiltro.value === "porFicha") {
        if (!fichaSeleccionada.value) {
          Notify.create({
            message: "Selecciona una ficha.",
            color: "negative",
          });
        } else {
          response = await bitacoraStore.listarXIdFicha(
            fichaSeleccionada.value,
            fechaInicioISO,
            fechaFinISO
          );
        }
      }

      if (Array.isArray(response) && response.length > 0) {
        rows.value = response;
      } else {
        rows.value = [];
        Notify.create({
          message: "No se encontraron bitácoras.",
          color: "negative",
        });
      }
    }
  } catch (error) {
    console.error("Error al obtener las bitácoras:", error);
    Notify.create({
      message: "Error al obtener las bitácoras.",
      color: "negative",
    });
  } finally {
    isLoading.value = false; // Detiene el spinner
  }
}

async function actualizarEstado(id, nuevoEstado) {
  try {
    const res = await bitacoraStore.actualizarEstado(id, nuevoEstado);
    Notify.create({
      message: "Estado actualizado correctamente.",
      color: "positive",
    });
    console.log("Estado actualizado:", res.data);
  } catch (error) {
    console.error("Error al actualizar el estado:", error);
    Notify.create({
      message: "Error al actualizar el estado.",
      color: "negative",
    });
  }
}

// Método para aplicar clase dinámica basada en el estado
function getEstadoClass(estado) {
  switch (estado) {
    case "pendiente":
      return "bg-orange-3";
    case "asistió":
      return "bg-green-3";
    case "faltó":
      return "bg-red-3";
    case "excusa":
      return "bg-blue-3";
    default:
      return "";
  }
}
</script>

<style scoped>
.bg-red-3 {
  background-color: #ffcccc;
}

.bg-green-3 {
  background-color: #ccffcc;
}

.bg-blue-3 {
  background-color: #cce5ff;
}

.bg-orange-3 {
  background-color: #ffe5cc;
}
.q-table--dense .q-table__top {
  padding: 10px 16px;
}
</style>
