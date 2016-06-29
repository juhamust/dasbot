//import * as AWS from 'aws-sdk';
import querystring from 'querystring';
const shortid = require('shortid');
const AWS = require('aws-sdk');
import * as btree from 'binary-search-tree';
import FuzzySet from 'fuzzyset.js';
// NOTE: import from does not work
const snowballFactory = require('snowball-stemmers');

const TABLE_NAME = 'dasbot-input';
const region = process.env.SERVERLESS_REGION || 'eu-west-1';
const endpoint = `https://dynamodb.${region}.amazonaws.com`;

AWS.config.update({
  region: region,
  endpoint: endpoint
});

// Create instances
const doc = new AWS.DynamoDB();
const cloudsearch = new AWS.CloudSearch({ apiVersion: '2013-01-01' });
const searchdomain = new AWS.CloudSearchDomain({ endpoint: 'https://search-dasbot-input-cnpcv5rjxqlksogusvdz7x7s6i.eu-west-1.cloudsearch.amazonaws.com' });
const fuzz = FuzzySet();
const snow = snowballFactory.newStemmer('finnish');
const bst = new btree.BinarySearchTree();

function reindex(documentId = null) {
  var params = {
    contentType: 'application/json',
    documents: null
  };

  // Fetch documents
  return queryDocuments(documentId)
  .then((documents) => {
    console.log(`Fetched ${documents.length} documents`);
    params.documents = JSON.stringify(documents.map((document) => {
      return {
        type: 'add',
        id: document.id.S,
        fields: {
          answer: document.answer.S,
          question: document.question.S,
          id: document.id.S
        }
      };
    }));

    // Upload documents
    return new Promise((resolve, reject) => {
      searchdomain.uploadDocuments(params, (err, data) => {
        if (err) {
          console.error('Failed to upload documents', err, err.stack);
          return reject(err);
        }
        return resolve(data);
      });
    })
  });
}

function search(query) {
  const params = {
    query
  };

  return new Promise((resolve, reject) => {
    searchdomain.search(params, function(err, data) {
      if (err) {
        console.error('Failed ', err, err.stack);
        return reject(err);
      }
      // Take first answer
      data = data.hits.found > 0 ? data.hits.hit[0].fields.answer[0] : null;
      return resolve(data);
    });
  });
}

function learn(opts) {
  console.log('Learning', opts);
  // const wordIndexes = [];
  // const baseWords = [];
  //
  // const baseSentence = question.split(' ').map((word) => {
  //   return snow.stem(word);
  // }).join(' ');

  // Store sentence to fuzzy set: Question is matched against fuzzy search
  //fuzz.add(baseSentence);
  // Store the sentence with answer: Base sentence works as index
  //bst.insert(baseSentence, answer);

  return new Promise((resolve, reject) => {
    const id = shortid.generate();
    const params = {
      TableName : TABLE_NAME,
      Item: {
         id: { S: id } ,
         question: { S: opts.question } ,
         answer: { S: opts.answer }
      },
      ReturnValues: 'ALL_OLD'
    }
    doc.putItem(params, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve({ id, question: opts.question, answer: opts.answer });
    })
  });
}

function queryDocuments(documentId) {
  // TODO: Implement fetching only given ids
  var params = {
    TableName: TABLE_NAME,
    //Select: 'ALL_ATTRIBUTES',
    ProjectionExpression: 'id, question, answer'
  }

  return new Promise((resolve, reject) => {
    doc.scan(params, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data.Items);
    });
  });
}

function updateAnswer(id, answer) {
  console.log('Updating answer with', id, answer);
  return new Promise((resolve, reject) => {
    const params = {
      TableName : TABLE_NAME,
      Key: {
         id: { S: id }
      },
      AttributeUpdates: {
        answer: {
          Action: 'PUT',
          Value: { S: answer }
        }
      },
      ReturnValues: 'ALL_OLD'
    }
    doc.updateItem(params, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve({ id, answer: answer });
    })
  });
}

function answer(question) {
  const baseSentence = question.split(' ').map((word) => { snow.stem(word)}).join();
  const output = fuzz.get(baseSentence)[0];

  return `${question} ${bst.search(output[1])[0]}`;
}

function parseEventData(rawEvent) {
  if (rawEvent.urldata) {
    return Promise.resolve(querystring.parse(rawEvent.urldata));
  }
  if (rawEvent.data) {
    return Promise.resolve(rawEvent.data);
  }
  return Promise.reject('Missing required data');
}

function checkToken(token, returnValue) {
  return Promise.resolve(returnValue);

  // NOTE: If env variable is not defined, no check
  if (token === process.env.DASBOT_TOKEN) {
    return Promise.resolve(returnValue);
  }
  return Promise.reject('Invalid token');
}

export default {
  learn,
  search,
  answer,
  reindex,
  updateAnswer,
  parseEventData,
  checkToken
};
