const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.commands = new Collection();
const commands = [];

const loadCommands = () => {
    const folders = [
        'music',
        'Entertainment',
        'Mini-Games',
        'Mini-Games/hangman'
    ];

    for (const folder of folders) {
        const folderPath = path.join(__dirname, folder);
        if (!fs.existsSync(folderPath)) {
            console.warn(`⚠️ Skipped missing folder: ${folder}`);
            continue;
        }

        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        if (commandFiles.length === 0) {
            console.warn(`⚠️ No commands found in the '${folder}' folder.`);
            continue;
        }

        for (const file of commandFiles) {
            const commandPath = path.join(folderPath, file);
            const command = require(commandPath);
            if (command.data && command.data.name) {
                client.commands.set(command.data.name, command);
                commands.push(command.data.toJSON());
                console.log(`Loaded command: ${command.data.name}`);
            } else {
                console.warn(`Skipped '${file}' - missing data or name`);
            }
        }
    }
};

loadCommands();

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Refreshing slash commands...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log('Slash commands registered successfully.');
    } catch (error) {
        console.error('Failed to register commands:', error);
        process.exit(1);
    }
})();

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`Command not found: ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(client, interaction);
    } catch (error) {
        console.error(`Error executing command '${interaction.commandName}':`, error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Der opstod en fejl under kommandoen.', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Der opstod en fejl under kommandoen.', ephemeral: true });
        }
    }
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity('/help', { type: ActivityType.Listening });
    client.user.setStatus('online');
});

client.login(process.env.DISCORD_TOKEN);
