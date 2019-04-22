//Generic Embed, Presents Card
function Card(c) {
  var embed = {
    embed: {
      title: c.name,
      url: c.scryfall_uri,
      color: 111111,
      timestamp: "2019-04-14T10:39:38.772Z",
      image: {
        url: c.image_uris.border_crop
      },
      author: {
        name: "New Card"
      },
      fields: [
        {
          name: "Description",
          value: c.oracle_text,
          inline: true
        },
        {
          name: "Set",
          value: c.set_name,
          inline: true
        },
        {
          name: "Artist",
          value: c.artist,
          inline: true
        },
        {
          name: "Image not showing?",
          value: `Card image available [here](${c.image_uris.border_crop})`
        }
      ]
    }
  };

  return embed;
}

//Embed that shows only art, set and artist
function NameGuess(c) {
  var embed = {
    embed: {
      url: c.scryfall_uri,
      color: 111111,
      timestamp: "2019-04-14T10:39:38.772Z",
      image: {
        url: c.image_uris.art_crop
      },
      author: {
        name: "Name the Card!"
      },
      fields: [
        {
          name: "Set",
          value: c.set_name,
          inline: true
        },
        {
          name: "Artist",
          value: c.artist,
          inline: true
        },
        {
          name: "Image not showing?",
          value: `Card image available [here](${c.image_uris.art_crop})`
        }
      ]
    }
  };

  return embed;
}

//Embed a card that has been claimed by someone
function ClaimedCard(c) {
  var embed = {
    embed: {
      title: c.name,
      url: c.scryfall_uri,
      color: 111111,
      timestamp: "2019-04-14T10:39:38.772Z",
      image: {
        url: c.image_uris.border_crop
      },
      author: {
        name: "Card Claimed!"
      },
      fields: [
        {
          name: "Description",
          value: c.oracle_text,
          inline: true
        },
        {
          name: "Set",
          value: c.set_name,
          inline: true
        },
        {
          name: "Artist",
          value: c.artist,
          inline: true
        },
        {
          name: "Image not showing?",
          value: `Card image available [here](${c.image_uris.border_crop})`
        }
      ]
    }
  };

  return embed;
}

module.exports = {
  Card,
  NameGuess,
  ClaimedCard
};
