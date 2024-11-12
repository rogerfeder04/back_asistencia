<template> 
  <div class="login-container">
    <q-card class="q-pa-lg q-mb-xl q-pa-sm q-card-responsive">
      <!-- Sección para el logo -->
      <q-card-section align="center" class="q-pb-none q-pt-none">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAGw03mi2-r-69jk5gvtp0hxTxIzzAXeLPRA&s" alt="logo" class="logo" />
      </q-card-section>

      <!-- Inputs de Email y Password -->
      <q-card-section class="q-mt-md">
        <q-input
          v-model="email"
          filled
          placeholder="Email"
          dense
          clearable
          prefix=""
          class="input-styled"
          :rules="[val => !!val || 'Este campo es requerido']"
        >
          <template v-slot:append>
            <q-icon name="email" />
          </template>
        </q-input>

        <q-input
          v-model="password"
          filled
          placeholder="Password"
          type="password"
          dense
          class="q-mt-md input-styled"
          clearable
          :rules="[val => !!val || 'Este campo es requerido']"
        >
          <template v-slot:append>
            <q-icon name="visibility_off" @click="togglePasswordVisibility" />
          </template>
        </q-input>
      </q-card-section>

      <!-- Botón de Iniciar Sesión -->
      <q-card-actions align="center" class="q-mt-md">
        <q-btn 
          :disable="loading"
          @click="login" 
          color="primary" 
          class="full-width btn-styled"
        >
          <template v-if="loading">
            <q-spinner-dots color="white" size="20px" />
          </template>
          <template v-else>
            Iniciar Sesión
          </template>
        </q-btn>
      </q-card-actions>

      <!-- Enlace para recuperación de contraseña -->
      <q-card-section align="center" class="q-mt-sm">
        <q-btn flat @click="goToResetPassword" label="¿Olvidaste tu contraseña?" color="primary" class="q-pa-none" />
      </q-card-section>

    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUsuariosStore } from '../stores/usuarios.js';
import { useRouter } from 'vue-router';
import { Notify } from 'quasar';

const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false); // Indicador de carga
const useUsuarios = useUsuariosStore();

async function login() {
  if (loading.value) return; // Evita múltiples clics

  loading.value = true;
  try {
    let res = await useUsuarios.login(email.value, password.value);

    if (res && res.status === 200 && res.data.token) {
      router.replace('/home');
    } else {
      Notify.create({
        type: 'negative',
        message: 'Error al iniciar sesión. Por favor, verifique sus credenciales.',
      });
    }
  } catch (error) {
    console.error('Error en el inicio de sesión:', error.message);
    Notify.create({
      type: 'negative',
      message: 'Error al iniciar sesión. Por favor, intente nuevamente.',
    });
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 3000);
  }
}

function goToResetPassword() {
  router.push('/reset-password');
}

function togglePasswordVisibility() {
  const type = password.type === 'password' ? 'text' : 'password';
  password.type = type;
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 16px;
  background-color: #f5f5f5;
}

.q-card {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
}

.input-styled {
  border-radius: 20px;
}

.full-width {
  width: 100%;
}

.btn-styled {
  background-color: #4CAF50; /* Cambia al verde que se parece al de la imagen */
  color: white;
  border-radius: 25px;
}

.logo {
  width: 120px;
  height: auto;
  margin-bottom: 10px;
}
</style>