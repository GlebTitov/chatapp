<!-- src/views/HomeView.vue -->
<template>
  <div class="home-container">
    <header class="app-header">
      <h1>Чат-приложение</h1>
      <div class="user-info" v-if="auth.currentUser">
        <span>{{ auth.currentUser.displayName || 'Пользователь' }}</span>
        <button class="logout-button" @click="logout">Выйти</button>
      </div>
    </header>

    <div class="rooms-container">
      <h2>Доступные комнаты</h2>

      <div v-if="isLoading" class="loading">
        Загрузка комнат...
      </div>

      <div v-else-if="rooms.length === 0" class="no-rooms">
        Нет доступных комнат.
      </div>

      <div class="rooms-list" v-else>
        <div
            v-for="room in rooms"
            :key="room.id"
            class="room-item"
            @click="goToRoom(room.id)"
        >
          <h3>{{ room.name }}</h3>
          <p class="room-description">{{ room.description }}</p>
        </div>
      </div>

      <div class="create-room">
        <button class="add-room-button" @click="showCreateRoomForm = true">
          Создать новую комнату
        </button>
      </div>
    </div>

    <!-- Модальное окно создания комнаты -->
    <div class="modal" v-if="showCreateRoomForm">
      <div class="modal-content">
        <h2>Создать новую комнату</h2>

        <div class="form-group">
          <label for="roomName">Название комнаты</label>
          <input
              id="roomName"
              v-model="newRoom.name"
              type="text"
              placeholder="Введите название комнаты"
          />
        </div>

        <div class="form-group">
          <label for="roomDescription">Описание</label>
          <textarea
              id="roomDescription"
              v-model="newRoom.description"
              placeholder="Описание комнаты"
          ></textarea>
        </div>

        <div class="modal-buttons">
          <button class="cancel-button" @click="showCreateRoomForm = false">
            Отмена
          </button>
          <button
              class="create-button"
              @click="createRoom"
              :disabled="!newRoom.name"
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase/config';

const router = useRouter();
const rooms = ref([]);
const isLoading = ref(true);
const showCreateRoomForm = ref(false);
const newRoom = ref({
  name: '',
  description: ''
});

// Загрузка доступных комнат
onMounted(async () => {
  // Проверяем аутентификацию
  if (!auth.currentUser) {
    router.push('/login');
    return;
  }

  try {
    const roomsRef = collection(db, 'rooms');
    const snapshot = await getDocs(roomsRef);

    rooms.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Ошибка при загрузке комнат:', error);
  } finally {
    isLoading.value = false;
  }
});

// Переход в выбранную комнату
const goToRoom = (roomId) => {
  router.push(`/chat/${roomId}`);
};

// Создание новой комнаты
const createRoom = async () => {
  if (!newRoom.value.name) return;

  try {
    const roomsRef = collection(db, 'rooms');
    const docRef = await addDoc(roomsRef, {
      name: newRoom.value.name,
      description: newRoom.value.description,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser.uid
    });

    // Добавляем новую комнату в список и очищаем форму
    rooms.value.push({
      id: docRef.id,
      name: newRoom.value.name,
      description: newRoom.value.description,
      createdAt: new Date(),
      createdBy: auth.currentUser.uid
    });

    newRoom.value = {
      name: '',
      description: ''
    };

    showCreateRoomForm.value = false;
  } catch (error) {
    console.error('Ошибка при создании комнаты:', error);
  }
};

// Выход из аккаунта
const logout = async () => {
  try {
    await signOut(auth);
    router.push('/login');
  } catch (error) {
    console.error('Ошибка при выходе:', error);
  }
};
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logout-button {
  background-color: transparent;
  border: 1px solid #ccc;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #f0f0f0;
}

.rooms-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.loading, .no-rooms {
  text-align: center;
  margin: 32px 0;
  color: #666;
}

.rooms-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.room-item {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.room-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.room-description {
  color: #666;
  margin-top: 8px;
  font-size: 0.9rem;
}

.create-room {
  margin-top: 24px;
  text-align: center;
}

.add-room-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

/* Модальное окно */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

input, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-button {
  background-color: #f0f0f0;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.create-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.create-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>