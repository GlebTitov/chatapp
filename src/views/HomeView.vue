<!-- src/views/HomeView.vue -->
<template>
  <div class="home-container">
    <!-- Минималистичная верхняя панель -->
    <header class="app-header">
      <div class="header-container">
        <div class="app-title">Чаты</div>

        <div class="user-controls">
          <button
              class="create-button-small"
              @click="showCreateRoomForm = true"
          >
            <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>

          <button
              class="avatar-button"
              :style="`background-color: ${getAvatarColor(auth.currentUser?.displayName || 'Пользователь')}`"
              @click="logout"
          >
            {{ getUserInitials(auth.currentUser?.displayName || 'Пользователь') }}
          </button>
        </div>
      </div>
    </header>

    <!-- Главное содержимое -->
    <div class="main-container">
      <!-- Строка поиска -->
      <div class="search-container">
        <div class="search-box">
          <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
              type="text"
              v-model="searchQuery"
              placeholder="Поиск"
              class="search-input"
          />
        </div>
      </div>

      <!-- Индикатор загрузки -->
      <div v-if="isLoading" class="empty-state">
        <div class="loader"></div>
        <p class="empty-message">Загрузка чатов...</p>
      </div>

      <!-- Пустое состояние -->
      <div v-else-if="filteredRooms.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg class="icon-large" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 class="empty-title">Нет доступных чатов</h3>
        <p class="empty-subtitle">
          {{ searchQuery ? 'По вашему запросу ничего не найдено' : 'Создайте новый чат, чтобы начать общение' }}
        </p>
        <button
            v-if="searchQuery"
            class="button-secondary"
            @click="searchQuery = ''"
        >
          Сбросить поиск
        </button>
        <button
            v-else
            class="button-primary"
            @click="showCreateRoomForm = true"
        >
          Создать чат
        </button>
      </div>

      <!-- Список чатов -->
      <div v-else class="room-list">
        <div
            v-for="room in filteredRooms"
            :key="room.id"
            class="room-card"
            @click="goToRoom(room.id)"
        >
          <div class="room-card-content">
            <div class="room-info">
              <div
                  class="room-avatar"
                  :style="`background-color: ${getAvatarColor(room.name)}`"
              >
                {{ room.name.charAt(0).toUpperCase() }}
              </div>
              <div class="room-details">
                <div class="room-name">{{ room.name }}</div>
                <div class="room-last-message">
                  {{ room.lastMessage || 'Нет сообщений' }}
                </div>
              </div>
            </div>
            <div class="room-time">
              {{ formatTimestamp(room.createdAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Плавающая кнопка создания на мобильной версии -->
      <button
          class="create-button-floating"
          @click="showCreateRoomForm = true"
      >
        <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>

    <!-- Модальное окно создания комнаты -->
    <div
        v-if="showCreateRoomForm"
        class="modal-overlay"
        @click="showCreateRoomForm = false"
    >
      <div
          class="modal-content"
          @click.stop
      >
        <div class="modal-header">
          <h2 class="modal-title">Новый чат</h2>
          <button
              class="close-button"
              @click="showCreateRoomForm = false"
          >
            <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="form-group">
          <label for="room-name" class="form-label">
            Название
          </label>
          <input
              type="text"
              id="room-name"
              v-model="newRoom.name"
              class="form-input"
              placeholder="Введите название чата"
          />
        </div>

        <div class="form-group">
          <label for="room-description" class="form-label">
            Описание (опционально)
          </label>
          <textarea
              id="room-description"
              v-model="newRoom.description"
              rows="3"
              class="form-input"
              placeholder="О чем этот чат?"
          ></textarea>
        </div>

        <div class="modal-footer">
          <button
              class="button-secondary"
              @click="showCreateRoomForm = false"
          >
            Отмена
          </button>
          <button
              class="button-primary"
              :disabled="!newRoom.name || isCreatingRoom"
              @click="createRoom"
          >
            {{ isCreatingRoom ? 'Создание...' : 'Создать' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDoc,
  doc
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase/config';

const router = useRouter();
const rooms = ref([]);
const isLoading = ref(true);
const isCreatingRoom = ref(false);
const showCreateRoomForm = ref(false);
const searchQuery = ref('');
const newRoom = ref({
  name: '',
  description: ''
});

// Хеш-функция для генерации цвета аватара на основе имени
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

// Получение инициалов пользователя
const getUserInitials = (name) => {
  if (!name) return '?';

  const parts = name.split(' ');
  if (parts.length === 1) return name.charAt(0).toUpperCase();

  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
};

// Фильтрация комнат по поисковому запросу
const filteredRooms = computed(() => {
  if (!searchQuery.value) return rooms.value;

  const query = searchQuery.value.toLowerCase();
  return rooms.value.filter(room =>
      room.name.toLowerCase().includes(query) ||
      (room.description && room.description.toLowerCase().includes(query))
  );
});

// Форматирование времени
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';

  try {
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now - date;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return days === 1 ? 'Вчера' : `${days} дн. назад`;
    } else if (hours > 0) {
      return `${hours} ч. назад`;
    } else if (minutes > 0) {
      return `${minutes} мин. назад`;
    } else {
      return 'Только что';
    }
  } catch (e) {
    return 'Недавно';
  }
};

// Загрузка списка комнат при монтировании компонента
onMounted(async () => {
  // Проверка аутентификации
  if (!auth.currentUser) {
    router.push('/login');
    return;
  }

  try {
    const roomsRef = collection(db, 'rooms');
    const roomsQuery = query(roomsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(roomsQuery);

    // Получаем базовую информацию о комнатах
    const roomsList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastMessage: null // Пока нет сообщений
    }));

    // Для каждой комнаты попробуем получить последнее сообщение
    for (const room of roomsList) {
      try {
        const messagesRef = collection(db, 'rooms', room.id, 'messages');
        const messagesQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
        const messagesSnapshot = await getDocs(messagesQuery);

        if (!messagesSnapshot.empty) {
          const lastMessage = messagesSnapshot.docs[0].data();
          room.lastMessage = `${lastMessage.displayName}: ${lastMessage.text}`;
        }
      } catch (error) {
        console.error(`Ошибка получения сообщений для комнаты ${room.id}:`, error);
      }
    }

    rooms.value = roomsList;
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
  if (!newRoom.value.name.trim() || isCreatingRoom.value) return;

  isCreatingRoom.value = true;

  try {
    const roomsRef = collection(db, 'rooms');
    const roomData = {
      name: newRoom.value.name.trim(),
      description: newRoom.value.description.trim(),
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser.uid
    };

    const docRef = await addDoc(roomsRef, roomData);

    // Добавляем новую комнату в список
    rooms.value.unshift({
      id: docRef.id,
      ...roomData,
      createdAt: new Date(), // Временная метка для отображения
      lastMessage: null
    });

    // Сбрасываем форму
    newRoom.value = {
      name: '',
      description: ''
    };

    showCreateRoomForm.value = false;

    // Переходим в созданную комнату
    router.push(`/chat/${docRef.id}`);
  } catch (error) {
    console.error('Ошибка при создании комнаты:', error);
    alert('Не удалось создать комнату. Пожалуйста, попробуйте снова.');
  } finally {
    isCreatingRoom.value = false;
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
/* Основные стили контейнеров */
.home-container {
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.app-header {
  background-color: #ffffff;
  border-bottom: 1px solid #eaecef;
}

.header-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.main-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
  position: relative;
}

/* Заголовок */
.app-title {
  font-size: 20px;
  font-weight: 500;
  color: #212529;
}

/* Панель пользователя */
.user-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 12px;
  border: none;
  cursor: pointer;
}

.create-button-small {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  color: #4b5563;
}

.create-button-small:hover {
  background-color: #f3f4f6;
}

/* Поиск */
.search-container {
  margin-bottom: 20px;
}

.search-box {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background-color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #9ca3af;
}

/* Карточки комнат */
.room-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.room-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.room-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.room-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0; /* Необходимо для работы truncate */
}

.room-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  flex-shrink: 0;
}

.room-details {
  min-width: 0; /* Необходимо для работы truncate */
}

.room-name {
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
}

.room-last-message {
  color: #6b7280;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.room-time {
  color: #9ca3af;
  font-size: 12px;
  margin-left: 8px;
  white-space: nowrap;
}

/* Пустое состояние */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: #9ca3af;
}

.empty-title {
  font-size: 18px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
}

.empty-subtitle {
  color: #6b7280;
  margin-bottom: 16px;
  font-size: 14px;
}

/* Плавающая кнопка создания */
.create-button-floating {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.create-button-floating:hover {
  background-color: #2563eb;
}

@media (min-width: 768px) {
  .create-button-floating {
    display: none;
  }
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out forwards;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 16px;
  max-width: 480px;
  width: 100%;
  padding: 24px;
  position: relative;
  animation: slideUp 0.3s ease-out forwards;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.close-button {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
}

.close-button:hover {
  color: #6b7280;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* Формы */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 4px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Кнопки */
.button-primary {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button-primary:hover {
  background-color: #2563eb;
}

.button-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.button-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button-secondary:hover {
  background-color: #e5e7eb;
}

/* Иконки */
.icon {
  width: 20px;
  height: 20px;
}

.icon-large {
  width: 32px;
  height: 32px;
}

/* Анимации */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Загрузчик */
.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  margin-bottom: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>