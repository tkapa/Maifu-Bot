const auth = require('./auth.json');
const {Client} = require('pg');
const client = new Client({
  user:"postgres",
  password: auth[0].dbPass,
  host:"localhost",
  port:5432,
  database: "testing_database"
});

function ProfileQuery(userID){
  var query = {
    text: "SELECT * FROM maifu_users_2019_4_17 WHERE discord_id = $1",
    values: [userID]
  }

  return query
}

//maifu_users_2019_4_17
//Establishes a connection to the database
function EstablishConnection(){
  client.connect()
    .then(()=> console.log('Connected Successfully!'))
    .catch(e=>console.log(e));
}

async function CheckGold(userID){
  var g = 0;
  await client.query(ProfileQuery(userID))
    .then(res => g = res.rows[0].current_gold)
    .catch(e=>console.log(e));
  return g;
}

//Testing Connectiong Functionality First
function Testing(){
  client.query("SELECT * from maifu_users_2019_4_17 WHERE discord_id = $1", ["142548196089004032"])
    .then(results => console.table(results.rows))
    .catch(e=>console.log(e));
}

module.exports = {
  EstablishConnection,
  Testing,
  CheckGold
};