const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Få information om botten'),

    async execute(client, interaction) {
        const aboutEmbed = new EmbedBuilder()
            .setColor('#961bc2')
            .setTitle('Om Botten')
            .setDescription('En dansk bot der startede som en mindre joke\nmen er nu lavet til sjov og underholdning.')
            .addFields(
                { name: '', value: '' },
                { name: '🎮   Mini-Games', value: 'Sjove små spil til at bryde kedsomheden' },
                { name: '', value: '' },
                { name: '🎵   Musik', value: 'Spil musik, juster lyd og hold styr på køen' },
                { name: '', value: '' },
                { name: '🎉   Underholdning', value: 'andre diverse commands' },
                { name: '', value: '' },
                { name: '📎   Links', value: '[Invitér mig](https://discord.com/oauth2/authorize?client_id=608420019147243616&permissions=8&scope=bot%20applications.commands)' },
                { name: '', value: '' }
            )
            .setFooter({ 
                text: `Lavet af DuckyDK  |  Version v1.22`, 
                iconURL: 'https://cdn.discordapp.com/avatars/422112484120592394/246497f693c65a1b41e27f2fa2b25f15.webp?size=80' 
            });

        return interaction.reply({ embeds: [aboutEmbed] });
    }
};