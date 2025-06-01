const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createAudioResource, AudioPlayerStatus, AudioPlayer } = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Spring den nuværende sang over'),

    async execute(client, interaction) {
        const channel = interaction.member?.voice?.channel;

        if (!channel) {
            return interaction.reply({
                content: "Du er ikke i en voice kanal!",
            });
        }

        const guildId = interaction.guild.id;
        const playerData = client.players?.get(guildId);

        if (!playerData || !playerData.player || playerData.player.state.status !== AudioPlayerStatus.Playing) {
            return interaction.reply({
                content: "Der er ikke nogen aktiv sang i gang",
            });
        }

        playerData.player.stop();

        if (playerData.queue.length > 0) {
            const nextSong = playerData.queue.shift();
            playSong(playerData, nextSong);

            const embed = new EmbedBuilder()
                .setColor('#961bc2')
                .setTitle('🎶   Sangen er sprunget over!')
                .setDescription(`**${nextSong.title}** afspilles nu`)
                .setURL(nextSong.url)
                .setFooter({ text: 'Forslået af ' + interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

            return interaction.reply({ embeds: [embed] });
        } else {
            return interaction.reply({
                content: "Sangen er blevet sprunget over.",
            });
        }
    }
};

function playSong(playerData, song) {
    if (!song || !song.url) {
        console.error("No valid song found to play.");
        return;
    }

    const stream = ytdl(song.url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25,
    });

    const resource = createAudioResource(stream);

    playerData.player.play(resource);
    playerData.currentSong = song;
}