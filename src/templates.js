const Handlebars = require('handlebars');
const { dateTimeFormat } = require('./helpers');

Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  // eslint-disable-next-line eqeqeq
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('dateTime', dateTimeFormat);

module.exports = {
  indexPage: Handlebars.compile(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Intercom Conversations</title>
  <style type="text/css" rel="stylesheet">
    body {
      background: #333;
      color: #eee;
    }
    a {
      color: #0bf;
    }
    tbody td {
      border-bottom: 1px solid #eee;
      padding: 0.5rem;
    }
  </style>
</head>
<body>
  <h1>Intercom Conversations</h1>

  <table cellpadding="0" cellspacing="0">
    <thead>
      <tr>
        <th></th>
        <th>Updated</th>
        <th>Started by</th>
        <th>Email</th>
        <th>Subject</th>
        <th>Tags</th>
      </tr>
    </thead>
    <tbody>
      {{#each conversations}}
        <tr>
          <td>
            {{#ifEquals this.source.type "email"}}
              ✉️
            {{else}}
              💬
            {{/ifEquals}}
          </td>
          <td>
            <a href="{{this.id}}.html">{{dateTime this.updated_at}}</a>
          </td>
          <td>{{this.source.author.name}}</td>
          <td>{{this.source.author.email}}</td>
          <td>{{{this.source.subject}}}</td>
          <td>
            {{#each this.tags.tags}}
              {{this.name}}, 
            {{/each}}
          </td>
        </tr>
      {{/each}}
    </tbody>
  </table>
</body>
</html>`),

  convoPage: Handlebars.compile(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{title}}</title>
  <style type="text/css" rel="stylesheet">
    body {
      background: #333;
      color: #eee;
    }
    a {
      color: #0bf;
    }
    .part {
      background: #444;
      border-radius: 4px;
      padding: 2rem;
      margin: 2rem;
    }
    .part img {
      max-width: 100%;
    }
    .tags {
      display: inline-flex;
      list-style: none;
      padding: 0;
    }
    .tags li {
      border-radius: 24px;
      border: 1px solid #0bf;
      color: #fff;
      padding: 0.5rem 1rem;
    }
    .tags li:not(:first-of-type) {
      margin-left: 0.5rem;
    }
  </style>
</head>
<body>
  <h1>{{title}}</h1>
  <ul class="tags">
    {{#each tags}}
      <li>🏷 {{this}}</li>
    {{/each}}
  </ul>
  {{#each convoParts}}
    <div class="part">
      <div>{{this.author.name}} ({{this.author.email}}) @ {{this.date}}</div>
      <blockquote>{{{this.body}}}</blockquote>
    </div>
  {{/each}}
</body>
</html>`),
};
