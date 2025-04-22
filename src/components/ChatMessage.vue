<!-- src/components/ChatMessage.vue -->
<template>
  <div class="message" :class="{ 'own-message': isOwnMessage }">
    <div class="message-header">
      <span class="username">{{ message.displayName }}</span>
      <span class="timestamp">{{ formattedTime }}</span>
    </div>
    <div class="message-content">
      {{ message.text }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { auth } from '../firebase/config';

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
});

// Проверяем, является ли сообщение нашим
const isOwnMessage = computed(() => {
  return props.message.uid === auth.currentUser?.uid;
});

// Форматируем время сообщения
const formattedTime = computed(() => {
  if (!props.message.createdAt) return '';

  const date = props.message.createdAt.toDate();
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});
</script>

<style scoped>
.message {
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 80%;
  background-color: #f0f0f0;
}

.own-message {
  background-color: #dcf8c6;
  margin-left: auto;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 0.85rem;
}

.username {
  font-weight: bold;
}

.timestamp {
  color: #888;
}

.message-content {
  word-break: break-word;
}
</style>