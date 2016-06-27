require('babel-register');
var bot = require('./src/bot');

var material = [
  ['koirallamme on ehkä matoja', 'eikä, tosi ikävää!'],
  ['kissallamme on ehkä matoja', 'mistä lie saanut!'],
  ['kissallamme on ehkä matoja', 'hui kauhia!'],
  ['kissaa ei saa kiusata', 'ei tietenkään!'],
  ['kisatessa ei saa huijata', 'ei tietenkään!'],
  ['missä seppo on?', 'ei tietoa'],
  ['syömään!', 'nälkä!'],
  ['mennään syömään!', 'soppaa!'],
  ['missä seppo on?', 'huutele jos löytäisit'],
  ['missä kisuli on?', 'huutele jos löytäisit'],
  ['missä kissa on?', 'ei tietoa kissasta'],
  ['mikä sää?', 'mikäs tässä paistatellessa'],
  ['kurja sää', 'aika kehno'],
  ['vesisade', 'mälsää'],
];

material.forEach(function(pair) {
  bot.learn(pair[0], pair[1]);
})

console.log(bot.answer('missä'));
console.log(bot.answer('misä seppo?'));
console.log(bot.answer('minulla on matoja'));
console.log(bot.answer('älä kiusaa!'));
console.log(bot.answer('mihin syömään?'));
console.log(bot.answer('mikä sää?'));
console.log(bot.answer('ajatuksia säästä?'));
console.log(bot.answer('vettä sataa'));
