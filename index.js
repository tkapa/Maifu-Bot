const auth = require("./auth.json");
const db = require("./database.js");
const mtg = require("./scryfallreq.js");
const crd = require("./embeds.js");
const Eris = require("eris");
const bot = new Eris(auth[0].token);

var cards = [];

//Logs what happens when a bot connects to Discord
bot.on("ready", () => {
  console.log("Ready!");
  db.EstablishConnection();
});

//When a new message is sent in a guild, check it for commands
bot.on("messageCreate", msg => {
  var m = msg.content.toLowerCase();
  if (m === "m") {
    RandomCard(msg);
  }
  if (m === "s") {
    SpawnCard(msg);
  }
  if (m.split(" ", 1)[0] === "c") {
    ClaimCard(msg.channel.id, m.slice(2));
  }
});
bot.connect();

//Uses the MTG API to send a card embed with a random card
function RandomCard(msg) {
  mtg
    .RandomCard()
    .then(c => bot.createMessage(msg.channel.id, crd.Card(c)))
    .catch(e => console.log(e));
}

//Displays a random card that users can guess the name of
function SpawnCard(msg) {
  mtg
    .RandomCard()
    .then(c => {
      bot.createMessage(msg.channel.id, crd.NameGuess(c));
      StoreCard(msg.channel.id, c.name, c.uri);
      console.log(c.name);
    })
    .catch(e => console.log(e));
}

//Checks the card array to see if a card has spawned by that name
function ClaimCard(id, name) {
  for (var i = 0; i <= cards.length - 1; i++) {
    if (cards[i][0] === id) {
      if (cards[i][1].toLowerCase() === name.toLowerCase()) {
        //Insert card claim confirmation here
        mtg
          .FetchCard(cards[i][2])
          .then(c => bot.createMessage(id, crd.ClaimedCard(c)));
        
        cards.splice(i, 1);
      } else {
        bot.createMessage(id, "Card Name is Incorrect! Try again.")
      }
    } else {
      //Insert card claim rejection here
      bot.createMessage(id, "No cards to be claimed on this channel.");
    }
  }
}

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
