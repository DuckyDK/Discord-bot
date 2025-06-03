const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stopper sangen og leaver voice kanalen'),

    async execute(client, interaction) {
        const channel = interaction.member?.voice?.channel;

        if (!channel) {
            return interaction.reply({
                content: "Du er ikk i en voice kanal!",
                flags: 64,
            });
        }

        const guildid = interaction.guild.id;
        const playerData = client.players?.get(guildid);

        if (!playerData || !playerData.player) {
            return interaction.reply({
                content: "Der er ikke nogen aktiv sang!",
                flags: 64,
            });
        }

        playerData.player.stop();

        if (playerData.connection) playerData.connection.destroy();

        const embed = new EmbedBuilder()
            .setColor('#961bc2')
            .setTitle('🎶   Sang stoppet!')
            .setDescription('Sangen er blevet stoppet og har forladt voice kanalen')
            .setFooter({ text: 'Stoppet af ' + interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

        return interaction.reply({ embeds: [embed] });
    }
};