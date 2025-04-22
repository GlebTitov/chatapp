<!-- src/components/ChatRoom.vue -->
<template>
  <div class="chat-room">
    <div class="messages-container" ref="messagesContainer">
      <div v-if="messages.length === 0" class="no-messages">
        Нет сообщений. Будьте первым!
      </div>
      <chat-message
          v-for="message in messages"
          :key="message.id"
          :message="message"
      />
    </div>

    <div class="message-form">
      <input
          v-model="newMessage"
          type="text"
          placeholder="Введите сообщение..."
          @keyup.enter="sendMessage"
      />
      <button @click="sendMessage" :disabled="!newMessage.trim()">
        Отправить
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
      text: newMessage.value,
      createdAt: serverTimestamp(),
      uid: auth.currentUser.uid,
      displayName: auth.currentUser.displayName || 'Анонимный пользователь'
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
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.no-messages {
  text-align: center;
  color: #888;
  margin-top: 20px;
}

.message-form {
  display: flex;
  padding: 12px;
  border-top: 1px solid #e0e0e0;
  background-color: white;
}

input {
  flex: 1;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 8px 16px;
  margin-right: 8px;
  outline: none;
}

button {
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>