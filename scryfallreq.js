const fetch = require('node-fetch');

//This script deals with contacting the Scryfall API

//Draws aa random card
async function RandomCard(){
  var c = fetch('https://api.scryfall.com/cards/random')
    .then(handle);

  return await c;
}

function handle(res){
  return res.json().then(function(json){
    return res.ok ? json : Promise.reject(json);
  });
}

//Handles Embed content for discord
function Card(c) {
  var embed = {
      "embed": {
        "title": c.name,
        "url": c.scryfall_uri,
        "color": 111111,
        "timestamp": "2019-04-14T10:39:38.772Z",
        "image": {
          "url": c.image_uris.border_crop
        },
        "author": {
          "name": "New Card"
        },
        "fields": [
          {
            "name": "Description",
            "value": c.oracle_text,
            "inline": true
          },
          {
            "name": "Set",
            "value": c.set_name,
            "inline": true
          },
          {
            "name": "Artist",
            "value": c.artist,
            "inline": true
          },
          {
            "name": 'Image not showing?',
            "value": `Card image available [here](${c.image_uris.border_crop})`
          }
        ]
      }
  };

  return embed;
}

function NameGuess(c){
  var embed = {
    "embed": {
      "url": c.scryfall_uri,
      "color": 111111,
      "timestamp": "2019-04-14T10:39:38.772Z",
      "image": {
        "url": c.image_uris.art_crop
      },
      "author": {
        "name": "Name the Card!"
      },
      "fields": [
        {
          "name": "Set",
          "value": c.set_name,
          "inline": true
        },
        {
          "name": "Artist",
          "value": c.artist,
          "inline": true
        },
        {
          "name": 'Image not showing?',
          "value": `Card image available [here](${c.image_uris.border_crop})`
        }
      ]
    }
  };

  return embed;
}

module.exports = {
  RandomCard,
  Card,
  NameGuess
};