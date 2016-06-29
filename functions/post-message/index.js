import bot from 'daslib';

function postMessage(message) {
  return bot.search(message.replace(/\s/g, '|'))
  .then((response) => {
    // Return response if found
    if (response) {
      return Promise.resolve(response);
    }

    // Store th question for learning purposes
    return bot.learn({
      question: message,
      answer: '?'
    })
    .then((response) => {
      console.log('Message response', response);
      return `Nyt en ymmärrä. Opeta minua laittamalla viesti: "!papu #${response.id} <vastaus>`;
    });
  })
}

function respond(event) {
  return bot.parseEventData(event)
  .then(function(data) {
    return bot.checkToken(data.token, data);
  })
  .then((data) => {
    console.log('Handling event:', data);
    // Strip triggers and actions
    if (data.trigger_word) {
      data.text = data.text.replace(data.trigger_word, '');
    }

    const match = data.text.match(/(#(\w+))/)
    if (match && match.length > 1) {
      return bot.updateAnswer(match[2], data.text.replace(match[1], '').trim());
    }
    return postMessage(data.text);
  })
  .then((out) => {
    console.log('Output', out);
    return { text: out };
  });
};

export {
  respond,
  postMessage
}
