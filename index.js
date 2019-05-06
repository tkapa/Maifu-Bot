/*
  THIS DISCORD BOT IS NOT ASSOCIATED WITH 
  WIZARDS OF THE COAST OR MAGIC: THE GATHERING IN ANY WAY
*/
const auth = require("./auth.json");
const database = require("./tables.js");
const Eris = require("eris");
const bot = new Eris.CommandClient(auth[0].token, {}, {
  description: "Budget Card Collecting",
  owner: "Kapa",
  prefix: "m."
});

//A default time offset for daily time commands
let timeOffset = 10000;
let spawnChance = 0.01;

//Logs what happens when a bot connects to Discord
bot.on("ready", () => {
});

//Decides whether or not to spawn a card in the spawning channel
bot.on("messageCreate", (msg) => {
  if (msg.author.id != 286427596026019841) {
    s = Math.random();
    if (s <= spawnChance) {
      database.SpawnCard(msg.channel.guild.id, msg.channel.id, Date.now() + timeOffset)
        .catch(e => console.log(e));
    }
  }
})

//Command forces a card to spawn
bot.registerCommand("spawn", (msg) => {
  database.SpawnCard(msg.channel.guild.id, msg.channel.id, Date.now() + timeOffset)
    .then(r => bot.createMessage(r.channel, r.message))
    .catch(e => console.log(e));
},
  {
    description: "This is a secret command.",
    requirements: {
      userIDs: ["142548196089004032"]
    }
  });

//Claims a spawned card as users
bot.registerCommand("claim", (msg, args) => {
  console.log(args);

  database.ClaimSpawnedCard(msg.author.id, msg.channel.guild.id, args)
    .then(r => bot.createMessage(msg.channel.id, r));
},
  {
    description: "Claims the most recent spawned card  in a channel provided you get the name right.",
  });

//Intended to show users their current profile
bot.registerCommand("profile", (msg) => {
  database.GetProfile(msg)
    .then(r => bot.createMessage(msg.channel.id, r));
},
  {
    description: "Shows you your current profile."
  });

//A command that can be used daily
bot.registerCommand("daily", (msg) => {

  var addedAmount = 0;
  var jackpot = Math.random();

  if (jackpot >= 0.99999) {
    bot.createMessage("373486308427038720", `Bro <@${msg.author.id}> hit the jackpot`)
    addedAmount = Math.round(Math.random() * 100000)
  } else {
    addedAmount = Math.round(Math.random() * 100 + 10);
  }

  database.Daily(msg.author.id, addedAmount)
    .then(m => bot.createMessage(msg.channel.id, m));
},
  {
    description: "Shows you your current gold.",
    cooldown: 10000,
    cooldownMessage: "You cannot do that right now."
  });

bot.registerCommand("setspawnchannel", (msg) => {
  database.SetSpawningChannel(msg.channel.guild.id, msg.channel.id, true)
    .then(bot.createMessage(msg.channel.id, `Spawn channel now set to <#${msg.channel.id}>`));
},
  {
    description: "Sets this guild's spawn channel.",
    requirements:{
      permissions:{
        administrator: true
      }
    }
  });

bot.registerCommand("list", (msg, args)=>{
  database.ShowList(msg, args)
    .then(r => bot.createMessage(msg.channel.id, r));
},
{
  description: "Shows you a list of your cards."
})

bot.registerCommand("favourite", (msg, args)=>{
  database.SetFavourite(msg.author.id, args)
    .then(r=> bot.createMessage(msg.channel.id, r));
},
{
  argsRequired: true,
  description: `Favourites a card at the index specified.`
})

bot.registerCommand("remove", (msg, args)=>{
  database.RemoveCard(msg.author.id, args)
    .then(r=> bot.createMessage(msg.channel.id, r));
},
{
  argsRequired: true,
  description: `Removes a card at the index specified.`
})

//used to test functionality
bot.registerCommand("test", (msg, args) => {
  
},
  {
    description: "Used exclusively for testing functions.",
    requirements: {
      userIDs: ["142548196089004032"]
    }
  })

bot.connect();