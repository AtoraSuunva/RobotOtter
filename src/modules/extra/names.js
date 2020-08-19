module.exports.config = {
  name: 'names',
  invokers: ['names', 'n', 'namesStart', 'ns'],
  help: 'Counts users with a username/nickname',
  expandedHelp: 'n <word>\nns <word>',
  usage: ['Get users with <word>', 'names <word>', 'Get users starting with <word>', 'namesStart <word>'],
  invisible: true
}

module.exports.events = {}
module.exports.events.message = (bot, message) => new Promise(send => {
  if (message.guild === null) return message.channel.send('You\'re in DMs')

  let args  = bot.sleet.shlex(message.content)
  let count = 0

  if (['names', 'n'].includes(args[0]))
    names(bot, message)
  else
    namesStart(bot, message)
})

// I should rewrite this to reduce code duplication
function names(bot, message) {
  let count = 0
  let word = (bot.sleet.shlex(message.content)[1] || '').toLowerCase()

  message.guild.fetchMembers().then((g) => {
    g.members.array().forEach((m) => {
      if (m.nickname === undefined || m.nickname === null) m.nickname = ''
      if (m.user.username.toLowerCase().includes(word) || m.nickname.toLowerCase().includes(word)) {
        count++
        bot.sleet.logger.info(`${m.user.username}#${m.user.discriminator}\t${(m.nickname !== '' ? '(' + m.nickname + ')' : '')}\t<@${m.user.id}>`)
      }
    })
  message.channel.send(`${count} user${count === 1 ? '' : 's'}!`)
})
}

function namesStart(bot, message) {
	let count = 0
  let word = (bot.sleet.shlex(message.content)[1] || '').toLowerCase()

	message.guild.fetchMembers().then((g) => {
		g.members.array().forEach((m) => {
			if (m.nickname === undefined || m.nickname === null) {m.nickname = ''}
			if (m.user.username.toLowerCase().startsWith(word) || m.nickname.toLowerCase().startsWith(word)) {
				count++
				bot.sleet.logger.info(`${m.user.username}#${m.user.discriminator} ${(m.nickname !== '' ? '(' + m.nickname + ')' : '')} [${m.user.id}]`)
			}
		})
		message.channel.send(`${count} user${count === 1 ? '' : 's'}!`)
	})
}
