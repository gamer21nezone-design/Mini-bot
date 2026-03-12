const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const client = new Client({
  authStrategy: new LocalAuth()
});

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const commands = new Map();

commandFiles.forEach(file => {
  const command = require(path.join(commandsPath, file));
  commands.set(command.name, command);
});

console.log(`✅ Loaded ${commands.size} commands`);

// QR Code generation
client.on('qr', qr => {
  console.log('📱 Scan this QR code with your WhatsApp:');
  qrcode.generate(qr, { small: true });
});

// Client ready
client.on('ready', () => {
  console.log('✅ Bot is ready!');
});

// Message handler
client.on('message', async message => {
  const prefix = '.';
  if (!message.body.startsWith(prefix)) return;

  const args = message.body.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!commands.has(commandName)) {
    return message.reply('❌ Command not found!');
  }

  try {
    const command = commands.get(commandName);
    await command.execute(message, args, client);
  } catch (error) {
    console.error(error);
    message.reply('⚠️ Error executing command!');
  }
});

// Error handler
client.on('error', error => {
  console.error('❌ Client error:', error);
});

client.initialize();