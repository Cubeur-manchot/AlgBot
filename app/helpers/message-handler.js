const R = require('ramda');
const {
  parseOptions,
  getPuzzle,
  getUrl,
  getStageAndView,
} = require('./message-helpers');
const algorithms = require('../raw-data/algs');
const sendMessageToChannel = R.curry((channel, msg) => channel.send(msg));

const pingCommand = ({ channel }) => {
  console.log('pong');
  sendMessageToChannel(channel, 'pong');
};

const algCommand = ({ channel, args }, algOrCase) => {
  const [moveSequence, option] = parseOptions(args);
  const puzzle = getPuzzle(option);
  const [stage, view] = getStageAndView(option);
  const colorScheme = option === 'yellow' ? 'yogwrb' : 'wrgyob';

  const fullMoveSequence = R.map(
    R.when(R.either(R.includes('_'), R.includes('une')), (x) =>
      R.path(['PLL', x], algorithms)
    ),
    moveSequence
  );

  const urlMoveSequence = R.replace(/'/g, '%27', R.join('', fullMoveSequence));

  const imageUrl = getUrl({
    algOrCase,
    puzzle,
    stage,
    view,
    colorScheme,
    urlMoveSequence,
  });

  channel.send(R.join(' ', fullMoveSequence), {
    files: [{ attachment: imageUrl, name: 'cubeImage.png' }],
  });
};
module.exports = {
  algCommand,
  pingCommand,
};
