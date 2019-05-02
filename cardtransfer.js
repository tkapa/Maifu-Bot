const auth = require("./auth.json");
const cards = require("./scryfall-default-cards.json");
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

//Query for inserting cards into the card db
function cardInsert(id, name, desc, set, artist, img){
  let q ={
    text: "INSERT INTO saved_cards(card_id, card_name, card_description, card_set, card_artist, card_images) VALUES ($1, $2, $3, $4, $5, $6)",
    values: [id, name, desc, set, artist, img]
  };
  return q;
}

//Loops through all of the cards in the scryfall file and adds them to the database
(async () => {
  client = await pool.connect();
  let c = null;

  for(i=0;i<=cards.length-1; ++i){
    c = cards[i];
    try{
      await client.query("BEGIN");
      await client.query(cardInsert(c.id, c.name, c.oracle_text,c.set_name, c.artist, c.image_uris));
      client.query("COMMIT");
    } catch(e){
      client.query("ROLLBACK");
    }
  }
  console.log("Finished");
})().catch(e => console.log(e.stack));
