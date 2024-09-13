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
        >
          Ingresar
        </q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cedula: '',
    };
  },
  methods: {
    handleSubmit() {
      if (this.cedula.trim() === '') {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'El campo de cédula no puede estar vacío',
        });
      } else {
        console.log("Cédula ingresada: ", this.cedula);
      }
    },
    validateNumber(event) {
      const charCode = event.charCode;
      // Solo permite números (charCode entre 48 y 57 son los códigos ASCII para los números)
      if (charCode < 48 || charCode > 57) {
        event.preventDefault();
      }
    }
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
