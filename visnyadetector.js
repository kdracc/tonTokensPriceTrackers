const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const token = '6408780801:AAGq39fA3XnPFJqCaOBULOytiRB3YqZAUlI';
const bot = new TelegramBot(token, { polling: true });

let chat = { id: -1002131964420, type: 'channel' };

let previousPrice = 0;

async function getTokenPrice(symbol) {
  const url = `https://api.geckoterminal.com/api/v2/simple/networks/ton/token_price/${symbol}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'accept': 'application/json',
      },
    });

    if (response.status === 200) {
      const tokenPrices = response.data.data.attributes.token_prices;

      if (tokenPrices && Object.keys(tokenPrices).length > 0) {
        const tonTokenPrice = tokenPrices['EQCDIJKFTf5QoWii6-_KTk8bo6eKiR-6hk5HUQwixCe8SW-I'];

        if (tonTokenPrice !== undefined) {
          return parseFloat(tonTokenPrice).toFixed(5);
        } else {
          return "N/A";
        }
      } else {
        return "N/A";
      }
    } else {
      console.error(`Failed to fetch token information! Status: ${response.status}`);
      return `Failed to fetch token information! Status: ${response.status}`;
    }
  } catch (error) {
    console.error('Error fetching token information:', error.message);
    return `Error fetching token information: ${error.message}`;
  }
}

function sendTokenPrice() {
  getTokenPrice('EQCDIJKFTf5QoWii6-_KTk8bo6eKiR-6hk5HUQwixCe8SW-I')
    .then(currentPrice => {
      if (previousPrice !== 0) {
        let emoji = null;
        let percentageChange = '0.00%';

        if (currentPrice > previousPrice) {
          emoji = '🟢';
          percentageChange = `+${((currentPrice / previousPrice - 1) * 100).toFixed(2)}%`;
          perChangeNum = `+${((currentPrice / previousPrice - 1) * 100).toFixed(2)}`;
        } 
        else if (currentPrice < previousPrice) {
          emoji = '🔴';
          percentageChange = `-${(100 - currentPrice / previousPrice * 100).toFixed(2)}%`;
        }
        
        if (emoji !== null) {
          const message = `${emoji} $PLANKTON Price: ${currentPrice}$ | ${percentageChange}`;
          bot.sendMessage(chat.id, message);
        }
      }

      previousPrice = currentPrice;
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

setInterval(sendTokenPrice, 10000);
