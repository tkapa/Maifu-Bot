//Generic Embed, Presents Card
function Card(c) {
  let embed = {
    embed: {
      title: c.name,
      url: c.scryfall_uri,
      color: 111111,
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
  let embed = {
    embed: {
      url: c.scryfall_uri,
      color: 111111,
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
  let embed = {
    embed: {
      title: c.name,
      url: c.scryfall_uri,
      color: 111111,
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

function ProfileEmbed(p, cards, gold){
  let embed = {
    embed:{
      title: `${p.username}'s Profile`,
      thumbnail: {
        url: `https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.png`
      },
      fields: [
        {
          name: `Total Cards`,
          value: `${cards.length}`,
          inline: true
        },
        {
          name: `Gold`,
          value: `${gold}`,
          inline: true
        }
      ]
    }
  }
  return embed;
}
module.exports = {
  Card,
  NameGuess,
  ClaimedCard,
  ProfileEmbed
};
