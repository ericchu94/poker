'use strict';
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

app.use(co.wrap(function *(ctx, next) {
  yield next();
  console.log({
    users: app.context.users,
  });
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
    users: app.context.users,
    pot: app.context.pot,
  });
}));

router.put('/users', bodyParser(), co.wrap(function *(ctx, next) {
  const body = ctx.request.body;
  const users = app.context.users;
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

router.post('/bet', bodyParser(), co.wrap(function *(ctx, next) {
  const body = ctx.request.body;
  const user = app.context.users[body.user]; 
  const amount = parseInt(body.amount);

  if (user.score - amount >= 0) {
    user.score -= amount;
    user.bet += amount;
    app.context.pot += amount;
    ctx.status = 200;
    yield next();
  }
}));

router.post('/win', bodyParser(), co.wrap(function *(ctx, next) {
  const body = ctx.request.body;
  const users = app.context.users;

  users[body.user].score += app.context.pot;
  for (const user in users)
    users[user].bet = 0;

  app.context.pot = 0;
  ctx.status = 200;
  yield next();
}));

app.use(router.routes());
app.use(router.allowedMethods());

app.context.users = {};
app.context.pot = 0;

app.listen(3000);
