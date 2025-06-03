const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Spil sten, saks, papir mod botten')
        .addStringOption(option =>
            option.setName('valg')
                .setDescription('Dit valg: sten, saks, eller papir')
                .setRequired(true)
                .addChoices(
                    { name: 'Sten', value: 'sten' },
                    { name: 'Saks', value: 'saks' },
                    { name: 'Papir', value: 'papir' }
                )
        ),

    async execute(client, interaction) {
        const userChoice = interaction.options.getString('valg');
        const choices = ['sten', 'saks', 'papir'];
        const botChoice = choices[Math.floor(Math.random() * choices.length)];

        const winMap = {
            sten: 'saks',
            saks: 'papir',
            papir: 'sten'
        };

        let result;
        if (userChoice === botChoice) {
            result = 'Det blev uafgjort! 🤝';
        } else if (winMap[userChoice] === botChoice) {
            result = 'Du vandt! 🎉';
        } else {
            result = 'Jeg vandt! 😎';
        }

        const embed = new EmbedBuilder()
            .setColor('#961bc2')
            .setTitle('✊ 🤚 ✌️ Sten Saks Papir')
            .addFields(
                { name: 'Dit valg', value: userChoice, inline: true },
                { name: 'Mit valg', value: botChoice, inline: true },
                { name: 'Resultat', value: result }
            );

        await interaction.reply({ embeds: [embed] });
    }
};