const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
require('dotenv').config();

// Initialize the Discord client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

// Set up command collection and array for registering with Discord
client.commands = new Collection();
const commands = [];

// Load command files from folder and prepare them for registration
const loadCommands = () => {
    const folders = [
        './music/', 
        './Entertainment/', 
        './Mini-Games/', 
        './Mini-Games/hangman/'
    ];

    for (const folder of folders) {
        if (!fs.existsSync(folder)) {
            console.warn(`⚠️ Skipped missing folder: ${folder}`);
            continue;
        }

        const commandFiles = fs.readdirSync(folder).filter(file => file.endsWith('.js'));

        if (commandFiles.length === 0) {
            console.warn(`⚠️ No commands found in the '${folder}' folder.`);
            continue;
        }

        for (const file of commandFiles) {
            const command = require(`${folder}/${file}`);
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

// Register slash commands globally with Discord's API
const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

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

// Handle slash command interactions
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

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

// When bot is ready, set activity and status
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity('/help', { type: ActivityType.Listening });
    client.user.setStatus('online');
});

// Log in using the bot token
client.login(process.env.DISCORD_TOKEN);