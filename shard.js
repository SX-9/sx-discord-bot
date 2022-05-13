const { ShardingManager } = require('discord.js');
const botToken = require('./secrets.json').token;
const shardCount = require('./secrets.json').total_shards;

let manager = new ShardingManager('./index.js', {
    token: botToken,
    totalShards: shardCount,
});

manager.on('shardCreate', shard => {
    console.log(`Launching shard ${shard.id}`);
});

manager.spawn();
