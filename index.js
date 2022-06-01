const Discord = require('discord.js');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGES_REACTS"] });
const app = require('express')();
const fetch = require('node-fetch');
const fs = require('fs');
const os = require("os");
const chalk = require('chalk');
const io = require('socket.io')(5000, {
  cors: { 
    origin: 'http://localhost:3000',
    methods: ['POST']
  } 
});

if (!fs.existsSync('./database.json')) {
  console.log(chalk.yellowBright('Not found database.json, creating...'));
  fs.writeFileSync('./database.json', JSON.stringify({
    "cmds_used": 0,
    "page_views": 0,
    "bot_rps_wins": 0,
    "bot_rps_losses": 0,
    "cats_gathered": 0,
    "rickrolls": 0,
  }));
} else {
  console.log(chalk.greenBright('Loaded database.json'));
}

if (!fs.existsSync('./secrets.json')) {
  console.log(chalk.yellowBright('Not found secrets.json, creating...'));
  fs.writeFileSync('./secrets.json', JSON.stringify({
    "token": "",
    "password": "",
  }));
  console.log(chalk.redBright('Go to secrets.json and add your token and there.'));
  process.exit();
} else {
  console.log(chalk.greenBright('Loaded secrets.json'));
}

if (!fs.existsSync('./conf.json')) {
  console.log(chalk.yellowBright('Not found conf.json, creating...'));
  fs.writeFileSync('./conf.json', JSON.stringify({
    "bot_prefix": "sx!",
    "log_channel_id": "963713518966808587",
    "owner_main_id": '882595027132493864',
    "owner_alt_id": '916880217329516604',
    "status_text": 'sx!help | cat.sx9.is-a.dev',
    "status_type": 'LISTENING',
    "embed_color": '#00e1ff',
    "yes_emoji_id": '975216960449151006',
    "no_emoji_id": '975216906841780285',
    "random_emoji_id": '975216920955596880',
    "server_port": 3000,
    "total_shards": 200,
  }));
  console.log(chalk.redBright('Go to conf.json and add your prefix, owner id, log channel id, and other stuff.'));
  process.exit();
} else {
  console.log(chalk.greenBright('Loaded conf.json'));
}

const bot_token = require('./secrets.json').token || process.env.token;
const dash_password = require('./secrets.json').password || process.env.password;
const { 
  bot_prefix, 
  owner_main_id, 
  owner_alt_id, 
  log_channel_id, 
  status_text, 
  status_type, 
  embed_color, 
  yes_emoji_id, 
  no_emoji_id, 
  random_emoji_id,
  server_port 
} = require('./conf.json');
const db = require('./database.json');

app.enable("trust proxy");
app.set('etag', false);
app.use(require('express').static(__dirname + './'));

app.use((req, res, next) => {
  console.log(chalk.blueBright(`${req.method}: ${req.url} from ${req.ip}`));
  next();
});

app.get('/dash/' + dash_password, (req, res) => {
  let dash = fs.readFileSync('./dash.html', { encoding: 'utf8' });
  dash = dash.replace('$$username$$', client.user.username);
  res.send(dash);
});

app.get('/stats', (req, res) => {
  db.page_views++;
  let stats = fs.readFileSync('./stats.html', { encoding: 'utf8' });
  stats = stats.replace('$$avatar$$', client.user.avatarURL());
  stats = stats.replace('$$username$$', client.user.username);
  stats = stats.replace('$$client-id$$', client.user.id);
  stats = stats.replace('$$page-views$$', db.page_views);
  stats = stats.replace('$$servers$$', client.guilds.cache.size);
  stats = stats.replace('$$users$$', client.users.cache.size);
  stats = stats.replace('$$cmds-used$$', db.cmds_used);
  stats = stats.replace('$$rps-wins$$', db.bot_rps_wins);
  stats = stats.replace('$$rps-losses$$', db.bot_rps_losses);
  stats = stats.replace('$$cats-generated$$', db.cats_gathered);
  stats = stats.replace('$$rickrolls$$', db.rickrolls);
  stats = stats.replace('$$ping$$', client.ws.ping);
  stats = stats.replace('$$uptime$$', client.uptime);
  stats = stats.replace('$$os$$', os.platform());
  stats = stats.replace('$$cpu$$', os.cpus()[0].model);
  stats = stats.replace('$$ram$$', os.totalmem());
  res.send(stats)
  res.json();
});
app.listen(server_port, () => {
  console.log(chalk.greenBright(`Listening on port ${server_port}!`));
});

