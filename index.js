#!/usr/bin/env node

"use strict";

const fs = require('fs');
const chalk = require('chalk');
const md = require('telegraph.md');
const Telegraph = require('telegra.ph');
// const yargs = require('yargs')(process.argv.slice(2))
//   .usage('./$0 - follow ye instructions true')
//   .option('option', {
//     alias: 'o',
//     describe: "'tis a mighty fine option",
//     demandOption: true
//   })
//   .command('run', "Arrr, ya best be knowin' what yer doin'")
//   .example('$0 run foo', "shiver me timbers, here's an example for ye")
//   .showHelpOnFail(true, 'Specify --help for available options')
//   .help('help')
//   .wrap(70)
//   .locale('pirate')
//   .argv;

const config = {
  author: {
    name: '',
    nick: '',
    url: ''
  },
  user: {
    lastPage: '',
    savedToken: ''
  }
}

const app = {
  boot: function (client) {
    // Create an account if necessary and/or show existing pages list
    if (config.user.savedToken === 'undefined') {
      client.createAccount(config.author.nick, config.author.name, config.author.url).then((account) => {
        client.token = account.access_token
        console.log(client);

        // Save created token
        config.user.savedToken = account.access_token;
        return client.getPageList();
      }).then((pages) => console.log('Existing pages:', pages));
    }
    else {
      console.log(`\nUsing existing token: ${config.user.savedToken}\n`);
      client.getPageList().then((pages) => console.log('Existing pages:', pages));
    }
  },
  publishFile: function (client, title, content) {
    client.createPage(title, content, config.author.name, config.author.url, true).then((page) => {
      console.log(page);

      // Save last created page
      config.user.lastPage = page.path;
      return client.getPageList();
    }).then((pages) => console.log(pages))
  },
  updatePage: function (client, page, newTitle, newContent) {
    client.editPage(page, newTitle, newContent, config.author.name, config.author.url, true).then((page) => {
      console.log(page);

      // Save last edited page
      config.user.lastPage = page.path;
      return client.getPageList();
    }).then((pages) => console.log(pages))
  }
}

fs.readFile('./README.md', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(`Parsing markdown:\n\n${data}`);
  const nodes = md(data);
  console.log('Parsing result:', nodes);

  // Create a test client
  const client = config.user.savedToken ? new Telegraph(config.user.savedToken) : new Telegraph();

  // Start app code
  app.boot(client);

  // Publish method test
  // app.publishFile(client, 'md2tg', nodes);

  // Update method test
  // app.updatePage(client, config.user.lastPage, 'md2tg project page', nodes);
});
