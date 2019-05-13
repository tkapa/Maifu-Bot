const auth = require('./auth.json');
const embd = require('./embeds.js');
const { Pool } = require('pg');

const pool = new Pool({
  user: "postgres",
  password: auth[0].dbPass,
  host: "localhost",
  port: 5432,
  database: "testing_database"
});

let client = null;
pool.on('error', (err) => {
  console.error('Unexpected error', err);
  process.exit(-1);
});

(async () => {
  client = await pool.connect();
})().catch(e => console.log(e.stack));

//Database Names so I don't have to type em every time
const userDb = "maifu_users_2019_4_17";
const userInv = "user_inventory";
const spawnDb = "spawned_cards"
const saveDb = "saved_cards";

//Selecting rows from a table
function SelectUser(userID) {
  let query = {
    text: `SELECT * FROM ${userDb} WHERE discord_id = $1`,
    values: [userID]
  };
  return query;
}

//Inserts a spawned card to await spawning
function UpdateSpawnedCard(guildID, cardName, cardID, time) {
  let query = {
    text: `UPDATE ${spawnDb} SET card_name = $1, card_id = $2, last_spawn = $3 WHERE guild_id = $4`,
    values: [cardName, cardID, time, guildID]
  };
  return query;
}

//Checks if a value is already in a table
async function CheckUserExistence(userID) {
  try {
    await client.query("BEGIN");
    await client.query(`INSERT INTO ${userDb}(discord_id) VALUES ($1)`, [userID])
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
  }
}

//Retrieves the Profile of a user
async function GetProfile(msg) {
  await CheckUserExistence(msg.author.id);

  var cardCount = await client.query(`SELECT card_id FROM ${userInv} WHERE user_id = $1`, [msg.author.id])
    .catch(e => console.log(e));

  var profile = await client.query(SelectUser(msg.author.id));
  var fav = null;  

  if(profile.rows[0].favourite_card != null){
    await client.query(`SELECT * FROM ${saveDb} WHERE card_id = $1`, [profile.rows[0].favourite_card])  
    .then(r => fav = r);
  }

  return embd.ProfileEmbed(msg.author, cardCount.rows, profile.rows[0].gold, fav);
}

//Checks a user and updates their gold
async function GainGold(userID, amount) {
  await CheckUserExistence(userID);

  let m = null;

  try {
    await client.query("BEGIN");
    await client.query(`UPDATE ${userDb} SET gold = gold + $1 WHERE discord_id = $2`, [amount, userID]);
    await client.query(SelectUser(userID))
      .then(r => {
        m = `Nice, you got ${amount} gold! You now have ${r.rows[0].gold} gold, come back tomorrow for more.`;
      });
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    m = `Something fucked up.`;
  }
  return m;
}

//Draws a new card for the user
async function Draw(userID){
  await CheckUserExistence(userID);
  try{
    await client.query(`BEGIN`);
    let c = await client.query(`SELECT * FROM ${saveDb} ORDER BY RANDOM() LIMIT 1`);
    await client.query(`INSERT INTO ${userInv}(user_id, card_id) VALUES ($1, $2)`, [userID, c.rows[0].card_id]);
    client.query("COMMIT");
    
    return embd.ClaimedCard(c.rows[0], userID);
  } catch (e) {
    client.query("ROLLBACK");
    console.log(e);
  }
}

//Intended to be used to set the spawning channel for a guild
async function SetSpawningChannel(guildID, channelID, settingChannel) {
  try {
    await client.query("BEGIN");
    await client.query(`INSERT INTO ${spawnDb}(guild_id, channel_id, last_spawn) VALUES ($1, $2, 0)`, [guildID, channelID]);
    client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    if (settingChannel) {
      client.query(`UPDATE ${spawnDb} SET channel_id = $1 WHERE guild_id = $2`, [channelID, guildID]);
      console.log(`Guild spawn set to ${channelID}`);
    }
  }
}

//Adds a card to the spawned table
async function SpawnCard(guildID, channelID, time) {
  await SetSpawningChannel(guildID, channelID, false);
  let spawnChannel = await client.query(`SELECT channel_id, last_spawn FROM ${spawnDb} WHERE guild_id = $1`, [guildID]);

  if (spawnChannel.rows[0].last_spawn <= Date.now()) {
    c = await client.query(`SELECT * FROM ${saveDb} ORDER BY RANDOM() LIMIT 1`);
    console.table(c.rows[0].card_name);
    client.query(UpdateSpawnedCard(guildID, c.rows[0].card_name, c.rows[0].card_id, time));
    return { channel: spawnChannel.rows[0].channel_id, message: embd.NameGuess(c.rows[0]) };
  } else {
    throw `Guild has had a card spawn too recently`;
  }
}

//Checks a user exists and that a card is spawned in the channel
async function ClaimSpawnedCard(userID, guildID, args) {
  await CheckUserExistence(userID);

  cardID = await client.query(`SELECT card_id FROM ${spawnDb} WHERE guild_id = $1`, [guildID]);

  if (cardID.rows[0].card_id === null)
    return `No spawned cards in this channel`;
  else{
    c = await client.query(`SELECT * FROM ${saveDb} WHERE card_id = $1`, [cardID.rows[0].card_id]);
    return CheckClaim(c, userID, guildID, args);
  }
}

