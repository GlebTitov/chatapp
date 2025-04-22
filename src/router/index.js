// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '../firebase/config';
import HomeView from '../views/HomeView.vue';
import ChatView from '../views/ChatView.vue';
import LoginView from '../views/LoginView.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomeView,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/chat/:id',
        name: 'Chat',
        component: ChatView,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginView
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Защита маршрутов (требуется авторизация)
router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const isAuthenticated = auth.currentUser;

    if (requiresAuth && !isAuthenticated) {
        next('/login');
    } else {
        next();
    }
});

export default router;