require('dotenv').config();
const Discord = require('discord.js');
const { incomingMessage } = require('./app/controllers/message-controller');

const bot = new Discord.Client();

bot.on('ready', () => {
  bot.user.setActivity("attendre d'afficher des algos").catch(console.error);
  console.log('Bot ready!');
});

bot.on('message', incomingMessage);
bot.login(process.env.TOKEN);
