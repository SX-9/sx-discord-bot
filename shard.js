const { ShardingManager } = require('discord.js');
const botToken = require('./secrets.json').token || process.env.token;
const shardCount = require('./conf.json').total_shards || auto;

let manager = new ShardingManager('./index.js', {
    token: botToken,
    totalShards: shardCount,
});

manager.on('shardCreate', shard => {
    console.log(`Launching shard ${shard.id}`);
});

manager.spawn();
