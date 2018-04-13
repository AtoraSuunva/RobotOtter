//Counts words
module.exports.config = {
  name: 'count',
  invokers: ['count'],
  help: 'Counts words',
  expandedHelp: 'it just counts words',
  usage: ['Count words', 'count <some text to count here>']
}

module.exports.events = {}
module.exports.events.message = (bot, message) => {
  message.channel.send(message.content.trim().replace(/\s+/gi, ' ').split(' ').filter(w=>w!=='').length-1)
}
