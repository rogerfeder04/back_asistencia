<template>
  <div class="flex flex-center bg-soft-green">
    <q-card class="q-pa-lg q-mb-xl q-pa-sm q-card-responsive">
      <q-card-section class="row items-center q-pb-none">
        <q-avatar icon="lock" size="56px" class="q-mr-md" color="white" text-color="primary" />
        <div class="text-h6">Restablecer Contraseña</div>
      </q-card-section>

      <q-card-section class="q-mt-md">
        <q-input
          v-model="newPassword"
          filled
          label="Nueva Contraseña"
          dense
          type="password"
          hint="Ingrese su nueva contraseña"
          :rules="[val => val.length >= 8 || 'La contraseña debe tener al menos 8 caracteres']"
        />
      </q-card-section>

      <q-card-actions align="right" class="q-mt-md">
        <q-btn @click="changePassword" :disable="loading" label="Cambiar Contraseña" color="primary" class="full-width">
          <template v-if="loading">
            <q-spinner-dots color="white" size="20px" />
          </template>
          <!-- <template v-else>
            Cambiar Contraseña
          </template> -->
        </q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Notify } from 'quasar';
import axios from 'axios';
import { useRoute } from 'vue-router';

const newPassword = ref('');
const loading = ref(false);
const route = useRoute(); // Para obtener el token de la URL

async function changePassword() {
  const token = route.params.token; // Obtener el token desde la URL

  if (newPassword.value.length < 8) {
    Notify.create({
      message: 'La contraseña debe tener al menos 8 caracteres',
      color: 'negative',
      position: 'top-right',
    });
    return;
  }

  loading.value = true;

  try {
    const response = await axios.put(`https://back-asistenciadespliegue.onrender.com/api/reset-password/${token}`, { newPassword: newPassword.value });
    Notify.create({
      message: 'Contraseña actualizada con éxito',
      color: 'green',
      position: 'top-right',
    });
  } catch (error) {
    Notify.create({
      message: 'Error al cambiar la contraseña',
      color: 'red',
      position: 'top-right',
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #e8f5e9; /* Color de fondo suave */
}

.q-card-responsive {
  max-width: 400px;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
</style>
