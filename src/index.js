require('dotenv').config();
const fs = require('fs');
const cliProgress = require('cli-progress');
const colors = require('colors');
const templates = require('./templates'); // Handlebars templates
const intercomApi = require('./api');
const { writeConversation } = require('./conversations');
const { CONVO_DIR, PER_PAGE } = require('./constants');

(async function () {
  if (!fs.existsSync(`./${CONVO_DIR}`)) {
    fs.mkdirSync(`./${CONVO_DIR}`);
  }

  const apiCalls = [];
  const response = await intercomApi.get(`/conversations?per_page=${PER_PAGE}`);
  const { pages } = response.data;
  const data = [response.data];

  for (let page = 2; page <= pages.total_pages; ++page) {
    apiCalls.push(
      intercomApi.get(`/conversations?per_page=${PER_PAGE}&page=${page}`),
    );
  }

  process.stdout.write(
    'First page fetched. ' +
      `Fetching additional ${apiCalls.length} pages of data...`,
  );
  const responses = await Promise.all(apiCalls);

  data.push(...responses.map(r => r.data));
  data.sort((a, b) => (a.pages.page > b.pages.page ? 1 : -1));
  const conversations = [].concat(...data.map(d => d.conversations));

  fs.writeFileSync(
    `./${CONVO_DIR}/index.html`,
    templates.indexPage({ conversations }),
  );

  console.log(`done! Wrote index of ${conversations.length} conversations.`);
  console.log('\nFetching and writing individual conversations...');

  const bar = new cliProgress.SingleBar(
    {
      format:
        'Progress: |' +
        colors.cyan('{bar}') +
        '| {value}/{total} conversations ({percentage}%) - ETA {eta}s',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
    },
    cliProgress.Presets.rect,
  );
  bar.start(conversations.length, 0);

  /**
   * await in a loop to avoid getting throttled by Intercom
   */
  for (const conversationId of conversations.map(c => c.id)) {
    await writeConversation(conversationId);
    bar.increment();
  }
})();
