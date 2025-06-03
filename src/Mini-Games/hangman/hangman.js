const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const words = require('./hangmanwords');

const games = new Map();

module.exports = {
    games,
    data: new SlashCommandBuilder()
        .setName('hangman')
        .setDescription('Start et spil hangman')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Vælg mellem singleplayer eller multiplayer')
                .setRequired(true)
                .addChoices(
                    { name: 'singleplayer', value: 'single' },
                    { name: 'multiplayer', value: 'multi' }
                )
        ),

    async execute(client, interaction) {
        const mode = interaction.options.getString('mode');
        const userId = interaction.user.id;
        const channelId = interaction.channel.id;
        const gameKey = `${channelId}-${mode === 'multi' ? 'global' : userId}`;

        if (games.has(gameKey)) {
            return interaction.reply({ content: 'Et spil er allerede i gang!' });
        }

        const word = words[Math.floor(Math.random() * words.length)].toLowerCase();
        const maskedArray = word.split('').map(char => (char === ' ' ? ' ' : '_'));
        const maskedDisplay = maskedArray.join(' ');

        const attempts = [];
        const maxTries = 10;

        games.set(gameKey, {
            word,
            masked: maskedArray,
            attempts,
            remaining: maxTries,
            mode,
            initiator: interaction.user,
            lastMessageId: null
        });

        const embed = new EmbedBuilder()
            .setColor('#961bc2')
            .setTitle('🎯   Hangman er startet')
            .setDescription(`**Mode:** ${mode === 'multi' ? 'Multiplayer' : 'Singleplayer'}\n**Ord:** \`${maskedDisplay}\`\n**Gæt ved at skrive /guess <bogstav>**\n**Eller gæt hele ordet med /guessword**`)
            .setFooter({ text: 'Held og lykke!', iconURL: interaction.user.displayAvatarURL() });

        const reply = await interaction.reply({ embeds: [embed], fetchReply: true });

        games.get(gameKey).lastMessageId = reply.id;
    }
};