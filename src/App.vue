<!-- src/App.vue -->
<template>
  <div class="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';

const router = useRouter();

onMounted(() => {
  // Проверяем состояние аутентификации при загрузке приложения
  onAuthStateChanged(auth, (user) => {
    if (!user && router.currentRoute.value.meta.requiresAuth) {
      router.push('/login');
    }
  });
});
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Arial', sans-serif;
  background-color: #f5f5f5;
  color: #333;
  line-height: 1.6;
}

.app {
  height: 100vh;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>