const { ShardingManager } = require('discord.js');
const chalk = require('chalk');
const botToken = require('./secrets.json').token || process.env.token;
const shardCount = require('./conf.json').settings.config.bot.shards || auto;

let manager = new ShardingManager('./index.js', {
    token: botToken,
    totalShards: shardCount,
});

manager.on('shardCreate', shard => {
    console.log(chalk.greenBright(`Launching shard ${shard.id}`));
});

manager.spawn();
