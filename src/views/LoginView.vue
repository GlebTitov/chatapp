```vue
<!-- src/views/LoginView.vue -->
<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>{{ isLogin ? 'Добро пожаловать' : 'Создать аккаунт' }}</h1>
        <p class="subtitle">{{ isLogin ? 'Рады видеть вас снова!' : 'Присоединяйтесь к нашему сообществу' }}</p>
      </div>

      <div v-if="errorMessage" class="error-message">
        <span class="error-icon">!</span>
        {{ errorMessage }}
      </div>

      <div class="form-container">
        <div class="form-group" v-if="!isLogin">
          <label for="displayName">Имя пользователя</label>
          <div class="input-container">
            <span class="input-icon">👤</span>
            <input
                id="displayName"
                v-model="displayName"
                type="text"
                placeholder="Введите ваше имя"
                :class="{ 'input-error': !isLogin && displayNameError }"
                @focus="displayNameError = false"
            />
          </div>
          <span class="error-text" v-if="!isLogin && displayNameError">Укажите имя пользователя</span>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <div class="input-container">
            <span class="input-icon">✉️</span>
            <input
                id="email"
                v-model="email"
                type="email"
                placeholder="your@email.com"
                :class="{ 'input-error': emailError }"
                @focus="emailError = false"
            />
          </div>
          <span class="error-text" v-if="emailError">Введите корректный email</span>
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <div class="input-container">
            <span class="input-icon">🔒</span>
            <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="********"
                :class="{ 'input-error': passwordError }"
                @focus="passwordError = false"
            />
            <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <span class="error-text" v-if="passwordError">Пароль должен содержать минимум 6 символов</span>
        </div>

        <button
            class="login-button"
            @click="submitForm"
            :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>{{ isLogin ? 'Войти' : 'Зарегистрироваться' }}</span>
        </button>

        <div class="social-login">
          <p>или войти через</p>
          <div class="social-buttons">
            <button class="social-button google">G</button>
            <button class="social-button facebook">f</button>
          </div>
        </div>

        <div class="toggle-form">
          <span @click="isLogin = !isLogin">
            {{ isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти' }}
          </span>
        </div>
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
const showPassword = ref(false);

// Состояния ошибок валидации
const emailError = ref(false);
const passwordError = ref(false);
const displayNameError = ref(false);

// Проверка валидности email
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Обработка формы
const submitForm = async () => {
  errorMessage.value = '';
  let hasErrors = false;

  // Валидация полей
  if (!email.value || !validateEmail(email.value)) {
    emailError.value = true;
    hasErrors = true;
  }

  if (!password.value || password.value.length < 6) {
    passwordError.value = true;
    hasErrors = true;
  }

  if (!isLogin.value && !displayName.value) {
    displayNameError.value = true;
    hasErrors = true;
  }

  if (hasErrors) {
    errorMessage.value = 'Пожалуйста, проверьте правильность заполнения полей';
    return;
  }

  try {
    isLoading.value = true;

    if (isLogin.value) {
      // Вход с существующим аккаунтом
      await signInWithEmailAndPassword(auth, email.value, password.value);
    } else {
      // Создание нового аккаунта
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
  background: linear-gradient(135deg, #fb139b, #80d9ff);
  background-size: 400% 400%;
  animation: gradientBG 8s ease infinite;
  padding: 20px;
  position: relative;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.login-card {
  position: relative;
  z-index: 2;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 10px 50px rgba(251, 19, 155, 0.2);
  width: 100%;
  max-width: 450px;
  overflow: hidden;
  transition: all 0.4s ease;
  transform: translateY(0);
  animation: fadeIn 0.5s ease-out;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 60px rgba(251, 19, 155, 0.3);
}

.login-header {
  padding: 35px 35px 0;
  text-align: center;
}

.login-header h1 {
  margin: 0;
  color: #333;
  font-weight: 600;
  font-size: 2rem;
  background: linear-gradient(to right, #fb139b, #80d9ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.5px;
}

.subtitle {
  color: #555;
  margin-top: 10px;
  font-size: 1rem;
}

.form-container {
  padding: 25px 35px 35px;
}

.form-group {
  margin-bottom: 24px;
  position: relative;
}

label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 15px;
  color: #888;
  font-size: 0.9rem;
}

input {
  width: 100%;
  padding: 14px 15px 14px 45px;
  border: 1px solid rgba(128, 217, 255, 0.4);
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

input:focus {
  outline: none;
  border-color: #fb139b;
  box-shadow: 0 4px 15px rgba(251, 19, 155, 0.15);
  background-color: #fff;
}

.input-error {
  border-color: #ff3b5c !important;
  box-shadow: 0 4px 15px rgba(255, 59, 92, 0.1);
}

.error-text {
  color: #ff3b5c;
  font-size: 0.85rem;
  margin-top: 6px;
  display: block;
}

.login-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(to right, #fb139b, #80d9ff);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 5px 15px rgba(251, 19, 155, 0.2);
  letter-spacing: 0.5px;
}

.login-button:hover {
  background: linear-gradient(to right, #e012a0, #6bc8f0);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(251, 19, 155, 0.3);
}

.login-button:active {
  transform: translateY(0);
  box-shadow: 0 3px 10px rgba(251, 19, 155, 0.2);
}

.login-button:disabled {
  background: linear-gradient(to right, #ffa0db, #c2ecff);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.spinner {
  width: 22px;
  height: 22px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

.toggle-form {
  margin-top: 25px;
  text-align: center;
  color: #fb139b;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.3s;
}

.toggle-form:hover {
  color: #80d9ff;
  text-decoration: underline;
}

.error-message {
  background-color: rgba(255, 59, 92, 0.1);
  color: #ff3b5c;
  padding: 15px;
  border-radius: 10px;
  margin: 20px 35px 5px;
  display: flex;
  align-items: center;
  font-size: 0.95rem;
  border: 1px solid rgba(255, 59, 92, 0.15);
}

.error-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 25px;
  height: 25px;
  background-color: #ff3b5c;
  color: white;
  border-radius: 50%;
  margin-right: 12px;
  font-weight: bold;
}

.social-login {
  margin-top: 30px;
  text-align: center;
}

.social-login p {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 18px;
  position: relative;
}

.social-login p::before,
.social-login p::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 35%;
  height: 1px;
  background: linear-gradient(to right, rgba(251, 19, 155, 0.1), rgba(251, 19, 155, 0.5));
}

.social-login p::before {
  left: 0;
}

.social-login p::after {
  right: 0;
  background: linear-gradient(to left, rgba(128, 217, 255, 0.1), rgba(128, 217, 255, 0.5));
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.social-button {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 1px solid rgba(128, 217, 255, 0.3);
  background-color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1.1rem;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

.social-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  border-color: #80d9ff;
}

.google {
  color: #DB4437;
}

.facebook {
  color: #4267B2;
}

.toggle-password {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  position: absolute;
  right: 12px;
  color: #777;
  transition: color 0.3s;
}

.toggle-password:hover {
  color: #fb139b;
}

/* Animations */
@keyframes gradientBG {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .login-card {
    border-radius: 14px;
  }

  .login-header h1 {
    font-size: 1.7rem;
  }

  .form-container {
    padding: 20px 25px 30px;
  }

  input {
    padding: 12px 12px 12px 40px;
  }

  .login-button {
    padding: 14px;
  }
}
</style>
