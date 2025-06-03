const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { games } = require('./hangman');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guessword')
        .setDescription('Gæt hele ordet i hangman')
        .addStringOption(option =>
            option.setName('ord')
                .setDescription('Ordet du vil gætte på')
                .setRequired(true)
        ),

    async execute(client, interaction) {
        const guessedWord = interaction.options.getString('ord').toLowerCase();
        const userId = interaction.user.id;
        const channelId = interaction.channel.id;

        const possibleKeys = [
            `${channelId}-global`,
            `${channelId}-${userId}`
        ];

        let gameKey;
        let game;

        for (const key of possibleKeys) {
            if (games && games.has(key)) {
                gameKey = key;
                game = games.get(key);
                break;
            }
        }

        if (!game) {
            return interaction.reply({ content: 'Der er ikke noget aktivt hangman-spil i denne kanal eller for dig.', ephemeral: true });
        }

        const embed = new EmbedBuilder().setFooter({ text: `Gættet af ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

        if (guessedWord === game.word) {
            games.delete(gameKey);
            embed.setTitle('🎉   Du har gættet ordet korrekt!')
                .setDescription(`**Ordet var:** \`${game.word}\``)
                .setColor('#00ff00');
        } else {
            game.remaining--;

            if (game.remaining <= 0) {
                games.delete(gameKey);
                embed.setTitle('💀   Du tabte')
                    .setDescription(`**Ordet var:** \`${game.word}\``)
                    .setColor('#000000');
            } else {
                embed.setTitle('❌   Forkert gæt!')
                    .setDescription(`**Du gættede:** \`${guessedWord}\`**Tilbageværende forsøg:** ${game.remaining}`)
                    .setColor('#ff0000');
            }
        }

        return interaction.reply({ embeds: [embed] });
    }
};
