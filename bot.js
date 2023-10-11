const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
// Reemplaza 'tu_token_aqui' con el token proporcionado por BotFather
const token = '';



//const token = 'TU_TOKEN'; // Reemplazar con el token de tu bot
const jsonDriveURL = ''; // Reemplazar con la URL de tu archivo JSON en Google Drive

const bot = new TelegramBot(token, { polling: true });

async function showMainMenu(chatId) {
    const keyboard = {
        reply_markup: {
            keyboard: [
                [{ text: 'Fecha Actual' }, { text: 'Hora en Canarias' }],
                [{ text: 'Saludar: Hola' }, { text: 'Saludar: Adiós' }],
                [{ text: 'Volver al Menú Principal' }]
            ],
            resize_keyboard: true
        }
    };
    await bot.sendMessage(chatId, 'Elige una opción:', keyboard);
}

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username;
    try {
        const response = await axios.get(jsonDriveURL);
        const usuarios = response.data.usuarios;
        const usuario = usuarios.find(u => u.userTelegram === username);
        if (usuario && usuario.activo) {
            // Usuario autorizado y activo, mostrar los botones del menú principal
            await showMainMenu(chatId);
        } else {
            // Usuario no autorizado o inactivo, enviar mensaje de error
            await bot.sendMessage(chatId, 'Lo siento, no estás registrado o no estás activo para usar este bot.');
        }
    } catch (error) {
        console.error(error);
        // Error al obtener datos del archivo JSON, enviar mensaje de error
        await bot.sendMessage(chatId, 'Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.');
    }
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;
    if (messageText != '/start') {
        if (messageText === 'Fecha Actual') {
            const currentHour = new Date().toLocaleDateString();
            await bot.sendMessage(chatId, `La fecha actual es: ${currentHour}`);
        } else if (messageText === 'Hora en Canarias') {
            const canariasHour = new Date().toLocaleTimeString('en-GB', { timeZone: 'Atlantic/Canary' });
            await bot.sendMessage(chatId, `La hora en Canarias es: ${canariasHour}`);
        } else if (messageText === 'Saludar: Hola') {
            await bot.sendMessage(chatId, '¡Hola!');
        } else if (messageText === 'Saludar: Adiós') {
            await bot.sendMessage(chatId, '¡Adiós!');
        } else if (messageText === 'Volver al Menú Principal') {
            // Volver al menú principal
            await showMainMenu(chatId);
        } else {
            // Mensaje no reconocido, responder con un mensaje de error
            await bot.sendMessage(chatId, 'Lo siento, no entiendo ese comando. Por favor, elige una opción del menú.');
            // Mostrar el menú principal después del mensaje de error
            await showMainMenu(chatId);
        }
    }

});

console.log('Bot en funcionamiento...');