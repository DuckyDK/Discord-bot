const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cat')
        .setDescription('Sender et billede af en kat'),

    async execute(client, interaction) {
        try {
            // Dynamic import of node-fetch here
            const fetch = (await import('node-fetch')).default;

            const response = await fetch('https://api.thecatapi.com/v1/images/search');
            const data = await response.json();

            if (!data[0] || !data[0].url) {
                return interaction.reply({ content: 'Kunne ikke hente noget billede lige nu, prøv igen senere.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor('#961bc2')
                .setTitle('🐱   Her er en tilfældig kat')
                .setImage(data[0].url);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching cat image:', error);
            await interaction.reply({ content: 'Noget gik galt, prøv igen senere.', ephemeral: true });
        }
    }
};