if (io) {
  console.log(chalk.greenBright('Socket.io is online on port 5000!'));
} else {
  console.log(chalk.redBright('Socket.io is offline'));
  process.exit();
}

io.on('connection', socket => {
  console.log(chalk.blueBright('Server Connected To ' + socket.id));
  io.on('code-eval', data => {
    console.log(chalk.blueBright('Code Evaluation: ' + data));
    try {
      console.log(chalk.greenBright('Sending Result...'));
      socket.emit('code-output', 'Result: ' + eval(data));
    } catch (e) {
      console.log(chalk.redBright('Error: ' + e));
      socket.emit('code-output', 'Error: ' + e);
    }
  })
  io.on('disconnect', () => {
    console.log(chalk.yellowBright('Server Disconnected From ' + socket.id));
  });
});

client.on('ready', () => {
  console.log(chalk.greenBright(`Logged in as ${client.user.tag}!`));
  client.user.setActivity(status_text, { type: status_type });
  client.channels.cache.get(log_channel_id).send('Bot is online!');
});

client.on('guildCreate', guild => {
  client.channels.cache.get(log_channel_id).send(`Bot joined guild: ${guild.name} (${guild.id})`);
});

client.on('guildDelete', guild => {
  client.channels.cache.get(log_channel_id).send(`Bot left guild: ${guild.name} (${guild.id})`);
});

