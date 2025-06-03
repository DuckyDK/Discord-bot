const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Sender en tilfældig meme'),

    async execute(client, interaction) {
        try {
            const fetch = (await import('node-fetch')).default;

            const subreddits = [
                'memes', 
                'dankmemes', 
                'wholesomememes', 
                'me_irl', 
                '2meirl4meirl', 
                'AdviceAnimals', 
                'funny', 
                'MemeEconomy'
            ];

            const subreddit = subreddits[Math.floor(Math.random() * subreddits.length)];

            const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=50`);
            const data = await response.json();

            const posts = data.data.children.filter(post => post.data.post_hint === 'image');

            if (!posts.length) {
                return interaction.reply({ content: 'Kunne ikke finde nogen memes lige nu, prøv igen senere.', ephemeral: true });
            }

            const meme = posts[Math.floor(Math.random() * posts.length)].data;

            const embed = new EmbedBuilder()
                .setColor('#961bc2')
                .setTitle(meme.title)
                .setImage(meme.url)
                .setURL(`https://reddit.com${meme.permalink}`)
                .setFooter({ text: `Fra r/${subreddit}` });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching meme:', error);
            await interaction.reply({ content: 'Noget gik galt, prøv igen senere.', ephemeral: true });
        }
    }
};