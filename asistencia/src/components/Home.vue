<template>
  <div class="q-pa-md">
    <q-layout view="hHh LpR fFf" container style="height: 100vh; overflow: hidden;" class="shadow-2 rounded-borders">
      <!-- Header -->
      <q-header elevated :class="$q.dark.isActive ? 'bg-secondary' : 'bg-green-8'">
        <q-toolbar>
          <q-btn flat @click="toggleDrawer" round dense icon="menu" />
          <q-toolbar-title>APRENDICES BITACORAS LOG</q-toolbar-title>
          <q-btn @click="router.back()" icon="arrow_back" :style="{ backgroundColor: 'rgba(47, 125, 50, 0.9)', color: 'white' }" />
        </q-toolbar>
      </q-header>

      <!-- Drawer -->
      <q-drawer
        v-model="drawer"
        :width="250"
        side="left"
        overlay
        :mini="miniState"
        @mouseover="miniState = false"
        @mouseout="miniState = true"
        mini-to-overlay
        bordered
        dark
        elevated
        :style="{ backgroundColor: 'rgba(47, 125, 50, 0.9)', color: 'white' }"
      >
        <!-- Información del usuario -->
        <div class="q-pa-md q-my-md text-center">
          <q-avatar size="46px" class="q-mb-md">
            <img src="https://diseodesoftwareblog.wordpress.com/wp-content/uploads/2016/03/5e090-logo_sena.png?w=356&h=330" alt="User Avatar" />
          </q-avatar>
          <!-- Mostrar nombre y email solo cuando el drawer esté expandido -->
          <div v-if="!miniState">
            <div class="text-white text-bold">
              {{ usuario?.nombre || 'Usuario' }}
            </div>
            <div class="text-white">
              {{ usuario?.email || 'email@dominio.com' }}
            </div>
          </div>
        </div>

        <!-- Lista de navegación -->
        <q-list padding>
          <q-item clickable to="/home" v-ripple class="drawer-item">
            <q-item-section avatar>
              <q-icon name="home" class="drawer-icon" />
            </q-item-section>
            <q-item-section class="drawer-label">Inicio</q-item-section>
          </q-item>

          <q-item clickable to="/bitacoras" v-ripple class="drawer-item">
            <q-item-section avatar>
              <q-icon name="note" class="drawer-icon" />
            </q-item-section>
            <q-item-section class="drawer-label">Bitacoras</q-item-section>
          </q-item>

          <q-item clickable to="/fichas" v-ripple class="drawer-item">
            <q-item-section avatar>
              <q-icon name="folder" class="drawer-icon" />
            </q-item-section>
            <q-item-section class="drawer-label">Fichas</q-item-section>
          </q-item>

          <q-item clickable to="/aprendiz" v-ripple class="drawer-item">
            <q-item-section avatar>
              <q-icon name="group" class="drawer-icon" />
            </q-item-section>
            <q-item-section class="drawer-label">Aprendices</q-item-section>
          </q-item>

          <q-item clickable to="/informe" v-ripple class="drawer-item">
            <q-item-section avatar>
              <q-icon name="assessment" class="drawer-icon" />
            </q-item-section>
            <q-item-section class="drawer-label">Informe</q-item-section>
          </q-item>

          <q-item clickable to="/usuario" v-ripple class="drawer-item">
            <q-item-section avatar>
              <q-icon name="person" class="drawer-icon" />
            </q-item-section>
            <q-item-section class="drawer-label">Usuarios</q-item-section>
          </q-item>
        </q-list>
      </q-drawer>

      <!-- Main content -->
      <q-page-container :class="drawerExpandedClass">
        <!-- Condicional para mostrar las tarjetas solo en la ruta /home -->
        <div v-if="isHomePage" class="cards">
          <div class="q-pa-lg" style="max-width: 1200px; width: 90%;">
            <div class="row q-col-gutter-lg">
              <!-- Primer Card -->
              <div class="col-xs-12 col-md-6">
                <q-card class="card" clickable @click="goToRoute('/fichas')">
                  <q-card-section class="card-header">
                    <div class="text-h6">FICHAS</div>
                  </q-card-section>
                  <q-img src="https://cdn.pixabay.com/photo/2016/08/13/23/41/flashcards-1591812_1280.jpg" class="q-mx-auto q-mb-md" />
                </q-card>
              </div>

              <!-- Segundo Card -->
              <div class="col-xs-12 col-md-6">
                <q-card class="card" clickable @click="goToRoute('/informe')">
                  <q-card-section class="card-header">
                    <div class="text-h6">INFORME</div>
                  </q-card-section>
                  <q-img src="https://cdn.pixabay.com/photo/2016/08/15/10/17/survey-1594962_1280.jpg" class="q-mx-auto q-mb-md" />
                </q-card>
              </div>
            </div>

            <div class="row q-col-gutter-lg q-mt-lg">
              <!-- Tercer Card -->
              <div class="col-xs-12 col-md-6">
                <q-card class="card" clickable @click="goToRoute('/bitacoras')">
                  <q-card-section class="card-header">
                    <div class="text-h6">BITACORAS</div>
                  </q-card-section>
                  <q-img src="https://cdn.pixabay.com/photo/2020/07/24/09/49/books-5433432_960_720.jpg" class="q-mx-auto q-mb-md" />
                </q-card>
              </div>

              <!-- Cuarto Card -->
              <div class="col-xs-12 col-md-6">
                <q-card class="card" clickable @click="goToRoute('/usuario')">
                  <q-card-section class="card-header">
                    <div class="text-h6">USUARIOS</div>
                  </q-card-section>
                  <q-img src="https://cdn.pixabay.com/photo/2017/08/25/10/56/women-2679748_1280.jpg" class="q-mx-auto q-mb-md" />
                </q-card>
              </div>

              <!-- Quinto Card -->
              <div class="col-xs-12 col-md-6">
                <q-card class="card" clickable @click="goToRoute('/aprendiz')">
                  <q-card-section class="card-header">
                    <div class="text-h6">APRENDICES</div>
                  </q-card-section>
                  <q-img src="https://cdn.pixabay.com/photo/2024/07/21/09/36/ai-generated-8909906_960_720.jpg" class="q-mx-auto q-mb-md" />
                </q-card>
              </div>
            </div>
          </div>
        </div>
        
        <router-view />
      </q-page-container>

      <!-- Footer -->
      <q-footer elevated class="bg-green-9" style="padding: 20px 0;">
        <q-toolbar style="justify-content: center;">
          <q-toolbar-title class="text-center">
            <span class="text-bold" style="color: white; font-size: 22px; letter-spacing: 0.5px;">
              2024 Todos los derechos reservados
            </span>
          </q-toolbar-title>
        </q-toolbar>
      </q-footer>
    </q-layout>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUsuariosStore } from '../stores/usuarios';

