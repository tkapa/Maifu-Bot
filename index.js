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
bot.registerCommand("rand", (msg, args) =>{
  mtg
    .RandomCard()
    .then(c => bot.createMessage(msg.channel.id, embd.Card(c)))
    .catch(e => console.log(e));
  },
  {
    description: "A random card from the void",
    fullDescription: "A random card from the void"
  }
);

//Command forces a card to spawn
bot.registerCommand("spawn", (msg, args)=>{
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
    description: "This is a secret command",
    requirements: {
      userIDs: ["142548196089004032"]
    }
  }
);

//
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
    description: "This is a secret command",
  }
);

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