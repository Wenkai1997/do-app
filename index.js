const { Telegraf } = require('telegraf');
require('dotenv').config(); // no need to assign

const bot = new Telegraf(`${process.env.TOKEN}`);

bot.on('text', (ctx) =>
  bot.telegram.sendMessage(ctx.chat.id, ctx.message.text),
);

// 2nd test
bot
  .launch()
  .then(console.log('up n running!'))
  .catch((err) => console.log(err));
