const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dog')
        .setDescription('Sender et billede af en hund'),

    async execute(client, interaction) {
        try {
            const fetch = (await import('node-fetch')).default;

            const response = await fetch('https://api.thedogapi.com/v1/images/search');
            const data = await response.json();

            if (!data[0] || !data[0].url) {
                return interaction.reply({ content: 'Kunne ikke hente noget billede lige nu, prøv igen senere.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor('#1E90FF')
                .setTitle('🐶   Her er en tilfældig hund')
                .setImage(data[0].url);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching dog image:', error);
            await interaction.reply({ content: 'Noget gik galt, prøv igen senere.', ephemeral: true });
        }
    }
};