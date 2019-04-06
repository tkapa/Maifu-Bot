const auth = require('./auth.json');
const db = require('./database.js');
const mtg = require('mtgsdk');
const Eris = require('eris');
const bot = new Eris(auth[0].token);

//Logs what happens when a bot connects to Discord
bot.on("ready", () => {
    console.log("Ready!");
    db.EstablishConnection();
});

bot.on("messageCreate", (msg) => {
    if(msg.content.toLowerCase() === 'm.dailycard'){
      mtg.card.find(3)
      .then(c=>{
        console.log(c.card.name);
        bot.createMessage(msg.channel.id, c.card.name);
      });
    }
});
bot.connect();