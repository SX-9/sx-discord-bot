const Discord = require('discord.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
const bot_token = "ODg5Mzg0MjE5Njc4MjMyNjA2.YUgdmQ.D_Pn2Okc9hf7C1hWZZfmcrhh0DQ";
const owner_main_id = '882595027132493864';
const owner_alt_id = '916880217329516604';
const dm_log_channel_id = '963713518966808587';
const status_text = 'sx!help | sx9.is-a.dev';
const status_type = 'LISTENING';
const bot_prefix = `sx!`;
const embed_color = '#00e1ff';

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(status_text, { type: status_type });
});

client.on('message', msg => {
  if (msg.content.startsWith(bot_prefix + 'random')) {
    let random_number = Math.floor(Math.random() * 9000000) + 1;
    msg.channel.send(`Your random number is ${random_number} out of 9,000,000.`);
  }
  if (msg.content === `${bot_prefix}serverlist`) {
    if (msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      msg.channel.send({ embed: {
        color: embed_color,
        title: "Server List",
        description: "Here is a list of all the servers I am in.",
        fields: [
          {
            name: "Servers",
            value: `> ${client.guilds.cache.map(g => g.name).join("\n> ")}`
          }
        ]
      } });
    } else {
      msg.channel.send(`You do not have permission to use this command.`);
    }
  }
  if (msg.channel.type === 'dm') {
    console.log(`${msg.author.tag}: ${msg.content}`);
    client.channels.cache.get(dm_log_channel_id).send(`${msg.author.tag}: ${msg.content}`)
  }
  if (msg.content === bot_prefix + 'ping') {
    msg.channel.send('Pong!');
  }
  if (msg.content === bot_prefix + 'embed') {
    msg.channel.send({embed: {
        color: embed_color,
        title: client.user.tag,
        description: "Hi, I'm your assistant! I'm a bot made by SX9. I'm here to help you with your server.\n\n[Click here to go to my website](https://sx9.is-a.dev/).",
        url: "https://sx9.is-a.dev/",
        timestamp: new Date(),
        footer: {
          icon_url: client.user.avatarURL(),
          text: "sx!help ;)"
        },
      }
    });
  }
  if (msg.content.startsWith(bot_prefix + 'say')) {
    msg.channel.send(msg.content.substring(5));
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
      client.destroy();
    } else {
      msg.channel.send('You are not the owner of this bot.');
    }
  }
  if (msg.content.startsWith(bot_prefix + 'dm')) {
    msg.channel.send('You have been dmed.');
    msg.author.send('hello!');
  }
  if (msg.content === bot_prefix + 'help') {
    msg.channel.send({embed: {
        color: embed_color,
        title: client.user.username,
        description: "Hi, Thanks for using me! To contact owners dm me! (I will not respond back)",
        fields: [{
            name: bot_prefix + "ping",
            value: "Sends a message saying 'Pong!'",
            inline: true
          },
          {
            name: bot_prefix + "embed",
            value: "Sends an embed message",
            inline: true
          },
          {
            name: bot_prefix + "say",
            value: "Sends a message that you typed after the command",
            inline: true
          },
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
            name: bot_prefix + "links",
            value: "Sends links to my website and discord server",
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
            name: bot_prefix + "poll",
            value: "Creates a yes or no poll",
            inline: true
          },
          {
            name: bot_prefix + "kill",
            value: "Stops the bot (Owner only)",
            inline: true
          },
          {
            name: bot_prefix + "serverlist",
            value: "Sends a list of all the servers I am in (Owner only)",
            inline: true
          }
        ],
        timestamp: new Date(),
        footer: {
          text: "Powered By sx9.is-a.dev | The Blue Dot AI",
          icon_url: "https://sx9.is-a.dev/images/avatar.png"
        },
      }
    });
  }
});

client.login(bot_token);

/*

Coded by SX-Spy-Agent#1377
Website: https://sx9.is-a.dev/
Thanks to Github Copilot for helping me with the code!

Start Command: npm start or node index.js
Install Command: npm install discord.js@12.3.1
Initialize Command: npm init -y

Warning: DO NOT REMOVE THIS CREATOR MESSAGE!

*/