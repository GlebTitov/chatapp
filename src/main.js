// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Создаем экземпляр приложения Vue
const app = createApp(App);

// Подключаем маршрутизатор
app.use(router);

// Монтируем приложение
app.mount('#app');