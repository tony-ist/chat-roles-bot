import { Telegraf } from 'telegraf';
import { closeConnection, connectDB } from './db';

import reply from './middlewares/reply';
import error from './middlewares/error';
import rememberUser from './middlewares/remember_user';

import ping from './commands/ping';
import join from './commands/join';
import leave from './commands/leave';
import myroles from './commands/myroles';
import roles from './commands/roles';
import onRoleMention from './onRoleMention';
import list from './commands/list';
import deletee from './commands/delete';

const bot: Telegraf = new Telegraf(process.env.BOT_API_TOKEN);

bot.use(reply);
bot.use(error);
bot.use(rememberUser);

bot.command('ping', ping);
bot.command('join', join);
bot.command('leave', leave);
bot.command('myroles', myroles);
bot.command('roles', roles);
bot.command('list', list);
bot.command('delete', deletee);
bot.on('text', onRoleMention);

bot.action(/^[ping]+(-[a-zA-Z0-9]+)?$/, async (ctx) => {
  ctx.answerCbQuery();
  ctx.state.roleChosen = ctx.match[1].split('-')[1];
  return ping(ctx);
});

bot.action(/^[join]+(-[a-zA-Z0-9]+)?$/, async (ctx) => {
  ctx.answerCbQuery();
  ctx.state.roleChosen = ctx.match[1].split('-')[1];
  return join(ctx);
});

bot.action(/^[leav]+(-[a-zA-Z0-9]+)?$/, async (ctx) => {
  ctx.answerCbQuery();
  ctx.state.roleChosen = ctx.match[1].split('-')[1];
  return leave(ctx);
});

bot.action(/^[delt]+(-[a-zA-Z0-9]+)?$/, async (ctx) => {
  ctx.answerCbQuery();
  ctx.state.roleChosen = ctx.match[1].split('-')[1];
  return deletee(ctx);
});

process.once('SIGINT', () => {
  closeConnection()
    .then(() => console.log('SIGINT occurred, exiting'))
    .catch(() => console.log('SIGINT occurred, exiting with no db connection closed'));
});
process.once('SIGTERM', () => {
  closeConnection()
    .then(() => console.log('SIGTERM occurred, exiting'))
    .catch(() => console.log('SIGTERM occurred, exiting with no db connection closed'));
});

connectDB()
  .then(() => bot.launch())
  .then(() => console.log('Bot started'))
  .catch((err) => console.log(err));
