const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createAudioPlayer, createAudioResource, AudioPlayerStatus, joinVoiceChannel, NoSubscriberBehavior } = require('@discordjs/voice');
const ytSearch = require('yt-search');
const ytdl = require('@distube/ytdl-core');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Tilføj en sang til køen')
        .addStringOption(option =>
            option.setName('sang')
                .setDescription('Søg efter en sang med enten navn eller link fra YouTube')
                .setRequired(true)),

    async execute(client, interaction) {
        try {
            await interaction.deferReply();

            const query = interaction.options.getString('sang');
            const guildId = interaction.guild.id;
            const channel = interaction.member?.voice?.channel;

            if (!channel) {
                return interaction.editReply({ content: "Du er ikke i en voice kanal!" });
            }

            if (!client.players) client.players = new Map();
            let playerData = client.players.get(guildId);
            let isFirstSong = false;

            if (!playerData) {
                const connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: guildId,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });

                const player = createAudioPlayer({
                    behaviors: {
                        noSubscriber: NoSubscriberBehavior.Pause,
                    },
                });

                connection.subscribe(player);

                playerData = {
                    player,
                    connection,
                    queue: [],
                    isPlaying: true,
                };

                client.players.set(guildId, playerData);

                player.on(AudioPlayerStatus.Idle, () => {
                    if (playerData.queue.length > 0) {
                        const nextSong = playerData.queue.shift();
                        if (nextSong) playSong(playerData, nextSong);
                    } else {
                        playerData.isPlaying = false;
                    }
                });

                isFirstSong = true;
            }

            const song = await fetchVideoInfo(query);

            if (!song) {
                return interaction.editReply({ content: "Der opstod en fejl ved hentning af sangen" });
            }

            const isIdle = playerData.player.state.status === AudioPlayerStatus.Idle;
            let embed;

            if ((!playerData.isPlaying && isIdle) || isFirstSong) {
                playSong(playerData, song);
                playerData.isPlaying = true;

                embed = new EmbedBuilder()
                    .setColor('#961bc2')
                    .setTitle('🎶   Afspiller tilføjet sang')
                    .setDescription(`**${song.title}** bliver nu afspillet`)
                    .setURL(song.url)
                    .setFooter({ text: 'Queued af ' + interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });
            } else {
                playerData.queue.push(song);

                embed = new EmbedBuilder()
                    .setColor('#961bc2')
                    .setTitle('🎶   Sangen er blevet tilføjet til køen')
                    .setDescription(`**${song.title}** er blevet tilføjet`)
                    .setURL(song.url)
                    .setFooter({ text: 'Queued af ' + interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });
            }

            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error("Fejl i /queue kommandoen:", error);
            if (interaction.deferred || interaction.replied) {
                return interaction.editReply({ content: 'Der opstod en fejl under kommandoen.'});
            }
        }
    }
};

async function fetchVideoInfo(query) {
    try {
        if (ytdl.validateURL(query)) {
            const info = await ytdl.getInfo(query);
            return {
                title: info.videoDetails.title,
                url: info.videoDetails.video_url
            };
        } else {
            const results = await ytSearch(query);
            const video = results.videos[0];
            if (video) {
                return {
                    title: video.title,
                    url: video.url
                };
            }
            return null;
        }
    } catch (error) {
        console.error("Error fetching video info:", error);
        return null;
    }
}

function playSong(playerData, song) {
    if (!song || !song.url) {
        console.error("No valid song found to play");
        return;
    }

    const stream = ytdl(song.url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25,
    });

    const resource = createAudioResource(stream);
    playerData.player.play(resource);
    playerData.isPlaying = true;
}