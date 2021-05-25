const { Telegraf } = require('telegraf');
const axios = require('axios');
require('dotenv').config(); // no need to assign

const DEFIPULSE_APIKEY = process.env.DEFIPULSE_APIKEY;
const URL = `https://ethgasstation.info/api/ethgasAPI.json?api-key=${DEFIPULSE_APIKEY}`;
const bot = new Telegraf(`${process.env.BOT_TOKEN}`);

// review logic of 1 alert at a time and alert cancellation
bot.start((ctx) => {
  ctx.reply('Bot 2.0 \n- /start \n- /gas {input number} \n- /cancel');
});

let timerId;
bot.command('gas', (ctx) => {
  // how to set 1x alert only ?
  if (!timerId || timerId._destroyed) {
    // from telegram: /gas 500
    words = ctx.message.text;
    wordArray = words.split(' '); // /gas 500 string -> array ['/gas', 500]
    gasAlertLimit = +wordArray[1];

    //  +'100abc' : string -> NaN : number
    if (isNaN(gasAlertLimit)) {
      ctx.reply('send number');
    } else {
      ctx.reply('alert running!!!');
      timerId = setTimeout(function getGasPrice() {
        axios.get(URL).then(async (res) => {
          let fastGas = await res.data.fast;
          console.log(fastGas);
          if (fastGas > gasAlertLimit) {
            ctx.reply(`gas exceeded ${gasAlertLimit}, currently: ${fastGas}`);
            clearTimeout(timerId);
          }
        });
        timerId = setTimeout(getGasPrice, 15000);
      }, 1000);
    }
  }
});

bot.command('cancel', (ctx) => {
  clearTimeout(timerId);
  ctx.reply('alert cancelled');
});

bot
  .launch()
  .then(console.log('up n running!'))
  .catch((err) => console.log(err));
