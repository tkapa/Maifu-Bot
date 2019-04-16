const mtg = require("./scryfall.js");
const embd = require("./embeds.js");
const bot = require("./index.js");

var cards = [];

//Uses the MTG API to send a card embed with a random card
function RandomCard(msg) {
  mtg
    .RandomCard()
    .then(c => bot.Send(msg.channel.id, embd.Card(c)))
    .catch(e => console.log(e));
}

//Displays a random card that users can guess the name of
function SpawnCard(msg) {
  mtg
    .RandomCard()
    .then(c => {
      bot.Send(msg.channel.id, embd.NameGuess(c));
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
          .then(c => bot.Send(id, embd.ClaimedCard(c)));
        
        cards.splice(i, 1);
      } else {
        bot.Send(id, "Card Name is Incorrect! Try again.")
      }
    } else {
      //Insert card claim rejection here
      bot.Send(id, "No cards to be claimed on this channel.");
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

module.exports = {
  RandomCard,
  SpawnCard,
  ClaimCard,
  StoreCard
}