const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
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
                flags: 64,
            });
        }

        const guildId = interaction.guild.id;
        const playerData = client.players?.get(guildId);

        if (!playerData || !playerData.player || playerData.player.state.status !== AudioPlayerStatus.Playing) {
            return interaction.reply({
                content: "Der er ikke nogen aktiv sang i gang",
                flags: 64,
            });
        }

        playerData.player.stop();

        if (playerData.queue.length > 0) {
            const nextSong = playerData.queue.shift();
            playSong(playerData, nextSong);

            const embed = new EmbedBuilder()
                .setColor('#961bc2')
                .setTitle('🎶   Sangen er sprunget over!')
                .setURL(nextSong.url)
                .setDescription(`Afspiller nu **${nextSong.title}**`)
                .setFooter({ text: 'Sprunger over af ' + interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

            return interaction.reply({ embeds: [embed] });
        } else {
            const noSongsEmbed = new EmbedBuilder()
                .setColor('#961bc2')
                .setDescription('Sangen er blevet sprunget over.')
                .setFooter({ text: 'Sprunger over af ' + interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

            return interaction.reply({ embeds: [noSongsEmbed] });
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