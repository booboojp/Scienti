const { Client, Collection, Events, EmbedBuilder, GatewayIntentBits  } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});




client.once('ready', () => {
    console.log('The Bot is ready!');

    const sendDailyMessage = async () => {
        try {
            const response = await axios.get(`https://api.hypixel.net/v2/resources/skyblock/election?key=${process.env.API_KEY}&uuid=${process.env.MINECRAFT_UUID}`);

            if (response.status !== 200) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = response.data;
			const electionData = data.mayor.election ? data.mayor.election : {};

            let candidatesList = '';
			if (electionData.candidates && electionData.candidates.length > 0) {
				electionData.candidates.sort((a, b) => b.votes - a.votes);

				candidatesList = electionData.candidates.map(candidate => `- **${candidate.name}** (${candidate.votes}):`).join('\n');
			} else {
				candidatesList = "No candidates found in the election data.";	
			}

            const mayorPerks = data.mayor && data.mayor.perks ? data.mayor.perks.map(perk => `- **${perk.name}**: ${perk.description}`).join('\n') : '';

            const embed = new EmbedBuilder()
                .setTitle(`Election Year (${data.mayor.election.year}) Data:`)
                .setDescription(`Mayor: **${data.mayor.name || 'Unknown'}**`)
                .addFields(
                    { name: 'Perks', value: mayorPerks },
                    { name: 'Candidates', value: candidatesList }
                )
                .setColor('#0099ff');
	
			const channelID = process.env.CHANNEL_ID;
            const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
            const channel = guild.channels.cache.get(channelID);
            if (!channel) {
                console.log('Channel not found or something fucked up, You wont remember the code booboo go just check the source.');
                return;
            }

            channel.send({ content: `<@386205272005410816>`, embeds: [embed] });

        } catch (error) {
            console.error(error);
        }
    }
    setInterval(sendDailyMessage, 172800000); // 172800000 = 2 Days, 30000 = 30 Seconds or 3 Seconds
});

client.login(process.env.DISCORD_BOT_TOKEN);
client.on('debug', information => {
    console.log(`Debug Message: ${information}`);
});
client.on('warn', information => {
    console.log(`Warning Message: ${information}`);
});
client.on('rateLimit', information => {
    console.log(`Rate Limit was hit ${information.time} ms ago.`)
});
client.on('ready', () => {
    const channelID = process.env.CHANNEL_ID;
    const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
    const channel = guild.channels.cache.get(channelID);
    channel.send('Bot is Online');
});
