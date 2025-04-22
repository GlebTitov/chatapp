<!-- src/views/LoginView.vue -->
<template>
  <div class="login-container">
    <div class="login-form">
      <h1>{{ isLogin ? 'Вход' : 'Регистрация' }}</h1>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="form-group" v-if="!isLogin">
        <label for="displayName">Имя пользователя</label>
        <input
            id="displayName"
            v-model="displayName"
            type="text"
            placeholder="Ваше имя"
        />
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input
            id="email"
            v-model="email"
            type="email"
            placeholder="your@email.com"
        />
      </div>

      <div class="form-group">
        <label for="password">Пароль</label>
        <input
            id="password"
            v-model="password"
            type="password"
            placeholder="********"
        />
      </div>

      <button
          class="login-button"
          @click="submitForm"
          :disabled="isLoading"
      >
        {{ isLogin ? 'Войти' : 'Зарегистрироваться' }}
      </button>

      <div class="toggle-form">
        <span @click="isLogin = !isLogin">
          {{ isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase/config';

const router = useRouter();

// Состояния формы
const isLogin = ref(true);
const email = ref('');
const password = ref('');
const displayName = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

// Обработка формы
const submitForm = async () => {
  errorMessage.value = '';

  if (!email.value || !password.value) {
    errorMessage.value = 'Пожалуйста, заполните все поля';
    return;
  }

  try {
    isLoading.value = true;

    if (isLogin.value) {
      // Вход с существующим аккаунтом
      await signInWithEmailAndPassword(auth, email.value, password.value);
    } else {
      // Создание нового аккаунта
      if (!displayName.value) {
        errorMessage.value = 'Пожалуйста, укажите имя пользователя';
        isLoading.value = false;
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.value,
          password.value
      );

      // Обновляем профиль пользователя с указанным именем
      await updateProfile(userCredential.user, {
        displayName: displayName.value
      });
    }

    // Переходим на главную страницу после успешного входа/регистрации
    router.push('/');
  } catch (error) {
    console.error('Ошибка аутентификации:', error);

    // Обработка разных типов ошибок
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage.value = 'Неверный email или пароль';
        break;
      case 'auth/email-already-in-use':
        errorMessage.value = 'Этот email уже зарегистрирован';
        break;
      case 'auth/weak-password':
        errorMessage.value = 'Пароль должен содержать минимум 6 символов';
        break;
      case 'auth/invalid-email':
        errorMessage.value = 'Некорректный email адрес';
        break;
      default:
        errorMessage.value = 'Произошла ошибка. Попробуйте позже.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-form {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #555;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 8px;
}

.login-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.toggle-form {
  margin-top: 16px;
  text-align: center;
  color: #4caf50;
  cursor: pointer;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 16px;
}
</style>