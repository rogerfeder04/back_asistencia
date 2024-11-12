<template>
  <div class="ingreso-container">
    <q-card class="q-pa-lg q-mb-xl q-pa-sm q-card-responsive">
      <q-card-section class="row items-center q-pb-none">
        <q-avatar icon="person" size="56px" class="q-mr-md" color="white" text-color="primary"/>
        <div class="text-h6">Ingreso de Aprendiz</div>
      </q-card-section>

      <q-card-section class="q-mt-md">
        <q-input
          v-model="cedula"
          filled
          label="Cédula"
          dense
          clearable
          hint="Ingresa tu cédula"
          prefix-icon="badge"
          :rules="[val => !!val || 'Este campo es requerido']"
          @keypress="validateNumber"
        />
      </q-card-section>

      <q-card-actions align="right" class="q-mt-md">
        <q-btn 
          @click="handleSubmit" 
          color="primary" 
          class="full-width"
          :disable="loading"
        >
          <template v-if="loading">
            <q-spinner-dots color="white" size="20px" />
          </template>
          <template v-else>
            Ingresar
          </template>
        </q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useBitacoraStore } from '../stores/Binnacle.js';
import { Notify } from 'quasar';

export default {
  data() {
    return {
      cedula: '', // Campo de cédula
      loading: false, // Indicador de carga
    };
  },
  methods: {
    // Validación para permitir solo números en la cédula
    validateNumber(event) {
      const charCode = event.charCode;
      if (charCode < 48 || charCode > 57) {
        event.preventDefault();
      }
    },
    // Método para enviar el formulario
    async handleSubmit() {
      // Activa el spinner
      this.loading = true;

      // Simula tiempo de espera aunque esté vacío el campo
      setTimeout(() => {
        this.loading = false;
      }, 3000);

      if (this.cedula.trim() === '') {
        // Si el campo está vacío, muestra un mensaje de error
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'El campo de cédula no puede estar vacío',
        });
        return;
      }

      try {
        // Usa el store para crear el registro en bitácora
        const bitacoraStore = useBitacoraStore();
        const response = await bitacoraStore.crearRegistroBitacora(this.cedula);

        // Muestra notificación si el registro fue exitoso
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: 'Registro en bitácora creado con éxito',
        });
        
        console.log("Respuesta del servidor:", response);
        this.cedula = ''; // Limpiar el campo de cédula después del envío
      } catch (error) {
        // Si el servidor retorna un error, mostramos el mensaje específico
        const errorMessage = error.response?.data?.error || 'Error al crear el registro en bitácora';
        
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: errorMessage,
        });
      }
    },
  },
};
</script>

<style scoped>
.ingreso-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url('/src/assets/image/WhatsApp-Image-2023-09-11-at-4.50.10-PM.jpeg'); /* Ruta a la imagen de fondo */
  background-size: cover;
  background-position: center;
}

.q-card-responsive {
  max-width: 400px;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.9); /* Fondo blanco semi-transparente para la tarjeta */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Sombra suave */
  border-radius: 8px;
}
</style>
