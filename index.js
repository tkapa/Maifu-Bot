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

var cards = [];

//Logs what happens when a bot connects to Discord
bot.on("ready", () => {
});

//Command forces a card to spawn
bot.registerCommand("spawn", (msg)=>{
  mtg
    .RandomCard()
    .then(c => {
      bot.createMessage(msg.channel.id, embd.NameGuess(c));
      database.SpawnCard(msg.channel.id, c.name, c.id);
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
  let id = msg.channel.id; 
  console.log(args);

  database.ClaimSpawnedCard(msg.author.id, id, args)
    .then(r => bot.createMessage(id, r));
},
{
    description: "Claims the most recent spawned card  in a channel provided you get the name right.",
});

//Intended to show users their current profile
bot.registerCommand("profile", (msg) =>{
  database.GetProfile(msg.author.id)
    .then(g=>console.table(g.rows))
},
{
  description: "Shows you your current profile."
});

//A command that can be used daily
bot.registerCommand("daily", (msg)=>{
  var addedAmount = 0;
  var jackpot = Math.random();//Math.random();

  if(jackpot >= 0.99999){
    bot.createMessage("373486308427038720", `Bro <@${msg.author.id}> hit the jackpot`)
    addedAmount = Math.round(Math.random() *100000)
  } else {
    addedAmount = Math.round(Math.random()*100+10);
  }

  database.PerformDaily(msg.author.id, addedAmount, Date.now())
    .then(m=>bot.createMessage(msg.channel.id, m));
},
{
  description: "Shows you your current gold."
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