    const Discord = require('discord.js');
    const fs = require('fs');
    const path = require('path');
    require('dotenv').config();	


    const client = new Discord.Client({
        intents: [
            Discord.GatewayIntentBits.Guilds,
            Discord.GatewayIntentBits.GuildMembers,
            Discord.GatewayIntentBits.GuildEmojisAndStickers,
            Discord.GatewayIntentBits.GuildIntegrations,
            Discord.GatewayIntentBits.GuildWebhooks,
            Discord.GatewayIntentBits.GuildInvites,
            Discord.GatewayIntentBits.GuildVoiceStates,
            Discord.GatewayIntentBits.GuildMessages,
            Discord.GatewayIntentBits.GuildMessageReactions,
            Discord.GatewayIntentBits.GuildMessageTyping,
            Discord.GatewayIntentBits.DirectMessages,
            Discord.GatewayIntentBits.DirectMessageReactions,
            Discord.GatewayIntentBits.DirectMessageTyping,
            Discord.GatewayIntentBits.GuildScheduledEvents,
            Discord.GatewayIntentBits.MessageContent,
        ],
        partials: [
            Discord.Partials.Channel,
            Discord.Partials.GuildMember,
            Discord.Partials.Message,
            Discord.Partials.Reaction,
            Discord.Partials.User,
            Discord.Partials.GuildScheduledEvent
        ],
    });


    // Load in data from the config folder
    client.config = require('./config/bot.js');
    client.webhooks = require('./config/webhooks.json');
    client.commands = new Discord.Collection();






    // Process Webhooks
    const webHooksArray = ['startLogs', 'shardLogs', 'errorLogs', 'dmLogs', 'voiceLogs', 'serverLogs', 'serverLogs2', 'commandLogs', 'consoleLogs', 'warnLogs', 'voiceErrorLogs', 'creditLogs', 'evalLogs', 'interactionLogs'];


    if (process.env.WEBHOOK_ID && process.env.WEBHOOK_TOKEN) {
        for (const webhookName of webHooksArray) {
            client.webhooks[webhookName].id = process.env.WEBHOOK_ID;
            client.webhooks[webhookName].token = process.env.WEBHOOK_TOKEN;
        }
    }




    // Initialize Webhooks

    // process logs
    const consoleLogs = new Discord.WebhookClient({
        id: client.webhooks.consoleLogs.id,
        token: client.webhooks.consoleLogs.token,
    });
    const warnLogs = new Discord.WebhookClient({
        id: client.webhooks.warnLogs.id,
        token: client.webhooks.warnLogs.token,
    });

    fs.readdirSync('./src/handlers').forEach((dir) => {
        fs.readdirSync(`./src/handlers/${dir}`).forEach((handler) => {
            require(`./handlers/${dir}/${handler}`)(client);
        });
    });







    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }	

    process.on('unhandledRejection', error => {
        console.error('Unhandled promise rejection:', error);
        if (error) if (error.length > 950) error = error.slice(0, 950) + '... view console for details';
        if (error.stack) if (error.stack.length > 950) error.stack = error.stack.slice(0, 950) + '... view console for details';
        if(!error.stack) return
        const embed = new Discord.EmbedBuilder()
            .setTitle(`🚨・Unhandled promise rejection`)
            .addFields([
                {
                    name: "Error",
                    value: error ? Discord.codeBlock(error) : "No error",
                },
                {
                    name: "Stack error",
                    value: error.stack ? Discord.codeBlock(error.stack) : "No stack error",
                }
            ])
            .setColor(client.config.colors.normal)
        consoleLogs.send({
            username: 'Bot Logs',
            embeds: [embed],
        }).catch(() => {
            console.log('Error sending unhandledRejection to webhook')
            console.log(error)
        })
    });




    process.on('warning', warn => {
        console.warn("Warning:", warn);
        const embed = new Discord.EmbedBuilder()
            .setTitle(`🚨・New warning found`)
            .addFields([
                {
                    name: `Warn`,
                    value: `\`\`\`${warn}\`\`\``,
                },
            ])
            .setColor(client.config.colors.normal)
        warnLogs.send({
            username: 'Bot Logs',
            embeds: [embed],
        }).catch(() => {
            console.log('Error sending warning to webhook')
            console.log(warn)
        })
    });

    client.on(Discord.ShardEvents.Error, error => {
        console.log(error)
        if (error) if (error.length > 950) error = error.slice(0, 950) + '... view console for details';
        if (error.stack) if (error.stack.length > 950) error.stack = error.stack.slice(0, 950) + '... view console for details';
        if (!error.stack) return
        const embed = new Discord.EmbedBuilder()
            .setTitle(`🚨・A websocket connection encountered an error`)
            .addFields([
                {
                    name: `Error`,
                    value: `\`\`\`${error}\`\`\``,
                },
                {
                    name: `Stack error`,
                    value: `\`\`\`${error.stack}\`\`\``,
                }
            ])
            .setColor(client.config.colors.normal)
        consoleLogs.send({
            username: 'Bot Logs',
            embeds: [embed],
        });
    });
client.login(process.env.DISCORD_BOT_TOKEN);
