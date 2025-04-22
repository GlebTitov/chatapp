<!-- src/views/ChatView.vue -->
<template>
  <div class="chat-view">
    <div class="chat-header">
      <button class="back-button" @click="goBack">
        ← Назад
      </button>
      <h2 v-if="roomDetails">{{ roomDetails.name }}</h2>
      <div class="online-users">
        <span>Участников: {{ onlineUsers }}</span>
      </div>
    </div>

    <div v-if="isLoading" class="loading-container">
      Загрузка чата...
    </div>

    <chat-room v-else :room-id="roomId" />
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
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ddd;
}

.back-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 8px;
  margin-right: 16px;
  color: #333;
}

.back-button:hover {
  color: #4caf50;
}

h2 {
  margin: 0;
  flex: 1;
}

.online-users {
  color: #666;
  font-size: 0.9rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  color: #666;
}
</style>