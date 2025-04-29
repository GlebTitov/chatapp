<!-- src/components/ChatRoom.vue -->
<template>
  <div class="chat-room">
    <!-- Контейнер сообщений -->
    <div class="messages-container" ref="messagesContainer">
      <div v-if="messages.length === 0" class="no-messages">
        <div class="empty-chat">
          <div class="empty-icon">
            <svg class="icon-large" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p class="empty-title">Нет сообщений</p>
          <p class="empty-text">Будьте первым, кто начнет общение в этом чате!</p>
        </div>
      </div>

      <div v-else class="messages-list">
        <!-- День сообщений -->
        <div class="message-day">
          <div class="day-divider">
            <span class="day-text">Сегодня</span>
          </div>

          <!-- Сообщения -->
          <chat-message
              v-for="(message, index) in messages"
              :key="message.id"
              :message="message"
              :showAvatar="shouldShowAvatar(message, index)"
          />
        </div>
      </div>
    </div>

    <!-- Форма отправки сообщения -->
    <div class="message-form">
      <button class="form-button" title="Прикрепить файл">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </button>

      <div class="input-container">
        <input
            v-model="newMessage"
            type="text"
            class="message-input"
            placeholder="Сообщение..."
            @keyup.enter="sendMessage"
        />
      </div>

      <button
          class="send-button"
          :class="{ 'active': newMessage.trim() }"
          @click="sendMessage"
          :disabled="!newMessage.trim()"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import ChatMessage from './ChatMessage.vue';

const props = defineProps({
  roomId: {
    type: String,
    required: true
  }
});

const messages = ref([]);
const newMessage = ref('');
const messagesContainer = ref(null);

// Функция для определения, нужно ли показывать аватар
// (скрываем аватары для последовательных сообщений от одного пользователя)
const shouldShowAvatar = (message, index) => {
  // Всегда показываем для первого сообщения
  if (index === 0) return true;

  // Получаем предыдущее сообщение
  const prevMessage = messages.value[index - 1];

  // Если отправитель отличается от предыдущего, показываем аватар
  return message.uid !== prevMessage.uid;
};

// Подписываемся на обновления сообщений из Firestore
onMounted(() => {
  const messagesRef = collection(db, 'rooms', props.roomId, 'messages');
  const messagesQuery = query(messagesRef, orderBy('createdAt'));

  const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        messages.value.push({
          id: change.doc.id,
          ...change.doc.data()
        });
      }
    });

    // Прокручиваем к последнему сообщению
    scrollToBottom();
  });

  // Отписываемся при размонтировании компонента
  return unsubscribe;
});

// Отправка нового сообщения
const sendMessage = async () => {
  if (!newMessage.value.trim() || !auth.currentUser) return;

  try {
    const messagesRef = collection(db, 'rooms', props.roomId, 'messages');
    await addDoc(messagesRef, {
      text: newMessage.value.trim(),
      createdAt: serverTimestamp(),
      uid: auth.currentUser.uid,
      displayName: auth.currentUser.displayName || 'Анонимный пользователь',
      photoURL: auth.currentUser.photoURL || null
    });

    newMessage.value = '';
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
  }
};

// Автоматическая прокрутка вниз при новых сообщениях
const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// Наблюдаем за изменениями в списке сообщений
watch(messages, () => {
  scrollToBottom();
});
</script>

<style scoped>
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
}

/* Контейнер сообщений */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.messages-list {
  display: flex;
  flex-direction: column;
  max-width: 880px;
  width: 100%;
  margin: 0 auto;
}

/* Пустое состояние */
.no-messages {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.empty-chat {
  text-align: center;
  max-width: 300px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto;
  background-color: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  margin-bottom: 16px;
}

.empty-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.empty-text {
  color: #6b7280;
  font-size: 14px;
}

/* Группировка сообщений по дням */
.message-day {
  margin-bottom: 16px;
}

.day-divider {
  text-align: center;
  position: relative;
  margin: 20px 0;
}

.day-divider::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background-color: #e5e7eb;
  z-index: 1;
}

.day-text {
  background-color: #f8f9fa;
  padding: 0 12px;
  font-size: 12px;
  color: #6b7280;
  position: relative;
  z-index: 2;
}

/* Форма отправки сообщения */
.message-form {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #ffffff;
  border-top: 1px solid #eaecef;
}

.input-container {
  flex: 1;
  position: relative;
}

.message-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  background-color: #f3f4f6;
}

.message-input:focus {
  border-color: #3b82f6;
  background-color: #ffffff;
}

.form-button {
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  margin-right: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.form-button:hover {
  background-color: #f3f4f6;
  color: #4b5563;
}

.send-button {
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  margin-left: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.send-button.active {
  color: #3b82f6;
}

.send-button.active:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

.send-button:disabled {
  cursor: default;
  color: #d1d5db;
}

.icon {
  width: 20px;
  height: 20px;
}

.icon-large {
  width: 32px;
  height: 32px;
}
</style>