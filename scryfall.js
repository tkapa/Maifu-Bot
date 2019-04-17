const fetch = require('node-fetch');

//This script deals with contacting the Scryfall API

//Draws a random card
async function RandomCard(){
  var c = fetch('https://api.scryfall.com/cards/random')
    .then(handle);

  return await c;
}

async function FetchCard(uri){
  var c = fetch(uri)
    .then(handle);

  return await c;
}

function handle(res){
  return res.json().then(function(json){
    return res.ok ? json : Promise.reject(json);
  });
}

module.exports = {
  RandomCard,
  FetchCard
};