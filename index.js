const auth = require("./auth.json");
const db = require("./database.js");
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

function Send(id, content){
  bot.createMessage(id, content);
}

module.exports = {
  Send
}