//npm i discord.js@12.5.3 node-fetch@2.6.1 express 
//node index.js

const bot_token = "ODg5Mzg0MjE5Njc4MjMyNjA2.YUgdmQ.YKf0a_tsepvDPP0Fk67MPiAw2_o";
const owner_main_id = '882595027132493864';
const owner_alt_id = '916880217329516604';
const log_channel_id = '963713518966808587';
const status_text = 'sx!help | sx9.is-a.dev';
const status_type = 'LISTENING';
const bot_prefix = `sx!`;
const embed_color = '#00e1ff';
const server_port = 3000;

const Discord = require('discord.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
const express = require('express');
const pinger = express();
const fetch = require('node-fetch');

pinger.get('/', (req, res) => {
  res.send(`
  Coded by SX-Spy-Agent#1377<br>
  Website: <a href="https://sx9.is-a.dev">sx9.is-a.dev</a>
  `);
});
pinger.listen(server_port, () => {
  console.log(`Listening on port ${server_port}!`);
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(status_text, { type: status_type });
  client.channels.cache.get(log_channel_id).send(`Bot is alive!`);
});

client.on('guildCreate', guild => {
  client.channels.cache.get(log_channel_id).send(`Bot joined guild: ${guild.name}`);
});

client.on('guildDelete', guild => {
  client.channels.cache.get(log_channel_id).send(`Bot left guild: ${guild.name}`);
});

client.on('message', msg => {
if (msg.author.bot) return;
  if (msg.content.startsWith(`${bot_prefix}userinfo`)) {
    const user = msg.mentions.users.first();
    if (!user) {
      msg.channel.send(`You didn't mention a user!`);
    } else {
      msg.channel.send({ embed: {
        color: embed_color,
        title: `${user.username}#${user.discriminator}`,
        description: `ID: ${user.id}`,
        fields: [
          {
            name: 'Created At',
            value: user.createdAt,
            inline: true
          },
          {
            name: 'Joined At',
            value: user.joinedAt,
            inline: true
          }
        ]
      }});
    }
  }
  if (msg.content === `${bot_prefix}meme`) {
    fetch('https://meme-api.herokuapp.com/gimme').then(res => res.json()).then(json => {
      msg.channel.send({ embed: {
        color: embed_color,
        title: json.title,
        description: json.postLink,
        image: {
          url: json.url
        }
      }});
    });
  }
  if (msg.content.startsWith(`${bot_prefix}status`)) {
    if (msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      const args = msg.content.split(' ');
      if (args[1] === 'reset') {
        client.user.setActivity(status_text, { type: status_type });
        msg.channel.send(`Status reset!`);
      } else {
        client.user.setActivity(args.slice(1).join(' '), { type: status_type });
        msg.channel.send(`Status set to: ${args.slice(1).join(' ')}`);
      }
    } else {
      msg.channel.send(`You don't have permission to use this command!`);
    }
  }
  if (msg.content === `${bot_prefix}jointester`) {
    msg.channel.send({ embed: {
      color: embed_color,
      title: 'How to join the testers:',
      description: 'Join the testers by joining the [community server](https://discord.gg/Z98auctczm) and say ``<@!' + owner_main_id + '> JoinTesters101``)!',
      footer: {
        text: 'sx9.is-a.dev'
      }
    }});
  }
  if (msg.content.startsWith(bot_prefix + 'random')) {
    let random_number = Math.floor(Math.random() * 9000000) + 1;
    msg.channel.send(`Your random number is ${random_number} out of 9,000,000.`);
  }
  if (msg.content === `${bot_prefix}serverlist`) {
    if (msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      msg.author.send({ embed: {
        color: embed_color,
        title: "Server List",
        description: "Here is a list of all the servers I am in.",
        fields: [
          {
            name: "Servers",
            value: `> ${client.guilds.cache.map(g => g.name).join("\n> ")}`,
            inline: true
          },
          {
            name: "Total Servers",
            value: `> ${client.guilds.cache.size}`,
            inline: true
          }
        ]
      } });
    } else {
      msg.channel.send(`You do not have permission to use this command.`);
    }
  }
  if (msg.channel.type === 'dm') {
    console.log(`${msg.author.tag}: ${msg.content}`);
    msg.react('📧');
    client.channels.cache.get(log_channel_id).send(`${msg.author.tag}: ${msg.content}`)
  }
  if (msg.content === bot_prefix + 'ping') {
    msg.channel.send('Pong! :ping_pong: \n' + `Response Time: ${client.ws.ping}ms`);
  }
  if (msg.content.startsWith(bot_prefix + 'say')) {
    if (msg.content.includes('@everyone') || msg.content.includes('@here')) {
      msg.channel.send('You cannot use @/everyone or @/here in this command.');
    } else {
      msg.channel.send(msg.content.slice(bot_prefix.length + 4));
    }
  }
  if (msg.content === bot_prefix + 'avatar') {
    msg.channel.send({embed: {
        color: embed_color,
        title: `${msg.author.username}'s Avatar`,
        description: "Here's your avatar!",
        image: {
          url: msg.author.avatarURL({ format: 'png', dynamic: true, size: 1024 })
        },
        timestamp: new Date(),
        footer: {
          text: "sx9.is-a.dev",
        }
    }});
  }
  if (msg.content === bot_prefix + 'react') {
    msg.react('909064500794253312');
  }
  if (msg.content.startsWith(bot_prefix + 'poll')) {
    msg.react('889165118104023042');
    msg.react('889165118582165584');
  }
  if (msg.content === bot_prefix + 'links') {
    msg.channel.send({embed: {
        color: embed_color,
        title: "Links",
        description: "Here are some links I can help you with!",
        fields: [
          {
            name: "Website",
            value: "[Click here to go to my website](https://sx9.is-a.dev/).",
            inline: true
          },
          {
            name: "Discord",
            value: "[Click here to go to my Discord server](https://chat-with.sx9.is-a.dev).",
            inline: true
          },
          {
            name: "Invite",
            value: `[Click here to invite me to your server](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=274878285888&scope=bot).`,
            inline: true
          }
        ],
        timestamp: new Date(),
        footer: {
          text: "sx9.is-a.dev",
        }
    }});
  }
  if (msg.content.startsWith(bot_prefix + 'kill')) {
    if (msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      msg.react('889165118104023042');
      client.channels.cache.get(log_channel_id).send(`${msg.author.tag} has killed the bot.`);
      console.log('Bot killed by ' + msg.author.tag);
      setTimeout(() => {
        process.exit(0);
      }, 3000);
    } else {
      msg.react('889165118582165584')
      msg.channel.send('You are not the owner of this bot.');
    }
  }
  if (msg.content === bot_prefix + 'dm') {
    msg.channel.send('You have been dmed.');
    msg.author.send('Hello There!');
  }
  if (msg.content === bot_prefix + 'token') {
    if (msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      msg.react('889165118104023042');
      msg.channel.send('Check your DMs!');
      msg.author.send("```" + bot_token + "```");
    } else {
      msg.react('889165118582165584');
      msg.channel.send('You do not have permission to use this command.');
    }
  }
  if (msg.content.startsWith(bot_prefix + 'owner')) {
    if (msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      msg.channel.send('Owner: True');
    } else {
      msg.react('889165118582165584');
      msg.channel.send('Owner: False');
    }
  }
  if (msg.content.startsWith(bot_prefix + 'setname')) {
    if (msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      client.user.setUsername(msg.content.slice(bot_prefix.length + 8));
      msg.react('889165118104023042');
      msg.channel.send('Done!');
    } else {
      msg.react('889165118582165584');
      msg.channel.send('You do not have permission to use this command.');
    }
  }
  if (msg.content.startsWith(bot_prefix + 'setpfp')) {
    if (msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      msg.channel.send('Avatar changed.');
      client.user.setAvatar(msg.content.slice(bot_prefix.length + 7));
    } else {
      msg.react('889165118582165584');
      msg.channel.send('You do not have permission to use this command.');
    }
  }
  if (msg.content.startsWith(bot_prefix + 'log')) {
    if (msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      msg.channel.send('Logged.');
      console.log(msg.content.slice(bot_prefix.length + 4));
      client.channels.cache.get(log_channel_id).send(msg.content.slice(bot_prefix.length + 4));
    } else {
      msg.react('889165118582165584');
      msg.channel.send('You do not have permission to use this command.');
    }
  }
  if (msg.content.startsWith(bot_prefix + 'rps')) {
    let choices = ['Rock', 'Paper', 'Scissors'];
    let pick = choices[Math.floor(Math.random() * choices.length)];
    let arg = msg.content.slice(bot_prefix.length + 4);
    msg.channel.send({embed: {
        color: embed_color,
        title: "RPS Game Results",
        fields: [
          {
            name: "Your Choice",
            value: arg,
            inline: true
          },
          {
            name: "Bot Choice",
            value: pick,
            inline: true
           }
        ],
        timestamp: new Date(),
        footer: {
          text: "sx9.is-a.dev",
        }
    }});
  }
  if (msg.content.startsWith(bot_prefix + 'serverstats')) {
    msg.channel.send({embed: {
        color: embed_color,
        title: "Server Stats",
        fields: [
          {
            name: "Members",
            value: msg.guild.memberCount,
            inline: true
          },
          {
            name: "Channels",
            value: msg.guild.channels.cache.size,
            inline: true
          },
          {
            name: "Roles",
            value: msg.guild.roles.cache.size,
            inline: true
          }
        ],
        timestamp: new Date(),
        footer: {
          text: "sx9.is-a.dev",
        }
    }});
  }
  if (msg.content.startsWith(bot_prefix + 'msg')) {
    let user = msg.mentions.users.first();
    let mess = msg.content.slice(bot_prefix.length + 4 + user.id.length);
    if (msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      msg.react('889165118104023042');
      client.channels.cache.get(log_channel_id).send(`${user.tag} has a message from ${msg.author.tag}. \nMessage: ${mess}\nServer: ${msg.guild.name}`);
      msg.channel.send(`Message sent to ${user.tag}.`);
      user.send(`You have a message from the developers!\nMessage: ${mess}`);
    } else {
      msg.react('889165118582165584');
      msg.channel.send('You do not have permission to use this command.');
    }
  }
  if (msg.content.startsWith(`${bot_prefix}login`)) {
    let new_token = msg.content.slice(bot_prefix.length + 6);
    if (msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      msg.delete();
      msg.react('889165118104023042');
      setTimeout(() => {
        client.destroy();
        client.login(new_token);
      }, 3000);
    } else {
      msg.react('889165118582165584');
      msg.channel.send('You do not have permission to use this command.');
    }
    if (new_token === 'back') {
      msg.react('889165118104023042');
      setTimeout(() => {
        client.destroy();
        client.login(bot_token);
      }, 3000);
    }
  }
  if (msg.content === bot_prefix + 'help owner') {
    if (msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      msg.react('889165118104023042');
      msg.channel.send("Check your DMs!");
      msg.author.send({embed: {
          color: embed_color,
          title: "Owner Only Commands",
          description: "Here are some commands I can help you with!",
          fields: [
            {
              name: bot_prefix + "token",
              value: `Sends the bot's token to you.`,
              inline: true
            },
            {
              name: bot_prefix + "kill",
              value: `Kills the bot.`,
              inline: true
            },
            {
              name: bot_prefix + "serverlist",
              value: `Sends a list of all the servers the bot is in.`,
              inline: true
            },
            {
              name: bot_prefix + "setname <name>",
              value: `Changes the bot's username.`,
              inline: true
            },
            {
              name: bot_prefix + "setpfp <url>",
              value: `Changes the bot's avatar.`,
              inline: true
            },
            {
              name: bot_prefix + "status <status>",
              value: `Changes the bot's status.`,
              inline: true
            },
            {
              name: bot_prefix + "log <message>",
              value: `Logs a message to the console.`,
              inline: true
            },
            {
              name: bot_prefix + "msg <user> <message>",
              value: `Sends a message to a user.`,
              inline: true
            },
            {
              name: bot_prefix + "login <token>",
              value: `Login to a new bot.`,
              inline: true
            },
          ],
          timestamp: new Date(),
          footer: {
            text: "sx9.is-a.dev",
          }
      }});
    } else {
      msg.react('889165118582165584');
      msg.channel.send('You do not have permission to use this command.');
    }
  }
  if (msg.content === bot_prefix + 'help info') {
    msg.channel.send({embed: {
        color: embed_color,
        title: "Info Commands",
        description: "Here are some commands I can help you with!",
        fields: [
          {
            name: bot_prefix + "jointester",
            value: `Joins the testers with some experimental stuff.`,
            inline: true
          },
          {
            name: bot_prefix + "serverstats",
            value: `Gives you some stats about the server.`,
            inline: true
          },
          {
            name: bot_prefix + "ping",
            value: `See how long it takes to ping the bot.`,
            inline: true
          },
          {
            name: bot_prefix + "links",
            value: `Sends a list of all the links the bot has.`,
            inline: true
          },
          {
            name: bot_prefix + "userinfo <user>",
            value: `Sends information about a user.`,
            inline: true
          },
        ],
        timestamp: new Date(),
        footer: {
          text: "sx9.is-a.dev",
        }
    }});
  }
  if (msg.content === bot_prefix + 'help fun') {
    msg.channel.send({embed: {
        color: embed_color,
        title: "Fun Commands",
        description: "Hi, Thanks for using me! To contact owners dm me! (I will not respond back)",
        fields: [
          {
            name: bot_prefix + "dm",
            value: "Sends a dm to you",
            inline: true
          }, 
          {
            name: bot_prefix + "avatar",
            value: "Sends your avatar",
            inline: true
          },
          {
            name: bot_prefix + "react",
            value: "Reacts with a blue dot",
            inline: true
          },
          {
            name: bot_prefix + "random",
            value: "Sends a random number from 1 to 9,000,000",
            inline: true
          },
          {
            name: bot_prefix + "meme",
            value: "Sends a random meme",
            inline: true
          },
          {
            name: bot_prefix + "owner",
            value: "Sends a message saying if you are the owner or not",
            inline: true
          }, 
          {
            name: bot_prefix + "rps <choice>",
            value: "Sends a rock paper scissors game",
            inline: true
          },
          {
            name: bot_prefix + "say <message>",
            value: "Sends a message that you typed after the command",
            inline: true
          },
          {
            name: bot_prefix + "poll <question>",
            value: "Creates a yes or no poll",
            inline: true
          },
        ],
        timestamp: new Date(),
        footer: {
          text: "Powered By sx9.is-a.dev | The Blue Dot AI",
          icon_url: "https://sx9.is-a.dev/images/avatar.png"
        },
      }
    });
  } 
  if (msg.content === bot_prefix + 'help') {
    msg.channel.send({embed: {
        color: embed_color,
        title: client.user.username,
        description: "Hi, Thanks for using me! To contact owners dm me! (I will not respond back)",
        fields: [
          {
            name: bot_prefix + "help info",
            value: "Sends a list of commands that are used to get info",  
            inline: true
          },
          {
            name: bot_prefix + "help fun",
            value: "Sends a list of commands that are used to have fun",
            inline: true
          },
          {
            name: bot_prefix + "help owner",
            value: "Sends a list of commands only the owner can use",
            inline: true
          },
        ],
        timestamp: new Date(),
        footer: {
          text: "Powered By sx9.is-a.dev | The Blue Dot AI",
          icon_url: "https://sx9.is-a.dev/images/avatar.png"
        },
      }
    });
  }
  if (msg.content.startsWith(bot_prefix)) {
    client.channels.cache.get(log_channel_id).send(`${msg.author.tag}: ${msg.content}`);
  }
});

client.on('error', (error) => {
  client.channels.cache.get(log_channel_id).send({embed: {
    color: 'RED',
    title: "Error",
    description: 'An error has occured!',
    fields: [
      {
        name: 'Error Message',
        value: "```" + error + "```"
      }
    ],
    timestamp: new Date(),
    footer: {
      text: "sx9.is-a.dev",
    }
  }});
  if (msg.content.startsWith(bot_prefix)) {
    client.channels.cache.get(log_channel_id).send(`${msg.author.username}: ${msg.content}`);
  }
});

client.on("warn", console.warn);
client.on("error", console.error);

client.on('messageDelete', (msg) => {
  client.channels.cache.get(log_channel_id).send({embed: {
    color: 'RED',
    title: "Message Deleted",
    description: 'A message has been deleted!',
    fields: [
      {
        name: 'Message',
        value: "```" + msg.content + "```"
      }
    ],
    timestamp: new Date(),
    footer: {
      text: "sx9.is-a.dev",
    }
  }});
});

client.on('guildMemberAdd', member => {
  client.channels.cache.get(log_channel_id).send({embed: {
    color: embed_color,
    title: "Member Joined",
    description: `${member.user.tag} has joined the server.`,
    timestamp: new Date(),
    footer: {
      text: "sx9.is-a.dev",
    }
  }});
});

client.on('guildMemberRemove', member => {
  client.channels.cache.get(log_channel_id).send({embed: {
    color: embed_color,
    title: "Member Left",
    description: `${member.user.tag} has left the server.`,
    timestamp: new Date(),
    footer: {
      text: "sx9.is-a.dev",
    }
  }});
});

client.login(bot_token);
