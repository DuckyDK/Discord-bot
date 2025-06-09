const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Viser en liste over alle commands')
        .addIntegerOption(option =>
            option.setName('side')
                .setDescription('Vælg hvilken side du vil se (side 1-3)')
                .setRequired(true)
        ),

    async execute(client, interaction) {
        const page = interaction.options.getInteger('side') || 1;

        let helpEmbed;

        if (page === 1) {
            helpEmbed = new EmbedBuilder()
                .setColor('#961bc2')
                .setTitle('🎶   Musik Commands')
                .setDescription('Liste over musik commands:')
                .addFields(
                    { name: '/help', value: 'Viser den her liste over commands' },
                    { name: '', value: '' },
                    { name: '/play', value: 'Afspiller en sang' },
                    { name: '', value: '' },
                    { name: '/stop', value: 'Stopper sangen og leaver voice kanalen' },
                    { name: '', value: '' },
                    { name: '/skip', value: 'Springer den nuværende sang over' },
                    { name: '', value: '' },
                    { name: '/queue', value: 'Tilføjer en sang til køen' },
                    { name: '', value: '' },
                    { name: '/volume', value: 'Ændrer lydstyrken på det der bliver afspillet' },
                    { name: '', value: '' },
                    { name: '/pause', value: 'Pauser den nuværende sang' },
                    { name: '', value: '' },
                    { name: '/resume', value: 'Fortsætter den pausede sang' },
                    { name: '', value: '' }
                )
                .setFooter({ text: 'Lavet af DuckyDK - Side 1/3', iconURL: 'https://cdn.discordapp.com/avatars/422112484120592394/246497f693c65a1b41e27f2fa2b25f15.webp?size=80' });

        } else if (page === 2) {
            helpEmbed = new EmbedBuilder()
                .setColor('#961bc2')
                .setTitle('🎉   Underholdnings Commands')
                .setDescription('Liste over underholdnings commands:')
                .addFields(
                    { name: '/cat', value: 'Sender et billede af en kat' },
                    { name: '', value: '' },
                    { name: '/dog', value: 'Sender et billede af en hund' },
                    { name: '', value: '' },
                    { name: '/bonk', value: 'Bonk en person over hovedet' },
                    { name: '', value: '' },
                    { name: '/meme', value: 'Sender en tilfældig meme' },
                    { name: '', value: '' }
                )
                .setFooter({ text: 'Lavet af DuckyDK - Side 2/3', iconURL: 'https://cdn.discordapp.com/avatars/422112484120592394/246497f693c65a1b41e27f2fa2b25f15.webp?size=80' });

        } else if (page === 3) {
            helpEmbed = new EmbedBuilder()
                .setColor('#961bc2')
                .setTitle('🕹️   Mini-Games Commands')
                .setDescription('Liste over mini-game commands:')
                .addFields(
                    { name: '/rps', value: 'Spil sten-saks-papir mod botten' },
                    { name: '', value: '' },
                    { name: '/hangman', value: 'Start et spil hangman\n  ' },
                    { name: '/guessword', value: 'Gæt på hele ordet i hangman\n  ' },
                    { name: '/guess', value: 'Gæt på et bogstav i hangman' },
                    { name: '', value: '' }
                )
                .setFooter({ text: 'Lavet af DuckyDK - Side 3/3', iconURL: 'https://cdn.discordapp.com/avatars/422112484120592394/246497f693c65a1b41e27f2fa2b25f15.webp?size=80' });
        } else {
            return interaction.reply({ content: "Den side findes ikke. Vælg en side mellem 1 og 3.", ephemeral: true });
        }

        return interaction.reply({ embeds: [helpEmbed] });
    }
};