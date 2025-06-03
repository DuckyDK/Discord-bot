const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Fortsætter den pausede sang'),

    async execute(client, interaction) {
        const guildId = interaction.guildId;

        if (!client.players || !client.players.has(guildId)) {
            return interaction.reply({
                content: 'Der bliver ikke afspillet noget lige nu',
                ephemeral: true
            });
        }

        const playerData = client.players.get(guildId);

        if (!playerData.player || !playerData.player.state) {
            return interaction.reply({
                content: 'Der opstod en fejl: Afspilleren blev ikke fundet.',
                ephemeral: true
            });
        }

        const currentStatus = playerData.player.state.status;
        console.debug(`[DEBUG] Player status: ${currentStatus}`);
        console.debug(`[DEBUG] playerData.isPlaying: ${playerData.isPlaying}`);

        if (playerData.isPlaying || currentStatus !== AudioPlayerStatus.Paused) {
            return interaction.reply({
                content: 'Sangen er ikke sat på pause',
                ephemeral: true
            });
        }

        playerData.player.unpause();
        playerData.isPlaying = true;

        const embed = new EmbedBuilder()
            .setColor('#20c997')
            .setTitle('▶️   Sangen er blevet genoptaget')
            .setFooter({text: `Genoptaget af ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        return interaction.reply({ embeds: [embed] });
    }
};