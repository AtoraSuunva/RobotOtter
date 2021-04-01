module.exports.config = {
  name: 'invite',
  invokers: ['invite'],
  help: 'Invite the bot',
  expandedHelp: 'Just call the command',
  usage: [],
}

module.exports.events = {}

module.exports.events.message = (bot, message) => {
  bot.generateInvite().then(i => message.channel.send(`Invite me! <${i}>`))
}
