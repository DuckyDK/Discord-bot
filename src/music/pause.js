const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pauser den nuværende sang'),

    async execute(client, interaction) {
        const guildId = interaction.guildId;

        if (!client.players || !client.players.has(guildId)) {
            const noSongEmbed = new EmbedBuilder()
                .setColor('#961bc2')
                .setTitle('❌   Ingen sang afspilles')
                .setDescription('Der bliver ikke afspillet noget lige nu.')
                .setFooter({ text: `Anmodet af ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            return interaction.reply({ embeds: [noSongEmbed], ephemeral: true });
        }

        const playerData = client.players.get(guildId);
        const currentStatus = playerData.player.state.status;
        console.debug(`[DEBUG] Player status: ${currentStatus}`);
        console.debug(`[DEBUG] playerData.isPlaying: ${playerData.isPlaying}`);

        if (!playerData.isPlaying || currentStatus !== AudioPlayerStatus.Playing) {
            const noSongEmbed = new EmbedBuilder()
                .setColor('#961bc2')
                .setTitle('❌   Ingen sang afspilles')
                .setDescription('Der bliver ikke afspillet noget lige nu.')
                .setFooter({ text: `Anmodet af ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            return interaction.reply({ embeds: [noSongEmbed], ephemeral: true });
        }

        playerData.player.pause();
        playerData.isPlaying = false;

        const pauseEmbed = new EmbedBuilder()
            .setColor('#961bc2')
            .setTitle('⏸️   Sangen er blevet sat på pause')
            .setFooter({ text: `Pauset af ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

        return interaction.reply({ embeds: [pauseEmbed] });
    }
};