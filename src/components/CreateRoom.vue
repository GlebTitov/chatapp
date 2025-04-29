<!-- src/components/CreateRoom.vue -->
<template>
  <div class="create-room">
    <h2>Создать новую комнату</h2>

    <form @submit.prevent="handleCreateRoom">
      <div class="form-group">
        <label for="roomName">Название комнаты</label>
        <input
            type="text"
            id="roomName"
            v-model="roomName"
            required
            placeholder="Введите название комнаты"
        />
      </div>

      <div class="form-group">
        <label for="roomDescription">Описание (необязательно)</label>
        <textarea
            id="roomDescription"
            v-model="roomDescription"
            placeholder="Введите описание комнаты"
        ></textarea>
      </div>

      <div v-if="error" class="error">{{ error }}</div>

      <div class="form-actions">
        <button type="button" @click="$router.push('/')" class="cancel-btn">Отмена</button>
        <button type="submit" class="create-btn" :disabled="isCreating || !roomName.trim()">
          {{ isCreating ? 'Создание...' : 'Создать комнату' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createRoom } from '../firebase/roomService';

const router = useRouter();
const roomName = ref('');
const roomDescription = ref('');
const error = ref('');
const isCreating = ref(false);

const handleCreateRoom = async () => {
  if (!roomName.value.trim()) return;

  error.value = '';
  isCreating.value = true;

  try {
    const roomId = await createRoom(roomName.value, roomDescription.value);
    console.log('Комната создана успешно, ID:', roomId);

    router.push(`/chat/${roomId}`);
  } catch (err) {
    error.value = 'Ошибка при создании комнаты: ' + err.message;
    console.error(err);
  } finally {
    isCreating.value = false;
  }
};
</script>

<style scoped>
.create-room {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

input, textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

textarea {
  height: 100px;
  resize: vertical;
}

.error {
  color: #d32f2f;
  margin: 10px 0;
  padding: 8px;
  background-color: #ffebee;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

button {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #555;
  border: 1px solid #ddd;
}

.create-btn {
  background-color: #4caf50;
  color: white;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>