client.on('message', msg => {
  if (msg.author.bot) return;
  if (msg.content === `${bot_prefix}perms`) {
    msg.channel.send('I need the ADMINISTRATOR permission to run properly.');
  }
  if (msg.content.startsWith(bot_prefix)) {
    if (!msg.guild.me.hasPermission("ADMINISTRATOR")) return msg.channel.send('Error: I need permisions, run `' + bot_prefix + 'perms`');
    db.cmds_used++;
    client.channels.cache.get(log_channel_id).send(`${msg.author.tag}: "${msg.content}" in ${msg.channel.id}`);
  }
  if (msg.content.startsWith(bot_prefix + 'geninvite')) {
    let arg = msg.content.split(' ')[1];
    if (!msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      msg.channel.send('You do not have permission to run this command.');
    } else {
      client.channels.cache.get(arg).createInvite({
        'temporary': true,
        'maxAge': 604800,
        'maxUses': 1
      }).then(invite => {
        msg.channel.send(invite.url);
      })
    }
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
            value: `> ${client.guilds.cache.map(g => g.name ).join("\n> ")}`,
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
    console.log(chalk.blueBright(`${msg.author.tag}: ${msg.content}`));
    msg.react('📧');
    client.channels.cache.get(log_channel_id).send(`${msg.author.tag}: ${msg.content}`)
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
      msg.channel.send(msg.author.tag + ': ' + msg.content.slice(bot_prefix.length + 4));
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
    msg.react(random_emoji_id);
  }
  if (msg.content.startsWith(bot_prefix + 'poll')) {
    msg.react(yes_emoji_id);
    msg.react(no_emoji_id);
  }
  if (msg.content.startsWith(bot_prefix + 'kill')) {
    if (msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      msg.react(yes_emoji_id);
      client.channels.cache.get(log_channel_id).send(`${msg.author.tag} has killed the bot.`);
      console.log(chalk.redBright('Bot killed by ' + msg.author.tag));
      setTimeout(() => {
        process.exit(0);
      }, 3000);
    } else {
      msg.react(no_emoji_id)
      msg.channel.send('You are not the owner of this bot.');
    }
  }
  if (msg.content === bot_prefix + 'dm') {
    msg.channel.send('You have been dmed.');
    msg.author.send('Hello There!');
  }
  if (msg.content === bot_prefix + 'token') {
    if (msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      msg.react(yes_emoji_id);
      msg.channel.send('Check your DMs!');
      msg.author.send("```" + bot_token + "```");
    } else {
      msg.react(no_emoji_id);
      msg.channel.send('You do not have permission to use this command.');
    }
  }
  if (msg.content.startsWith(bot_prefix + 'owner')) {
    if (msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      msg.channel.send('Owner: True');
    } else {
      msg.react(no_emoji_id);
      msg.channel.send('Owner: False');
    }
  }
  if (msg.content.startsWith(bot_prefix + 'setname')) {
    if (msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      client.user.setUsername(msg.content.slice(bot_prefix.length + 8));
      msg.react(yes_emoji_id);
      msg.channel.send('Done!');
    } else {
      msg.react(no_emoji_id);
      msg.channel.send('You do not have permission to use this command.');
    }
  }
  if (msg.content.startsWith(bot_prefix + 'setpfp')) {
    if (msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      msg.channel.send('Avatar changed.');
      client.user.setAvatar(msg.content.slice(bot_prefix.length + 7));
    } else {
      msg.react(no_emoji_id);
      msg.channel.send('You do not have permission to use this command.');
    }
  }
  if (msg.content.startsWith(bot_prefix + 'log')) {
    if (msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      msg.channel.send('Logged.');
      console.log(chalk.yellowBright(msg.content.slice(bot_prefix.length + 4)));
      client.channels.cache.get(log_channel_id).send(msg.content.slice(bot_prefix.length + 4));
    } else {
      msg.react(no_emoji_id);
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
    if (msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      let arg = msg.content.slice(bot_prefix.length + 5);
      try {
        let evaled = eval(arg);
        msg.channel.send({embed: {
          color: embed_color,
          title: "Eval",
          description: `Input: ${arg}\nOutput: ${evaled}`,
          footer: {
            text: "sx9.is-a.dev"
          }
        }});
      } catch (err) {
        msg.channel.send({embed: {
          color: 'RED',
          title: "Eval ERROR",
          description: `Input: ${arg}\nOutput: ${err}`,
          footer: {
            text: "sx9.is-a.dev"
          }
        }});
      }
    } else {
      msg.channel.send('You do not have access to this command.');
    }
  }
  if (msg.content === bot_prefix + 'database') {
    if (msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      msg.channel.send('Type the following command to get the database: ```' + bot_prefix + 'eval msg.author.send("Here is the database.", { files: ["./database.json"] })```');
    } else {
      msg.channel.send('You do not have permission to use this command.');
    }
  }
  if (msg.content.startsWith(bot_prefix + 'warn')) {
    let user = msg.mentions.users.first();
    let reason = msg.content.slice(bot_prefix.length + 5) || 'No reason given.';
    if (!msg.member.hasPermission('KICK_MEMBERS')) {
      msg.channel.send('You do not have permission to use this command.');
    } else {
      if (user === undefined) {
        msg.channel.send('You need to mention someone to warn them.');
      } else {
        user.send(`You have been warned in ${msg.guild.name} for: ${reason}`);
        msg.channel.send(`${user.tag} has been warned for: ${reason}`);
      }
    }
  }
  if (msg.content.startsWith(bot_prefix + 'kick')) {
    let user = msg.mentions.users.first();
    let reason = msg.content.slice(bot_prefix.length + 5) || 'No reason provided.';
    if (!msg.member.hasPermission('KICK_MEMBERS')) {
      msg.channel.send('You do not have permission to use this command.');
    } else {
      if (user === undefined) {
        msg.channel.send('You need to mention someone to kick them.');
      } else {
        user.send(`You have been kicked from ${msg.guild.name} for: ${reason}`);
        msg.channel.send(`${user.tag} has been kicked for: ${reason}`);
        setTimeout(() => {
          msg.guild.member(user).kick(reason)
        }, 3000)
      }
    }
  }
  if (msg.content.startsWith(bot_prefix + 'unban')) {
    let id = msg.content.slice(bot_prefix.length + 6);
    if (!msg.member.hasPermission('BAN_MEMBERS')) {
      msg.channel.send('You do not have permission to use this command.');
    } else {
      msg.guild.members.unban(id);
      msg.channel.send(`Unbanned <@&${id}>`);
    }
  }
  if (msg.content.startsWith(bot_prefix + 'ban')) {
    let user = msg.mentions.users.first();
    let why = msg.content.slice(bot_prefix.length + 5) || 'No reason provided.';
    if (!msg.member.hasPermission('BAN_MEMBERS')) {
      msg.channel.send('You do not have permission to use this command.');
    } else {
      if (user === undefined) {
        msg.channel.send('You need to mention someone to ban them.');
      } else {
        user.send(`You have been banned from ${msg.guild.name} for: ${why}`);
        msg.channel.send(`${user.tag} has been banned for: ${why}`);
        setTimeout(() => {
          msg.guild.member(user).ban({reason: why});
        }, 3000)
      }
    }
  }
  if (msg.content.startsWith(bot_prefix + 'slowmode')) {
    let time = msg.content.slice(bot_prefix.length + 9);
    if (!msg.member.hasPermission('MANAGE_CHANNELS')) {
      msg.channel.send('You do not have permission to use this command.');
    } else {
      if (time === undefined) {
        msg.channel.send('You need to specify a time,');
      } else {
        if (isNaN(time)) {
          msg.channel.send('You need to specify a time.');
        } else {
          msg.channel.setRateLimitPerUser(time);
          msg.channel.send('Slowmode set to ' + time + 'seconds.');
        }
      }
    }
  }
  if (msg.content.startsWith(bot_prefix + 'purge')) {
    let amount = msg.content.slice(bot_prefix.length + 6);
    if (!msg.member.hasPermission('MANAGE_MESSAGES')) {
      msg.channel.send('You do not have permission to use this command.');
    } else {
      if (amount === undefined) {
        msg.channel.send('You need to specify how many messages to delete.');
      } else {
        if (isNaN(amount)) {
          msg.channel.send('You need to specify how many messages to delete.');
        } else {
          if (amount > 100) {
            msg.channel.send('You cannot delete more than 100 messages at a time.');
          } else {
            msg.channel.bulkDelete(amount);
            msg.channel.send(`Deleted ${amount} messages.`).then(msg => msg.delete({ timeout: 3000 }));
          }
        }
      }
    }
  }
  if (msg.content.startsWith(bot_prefix + 'banall')) {
    let reason = msg.content.slice(bot_prefix.length + 7) || 'No reason provided.';
    if (!msg.member.hasPermission('BAN_MEMBERS')) {
      msg.channel.send('You do not have permission to use this command.');
    } else {
      msg.guild.members.cache.forEach(member => {
        if (member.user.bot) return;
        member.send('You have been banned from ' + msg.guild.name + ' for: ' + reason);
        member.ban(reason);
        msg.channel.send(`Banned: ${member.user.tag}`);
      });
      msg.channel.send('All users have been banned.');
    }
  }
  if (msg.content.startsWith(bot_prefix + 'kickall')) {
    let reason = msg.content.slice(bot_prefix.length + 8) || 'No reason provided.';
    if (!msg.member.hasPermission('KICK_MEMBERS')) {
      msg.channel.send('You do not have permission to use this command.');
    } else {
      msg.guild.members.cache.forEach(member => {
        if (member.user.bot) return;
        if (member.id !== msg.guild.ownerID) {
          member.send(`You have been kicked from ${msg.guild.name} for: ${reason}`);
          setTimeout(() => {
            msg.guild.member(member).kick(reason)
          }, 3000)
        }
        msg.channel.send('Kicked: ' + member.user.tag);
      })
      msg.channel.send('Kicked everyone.');
    }
  }
  if (msg.content.startsWith(bot_prefix + 'dmall')) {
    let message = msg.content.slice(bot_prefix.length + 6);
    if (!msg.member.hasPermission('ADMINISTRATOR')) {
      msg.channel.send('You do not have permission to use this command.');
    } else {
      msg.guild.members.cache.forEach(member => {
        if (member.user.bot) return;
        member.send(message);
        msg.channel.send(`Sent message to ${member.user.tag}`);
      });
      msg.channel.send('Message sent to all members.');
    }
  }
  if (msg.content === bot_prefix + 'blurplefier') {
    msg.channel.send('https://projectblurple.com/paint/');
  }
  if (msg.content === bot_prefix + 'help mod') {
    msg.channel.send({embed: {
      color: embed_color,
      title: "Moderation Commands",
      description: "These commands are for moderators and administrators only.",
      fields: [
        {
          name: bot_prefix + "slowmode <seconds>",
          value: "Sets the slowmode for the channel.",
          inline: true
        },
        {
          name: bot_prefix + "unban <id>",
          value: "Unbans a user.",
          inline: true
        },
        {
          name: bot_prefix + "purge <amount>",
          value: "Deletes messages.",
          inline: true
        },
        {
          name: bot_prefix + "kickall <reason>",
          value: "Kicks all users.",
          inline: true
        },
        {
          name: bot_prefix + "dmall <reason>",
          value: "DMs all users.",
          inline: true
        },
        {
          name: bot_prefix + "banall <reason>",
          value: "Bans all users.",
          inline: true
        },
        {
          name: bot_prefix + "warn <user> <reason>",
          value: "Warns a user.",
          inline: true
        },
        {
          name: bot_prefix + "kick <user> <reason>",
          value: "Kicks a user.",
          inline: true
        },
        {
          name: bot_prefix + "ban <user> <reason>",
          value: "Bans a user.",
          inline: true
        },
      ],
      footer: {
        text: "sx9.is-a.dev"
      }
    }});
  }
  if (msg.content === bot_prefix + 'help owner') {
    if (msg.author.id === owner_main_id || msg.author.id === owner_alt_id) {
      msg.react(yes_emoji_id);
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
              name: bot_prefix + "geninvite <channel-id>",
              value: `Generates an invite from a server.`,
            },
            {
              name: bot_prefix + "eval <code>",
              value: `Evaluates a code.`,
              inline: true
            },
          ],
          timestamp: new Date(),
          footer: {
            text: "sx9.is-a.dev",
          }
      }});
    } else {
      msg.react(no_emoji_id);
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
          {
            name: bot_prefix + "blurplefier",
            value: "Blurplefy your pfp",
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
  if (msg.content === bot_prefix + 'help') {
    msg.channel.send({embed: {
        color: embed_color,
        title: client.user.username,
        description: "Hi, Thanks for using me! To contact owners dm me! (I will not respond back)",
        fields: [
          {
            name: bot_prefix + "help mod",
            value: "Sends a list of mod commands",
            inline: true
          },
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
            name: "Links",
            value: "[Bot Stats](https://cat.sx9.is-a.dev) | [Vote Me On Top.gg](https://top.gg/bot/" + client.user.id + "/vote) | [Invite Me](https://discordapp.com/oauth2/authorize?client_id=" + client.user.id + "&permissions=8&scope=bot) | [Support Server](https://discord.gg/723897885869058688) | [Github Source](https://github.com/SX-9/sx-discord-bot) | [Website](https://sx9.is-a.dev)",
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
});

client.on("warn", console.warn);
client.on("error", console.error);

process.on('unhandledRejection', (error) => {
  try {
    client.channels.cache.get(log_channel_id).send(error.message)
  } catch (e) {
    console.log(chalk.yellowBright(error.message));
  }
});

client.login(bot_token);
