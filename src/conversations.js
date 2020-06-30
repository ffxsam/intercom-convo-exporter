const fs = require('fs');
const _uniq = require('lodash.uniq');
const intercomApi = require('./api');
const templates = require('./templates');
const { dateTimeFormat } = require('./helpers');
const { CONVO_DIR } = require('./constants');

async function writeConversation(conversationId) {
  let response;

  try {
    response = await intercomApi.get(`/conversations/${conversationId}`);
  } catch (e) {
    console.error(e);
    return;
  }

  const { data: conversation } = response;
  const { conversation_parts: parts } = conversation.conversation_parts;
  const participants = _uniq([
    ...parts.map(p => p.author.name),
    conversation.source.author.name,
  ]).join(', ');
  const tags = conversation.tags.tags.map(t => t.name);
  const convoParts = [];

  convoParts.push(
    {
      date: dateTimeFormat(conversation.created_at),
      body: conversation.source.body,
      author: conversation.source.author,
    },
    ...parts.map(p => ({
      date: dateTimeFormat(p.created_at),
      body: p.body,
      author: p.author,
    })),
  );

  fs.writeFileSync(
    `./${CONVO_DIR}/${conversationId}.html`,
    templates.convoPage({
      title: `Conversation between ${participants}`,
      convoParts,
      tags,
    }),
  );
}

module.exports = {
  writeConversation,
};