const router = useRouter();
const route = useRoute();
const drawer = ref(false);
const miniState = ref(true);

const toggleDrawer = () => {
  drawer.value = !drawer.value;
};

// Función para manejar la navegación al hacer clic en la tarjeta
const goToRoute = (path) => {
  router.push(path);
};

// Revisar si la ruta actual es '/home'
const isHomePage = computed(() => route.path === '/home');

const drawerExpandedClass = computed(() => {
  return miniState.value ? 'content-mini' : 'content-expanded';
});

const useUsuarios = useUsuariosStore();
const usuario = computed(() => useUsuarios.usuario); // Obtenemos la información del usuario
</script>

<style scoped>
/* General layout padding */
.q-pa-md {
  margin: 0;
  padding: 0;
}

.content-mini {
  margin-left: 60px; /* Ajusta este valor según el tamaño del drawer mini */
}

.content-expanded {
  margin-left: 250px; /* Ajusta este valor según el tamaño del drawer expandido */
}

/* Drawer styles */
.q-drawer {
  position: fixed !important;
  z-index: 1000;
  background-color: rgba(47, 125, 50, 0.9) !important;
  color: white;
}

.drawer-item {
  background-color: white;
  border-radius: 12px;
  color: #2F7D32;
  margin-bottom: 15px;
  padding: 10px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.drawer-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.drawer-icon {
  font-size: 24px;
}

.drawer-label {
  font-size: 16px;
  font-weight: bold;
}

/* Card styles */
.card {
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.card-header {
  background-color: rgba(47, 125, 50, 0.9);
  color: white;
  border-radius: 12px 12px 0 0;
  padding: 15px;
}

.q-img {
  border-radius: 12px;
}

.cards {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
}
</style>
