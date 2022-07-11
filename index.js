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
    methods: ['GET', 'POST']
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

if (!fs.existsSync('./settings.json')) {
  console.log(chalk.yellowBright('Not found settings.json, creating...'));
  fs.writeFileSync('./settings.json', `
    "secrets": {
        "token": "",
        "password": ""
    },
    "config": {
        "bot": {
            "prefix": "dot!",
            "shards": 200,
            "color": "#00e1ff",
            "logs": "963713518966808587",
            "owners": {
                "main": "882595027132493864",
                "alt": "916880217329516604"
            },
            "emojis": {
                "yes": "975216960449151006",
                "no": "975216906841780285",
                "random": "975216920955596880"
            },
            "status": {
                "text": "dot!help | cat.sx9.is-a.dev",
                "type": "LISTENING"
            }
        },
        "web": {
            "port": 3000,
            "dash": true
        }
    }
  `);
  console.log(chalk.redBright('Go to settings.json and add your prefix, owner id, log channel id, and other stuff.'));
  process.exit();
} else {
  console.log(chalk.greenBright('Loaded settings.json'));
}

const settings = require('./settings.json');
const db = require('./database.json');

app.enable("trust proxy");
app.set('etag', false);
app.use(require('express').static(__dirname + './'));
app.use(require('express').json());

app.use((req, res, next) => {
  console.log(chalk.blueBright(`${req.method}: ${req.url}`));
  next();
});

app.post('/dash/:pass', (req, res) => {
  if (settings.web.dash) {
    if (req.params.pass === settings.secrets.password || process.env.password) {
      try {
        res.json({ "messs": eval(req.body.code) });
      } catch (e) {
        res.json({ "messs": e.toString() });
      }
    } else {
      res.json({ "mess": "Invalid password" });
    }
  } else {
    res.json({ "mess": "Dashboard is disabled" });
  }
});

app.get('/', (req, res) => {
  fs.writeFileSync('./database.json', JSON.stringify({
    "cmds_used": db.cmds_used,
    "page_views": db.page_views + 1,
    "bot_rps_wins": db.bot_rps_wins,
    "bot_rps_losses": db.bot_rps_losses,
    "cats_gathered": db.cats_gathered,
    "rickrolls": db.rickrolls,
  }));
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
app.listen(settings.config.web.port, () => {
  console.log(chalk.greenBright(`Listening on port ${settings.config.web.port}!`));
});

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
  client.user.setActivity(settings.config.bot.status.text, { type: settings.config.bot.status.type });
  client.channels.cache.get(settings.config.bot.logs).send('Bot is online!');
});

client.on('guildCreate', guild => {
  client.channels.cache.get(settings.config.bot.logs).send(`Bot joined guild: ${guild.name} (${guild.id})`);
});

client.on('guildDeletenhqg', guild => {
  client.channels.cache.get(settings.config.bot.logs).send(`Bot left guild: ${guild.name} (${guild.id})`);
});

