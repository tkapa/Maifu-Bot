const auth = require('./auth.json');
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

//A number to offset the daily commands by, temporary for easy testing
const timeOffset = 10000;

//COMMON QUERIES I USE A LOT
//Inserting a user into the database
function InsertUser(value){
  var query = {
    text: `INSERT INTO ${userDb}(discord_id) VALUES ($1)`,
    values: [value]
  };
  return query;  
}

//Selecting rows from a table
function SelectUser(value){
  var query = {
    text: `SELECT * FROM ${userDb} WHERE discord_id = $1`,
    values: [value]
  }
  return query;
}

function InsertCard(value){
  let query = {
    text: `INSERT INTO ${cardDb}(card_id) VALUES ($1)`,
    values: [value]
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

function RegisterCard(cardID){
  client.query(InsertCard(cardID));
}

module.exports = {
  GetProfile,
  PerformDaily,
  RegisterCard
}