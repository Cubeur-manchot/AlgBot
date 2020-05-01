const R = require('ramda');
const {
  algCommand,
  pingCommand,
  changeBotAvatarCommand,
} = require('../helpers/message-handler');

const messageIsCommand = R.startsWith('$');

const commandChoose = R.cond([
  [R.propEq('command', '$do'), x => algCommand(x, 'alg')],
  [R.propEq('command', '$alg'), x => algCommand(x, 'case')],
  [R.propEq('command', '$ping'), pingCommand],
]);

const applyCommand = (message) => {
  const { channel } = message;
  const [command, ...args] = R.pipe(R.prop('content'), R.split(' '))(message);

  return commandChoose({
    channel,
    command,
    args,
  });
};

const incomingMessage = R.when(
  R.pipe(R.prop('content'), messageIsCommand),
  applyCommand
);

module.exports = { incomingMessage };
