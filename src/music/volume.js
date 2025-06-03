const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Ændre lydsstyrken på det der bliver afspillet')
        .addIntegerOption(option =>
            option.setName('niveau')
                .setDescription('lydstyrke niveau (0-200)')
                .setRequired(true)),

    async execute(client, interaction) {
        const volume = interaction.options.getInteger('niveau');
        const guildId = interaction.guild.id;

        if (!client.players || !client.players.get(guildId)) {
            return interaction.reply({
                content: "Der bliver ikke afspillet nogen sang lige nu",
                flags: 64,
            });
        }

        const playerData = client.players.get(guildId);
        if (!playerData || !playerData.player || !playerData.player.state.resource) {
            return interaction.reply({
                content: "Der opstod et problem",
                flags: 64,
            });
        }

        const resource = playerData.player.state.resource;

        if (!resource.volume) {
            return interaction.reply({
                content: "Kontrol for lydstyrken er ikke tilgængelig. Måske mangler inlineVolume i createAudioResource?",
                flags: 64,
            });
        }

        if (volume < 0 || volume > 200) {
            return interaction.reply({
                content: "Lydstyrken skal være mellem 0-200",
                flags: 64,
            });
        }

        const volumeScaled = volume / 200;
        resource.volume.setVolume(volumeScaled);

        const embed = new EmbedBuilder()
            .setColor('#961bc2')
            .setTitle('🔊   Lydstyrken er ændret')
            .setDescription(`Den er nu sat til **${volume}%**`)
            .setFooter({ text: 'Ændret af ' + interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

        return interaction.reply({ embeds: [embed] });
    }
};