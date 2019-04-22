const auth = require('./auth.json');
const embd = require('./embeds.js');
const mtg = require('./scryfall.js');
const {Pool} = require('pg');

const pool = new Pool({
  user:"postgres",
  password: auth[0].dbPass,
  host:"localhost",
  port:5432,
  database: "testing_database"
});

let client = null;
pool.on('error', (err, client) => {
  console.error('Unexpected error', err);
  process.exit(-1)
});

(async() => {
  client = await pool.connect();
  const res = await client.query('SELECT NOW()');
})().catch(e => console.log(e.stack));

//Database Names so I don't have to type em every time
const userDb = "maifu_users_2019_4_17";
const userInv = "user_inventory";
const cardDb = "cards";
const spawnDb = "spawned_cards";

//A number to offset the daily commands by, temporary for easy testing
const timeOffset = 10000;

//COMMON QUERIES I USE A LOT
//Inserting a user into the database
function InsertUser(userID){
  let query = {
    text: `INSERT INTO ${userDb}(discord_id) VALUES ($1)`,
    values: [userID]
  };
  return query;  
}

//Selecting rows from a table
function SelectUser(userID){
  let query = {
    text: `SELECT * FROM ${userDb} WHERE discord_id = $1`,
    values: [userID]
  };
  return query;
}

//Inserts a card into the quick reference
function InsertCard(cardID){
  let query = {
    text: `INSERT INTO ${cardDb}(card_id) VALUES ($1)`,
    values: [cardID]
  };

  return query;
}

//Inserts a spawned card to await spawning
function InsertSpawnedCard(channelID, cardName, cardID){
  let query = {
    text: `INSERT INTO ${spawnDb}(channel_id, card_name, card_id) VALUES ($1, $2, $3)`,
    values: [channelID, cardName, cardID]
  };
  return query;
}

//Updates the spawned card on the db
function UpdateSpawnedCard(channelID, cardName, cardID){
  let query = {
    text: `UPDATE ${spawnDb} SET card_name = $1, card_id = $2 WHERE channel_id = $3`,
    values: [cardName, cardID, channelID]
  };
  return query;
}

function FetchSpawnedCard(channelID){
  let query = {
    text: `SELECT card_name, card_id FROM ${spawnDb} WHERE channel_id = $1`,
    values: [channelID]
  };
  return query;
}

//Checks if a value is already in a table
async function CheckUserExistence(value){ 
  try{
    await client.query("BEGIN");
    await client.query(InsertUser(value))
    await client.query("COMMIT");
  } catch(e){
    await client.query("ROLLBACK");
  }
}

//Retrieves the Profile of a user
async function GetProfile(userID){
  await CheckUserExistence(userID);

  var p = await client.query(SelectUser(userID))
    .catch(e=> console.log(e));

  return p;
}

//Checks a user and updates their gold
async function PerformDaily(userID, amount, time){
  await CheckUserExistence(userID);
  
  let m = null;
  let p = null;

  try{
    await client.query("BEGIN");
    p = await client.query(SelectUser(userID));
    
    //Checks if user has done this recently
    if(p.rows[0].last_daily <= time){
      await client.query(`UPDATE ${userDb} SET gold = gold + $1, last_daily = $2 WHERE discord_id = $3`, [amount, (time + timeOffset), userID]);
      await client.query("COMMIT");
      await client.query(SelectUser(userID))
        .then(r =>{
          m = `Nice, you got ${amount} gold! You now have ${r.rows[0].gold} gold, come back tomorrow for more.`;
        });
    } else {
      m = "You cannot do that right now.";
    }
  } catch(e){
    await Client.query("ROLLBACK");
  }
  return m;
}

//Registers a card that spawns
async function RegisterCard(cardID){
  try{
    await client.query("BEGIN");
    await client.query(InsertCard(cardID));
    await client.query("COMMIT");
  } catch(e){
    await client.query("ROLLBACK");
  }
}

//Adds a card to the spawned table
async function SpawnCard(channelID, cardName, cardID){
  console.log(cardName);
  await RegisterCard(cardID);

  try{
    await client.query("BEGIN");
    await client.query(InsertSpawnedCard(channelID, cardName, cardID));
    await client.query("COMMIT");
  } catch(e){
    await client.query("ROLLBACK");
    await client.query(UpdateSpawnedCard(channelID, cardName, cardID));
  }
}

//Checks a user exists and that a card is spawned in the channel
async function ClaimSpawnedCard(userID, channelID, args){
  await CheckUserExistence(userID);

  c = await client.query(FetchSpawnedCard(channelID));
 
  if(c.rowCount === 0)
    return `No cards in ${channelID}`;
  else 
    return CheckClaim(c, userID, channelID, args);
}

//Checks a claim to make sure the name is correct
async function CheckClaim(card, userID, channelID, args){
  if(card.rows[0].card_name.toLowerCase() === args.join(" ").toLowerCase()){
    return await ClaimConfirm(userID, channelID, card.rows[0].card_id)
  }else
    return `Wrong name`;
}

//If claim confirms, deletes entry from spawned table and adds it to user inventory table
async function ClaimConfirm(userID, channelID, cardID){
  try{
    await client.query("BEGIN");
    await client.query(`DELETE FROM ${spawnDb} WHERE channel_id = $1`, [channelID]);
    await client.query(`INSERT INTO ${userInv}(user_id, card_id) VALUES ($1, $2)`, [userID, cardID]);
    client.query("COMMIT");
    
    let c = null;
    await mtg.FetchCard(cardID)
      .then(r => c = r);
    return embd.ClaimedCard(c);
  } catch(e){
    client.query("ROLLBACK");
    console.log(e);
  }
}

module.exports = {
  GetProfile,
  PerformDaily,
  RegisterCard,
  SpawnCard,
  ClaimSpawnedCard
}