//Checks a claim to make sure the name is correct
async function CheckClaim(card, userID, guildID, args) {
  if (card.rows[0].card_name.toLowerCase() === args.join(" ").toLowerCase()) {
    ClaimConfirm(userID, guildID, card.rows[0].card_id);
    return embd.ClaimedCard(card.rows[0], userID);
  } else
    return `Wrong name`;
}

//If claim confirms, deletes entry from spawned table and adds it to user inventory table
async function ClaimConfirm(userID, guildID, cardID) {
  try {
    await client.query("BEGIN");
    await client.query(`UPDATE ${spawnDb} SET card_id = null, card_name = null WHERE guild_id = $1`, [guildID]);
    await client.query(`INSERT INTO ${userInv}(user_id, card_id) VALUES ($1, $2)`, [userID, cardID]);
    client.query("COMMIT");
  } catch (e) {
    client.query("ROLLBACK");
    console.log(e);
  }
}

//Retrieves the user's list of cards and displays them
async function ShowList(msg, page, pageSize){
  await CheckUserExistence(msg.author.id);

  idList = await client.query(`SELECT card_id FROM ${userInv} WHERE user_id = $1`, [msg.author.id]);

  let cardList = [];
  let temp = null;
  
  if(page == "")
    page = 1;

  if(idList.rowCount == 0){
    return `You have no cards`;
  } else if((page-1)*pageSize >= idList.rowCount){
    return `You don't have that many pages`
  }else{
    for(i = 0; i <= idList.rowCount - 1; ++i){
      temp = await client.query(`SELECT card_name FROM ${saveDb} WHERE card_id = $1`, [idList.rows[i].card_id]);
      cardList.push(temp.rows[0].card_name);
    }
    return embd.ListEmbed(msg.author, cardList, page, pageSize);
  }
}

//Set favourite card
async function SetFavourite(userID, args){
  await CheckUserExistence(userID);

  let cards = await client.query(`SELECT card_id FROM ${userInv} WHERE user_id = $1`, [userID]);
  
  if(cards.rowCount == 0){
    return `You have no cards to favourite.`;
  } else if(args > cards.rowCount-1){
    return `You don't have that many cards.`;
  } else {
    let n = await client.query(`SELECT card_name FROM ${saveDb} WHERE card_id = $1`, [cards.rows[args].card_id]);
    client.query(`UPDATE ${userDb} SET favourite_card = $1 WHERE discord_id = $2`, [cards.rows[args].card_id, userID]);

    return `Your favourite card has been set to ${n.rows[0].card_name}!`;
  }
}

//Remove a card from the user's database
async function RemoveCard(userID, args){
  await CheckUserExistence(userID);

  let profile = await client.query(SelectUser(userID));
  let cards = await client.query(`SELECT * FROM ${userInv} WHERE user_id = $1`, [userID]);

  if(cards.rowCount == 0)
    return `You have no cards to remove.`;
  else if(args > (cards.rowCount - 1)){
    return `You don't have that many cards.`;
  } else {
    if(profile.rows[0].favourite_card == cards.rows[args].card_id){
      client.query(`UPDATE ${userDb} SET favourite_card = null WHERE discord_id = $1`, [userID]);
    }
    let removedCard = await client.query(`SELECT card_name FROM ${saveDb} WHERE card_id = $1`, [cards.rows[args].card_id]);
    client.query(`DELETE FROM ${userInv} WHERE user_id = $1 AND card_id = $2`, [userID, cards.rows[args].card_id]);
    return `Removed ${removedCard.rows[0].card_name} from your inventory!`;
  }
}

//Roll an X sided die
async function DieRoll(userID, args, sides){
  let rollNum = Math.ceil(Math.random()*sides);
  let goldGain = Math.ceil(args[0]*(Math.random()+1.2));

  let profile = await client.query(`SELECT gold FROM ${userDb} WHERE discord_id = $1`, [userID]);

  if(args[1] == null){
    return `You're missing an argument, do \`m.help roll\` to see what it is.`;
  }

  if(args[1] > 6 || args[1] < 1){
    return `${args[1]} doesn't exist on a ${sides} sided die.`;
  } else if(args[0] > profile.rows[0].gold){
    return `You tried to bet ${args[0]}, but you only have ${profile.rows[0].gold}.`
  } else if(args[1] == rollNum){
    GainGold(userID, goldGain)
    return `You rolled a ${rollNum} and for your efforts gained ${goldGain} gold.`;
  } else{
    GainGold(userID, (args[0]*-1))
    return `You rolled a ${rollNum} and lost your ${args[0]} gold.`;
  }
}

module.exports = {
  GetProfile,
  SpawnCard,
  ClaimSpawnedCard,
  GainGold,
  Draw,
  SetSpawningChannel,
  ShowList,
  SetFavourite,
  RemoveCard,
  DieRoll
}