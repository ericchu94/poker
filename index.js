'use strict';
const fs = require('fs');
const Koa = require('koa');
const co = require('co');
const router = require('koa-router')();
const views = require('koa-views');
const serve = require('koa-static');
const bodyParser = require('koa-bodyparser');
const app = new Koa();

app.use(co.wrap(function *(ctx, next) {
  const start = new Date();
  yield next();
  const end = new Date();
  console.log(`${ctx.method} ${ctx.url} - ${ctx.status} ${end - start} ms`);
}));

app.use(views(__dirname + '/views', {
  map: {
    ejs: 'ejs',
  },
  extension: 'ejs',
}));

router.get('/assets/*', serve('.'));

router.get('/', co.wrap(function *(ctx, next) {
  yield ctx.render('index', {
    users: app.context.game.users,
    pot: app.context.game.pot,
  });
}));

router.put('/users', bodyParser(), co.wrap(updateContext),  co.wrap(function *(ctx, next) {
  const body = ctx.request.body;
  const users = app.context.game.users;
  const user = body.user;

  if (user && !(user in users)) {
    users[user] = {
      name: user,
      score: 100,
      bet: 0,
    };
    ctx.status = 200;
    yield next();
  }
}));

router.post('/bet', bodyParser(), co.wrap(updateContext),  co.wrap(function *(ctx, next) {
  const body = ctx.request.body;
  const user = app.context.game.users[body.user]; 
  const amount = parseInt(body.amount);

  if (user.score - amount >= 0) {
    user.score -= amount;
    user.bet += amount;
    app.context.game.pot += amount;
    ctx.status = 200;
    yield next();
  }
}));

router.post('/win', bodyParser(), co.wrap(updateContext),  co.wrap(function *(ctx, next) {
  const body = ctx.request.body;
  const users = app.context.game.users;

  users[body.user].score += app.context.game.pot;
  for (const user in users)
    users[user].bet = 0;

  app.context.game.pot = 0;
  ctx.status = 200;
  yield next();
}));

function *updateContext(ctx, next) {
  yield next();
  console.log(app.context.game);
  fs.writeFile('game.json', JSON.stringify(app.context.game));
}

app.use(router.routes());
app.use(router.allowedMethods());

try {
  const game = fs.readFileSync('game.json')
  app.context.game = JSON.parse(game);
}
catch (err) {
  console.log(`Failed to load save: ${err}`);
  app.context.game = {
    users: {},
    pot: 0,
  };
}

app.listen(3000);
