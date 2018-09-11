//Invite the butt

module.exports.config = {
  name: 'invite',
  invokers: ['invite'],
  help: 'Get an invite for the bot/the help server!',
  expandedHelp: 'Get an invite for the bot, or an invite to the help server DM\'d to you.',
  usage: ['Invite bot', 'invite', 'Get invite to server', 'invite server']
}

module.exports.events = {}
module.exports.events.message = (bot, message) => {
  let args = bot.sleet.shlex(message.content)

  if (args[1] === 'server' || args[1] === 'guild') {
    message.author.send('https://discord.gg/0w6AYrrMIUfO71oV')
    return message.channel.send('Sent! Check your DMs')
  }

  bot.generateInvite(['MANAGE_MESSAGES', 'EMBED_LINKS'])
    .then(link => {
      message.channel.send(`Invite me!\n${link}\nUse \`r?invite server\` for the help server!`);
    })
}
