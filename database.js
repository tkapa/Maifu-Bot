const auth = require('./auth.json');
const {Client} = require('pg');
const client = new Client({
  user:"postgres",
  password: auth[0].dbPass,
  host:"localhost",
  port:5432,
  database: "testing_database"
});

//Pulls all user data rows from the database
function ProfileQuery(userID){
  var query = {
    text: "SELECT * FROM maifu_users_2019_4_17 WHERE discord_id = $1",
    values: [userID]
  };

  return query;
}

//Inserts a user into the database
function InsertProfile(userID){
  var query = {
    text: "INSERT INTO maifu_users_2019_4_17(discord_id) VALUES ($1)",
    values: [userID]
  };

  return query;
}

//Updates the user's gold
function UpdateGold(userID, value){
  var query = {
    text: "UPDATE maifu_users_2019_4_17 SET gold = gold + $1 WHERE discord_id = $2",
    values: [value, userID]
  };

  return query;
}

//maifu_users_2019_4_17
//Establishes a connection to the database
function EstablishConnection(){
  client.connect()
    .then(()=> console.log('Connected Successfully!'))
    .catch(e=>console.log(e));
}

async function CheckAndReturnProfile(userID){
  await client.query(InsertProfile(userID))
  var p = await client.query(ProfileQuery(userID))
    .catch(e=>console.log(e));
  return p.rows;
}

async function AlterGold(userID, amount){
  //await client.query(InsertProfile(userID))
  var g = await client.query(UpdateGold(userID, amount))
    .catch(e=>console.log(e));
  return g;  
}

module.exports = {
  EstablishConnection,
  CheckAndReturnProfile,
  AlterGold
};