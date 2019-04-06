const auth = require('./auth.json');
const {Client} = require('pg');
const client = new Client({
  user:"postgres",
  password: auth[0].dbPass,
  host:"localhost",
  port:5432,
  database: "testing_database"
});

function EstablishConnection(){
  client.connect()
  .then(()=> console.log('Connected Successfully!'))
  .catch(e=>console.log(e));
}

module.exports = {
  EstablishConnection
};