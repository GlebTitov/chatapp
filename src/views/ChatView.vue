<!-- src/views/ChatView.vue -->
<template>
  <div class="chat-view">
    <!-- Шапка чата -->
    <header class="chat-header">
      <div class="header-content">
        <div class="header-left">
          <button class="back-button" @click="goBack">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div v-if="roomDetails" class="room-info">
            <div
                class="room-avatar"
                :style="`background-color: ${getAvatarColor(roomDetails.name)}`"
            >
              {{ roomDetails.name.charAt(0).toUpperCase() }}
            </div>
            <div class="room-details">
              <h2 class="room-name">{{ roomDetails.name }}</h2>
              <div class="online-status">
                {{ onlineUsers }} участников
              </div>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <button class="action-button" title="Поиск">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button class="action-button" title="Информация о чате">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Основной контент - сообщения -->
    <div v-if="isLoading" class="loading-container">
      <div class="loader"></div>
      <p>Загрузка сообщений...</p>
    </div>

    <div v-else class="chat-container">
      <!-- Компонент чата -->
      <chat-room :room-id="roomId" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import ChatRoom from '../components/ChatRoom.vue';

const route = useRoute();
const router = useRouter();
const roomId = route.params.id;
const roomDetails = ref(null);
const isLoading = ref(true);
const onlineUsers = ref(0); // Для демонстрации - в реальном приложении это бы обновлялось

// Функция получения цвета для аватара на основе имени
const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    '#3B82F6', // голубой
    '#EF4444', // красный
    '#10B981', // зеленый
    '#F59E0B', // янтарный
    '#8B5CF6', // фиолетовый
    '#EC4899', // розовый
    '#06B6D4', // бирюзовый
    '#F97316', // оранжевый
  ];

  return colors[Math.abs(hash) % colors.length];
};

// Проверяем аутентификацию и загружаем информацию о комнате
onMounted(async () => {
  // Проверяем аутентификацию
  if (!auth.currentUser) {
    router.push('/login');
    return;
  }

  try {
    // Получаем информацию о комнате
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnapshot = await getDoc(roomRef);

    if (roomSnapshot.exists()) {
      roomDetails.value = {
        id: roomSnapshot.id,
        ...roomSnapshot.data()
      };

      // В реальном приложении здесь бы обновлялся список пользователей онлайн
      onlineUsers.value = Math.floor(Math.random() * 10) + 1; // Для демонстрации
    } else {
      // Если комната не найдена, перенаправляем на главную
      router.push('/');
    }
  } catch (error) {
    console.error('Ошибка при загрузке комнаты:', error);
  } finally {
    isLoading.value = false;
  }
});

// Возврат на главную страницу
const goBack = () => {
  router.push('/');
};
</script>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f9fa;
}

/* Шапка чата */
.chat-header {
  background-color: white;
  border-bottom: 1px solid #eaecef;
  padding: 8px 16px;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-button {
  background: none;
  border: none;
  color: #4b5563;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: #f3f4f6;
}

.room-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.room-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-size: 18px;
}

.room-details {
  display: flex;
  flex-direction: column;
}

.room-name {
  font-weight: 600;
  font-size: 16px;
  color: #111827;
  margin: 0;
}

.online-status {
  font-size: 12px;
  color: #6b7280;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b5563;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-button:hover {
  background-color: #f3f4f6;
}

/* Контейнер чата */
.chat-container {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* Загрузка */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #6b7280;
  gap: 12px;
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.icon {
  width: 20px;
  height: 20px;
}
</style>