client.on('message', msg => {
  if (msg.author.bot) return;
  if (msg.content === `${settings.config.bot.prefix}perms`) {
    msg.channel.send(`
    I need the following permissions to run properly.

    For Info Commands:
    > Send Messages 
    > Read Message History 
    > Embed Links
    > View Channels
    
    For Fun Commands:
    > Add Reactions
    > Use External Emojis
    > Atach Files
    
    For Moderation Commands:
    > Kick Members
    > Ban Members
    > Manage Channels
    > Manage Messages
    `);
    return;
  }
  if (msg.content.startsWith(settings.config.bot.prefix)) {
    fs.writeFileSync('./database.json', JSON.stringify({
      "cmds_used": db.cmds_used + 1,
      "page_views": db.page_views,
      "bot_rps_wins": db.bot_rps_wins,
      "bot_rps_losses": db.bot_rps_losses,
      "cats_gathered": db.cats_gathered,
      "rickrolls": db.rickrolls,
    }));
    db.cmds_used++;
    client.channels.cache.get(settings.config.bot.logs).send(`${msg.author.tag}: "${msg.content}" in ${msg.channel.id}`);
  }
  if (msg.content === `${settings.config.bot.prefix}cmdsused`) {
    msg.channel.send(`Total commands used: ${db.cmds_used}`);
  }
  if (msg.content === `${settings.config.bot.prefix}vote`) {
    msg.channel.send(`https://top.gg/bot/${client.user.id}/`);
  }
  if (msg.content === `${settings.config.bot.prefix}meme`) {
    fetch('https://meme-api.herokuapp.com/gimme').then(res => res.json()).then(json => {
      msg.channel.send({ embed: {
        color: settings.config.bot.color,
        title: json.title,
        description: json.postLink,
        image: {
          url: json.url
        }
      }});
    });
  }
  if (msg.content.startsWith(`${settings.config.bot.prefix}status`)) {
    if (msg.author.id === settings.config.bot.owners.main || msg.author.id === settings.config.bot.owners.alt) {
      const args = msg.content.split(' ');
      if (args[1] === 'reset') {
        client.user.setActivity(settings.config.bot.status.text, { type: settings.config.bot.status.type });
        msg.channel.send(`Status reset!`);
      } else {
        client.user.setActivity(args.slice(1).join(' '), { type: settings.config.bot.status.type });
        msg.channel.send(`Status set to: ${args.slice(1).join(' ')}`);
      }
    } 
  }
  if (msg.content === `${settings.config.bot.prefix}jointester`) {
    msg.channel.send({ embed: {
      color: settings.config.bot.color,
      title: 'How to join the testers:',
      description: 'Join the testers by joining the [community server](https://discord.gg/Z98auctczm) and say ``<@!' + settings.config.bot.owners.main + '> JoinTesters101``)!',
      footer: {
        text: 'sx9.is-a.dev'
      }
    }});
  }
  if (msg.content.startsWith(settings.config.bot.prefix + 'random')) {
    let random_number = Math.floor(Math.random() * 9000000) + 1;
    msg.channel.send(`Your random number is ${random_number} out of 9,000,000.`);
  }
  if (msg.content === `${settings.config.bot.prefix}serverlist`) {
    if (msg.author.id === settings.config.bot.owners.main || msg.author.id === settings.config.bot.owners.alt) {
      msg.author.send({ embed: {
        color: settings.config.bot.color,
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
    }
  }
  if (msg.channel.type === 'dm') {
    console.log(chalk.blueBright(`${msg.author.tag}: ${msg.content}`));
    msg.react('📧');
    client.channels.cache.get(settings.config.bot.logs).send(`${msg.author.tag}: ${msg.content}`)
  }
  if (msg.content === settings.config.bot.prefix + 'ping') {
    msg.channel.send({ embed: {
      color: settings.config.bot.color,
      title: 'Pong! :ping_pong:',
      description: `${client.ws.ping}ms Response time`,
      fields: [
        {
          name: 'Operating System',
          value: `${os.platform()}`,
          inline: true
        },
        {
          name: 'CPU Name',
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
  if (msg.content.startsWith(settings.config.bot.prefix + 'say')) {
    if (msg.content.includes('@everyone') || msg.content.includes('@here') || msg.content.includes('<@&')) {
      msg.channel.send('You cannot use @/everyone, @/here, or ping roles in this command.');
    } else {
      msg.channel.send(msg.author.tag + ': ' + msg.content.slice(settings.config.bot.prefix.length + 4));
    }
  }
  if (msg.content === settings.config.bot.prefix + 'avatar') {
    msg.channel.send({embed: {
        color: settings.config.bot.color,
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
  if (msg.content === settings.config.bot.prefix + 'react') {
    msg.react(settings.config.bot.emojis.random);
  }
  if (msg.content.startsWith(settings.config.bot.prefix + 'poll')) {
    msg.react(settings.config.bot.emojis.yes);
    msg.react(settings.config.bot.emojis.no);
  }
  if (msg.content.startsWith(settings.config.bot.prefix + 'kill')) {
    if (msg.author.id === settings.config.bot.owners.main || msg.author.id === settings.config.bot.owners.alt) {
      msg.react(settings.config.bot.emojis.yes);
      client.channels.cache.get(settings.config.bot.logs).send(`${msg.author.tag} has killed the bot.`);
      console.log(chalk.redBright('Bot killed by ' + msg.author.tag));
      setTimeout(() => {
        process.exit(0);
      }, 3000);
    }
  }
  if (msg.content === settings.config.bot.prefix + 'dm') {
    msg.channel.send('You have been dmed.');
    msg.author.send('Hello There!');
  }
  if (msg.content === settings.config.bot.prefix + 'token') {
    if (msg.author.id === settings.config.bot.owners.main || msg.author.id === settings.config.bot.owners.alt) {
      msg.react(settings.config.bot.emojis.yes);
      msg.channel.send('Check your DMs!');
      msg.author.send("```" + settings.secrets.token + "```");
    }
  }
  if (msg.content.startsWith(settings.config.bot.prefix + 'owner')) {
    if (msg.author.id === settings.config.bot.owners.main || msg.author.id === settings.config.bot.owners.alt) {
      msg.react(settings.config.bot.emojis.yes);
      msg.channel.send('Owner: True');
    } else {
      msg.react(settings.config.bot.emojis.no);
      msg.channel.send('Owner: False');
    }
  }
  if (msg.content.startsWith(settings.config.bot.prefix + 'setname')) {
    if (msg.author.id === settings.config.bot.owners.main || msg.author.id === settings.config.bot.owners.alt) {
      client.user.setUsername(msg.content.slice(settings.config.bot.prefix.length + 8));
      msg.react(settings.config.bot.emojis.yes);
      msg.channel.send('Done!');
    }
  }
  if (msg.content.startsWith(settings.config.bot.prefix + 'setpfp')) {
    if (msg.author.id === settings.config.bot.owners.main || msg.author.id === settings.config.bot.owners.alt) {
      msg.channel.send('Avatar changed.');
      client.user.setAvatar(msg.content.slice(settings.config.bot.prefix.length + 7));
    }
  }
  if (msg.content.startsWith(settings.config.bot.prefix + 'log')) {
    if (msg.author.id === settings.config.bot.owners.main || msg.author.id === settings.config.bot.owners.alt) {
      msg.channel.send('Logged.');
      console.log(chalk.yellowBright(msg.content.slice(settings.config.bot.prefix.length + 4)));
      client.channels.cache.get(settings.config.bot.logs).send(msg.content.slice(settings.config.bot.prefix.length + 4));
    }
  }
  
  if (msg.content.startsWith(settings.config.bot.prefix + 'rps')) {
    let choices = [':rock:', ':newspaper:', ':scissors:'];
    let pick = choices[Math.floor(Math.random() * choices.length)];
    let arg = msg.content.slice(settings.config.bot.prefix.length + 4).toLocaleLowerCase();
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
      fs.writeFileSync('./database.json', JSON.stringify({
        "cmds_used": db.cmds_used,
        "page_views": db.page_views,
        "bot_rps_wins": db.bot_rps_wins,
        "bot_rps_losses": db.bot_rps_losses + 1,
        "cats_gathered": db.cats_gathered,
        "rickrolls": db.rickrolls,
      }))
      db.bot_rps_losses++;
    } else {
      text = 'You lose!'; 
      fs.writeFileSync('./database.json', JSON.stringify({
        "cmds_used": db.cmds_used,
        "page_views": db.page_views,
        "bot_rps_wins": db.bot_rps_wins + 1,
        "bot_rps_losses": db.bot_rps_losses,
        "cats_gathered": db.cats_gathered,
        "rickrolls": db.rickrolls,
      }));
      db.bot_rps_wins++;
    }
    if (arg === pick) {
      text = 'Its a tie!';
    }
    if (arg !== ':rock:' && arg !== ':newspaper:' && arg !== ':scissors:') {
      msg.channel.send('Valid choices are: ``rock``, ``paper``, ``scissors``.\nShortcuts are: ``r``, ``p``, and ``s``.');
    } else {
      msg.channel.send({embed: {
          color: settings.config.bot.color,
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
  if (msg.content.startsWith(settings.config.bot.prefix + '8ball')) {
    let arg = msg.content.slice(settings.config.bot.prefix.length + 5);
    let choices = ['It is certain.', 'It is decidedly so.', 'Without a doubt.', 'Yes - definitely.', 'You may rely on it.', 'As I see it, yes.', 'Most likely.', 'Outlook good.', 'Yes.', 'Signs point to yes.', 'Reply hazy, try again.', 'Ask again later.', 'Better not tell you now.', 'Cannot predict now.', 'Concentrate and ask again.', 'Don\'t count on it.', 'My reply is no.', 'My sources say no.', 'Outlook not so good.', 'Very doubtful.'];
    let pick = choices[Math.floor(Math.random() * choices.length)];
    msg.channel.send({embed: {
      color: settings.config.bot.color,
      title: "Magic 8 Ball",
      description: `${msg.author.tag} asked: ${arg}\n8ball: ${pick}`,
      footer: {
        text: "sx9.is-a.dev"
      }
    }});
  }
  if (msg.content === settings.config.bot.prefix + 'cat') {
    fs.writeFileSync('./database.json', JSON.stringify({
      "cmds_used": db.cmds_used,
      "page_views": db.page_views,
      "bot_rps_wins": db.bot_rps_wins,
      "bot_rps_losses": db.bot_rps_losses,
      "cats_gathered": db.cats_gathered + 1,
      "rickrolls": db.rickrolls,
    }));
    db.cats_gathered++;
    fetch('https://api.thecatapi.com/v1/images/search') 
    .then(res => res.json())
    .then(json => {
      msg.channel.send({embed: {
        color: settings.config.bot.color,
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
  if (msg.content.startsWith(settings.config.bot.prefix + 'hug')) {
    let user = msg.mentions.users.first();
    msg.channel.send(`${msg.author.tag} hugged ${user.tag}, aww! (Stare at the gif below)`);
    msg.channel.send('https://tenor.com/view/hugs-rickroll-gif-24588121')
  }
  if (msg.content.startsWith(settings.config.bot.prefix + 'slap')) {
    let user = msg.mentions.users.first();
    msg.channel.send(`${user.username} has been slapped by ${msg.author.username}, oof!`);
    msg.channel.send('https://tenor.com/view/abell46s-reface-batman-robin-bofetada-gif-18724899')
  }
  if (msg.content.startsWith(settings.config.bot.prefix + 'rickroll')) {
    let user = msg.mentions.users.first();
    if (user === undefined) {
      msg.channel.send("You need to mention someone to rickroll them. Since you didn't, I'll rickroll you later ;)");
    } else {
      user.send(`You recived a message from someone...\nMessage: ||Never Gonna Give You Up Never Gonna Let You Down Never Gonna Run Around And Desert You||`);
      fs.writeFileSync('./database.json', JSON.stringify({
        "cmds_used": db.cmds_used,
        "page_views": db.page_views,
        "bot_rps_wins": db.bot_rps_wins,
        "bot_rps_losses": db.bot_rps_losses,
        "cats_gathered": db.cats_gathered,
        "rickrolls": db.rickrolls + 1,
      }));
      db.rickrolls++;
      msg.channel.send('Rickroll sent to ' + user.tag + '!\nTotal rickrolls sent: ' + db.rickrolls);
    }
  }
  if (msg.content.startsWith(settings.config.bot.prefix + 'eval')) {
    if (msg.author.id === settings.config.bot.owners.main || msg.author.id === settings.config.bot.owners.alt) {
      let arg = msg.content.slice(settings.config.bot.prefix.length + 5);
      try {
        let evaled = eval(arg);
        msg.channel.send({embed: {
          color: settings.config.bot.color,
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
    }
  }
  if (msg.content === settings.config.bot.prefix + 'database') {
    if (msg.author.id === settings.config.bot.owners.main || msg.author.id === settings.config.bot.owners.alt) {
      msg.author.send("Here is the database.", { files: ["./database.json"] })
    }
  }
  if (msg.content.startsWith(settings.config.bot.prefix + 'warn')) {
    let user = msg.mentions.users.first();
    let reason = msg.content.slice(settings.config.bot.prefix.length + 5) || 'No reason given.';
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
  if (msg.content.startsWith(settings.config.bot.prefix + 'kick')) {
    let user = msg.mentions.users.first();
    let reason = msg.content.slice(settings.config.bot.prefix.length + 5) || 'No reason provided.';
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
  if (msg.content.startsWith(settings.config.bot.prefix + 'unban')) {
    let id = msg.content.slice(settings.config.bot.prefix.length + 6);
    if (!msg.member.hasPermission('BAN_MEMBERS')) {
      msg.channel.send('You do not have permission to use this command.');
    } else {
      msg.guild.members.unban(id);
      msg.channel.send(`Unbanned <@&${id}>`);
    }
  }
  if (msg.content.startsWith(settings.config.bot.prefix + 'ban')) {
    let user = msg.mentions.users.first();
    let why = msg.content.slice(settings.config.bot.prefix.length + 5) || 'No reason provided.';
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
  if (msg.content.startsWith(settings.config.bot.prefix + 'slowmode')) {
    let time = msg.content.slice(settings.config.bot.prefix.length + 9);
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
  if (msg.content.startsWith(settings.config.bot.prefix + 'purge')) {
    let amount = msg.content.slice(settings.config.bot.prefix.length + 6);
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
  if (msg.content.startsWith(settings.config.bot.prefix + 'banall')) {
    let reason = msg.content.slice(settings.config.bot.prefix.length + 7) || 'No reason provided.';
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
  if (msg.content.startsWith(settings.config.bot.prefix + 'kickall')) {
    let reason = msg.content.slice(settings.config.bot.prefix.length + 8) || 'No reason provided.';
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
  if (msg.content === settings.config.bot.prefix + 'blurplefier') {
    msg.channel.send('https://projectblurple.com/paint/');
  }
  if (msg.content === settings.config.bot.prefix + 'help mod') {
    msg.channel.send({embed: {
      color: settings.config.bot.color,
      title: "Moderation Commands",
      description: "These commands are for moderators and administrators only.",
      fields: [
        {
          name: settings.config.bot.prefix + "slowmode <seconds>",
          value: "Sets the slowmode for the channel.",
          inline: true
        },
        {
          name: settings.config.bot.prefix + "unban <id>",
          value: "Unbans a user.",
          inline: true
        },
        {
          name: settings.config.bot.prefix + "purge <amount>",
          value: "Deletes messages.",
          inline: true
        },
        {
          name: settings.config.bot.prefix + "kickall <reason>",
          value: "Kicks all users.",
          inline: true
        },
        {
          name: settings.config.bot.prefix + "banall <reason>",
          value: "Bans all users.",
          inline: true
        },
        {
          name: settings.config.bot.prefix + "warn <user> <reason>",
          value: "Warns a user.",
          inline: true
        },
        {
          name: settings.config.bot.prefix + "kick <user> <reason>",
          value: "Kicks a user.",
          inline: true
        },
        {
          name: settings.config.bot.prefix + "ban <user> <reason>",
          value: "Bans a user.",
          inline: true
        },
      ],
      footer: {
        text: "sx9.is-a.dev"
      }
    }});
  }
  if (msg.content === settings.config.bot.prefix + 'help owner') {
    if (msg.author.id === settings.config.bot.owners.main || msg.author.id === settings.config.bot.owners.alt) {
      msg.react(settings.config.bot.emojis.yes);
      msg.channel.send("Check your DMs!");
      msg.author.send({embed: {
          color: settings.config.bot.color,
          title: "Owner Only Commands",
          description: "Here are some commands I can help you with!",
          fields: [
            {
              name: settings.config.bot.prefix + "token",
              value: `Sends the bot's token to you.`,
              inline: true
            },
            {
              name: settings.config.bot.prefix + "kill",
              value: `Kills the bot.`,
              inline: true
            },
            {
              name: settings.config.bot.prefix + "serverlist",
              value: `Sends a list of all the servers the bot is in.`,
              inline: true
            },
            {
              name: settings.config.bot.prefix + "database",
              value: `Sends the bot's database.json file to you.`,
              inline: true
            },
            {
              name: settings.config.bot.prefix + "setname <name>",
              value: `Changes the bot's username.`,
              inline: true
            },
            {
              name: settings.config.bot.prefix + "setpfp <url>",
              value: `Changes the bot's avatar.`,
              inline: true
            },
            {
              name: settings.config.bot.prefix + "status <status>",
              value: `Changes the bot's status.`,
              inline: true
            },
            {
              name: settings.config.bot.prefix + "log <message>",
              value: `Logs a message to the console.`,
              inline: true
            },
            {
              name: settings.config.bot.prefix + "eval <code>",
              value: `Evaluates a code.`,
              inline: true
            },
          ],
          timestamp: new Date(),
          footer: {
            text: "sx9.is-a.dev",
          }
      }});
    }
  }
  if (msg.content === settings.config.bot.prefix + 'help info') {
    msg.channel.send({embed: {
        color: settings.config.bot.color,
        title: "Info Commands",
        description: "Here are some commands I can help you with!",
        fields: [
          {
            name: settings.config.bot.prefix + "vote",
            value: `Sends a link to the bot's top.gg page.`,
            inline: true
          },
          {
            name: settings.config.bot.prefix + "perms",
            value: `Sends a list of all the permissions the bot needs.`,
            inline: true
          },
          {
            name: settings.config.bot.prefix + "jointester",
            value: `Joins the testers with some experimental stuff.`,
            inline: true
          },
          {
            name: settings.config.bot.prefix + "ping",
            value: `See how long it takes to ping the bot.`,
            inline: true
          },
          {
            name: settings.config.bot.prefix + "cmdsused",
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
  if (msg.content === settings.config.bot.prefix + 'help fun') {
    msg.channel.send({embed: {
        color: settings.config.bot.color,
        title: "Fun Commands",
        description: "Hi, Thanks for using me! To contact owners dm me! (I will not respond back)",
        fields: [
          {
            name: settings.config.bot.prefix + "dm",
            value: "Sends a dm to you",
            inline: true
          }, 
          {
            name: settings.config.bot.prefix + "avatar",
            value: "Sends your avatar",
            inline: true
          },
          {
            name: settings.config.bot.prefix + "react",
            value: "Reacts with a blue dot",
            inline: true
          },
          {
            name: settings.config.bot.prefix + "random",
            value: "Sends a random number from 1 to 9,000,000",
            inline: true
          },
          {
            name: settings.config.bot.prefix + "meme",
            value: "Sends a random meme",
            inline: true
          },
          {
            name: settings.config.bot.prefix + "cat",
            value: "Sends a random cat",
            inline: true
          },
          {
            name: settings.config.bot.prefix + "owner",
            value: "Sends a message saying if you are the owner or not",
            inline: true
          },
          {
            name: settings.config.bot.prefix + "rps <choice>",
            value: "Sends a rock paper scissors game",
            inline: true
          },
          {
            name: settings.config.bot.prefix + "8ball <question>",
            value: "Sends a magic 8 ball",
            inline: true
          },
          {
            name: settings.config.bot.prefix + "say <message>",
            value: "Sends a message that you typed after the command",
            inline: true
          },
          {
            name: settings.config.bot.prefix + "poll <question>",
            value: "Creates a yes or no poll",
            inline: true
          },
          {
            name: settings.config.bot.prefix + "slap <user>",
            value: "Slaps a user",
            inline: true
          },
          {
            name: settings.config.bot.prefix + "hug <user>",
            value: "Hugs a user",
            inline: true
          },
          {
            name: settings.config.bot.prefix + "rickroll <user>",
            value: "Rickrolls a user",
            inline: true
          },
          {
            name: settings.config.bot.prefix + "blurplefier",
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
  if (msg.content === settings.config.bot.prefix + 'help') {
    msg.channel.send({embed: {
        color: settings.config.bot.color,
        title: client.user.username,
        description: "Hi, Thanks for using me! To contact owners dm me! (I will not respond back)",
        fields: [
          {
            name: settings.config.bot.prefix + "help mod",
            value: "Sends a list of mod commands",
            inline: true
          },
          {
            name: settings.config.bot.prefix + "help info",
            value: "Sends a list of commands that are used to get info",  
            inline: true
          },
          {
            name: settings.config.bot.prefix + "help fun",
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
  client.channels.cache.get(settings.config.bot.logs).send({embed: {
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
    client.channels.cache.get(settings.config.bot.logs).send(error.message)
  } catch (e) {
    console.log(chalk.yellowBright(error.message));
  }
});

client.login(settings.secrets.token || process.env.token);
