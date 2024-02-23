const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const token = '6789395892:AAHDfRyFWN2MezLsnQDVJKu4BGIBHO6mIGU';
const bot = new TelegramBot(token, { polling: true });

let chat = { id: -1002083319572, type: 'channel' };

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
        const tonTokenPrice = tokenPrices['EQATgD7dao9jWBdz_qKL-UJZCXZGQvV5HJVUC85ssgmHKWll'];

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
  getTokenPrice('EQATgD7dao9jWBdz_qKL-UJZCXZGQvV5HJVUC85ssgmHKWll')
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
