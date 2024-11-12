<template>
    <div class="flex flex-center bg-soft-green">
      <q-card class="q-pa-lg q-mb-xl q-pa-sm q-card-responsive">
        <q-card-section class="row items-center q-pb-none">
          <q-avatar icon="lock_open" size="56px" class="q-mr-md" color="white" text-color="primary" />
          <div class="text-h6">Restablecer Contraseña</div>
        </q-card-section>
  
        <q-card-section class="q-mt-md">
          <q-input
            v-model="email"
            filled
            label="Correo Electrónico"
            dense
            clearable
            hint="Ingrese su correo electrónico"
            prefix-icon="email"
            :rules="[val => !!val || 'Este campo es requerido']"
          />
        </q-card-section>
  
        <q-card-actions align="right" class="q-mt-md">
          <q-btn @click="sendResetLink" :disable="loading" color="primary" class="full-width">
            <template v-if="loading">
              <q-spinner-dots color="white" size="20px" />
            </template>
            <template v-else>
              Enviar enlace
            </template>
          </q-btn>
        </q-card-actions>
      </q-card>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useUsuariosStore } from '../stores/usuarios.js'; // Importa tu store
  
  const email = ref(''); // Campo de correo electrónico
  const loading = ref(false); // Estado de carga
  const useUsuarios = useUsuariosStore(); // Instancia del store
  
  async function sendResetLink() {
    if (email.value.trim() === '') {
      // Si el campo está vacío, simplemente no continúa
      return;
    }
  
    // Iniciar spinner y desactivar el botón
    loading.value = true;
  
    try {
      // Enviar solicitud al store para generar el enlace de restablecimiento
      let res = await useUsuarios.sendPasswordResetLink(email.value);
      // Puedes realizar alguna otra acción si lo necesitas, pero sin notificaciones
    } catch (error) {
      console.error('Error al enviar el enlace de restablecimiento:', error.message);
    } finally {
      // Desactivar el spinner y habilitar el botón nuevamente
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
  