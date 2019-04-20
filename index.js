const auth = require("./auth.json");
const db = require("./database.js");
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
  db.EstablishConnection();
});

//
bot.registerCommand("rand", (msg) =>{
  mtg
    .RandomCard()
    .then(c => bot.createMessage(msg.channel.id, embd.Card(c)))
    .catch(e => console.log(e));
  },
  {
    description: "A random card from the void.",
    fullDescription: "A random card from the void."
  }
);

//Command forces a card to spawn
bot.registerCommand("spawn", (msg)=>{
  mtg
    .RandomCard()
    .then(c => {
      bot.createMessage(msg.channel.id, embd.NameGuess(c));
      StoreCard(msg.channel.id, c.name, c.uri);
      console.log(c.name);
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
  var id = msg.channel.id; 
  console.log(args);

  for (var i = 0; i <= cards.length - 1; i++) {
    if (cards[i][0] === id) {
      if (cards[i][1].toLowerCase() === args.join(" ").toLowerCase()) {
        //Confirm Claim
        mtg
          .FetchCard(cards[i][2])
          .then(c => bot.createMessage(id, embd.ClaimedCard(c)));
        
        cards.splice(i, 1);
      } else {
        //Wrong card name
        bot.createMessage(id, "Card Name is Incorrect! Try again.")
      }
    } else {
      //No cards on the channel
      bot.createMessage(id, "No cards to be claimed on this channel.");
    }
  }
},
{
    description: "Claims the most recent spawned card  in a channel provided you get the name right.",
});

//Intended to show users their current profile
bot.registerCommand("profile", (msg) =>{
  db.CheckAndReturnProfile(msg.author.id)
    .then(g =>{
      console.table(g);
    });
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
  
  db.CheckLastDaily(msg.author.id, Date.now())
    .then(r=>{
      if(r){
        db.AlterGold(msg.author.id, addedAmount)
          .then(g=>{
          bot.createMessage(msg.channel.id,
            `Nice, you picked up ${addedAmount} gold! You now have ${g} gold. Come back tomorrow for some more.`);
        });
      } else {
        bot.createMessage(msg.channel.id, "You cannot do this right now");
      }
  }); 
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

//Stores a card in a local 2D array to be collected later
//Replaces any unclaimed cards
function StoreCard(id, name, uri) {
  
  if (cards.length > 0){
    for(var i = 0; i >=cards.length-1; i++) {
      if(cards[i][0] === id){
        cards.splice(i,1);
      }
    }
  }
  var newCard = [id, name, uri];
  cards.push(newCard);
}

bot.connect();