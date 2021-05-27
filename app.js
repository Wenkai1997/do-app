const { Telegraf } = require('telegraf');
const axios = require('axios');
require('dotenv').config(); // no need to assign

const DEFIPULSE_APIKEY = process.env.DEFIPULSE_APIKEY;
const URL = `https://ethgasstation.info/api/ethgasAPI.json?api-key=${DEFIPULSE_APIKEY}`;
const bot = new Telegraf(`${process.env.BOT_TOKEN}`);

// review logic of 1 alert at a time and alert cancellation
let startMsg = `Bot Version 3.0
/start \t\t\t\t\t\t\t\t\t\t- for commands
/gas num \t\t\t- for alerts
/cancel \t\t\t\t\t\t\t- cancel alert
/ditto /cat \t- pics!
inline_query\t- for programming articles`;

bot.start((ctx) => {
  ctx.reply(startMsg);
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

bot.command('ditto', (ctx) => {
  ctx.replyWithPhoto(
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png',
  );
});

bot.command('cat', (ctx) => {
  bot.telegram.sendPhoto(
    ctx.chat.id,
    { source: 'pic/cat.png' }, // why source
    { caption: 'cat' },
  );
});

// https://dev.to/api/articles
// https://dev.to/api/articles?tag=javascript
bot.on('inline_query', (ctx) => {
  //console.log(ctx);
  console.log(ctx.update.inline_query.query);
  query = ctx.update.inline_query.query;

  // 2 word query at least
  if (query.length >= 2) {
    let DEVTO_URL = `https://dev.to/api/articles?tag=${query}`;
    axios.get(DEVTO_URL).then((res) => {
      objArr = res.data;
      result = objArr.map((elem, index) => {
        return {
          type: 'article',
          id: String(index),
          title: elem.title,
          description: elem.description,
          input_message_content: {
            message_text: `${elem.title}\n${elem.description}\n${elem.url}`,
          },
          url: elem.url,
        };
      });
      result = result.slice(0, 10);
      console.log(result);
      ctx.answerInlineQuery(result);
    });
  }
});

/* inline_keyboard */
// bot.command('test', (ctx) => {
//   console.log('debug');
//   ctx.reply('hello world', {
//     reply_markup: {
//       inline_keyboard: [
//         [
//           { text: 'btn1-google', url: 'https://google.com' },
//           { text: 'btn2-callback_test2', callback_data: 'test2' },
//         ],
//       ],
//     },
//   });
// });

// // invoked when 'test2' is heard
// bot.action('test2', (ctx) => {
//   ctx.deleteMessage();
//   ctx.reply('test2 invoked');
// });

bot
  .launch()
  .then(console.log('up n running!'))
  .catch((err) => console.log(err));
