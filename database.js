const auth = require('./auth.json');
const {Client} = require('pg');
const dbName = "maifu_users_2019_4_17"
const client = new Client({
  user:"postgres",
  password: auth[0].dbPass,
  host:"localhost",
  port:5432,
  database: "testing_database"
});
const timeOffset = 0;


//Establishes a connection to the database
function EstablishConnection(){
  client.connect()
    .catch(e=>console.log(e));
}


///All of the Queries used in maifu
//Pulls all user data rows from the database
function ProfileQuery(userID){
  var query = {
    text: `SELECT * FROM ${dbName} WHERE discord_id = $1`,
    values: [userID]
  };

  return query;
}

//Inserts a user into the database
function InsertProfile(userID){
  var query = {
    text: `INSERT INTO ${dbName}(discord_id) VALUES ($1)`,
    values: [userID]
  };

  return query;
}

//Updates the user's gold
function UpdateGold(userID, value, nextTime){
  var query = {
    text: `UPDATE ${dbName} SET gold = gold + $1, last_daily = $3 WHERE discord_id = $2`,
    values: [value, userID, nextTime]
  };

  return query;
}



//Function checks whether or not the user can execute the daily
async function CheckLastDaily(userID, currentTime){
  var lastTime = await client.query(`SELECT last_daily FROM ${dbName} WHERE discord_id = $1`, [userID])
    .catch(e=>console.log("Something fucked up"));

  if(lastTime.rows[0].last_daily < currentTime){
    return true;
  } else{
    return false;
  }
}


//This can return a user's entire row if needed
async function CheckAndReturnProfile(userID){
  await client.query(InsertProfile(userID))
    .catch(e=>console.log("User Already Present"));
  var p = await client.query(ProfileQuery(userID))
    .catch(e=>console.log(e));
  return p.rows;
}

async function AlterGold(userID, amount){
  await client.query(InsertProfile(userID))
    .catch(e=>console.log("User Already Present"));    
  await client.query(UpdateGold(userID, amount, Date.now() + timeOffset))
    .catch(e=>console.log(e));
  var g = await client.query(ProfileQuery(userID))
    .catch(e=>console.log(e));
  return g.rows[0].gold;  
}

function AddCard(userID, cardName, cardUri){

}

module.exports = {
  EstablishConnection,
  CheckAndReturnProfile,
  AlterGold,
  CheckLastDaily,
  AddCard
};