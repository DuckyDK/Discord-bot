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
        'Mini-Games/hangman',
    ];

    for (const folder of folders) {
        const folderPath = path.join(__dirname, folder);
        if (!fs.existsSync(folderPath)) {
            continue;
        }

        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const commandPath = path.join(folderPath, file);
            const command = require(commandPath);
            if (command.data && command.data.name) {
                client.commands.set(command.data.name, command);
                commands.push(command.data.toJSON());
                console.log(`✅ Loaded command: ${file}`);
            }
        }
    }
};

loadCommands();

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('⏳ Fetching existing global commands...');
        const existingCommands = await rest.get(
            Routes.applicationCommands(process.env.CLIENT_ID)
        );

        const existingCommandNames = existingCommands.map(cmd => cmd.name);
        const currentCommandNames = commands.map(cmd => cmd.name);

        for (const cmd of existingCommands) {
            if (!currentCommandNames.includes(cmd.name)) {
                await rest.delete(
                    Routes.applicationCommand(process.env.CLIENT_ID, cmd.id)
                );
                console.log(`🗑️ Deleted old command: ${cmd.name}`);
            }
        }

        console.log('⏳ Registering/updating current global commands...');
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
        console.log('✅ Slash commands registered/updated successfully.');

        await client.login(process.env.DISCORD_TOKEN);

    } catch (error) {
        console.error('❌ Failed to register slash commands:', error);
        process.exit(1);
    }
})();

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(client, interaction);
    } catch (error) {
        console.error(`💥 Error executing command '${interaction.commandName}':`, error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: '❗ Der opstod en fejl under kommandoen.', ephemeral: true });
        } else {
            await interaction.reply({ content: '❗ Der opstod en fejl under kommandoen.', ephemeral: true });
        }
    }
});

client.once('ready', () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);
    client.user.setActivity('/help', { type: ActivityType.Listening });
    client.user.setStatus('online');
});
