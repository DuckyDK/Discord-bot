const { SlashCommandBuilder, EmbedBuilder, User } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bonk')
        .setDescription('Bonk en valgfri person over hovedet')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('hvem skal bonkes?')
                .setRequired(true)
        ),

    async execute(client, interaction) {
        const target = interaction.options.getUser('target');

        const bonkTitles = [
            'BONK! Afsted til horny jail! 🚓',
            'BAM! Det var en bonk! 🔨',
            'Du er bonket! Tid til at køle ned! ❄️',
            'Bonk! Sjovpolitiet er på vej! 🚓',
            'Det var en stor bonk! Pas på! ⚠️',
            'Bonk! Ikke mere uartigt! 🚫',
            'Bonk bonk! Slap lige af! 🧊',
            'Smæk! Du er bonket! 👊',
            'Bonk alarm! Hold det pænt! 📢',
            'Thwack! Afsted til horny jail! 🚓',
            'Bonk! Den opførsel går ikke! 🦅',
            'Tid til en bonk-timeout! ⏲️',
            'Bonket! Hold dig i skinnet! 🎯',
            'Whap! Bonken er leveret! 📦',
            'Bonk! Du er advaret! ⚡',
        ];

        const randomTitle = bonkTitles[Math.floor(Math.random() * bonkTitles.length)];

        const embed = new EmbedBuilder()
            .setColor('#961bc2')
            .setTitle(randomTitle)
            .setDescription(`${target} du er lige blevet bonket!`);

        await interaction.reply({ embeds: [embed] });
    }
};