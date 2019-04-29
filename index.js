/*
  THIS DISCORD BOT IS NOT ASSOCIATED WITH 
  WIZARDS OF THE COAST OR MAGIC: THE GATHERING IN ANY WAY
*/
const auth = require("./auth.json");
const database = require("./tables.js");
const embd = require("./embeds.js");
const mtg = require("./scryfall.js");
const Eris = require("eris");
const bot = new Eris.CommandClient(auth[0].token, {}, {
  description: "Budget Card Collecting",
  owner: "Kapa",
  prefix: "m."
});

//A default time offset for daily time commands
let timeOffset = 10000;

//Logs what happens when a bot connects to Discord
bot.on("ready", () => {
});

//Command forces a card to spawn
bot.registerCommand("spawn", (msg)=>{
  mtg
    .RandomCard()
    .then(c => {
      bot.createMessage(msg.channel.id, embd.NameGuess(c));
      database.SpawnCard(msg.channel.guild.id, c.name, c.id, Date.now());
    })
    .catch(e => console.log(e));
},
{
    description: "This is a secret command.",
    requirements: {
      userIDs: ["142548196089004032"]
    }
});

//Claims a spawned card as users
bot.registerCommand("claim", (msg, args)=>{
  console.log(args);

  database.ClaimSpawnedCard(msg.author.id, msg.channel.guild.id, msg.channel.id, args)
    .then(r => bot.createMessage(msg.channel.id, r));
},
{
    description: "Claims the most recent spawned card  in a channel provided you get the name right.",
});

//Intended to show users their current profile
bot.registerCommand("profile", (msg) =>{
  database.GetProfile(msg)
    .then(g=>console.table(g.rows))
},
{
  description: "Shows you your current profile."
});

//A command that can be used daily
bot.registerCommand("daily", (msg)=>{

  var addedAmount = 0;
  var jackpot = Math.random();

  if(jackpot >= 0.99999){
    bot.createMessage("373486308427038720", `Bro <@${msg.author.id}> hit the jackpot`)
    addedAmount = Math.round(Math.random() *100000)
  } else {
    addedAmount = Math.round(Math.random()*100+10);
  }

  database.Daily(msg, msg.author.id, addedAmount)
    .then(m=>bot.createMessage(msg.channel.id, m));
},
{
  description: "Shows you your current gold.",
  cooldown: 10000,
  cooldownMessage: "You cannot do that right now."
});

bot.registerCommand("setspawnchannel", (msg)=>{
 database.SetSpawningChannel(msg.channel.guild.id, msg.channel.id, true);
},
{
  description: "Sets this guild's spawn channel"
});

//used to test functionality
bot.registerCommand("test", (msg, args)=>{
     
},
{
  description: "Used exclusively for testing functions",
  requirements: {
    userIDs: ["142548196089004032"]
  }
})

bot.connect();