const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ytSearch = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const { createAudioPlayer, createAudioResource, AudioPlayerStatus, joinVoiceChannel, NoSubscriberBehavior } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Tilføj en sang til køen')
        .addStringOption(option =>
            option.setName('sang')
                .setDescription('Søg efter en sang med enten navn eller link fra YouTube')
                .setRequired(true)),

    async execute(client, interaction) {
        const query = interaction.options.getString('sang');
        const guildId = interaction.guild.id;
        const channel = interaction.member?.voice?.channel;

        if (!channel) {
            return interaction.reply({
                content: "Du er ikke i en voice kanal!",
                flags: 64,
            });
        }

        if (!client.players) client.players = new Map();
        let playerData = client.players.get(guildId);

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
                isPlaying: false,
            };

            client.players.set(guildId, playerData);

            player.on(AudioPlayerStatus.Idle, () => {
                if (playerData.queue.length > 0) {
                    const nextSong = playerData.queue.shift();
                    if (nextSong) {
                        playSong(playerData, nextSong);
                    }
                } else {
                    playerData.isPlaying = false;
                }
            });
        }

        const song = await fetchVideoInfo(query);

        if (song) {
            const currentlyIdle = playerData.player.state.status === AudioPlayerStatus.Idle;
            playerData.queue.push(song);

            if (currentlyIdle && !playerData.isPlaying) {
                const nextSong = playerData.queue.shift();
                playSong(playerData, nextSong);
                playerData.isPlaying = true;
            }

            const embed = new EmbedBuilder()
                .setColor('#961bc2')
                .setTitle('🎶   Sangen er blevet tilføjet til køen')
                .setDescription(`**${song.title}** er blevet tilføjet til køen`)
                .setURL(song.url)
                .setFooter({ text: 'Forslået af ' + interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

            return interaction.reply({ embeds: [embed] });
        } else {
            return interaction.reply({ content: "Der opstod en fejl ved hentning af sangen" });
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

    console.log(`Playing song: ${song.title}`);
    const stream = ytdl(song.url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25,
    });

    const resource = createAudioResource(stream);
    playerData.player.play(resource);
    playerData.isPlaying = true;
}