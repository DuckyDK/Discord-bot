const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Viser en liste over alle commands'),

    async execute(client, interaction) {
        const helpEmbed = new EmbedBuilder()
            .setColor('#961bc2')
            .setTitle('🎶   Music bot - commands')
            .setDescription('Liste over alle commands:')
            .addFields(
                { name: '/help', value: 'Viser den her liste over commands'},
                { name: '', value: ''},
                { name: '/play', value: 'Afspiller en sang'},
                { name: '', value: ''},
                { name: '/stop', value: 'Stopper sangen og leaver voice kanalen'},
                { name: '', value: ''},
                { name: '/skip', value: 'Spring den nuværende sang over'},
                { name: '', value: ''},
                { name: '/queue', value: 'Tilføj en sang til køen'},
                { name: '', value: ''},
                { name: '/volume', value: 'Ændre lydsstyrken på det der bliver afspillet'},
            )
            .setFooter({ text: 'Lavet af DuckyDK', iconURL: 'https://cdn.discordapp.com/avatars/422112484120592394/3bfa9c975ad10c50aafd7fe504f9b8b5.webp?size=40'});

        return interaction.reply({ embeds: [helpEmbed] });
    }
};