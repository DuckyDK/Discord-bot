const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');
const ytSearch = require('yt-search');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Afspil en sang')
        .addStringOption(option =>
            option.setName('sang')
                .setDescription('Søg efter en sang med enten navn eller link')
                .setRequired(true)),

    async execute(client, interaction) {
        console.log('[DEBUG] Received /play interaction');

        await interaction.deferReply();

        try {
            const query = interaction.options.getString('sang');
            console.log(`[DEBUG] Query received: ${query}`);

            const channel = interaction.member?.voice?.channel;
            if (!channel) {
                console.log('[DEBUG] User not in a voice channel');
                return interaction.editReply({
                    content: "Du er ikke i en voice kanal!",
                    flags: 64,
                });
            }

            let songURL = query;
            if (!ytdl.validateURL(query)) {
                console.log(`[DEBUG] Query is not a valid URL, searching for: ${query}`);
                const searchResults = await ytSearch(query);

                if (searchResults.videos.length === 0) {
                    console.log('[DEBUG] No search results found');
                    return interaction.editReply({
                        content: 'Ingen resultater fundet.',
                        flags: 64,
                    });
                }

                songURL = searchResults.videos[0].url;
                console.log(`[DEBUG] Found song URL: ${songURL}`);
            }

            const guildId = interaction.guild.id;
            const voiceConnection = joinVoiceChannel({
                channelId: channel.id,
                guildId: guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer();
            voiceConnection.subscribe(player);

            let info;
            try {
                console.log('[DEBUG] Attempting to get video info for', songURL);
                info = await ytdl.getInfo(songURL);
            } catch (error) {
                console.error('[ERROR] Failed to get video info:', error);
                return interaction.editReply({
                    content: `Der opstod et problem med at hente videooplysningerne: ${error.message}. Prøv venligst igen.`,
                    flags: 64,
                });
            }

            const track = info.videoDetails;
            console.log(`[DEBUG] Track found: ${track.title}`);

            const stream = ytdl(songURL, {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 1 << 25
            });

            const resource = createAudioResource(stream);
            player.play(resource);

            if (!client.players) client.players = new Map();

            client.players.set(guildId, {
                player: player,
                queue: [],
                currentSong: {
                    title: track.title,
                    url: info.video_url,
                }
            });

            player.on(AudioPlayerStatus.Idle, async () => {
                console.log('[DEBUG] Track ended, leaving voice channel...');
                voiceConnection.destroy();
                client.players.delete(guildId);
            });

            const embed = new EmbedBuilder()
                .setColor('#961bc2')
                .setTitle('🎶   Afspiller nu')
                .setURL(info.video_url)
                .setDescription(`**${track.title}**`)
                .setFooter({ text: 'Forslået af ' + interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('[ERROR] Something went wrong in /play command:', error);
            if (!interaction.replied) {
                await interaction.editReply({
                    content: `Der skete en fejl under forsøget på at afspille sangen: ${error.message}.`,
                    flags: 64,
                });
            }
        }
    }
};