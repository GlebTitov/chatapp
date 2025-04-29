// src/firebase/roomService.js
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import { db, auth } from './config';

/**
 * Создает новую комнату в Firebase Firestore
 * @param {string} name - Название комнаты
 * @param {string} description - Описание комнаты (опционально)
 * @returns {Promise<string>} - ID созданной комнаты
 */
export const createRoom = async (name, description = '') => {
    if (!auth.currentUser) {
        throw new Error('Пользователь не авторизован');
    }

    try {
        const roomData = {
            name,
            description,
            createdAt: serverTimestamp(),
            createdBy: auth.currentUser.uid,
            creatorName: auth.currentUser.displayName || 'Анонимный пользователь',
            members: [auth.currentUser.uid]
        };

        const roomRef = await addDoc(collection(db, 'rooms'), roomData);
        console.log('Комната успешно создана с ID:', roomRef.id);
        return roomRef.id;
    } catch (error) {
        console.error('Ошибка при создании комнаты:', error);
        throw error;
    }
};

/**
 * Получает список всех комнат
 * @returns {Promise<Array>} - Массив комнат
 */
export const getRooms = async () => {
    try {
        const roomsRef = collection(db, 'rooms');
        const q = query(roomsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Ошибка при получении списка комнат:', error);
        throw error;
    }
};