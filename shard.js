const { ShardingManager } = require('discord.js');
const botToken = require('./secrets.json').token;

let manager = new ShardingManager('./index.js', {
    token: botToken,
    totalShards: 'auto',
});

manager.on('shardCreate', shard => {
    console.log(`Launching shard ${shard.id}`);
});

manager.spawn();
