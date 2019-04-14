const auth = require("./auth.json");
const db = require("./database.js");
const mtg = require("./scryfallreq.js");
const Eris = require("eris");
const bot = new Eris(auth[0].token);

//Logs what happens when a bot connects to Discord
bot.on("ready", () => {
  console.log("Ready!");
  db.EstablishConnection();
});

bot.on("messageCreate", msg => {
  if (msg.content.toLowerCase() === "m") {
    RandomCard(msg);
  }
});
bot.connect();

function RandomCard(msg){
  mtg.RandomCard(mtg.randomcardURL)
    .then(c=>{
      bot.createMessage(
        msg.channel.id,
        mtg.Card(c)
      );
      bot.createMessage(
        msg.channel.id,
        mtg.NameGuess(c)
      )
    })
    .catch(e => console.log(e));
}
