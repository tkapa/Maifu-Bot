const auth = require('./auth.json');
const {Client} = require('pg');
const client = new Client({
  user:"postgres",
  password: auth[0].dbPass,
  host:"localhost",
  port:5432,
  database: "testing_database"
});

//Establishes a connection to the database
function EstablishConnection(){
  client.connect()
    .then(()=> console.log('Connected Successfully!'))
    .catch(e=>console.log(e));
}

//Testing Connectiong Functionality First
function Testing(){
  client.query("SELECT * from maifu_users_2019_4_17")
    .then(results => console.table(results.rows))
    .catch(e=>console.log(e));
}
//maifu_users_2019_4_17

module.exports = {
  EstablishConnection,
  Testing
};