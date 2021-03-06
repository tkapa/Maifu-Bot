//Generic Embed, Presents Card
function Card(c) {
  let embed = {
    embed: {
      title: c.card_name,
      url: c.card_uri,
      color: 111111,
      image: {
        url: c.card_images.border_crop
      },
      author: {
        name: "New Card"
      },
      fields: [
        {
          name: "Description",
          value: c.card_description,
          inline: true
        },
        {
          name: "Set",
          value: c.card_set,
          inline: true
        },
        {
          name: "Artist",
          value: c.card_artist,
          inline: true
        },
        {
          name: "Image not showing?",
          value: `Card image available [here](${c.card_images.border_crop})`
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
      color: 111111,
      image: {
        url: c.card_images.art_crop
      },
      author: {
        name: "Name the Card!"
      },
      fields: [
        {
          name: "Set",
          value: c.card_set,
          inline: true
        },
        {
          name: "Artist",
          value: c.card_artist,
          inline: true
        },
        {
          name: "Image not showing?",
          value: `Card image available [here](${c.card_images.art_crop})`
        }
      ]
    }
  };

  return embed;
}

//Embed a card that has been claimed by someone
function ClaimedCard(c, userID) {
  let embed = {
    embed: {
      title: c.card_name,
      url: c.card_uri,
      color: 111111,
      image: {
        url: c.card_images.border_crop
      },
      author: {
        name: `Card Claimed!`
      },
      fields: [
        {
          name: "Description",
          value: c.card_description,
          inline: true
        },
        {
          name: "Set",
          value: c.card_set,
          inline: true
        },
        {
          name: "Artist",
          value: c.card_artist,
          inline: true
        },
        {
          name: "Image not showing?",
          value: `Card image available [here](${c.card_images.border_crop})`,
          inline: true
        },
        {
          name: "Card Claimed By:",
          value: `<@${userID}>`,
          inline: true
        }
      ]
    }
  };

  return embed;
}

function ProfileEmbed(p, cards, gold, fav) {
  let favourite = `No favourited cards`;
  let card_image = null;

  if(fav != null){
    favourite = fav.rows[0].card_name;
    card_image = fav.rows[0].card_images.border_crop;
  }

  let embed = {
    embed: {
      title: `${p.username}'s Profile`,
      image:{
        url: card_image
      },
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
        },
        {
          name: `Favourite Card`,
          value: `${favourite}`,
          inline: true
        }
      ]
    }
  }
  return embed;
}

function ListEmbed(p, cardList, page, pageSize){
  let temp = ``;

  let min = 0;
  if((page-1)*pageSize > 0)
    min = (page-1)*pageSize;
  
  let max = pageSize;
  if(page*pageSize > max)
    max = page*pageSize;
  if(max >= cardList.length)
    max = cardList.length;

  for(i=min; i<=max-1; ++i){
    if(i == 0){
      temp = `${i} | ${cardList[i]}`;
    } else {
      temp = temp.concat("\n", `${i} | ${cardList[i]}`);
    }
  }

  let embed = {
    embed:{
      title: `${p.username}'s Cards`,
      description: temp,
      footer : {
        text: `This is page ${page} of ${Math.ceil(cardList.length/pageSize)}`
      }
    }
  }
  return embed;
}

module.exports = {
  Card,
  NameGuess,
  ClaimedCard,
  ProfileEmbed,
  ListEmbed
};
