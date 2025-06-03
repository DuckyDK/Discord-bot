const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { games } = require('./hangman');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guess')
        .setDescription('Gæt på et bogstav i hangman')
        .addStringOption(option =>
            option.setName('bogstav')
                .setDescription('Bogstavet du vil gætte på')
                .setRequired(true)
        ),

    async execute(client, interaction) {
        const letter = interaction.options.getString('bogstav').toLowerCase();
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

        if (letter.length !== 1 || !/^[a-zæøå]$/.test(letter)) {
            return interaction.reply({ content: 'Du skal skrive ét bogstav (a-å).', ephemeral: true });
        }

        if (game.attempts.includes(letter)) {
            return interaction.reply({ content: `Du har allerede gættet på \`${letter}\`.`, ephemeral: true });
        }

        game.attempts.push(letter);

        let correctGuess = false;

        for (let i = 0; i < game.word.length; i++) {
            if (game.word[i].toLowerCase() === letter) {
                game.masked[i] = game.word[i];
                correctGuess = true;
            }
        }

        if (!correctGuess) {
            game.remaining--;
        }

        const maskedDisplay = game.masked.join(' ');

        const embed = new EmbedBuilder()
            .setColor(correctGuess ? '#00ff00' : '#ff0000')
            .setTitle('🎯   Hangman opdateret')
            .setDescription(`**Ord:** \`${maskedDisplay}\`\n**Gættede bogstaver:** ${game.attempts.join(', ')}\n**Tilbageværende forsøg:** ${game.remaining}`)
            .setFooter({ text: correctGuess ? 'Godt gættet!' : 'Forkert gæt!', iconURL: interaction.user.displayAvatarURL() });

        let gameOver = false;
        if (!game.masked.includes('_')) {
            embed.setTitle('🎉   Du har vundet!')
                .setDescription(`**Ordet var:** \`${game.word}\``)
                .setColor('#ffd700');
            gameOver = true;
        } else if (game.remaining <= 0) {
            embed.setTitle('💀   Du tabte')
                .setDescription(`**Ordet var:** \`${game.word}\``)
                .setColor('#000000');
            gameOver = true;
        }

        if (game.lastMessageId) {
            try {
                const oldMessage = await interaction.channel.messages.fetch(game.lastMessageId);
                if (oldMessage) await oldMessage.delete();
            } catch (err) {
                console.warn('Kunne ikke slette tidligere besked:', err.message);
            }
        }

        const reply = await interaction.reply({ embeds: [embed], fetchReply: true });
        game.lastMessageId = reply.id;

        if (gameOver) {
            games.delete(gameKey);
        }
    }
};