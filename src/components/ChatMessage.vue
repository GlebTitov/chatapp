<!-- src/components/ChatMessage.vue -->
<template>
  <div
      class="message-container"
      :class="{ 'own-message': isOwnMessage, 'with-avatar': showAvatar }"
  >
    <!-- Аватар отправителя (для чужих сообщений) -->
    <div v-if="!isOwnMessage && showAvatar" class="avatar-container">
      <div
          class="message-avatar"
          :style="`background-color: ${getAvatarColor(message.displayName)}`"
      >
        {{ getUserInitials(message.displayName) }}
      </div>
    </div>

    <!-- Пустое место для выравнивания (для своих сообщений) -->
    <div v-if="isOwnMessage" class="avatar-placeholder"></div>

    <!-- Содержимое сообщения -->
    <div class="message-content-wrapper">
      <!-- Имя отправителя - показываем только для чужих сообщений и только если нужен аватар -->
      <div v-if="!isOwnMessage && showAvatar" class="sender-name">
        {{ message.displayName }}
      </div>

      <div
          class="message-content"
          :class="{ 'own': isOwnMessage }"
      >
        <div class="message-text">{{ message.text }}</div>
        <div class="message-time">{{ formattedTime }}</div>
      </div>
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
  },
  showAvatar: {
    type: Boolean,
    default: true
  }
});

// Проверяем, является ли сообщение нашим
const isOwnMessage = computed(() => {
  return props.message.uid === auth.currentUser?.uid;
});

// Форматируем время сообщения
const formattedTime = computed(() => {
  if (!props.message.createdAt) return '';

  try {
    const date = props.message.createdAt.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
});

// Получение инициалов пользователя
const getUserInitials = (name) => {
  if (!name) return '?';

  const parts = name.split(' ');
  if (parts.length === 1) return name.charAt(0).toUpperCase();

  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
};

// Генерация цвета аватара на основе имени
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
</script>

<style scoped>
.message-container {
  display: flex;
  margin-bottom: 2px;
  position: relative;
  padding: 2px 0;
}

/* Создаем больший отступ для сообщений с аватаром */
.message-container.with-avatar {
  margin-top: 16px;
}

/* Стили для своих сообщений */
.message-container.own-message {
  justify-content: flex-end;
}

/* Аватар */
.avatar-container {
  width: 38px;
  flex-shrink: 0;
  align-self: flex-end;
  margin-right: 8px;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-size: 12px;
}

.avatar-placeholder {
  width: 38px;
  flex-shrink: 0;
}

/* Основное содержимое сообщения */
.message-content-wrapper {
  max-width: 65%;
  display: flex;
  flex-direction: column;
}

.sender-name {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 4px;
  padding-left: 12px;
}

.message-content {
  position: relative;
  background-color: #f3f4f6;
  border-radius: 18px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
}

/* Стилизация своих сообщений */
.message-content.own {
  background-color: #dbeafe;
  color: #1e40af;
}

.message-text {
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}

.message-time {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
  align-self: flex-end;
}

.message-content.own .message-time {
  color: #60a5fa;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 640px) {
  .message-content-wrapper {
    max-width: 80%;
  }

  .avatar-container, .avatar-placeholder {
    width: 32px;
  }

  .message-avatar {
    width: 28px;
    height: 28px;
    font-size: 10px;
  }
}
</style>