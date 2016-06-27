import * as btree from 'binary-search-tree';
import FuzzySet from 'fuzzyset.js';
// NOTE: import from does not work
const snowballFactory = require('snowball-stemmers');

// Create instances
var fuzz = FuzzySet();
var snow = snowballFactory.newStemmer('finnish');
var bst = new btree.BinarySearchTree();

export function learn(question, answer) {
  var wordIndexes = [];
  var baseWords = [];

  const baseSentence = question.split(' ').map((word) => {
    return snow.stem(word);
  }).join(' ');

  // Store sentence to fuzzy set: Question is matched against fuzzy search
  fuzz.add(baseSentence);
  // Store the sentence with answer: Base sentence works as index
  bst.insert(baseSentence, answer);
}

export function answer(question) {
  const baseSentence = question.split(' ').map((word) => snow.stem(word)).join();
  const output = fuzz.get(baseSentence)[0];

  return `${question}: ${bst.search(output[1])[0]}`;
}
