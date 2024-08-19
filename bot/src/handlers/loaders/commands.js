const Discord = require('discord.js');
const { REST } =  require('discord.js');
const { Routes } = require('discord.js');
const fs = require('fs');
const ansis = require('ansis');
require('dotenv').config();	


module.exports = (client) => {
    const interactionLogs = new Discord.WebhookClient({
        id: client.webhooks.interactionLogs.id,
        token: client.webhooks.interactionLogs.token,
    });
    const errorLogs = new Discord.WebhookClient({
        id: client.webhooks.errorLogs.id,
        token: client.webhooks.errorLogs.token,
    });

    const commands = [];

    if (client.shard.ids[0] === 0) console.log(ansis.blue(ansis.bold(`System`)), (ansis.white(`>>`)), (ansis.green(`Loading commands`)), (ansis.white(`...`)))
    if (client.shard.ids[0] === 0) console.log(`\u001b[0m`);

    fs.readdirSync('./src/interactions').forEach(dirs => {
        const commandFiles = fs.readdirSync(`./src/interactions/${dirs}`).filter(files => files.endsWith('.js'));

        if (client.shard.ids[0] === 0) console.log(ansis.blue(ansis.bold(`System`)), (ansis.white(`>>`)), ansis.red(`${commandFiles.length}`), (ansis.green(`commands of`)), ansis.red(`${dirs}`), (ansis.green(`loaded`)));

        for (const file of commandFiles) {
            const command = require(`${process.cwd()}/src/interactions/${dirs}/${file}`);
            client.commands.set(command.data.name, command);

            
            try {
                commands.push(command.data);
                console.log(command.data.options[0])
                console.log('Loading Command')
                interactionLogs.send({
                    username: 'Bot Logs',
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setTitle(`Loaded command: ${command.data.name}`)
                            .addFields(
                                { name: 'Name', value: command.data.name ? command.data.name : 'No name provided' },
                                { name: 'Description', value: command.data.description ? command.data.description : 'No description provided' },
                                { name: 'NSFW', value: command.data.nsfw ? command.data.nsfw : 'No NSFW status provided' },
                            )
                            .setColor(client.config.colors.normal.toString())
                    ]
                }).then(() => {
                    console.log(ansis.blue(ansis.bold(`System`)), (ansis.white(`>>`)), (ansis.green(`Command`)), (ansis.magentaBright(`${command.data.name}`)), (ansis.green(`loaded`)));
                    console.log(`\u001b[0m`);
                }).catch(error => console.log(ansis.redBright(ansis.bold(`Error`)), (ansis.white(`>>`)), (ansis.yellow(ansis.bold(`${error}`)))));
            }catch (error) {
                    console.error(`Failed to load command ${command.data.name}:`, error);
                }
        } 
    });
    const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);
    (async () => {
        try {
            const embed = new Discord.EmbedBuilder()
                .setDescription(`Started refreshing application (/) commands.`)
                .setColor(client.config.colors.normal)
            interactionLogs.send({
                username: 'Bot Logs',
                embeds: [embed]
            });

            await rest.put(
                Routes.applicationGuildCommands(client.config.discord.id, process.env.DISCORD_GUILD_ID),
                { body: commands },
            )
            const embedFinal = new Discord.EmbedBuilder()
                .setDescription(`Successfully reloaded ${commands.length} guild (/) commands.`)
                .setColor(client.config.colors.normal)
            interactionLogs.send({
                username: 'Bot Logs',
                embeds: [embedFinal]
            });

        } catch (error) {
            console.log(error);
        }
    })();
}
