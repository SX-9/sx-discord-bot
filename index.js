//npm i discord.js@12.5.3 node-fetch@2.6.1 express
//node index.js

const Discord = require('discord.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
const express = require('express');
const pinger = express();
const fetch = require('node-fetch');
const fs = require('fs');
const os = require("os");

if (!fs.existsSync('./database.json')) {
  console.log('Not found database.json, creating...');
  fs.writeFileSync('./database.json', JSON.stringify({
    "cmds_used": 0,
    "page_views": 0,
    "bot_rps_wins": 0,
    "bot_rps_losses": 0,
    "cats_gathered": 0,
    "rickrolls": 0,
  }));
} else {
  console.log('Loaded database.json');
}

if (!fs.existsSync('./secrets.json')) {
  console.log('Not found secrets.json, creating...');
  fs.writeFileSync('./secrets.json', JSON.stringify({
    "token": ""
  }));
  console.log('Go to secrets.json and add your token and there.');
  process.exit();
} else {
  console.log('Loaded secrets.json');
}

if (!fs.existsSync('./conf.json')) {
  console.log('Not found conf.json, creating...');
  fs.writeFileSync('./conf.json', JSON.stringify({
    "bot_prefix": "sx!",
    "log_channel_id": "963713518966808587",
    "owner_main_id": '882595027132493864',
    "owner_alt_id": '916880217329516604',
    "status_text": 'sx!help | sx9.is-a.dev',
    "status_type": 'LISTENING',
    "embed_color": '#00e1ff',
    "server_port": 3000,
  }));
  console.log('Go to conf.json and add your prefix, owner id, log channel id, status text, status type, embed color, and server port there.');
  process.exit();
} else {
  console.log('Loaded conf.json');
}

const bot_token = require('./secrets.json').token;
const { bot_prefix, owner_main_id, owner_alt_id, log_channel_id, status_text, status_type, embed_color, server_port } = require('./conf.json');
const db = require('./database.json');

pinger.get('/', (req, res) => {
  db.page_views++;
  res.send(`
  Coded by SX-Spy-Agent#1377<br>
  Website: <a href="https://sx9.is-a.dev">sx9.is-a.dev</a><br>
  Page Views: ${db.page_views}<br>
  `);
});
pinger.listen(server_port, () => {
  console.log(`Listening on port ${server_port}!`);
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(status_text, { type: status_type });
  client.channels.cache.get(log_channel_id).send('Bot is online!');
});

client.on('guildCreate', guild => {
  client.channels.cache.get(log_channel_id).send(`Bot joined guild: ${guild.name}`);
});

client.on('guildDelete', guild => {
  client.channels.cache.get(log_channel_id).send(`Bot left guild: ${guild.name}`);
});

client.on('message', msg => {
  if (msg.author.bot) return;
  if (!msg.guild.me.hasPermission('SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'USE_EXTERNAL_EMOJIS', 'ADD_REACTIONS')) {
    msg.channel.send(`Error: I don't have the required permissions to run properly!\nMore info: ${bot_prefix}perms`);
  }
  if (msg.content.startsWith(bot_prefix)) {
    db.cmds_used++;
    fs.writeFileSync('./database.json', JSON.stringify(db));
    client.channels.cache.get(log_channel_id).send(`${msg.author.username}: ${msg.content}`);
  }
  if (msg.content === `${bot_prefix}perms`) {
    msg.channel.send('I need the following permissions to run properly:\n```SEND_MESSAGES\nEMBED_LINKS\nATTACH_FILES\nREAD_MESSAGE_HISTORY\nUSE_EXTERNAL_EMOJIS\nADD_REACTIONS```');
  }
  if (msg.content === `${bot_prefix}cmdsused`) {
    msg.channel.send(`Total commands used: ${db.cmds_used}`);
  }
  if (msg.content === `${bot_prefix}vote`) {
    msg.channel.send(`https://top.gg/bot/${client.user.id}/`);
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
    webhook.send(`${msg.author.tag}: ${msg.content}`)
  }
  if (msg.content === bot_prefix + 'ping') {
    msg.channel.send({ embed: {
      color: embed_color,
      title: 'Pong! :ping_pong:',
      description: `${client.ws.ping}ms Response time`,
      fields: [
        {
          name: 'Operating System',
          value: `${os.platform()}`,
          inline: true
        },
        {
          name: 'CPU Usage',
          value: `${os.cpus()[0].model}`,
          inline: true
        },
        {
          name: 'RAM Usage',
          value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
          inline: true
        },

      ]
    }});
  }
  if (msg.content.startsWith(bot_prefix + 'say')) {
    if (msg.content.includes('@everyone') || msg.content.includes('@here') || msg.content.includes('<@&')) {
      msg.channel.send('You cannot use @/everyone, @/here, or ping roles in this command.');
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
    let choices = [':rock:', ':newspaper:', ':scissors:'];
    let pick = choices[Math.floor(Math.random() * choices.length)];
    let arg = msg.content.slice(bot_prefix.length + 4).toLocaleLowerCase();
    let text = ''; 
    if (arg === 'rock' || arg === 'r') {
      arg = ':rock:';
    } 
    if (arg === 'paper' || arg === 'p') {
      arg = ':newspaper:';
    } 
    if (arg === 'scissors' || arg === 's') {
      arg = ':scissors:';
    }
    if (arg === ':rock:' && pick === ':scissors:' || arg === ':newspaper:' && pick === ':rock:' || arg === ':scissors:' && pick === ':newspaper:') {
      text = 'You win!';
      db.bot_rps_losses++;
    } else {
      text = 'You lose!'; 
      db.bot_rps_wins++;
    }
    if (arg === pick) {
      text = 'Its a tie!';
    }
    if (arg !== ':rock:' && arg !== ':newspaper:' && arg !== ':scissors:') {
      msg.channel.send('Valid choices are: ``rock``, ``paper``, ``scissors``.\nShortcuts are: ``r``, ``p``, and ``s``.');
    } else {
      msg.channel.send({embed: {
          color: embed_color,
          title: "RPS Game Results",
          description: `You choose ${arg} and the bot choose ${pick}. ${text}`,
          fields: [
            {
              name: "Players Choice",
              value: arg,
              inline: true
            },
            {
              name: "Robots Choice",
              value: pick,
              inline: true
            },
            {
              name: "RPS Stats",
              value: `Bot Wins: ${db.bot_rps_wins}\nBot Losses: ${db.bot_rps_losses}`,
            }
          ],
          timestamp: new Date(),
          footer: {
            text: "sx9.is-a.dev",
          }
      }});
    }
  }
  if (msg.content.startsWith(bot_prefix + '8ball')) {
    let arg = msg.content.slice(bot_prefix.length + 5);
    let choices = ['It is certain.', 'It is decidedly so.', 'Without a doubt.', 'Yes - definitely.', 'You may rely on it.', 'As I see it, yes.', 'Most likely.', 'Outlook good.', 'Yes.', 'Signs point to yes.', 'Reply hazy, try again.', 'Ask again later.', 'Better not tell you now.', 'Cannot predict now.', 'Concentrate and ask again.', 'Don\'t count on it.', 'My reply is no.', 'My sources say no.', 'Outlook not so good.', 'Very doubtful.'];
    let pick = choices[Math.floor(Math.random() * choices.length)];
    msg.channel.send({embed: {
      color: embed_color,
      title: "Magic 8 Ball",
      description: `${msg.author.tag} asked: ${arg}\n8ball: ${pick}`,
      footer: {
        text: "sx9.is-a.dev"
      }
    }});
  }
  if (msg.content === bot_prefix + 'cat') {
    db.cats_gathered++;
    fetch('https://api.thecatapi.com/v1/images/search') 
    .then(res => res.json())
    .then(json => {
      msg.channel.send({embed: {
        color: embed_color,
        title: "Cat",
        description: 'Image Source: ' + json[0].url + '\nCats generated: ' + db.cats_gathered,
        image: {
          url: json[0].url
        },
        footer: {
          text: "sx9.is-a.dev"
        }
      }});
    });
  }
  if (msg.content.startsWith(bot_prefix + 'hug')) {
    let user = msg.mentions.users.first();
    msg.channel.send(`${msg.author.tag} hugged ${user.tag}, aww! (Stare at the gif below)`);
    msg.channel.send('https://tenor.com/view/hugs-rickroll-gif-24588121')
  }
  if (msg.content.startsWith(bot_prefix + 'slap')) {
    let user = msg.mentions.users.first();
    msg.channel.send(`${user.username} has been slapped by ${msg.author.username}, oof!`);
    msg.channel.send('https://tenor.com/view/abell46s-reface-batman-robin-bofetada-gif-18724899')
  }
  if (msg.content.startsWith(bot_prefix + 'rickroll')) {
    let user = msg.mentions.users.first();
    if (user === undefined) {
      msg.channel.send("You need to mention someone to rickroll them. Since you didn't, I'll rickroll you later ;)");
    } else {
      user.send(`You recived a message from someone...\nMessage: ||Never Gonna Give You Up Never Gonna Let You Down Never Gonna Run Around And Desert You||`);
      db.rickrolls++;
      msg.channel.send('Rickroll sent to ' + user.tag + '!\nTotal rickrolls sent: ' + db.rickrolls);
    }
  }
  if (msg.content.startsWith(bot_prefix + 'eval')) {
    let arg = msg.content.slice(bot_prefix.length + 5);
    let result = eval(arg);
    if (msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      msg.channel.send({embed: {
        color: embed_color,
        title: "Eval",
        description: `${arg}\n\nResult: ${result}`,
        footer: {
          text: "sx9.is-a.dev"
        }
      }});
    }
  }
  if (msg.content === bot_prefix + 'database') {
    if (msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      msg.channel.send('Type the following command to get the database: ```' + bot_prefix + 'eval msg.author.send("Here is the database.", { files: ["./database.json"] })```');
    } else {
      msg.channel.send('You do not have permission to use this command.');
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
              name: bot_prefix + "database",
              value: `Sends the bot's database.json file to you.`,
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
              name: bot_prefix + "eval <code>",
              value: `Evaluates a code.`,
              inline: true
            },
            {
              name: bot_prefix + "msg <user> <message>",
              value: `Sends a message to a user.`,
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
            name: bot_prefix + "vote",
            value: `Sends a link to the bot's top.gg page.`,
            inline: true
          },
          {
            name: bot_prefix + "perms",
            value: `Sends a list of all the permissions the bot needs.`,
            inline: true
          },
          {
            name: bot_prefix + "jointester",
            value: `Joins the testers with some experimental stuff.`,
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
            name: bot_prefix + "cmdsused",
            value: `Sends a message with how many times a user uses me.`,
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
            name: bot_prefix + "cat",
            value: "Sends a random cat",
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
            name: bot_prefix + "8ball <question>",
            value: "Sends a magic 8 ball",
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
          {
            name: bot_prefix + "slap <user>",
            value: "Slaps a user",
            inline: true
          },
          {
            name: bot_prefix + "hug <user>",
            value: "Hugs a user",
            inline: true
          },
          {
            name: bot_prefix + "rickroll <user>",
            value: "Rickrolls a user",
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
});

client.on('error', (error) => {
  webhook.send({embed: {
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

process.on('unhandledRejection', (error) => {
  client.channels.cache.get(log_channel_id).send(error.message)
});

client.login(bot_token);
