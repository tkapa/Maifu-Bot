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
const cardDb = "cards";
const spawnDb = "spawned_cards"
const saveDb = "saved_cards";

//COMMON QUERIES I USE A LOT
//Inserting a user into the database
function InsertUser(userID) {
  let query = {
    text: `INSERT INTO ${userDb}(discord_id) VALUES ($1)`,
    values: [userID]
  };
  return query;
}

//Selecting rows from a table
function SelectUser(userID) {
  let query = {
    text: `SELECT * FROM ${userDb} WHERE discord_id = $1`,
    values: [userID]
  };
  return query;
}

//Inserts a card into the quick reference
function InsertCard(cardID) {
  let query = {
    text: `INSERT INTO ${cardDb}(card_id) VALUES ($1)`,
    values: [cardID]
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

//Gets a spawned card from the spawn db
function FetchSpawnedCard(guildID) {
  let query = {
    text: `SELECT card_id FROM ${spawnDb} WHERE guild_id = $1`,
    values: [guildID]
  };
  return query;
}

//Retrieve the user's inventory from the inventory
function FetchUserInventory(userID) {
  let query = {
    text: `SELECT card_id FROM ${userInv} WHERE user_id = $1`,
    values: [userID]
  };
  return query;
}

//Checks if a value is already in a table
async function CheckUserExistence(value) {
  try {
    await client.query("BEGIN");
    await client.query(InsertUser(value))
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
  }
}

//Retrieves the Profile of a user
async function GetProfile(msg) {
  await CheckUserExistence(msg.author.id);

  var cardCount = await client.query(FetchUserInventory(msg.author.id))
    .catch(e => console.log(e));

  var goldCount = await client.query(SelectUser(msg.author.id));

  return embd.ProfileEmbed(msg.author, cardCount.rows, goldCount.rows[0].gold);
}

//Checks a user and updates their gold
async function Daily(msg, userID, amount) {
  await CheckUserExistence(userID);

  let m = null;

  try {
    await client.query("BEGIN");
    await client.query(`UPDATE ${userDb} SET gold = gold + $1 WHERE discord_id = $2`, [amount, userID]);
    await client.query(SelectUser(userID))
      .then(r => {
        m = `Nice, you got ${amount} gold! You now have ${r.rows[0].gold} gold, come back tomorrow for more.`;
      })
      .catch(e => console.log(e));
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    m = `Something fucked up.`;
  }
  return m;
}

//Registers a card that spawns
async function RegisterCard(cardID) {
  try {
    await client.query("BEGIN");
    await client.query(InsertCard(cardID));
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
  }
}

//Intended to be used to set the spawning channel for a guild
async function SetSpawningChannel(guildID, channelID, settingChannel) {
  try {
    await client.query("BEGIN");
    await client.query(`INSERT INTO ${spawnDb}(guild_id, channel_id, last_spawn) VALUES ($1, $2, 0)`, [guildID, channelID]);
    client.query("COMMIT");
    console.log(`New guild spawn channel created`);
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

  cardID = await client.query(FetchSpawnedCard(guildID));

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
    return embd.ClaimedCard(card.rows[0]);
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

module.exports = {
  GetProfile,
  RegisterCard,
  SpawnCard,
  ClaimSpawnedCard,
  Daily,
  SetSpawningChannel
}