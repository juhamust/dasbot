import bot from 'daslib';

function respond(event) {
  let documentId = null;

  console.log('Received a trigger for reindexing');
  if (event.Records) {
    event.Records.forEach((record) => {
      console.log(record.eventName, 'for', record.dynamodb.Keys.id.S);
      documentId = record.dynamodb.Keys.id.S
    });
  }

  return bot.reindex(documentId)
  .then((out) => {
    console.log('Output', out);
    return { text: out };
  });
};

export {
  respond
}
