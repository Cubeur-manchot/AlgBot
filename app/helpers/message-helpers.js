const R = require('ramda');

const parseOptions = (args) => [
  R.reject(R.startsWith('-'), args),
  ...R.map(R.slice(1, Infinity), R.filter(R.startsWith('-'), args)),
];

const getPuzzle = R.cond([
  [R.isNil, R.always('333')],
  [(x) => !isNaN(x), R.always],
  [R.includes('mega'), R.always('mega')],
  [R.includes('kilo'), R.always('kilo')],
  [R.equals('skweb'), R.always('skewb')],
  [R.includes(R.__, ['sq1', 'skewb']), R.always],
  [R.T, R.always('333')],
]);

const getStageAndView = R.cond([
  [R.isNil, () => ['pll', '&view=plan']],
  [
    R.includes(R.__, [
      'fl',
      'f2l',
      'vh',
      'els',
      'cls',
      'cross',
      'f2l_3',
      'f2l_2',
      'f2l_sm',
      'f2l_1',
    ]),
    (x) => [x, ''],
  ],
  [
    R.includes(R.__, [
      'll',
      'cll',
      'ell',
      'oll',
      'ocll',
      'oell',
      'coll',
      'coell',
      'wv',
      'cmll',
      'f2b',
      'line',
      '2x2x2',
      '2x2x3',
    ]),
    (x) => [x, '&view=plan'],
  ],
  [R.equals('zbls'), () => ['vh', '']],
  [R.equals('ollcp'), () => ['coll', '&view=plan']],
  [R.includes(R.__, ['zbll', '1lll']), () => ['pll', '&view=plan']],
  [R.equals('plan'), () => ['', '&view=plan']],
  [R.T, () => ['pll', '&view=plan']],
]);

const getUrl = R.cond([
  [
    R.propEq('puzzle', '333'),
    ({ algOrCase, puzzle, stage, view, colorScheme, urlMoveSequence }) =>
      `http://cube.crider.co.uk/visualcube.php?fmt=png&bg=t&size=150${view}&pzl=${puzzle}&sch=${colorScheme}&stage=${stage}&${algOrCase}=${urlMoveSequence}`,
  ],

  [
    R.propEq('puzzle', 'mega'),
    ({ urlMoveSequence }) =>
      `http://cubiclealgdbimagegen.azurewebsites.net/generator?puzzle=mega&alg=${urlMoveSequence}`,
  ],
  [R.T, R.always],
]);

module.exports = { parseOptions, getPuzzle, getStageAndView, getUrl };
