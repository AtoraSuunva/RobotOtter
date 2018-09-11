//Core module to reload modules

module.exports.config = {
  name: 'load',
  invokers: ['load', 'loaf', 'unfuck', 'unload'],
  help: '(Re)loads/unloads a module',
  expandedHelp: '(Re)loads a module or all of them. Or unload one',
  usage: ['(Re)load', 'load <module>', 'Reload all', 'load all', 'Unload module', 'unload <module>'],
  invisible: true
}

module.exports.events = {}
module.exports.events.message = (bot, message) => {
  let config = bot.sleet.config
  if (message.author.id !== config.owner.id) return

  let loadModule = bot.sleet.loadModule
  let loadModules = bot.sleet.loadModules
  let unloadModule = bot.sleet.unloadModule

  let [cmd, module] = bot.sleet.shlex(message.content)

  if (cmd !== 'unload') {
    if (module !== 'all') {
      message.channel.sendMessage(loadModule(module))
    } else {
      message.channel.sendMessage(loadModules())
    }
  } else {
    message.channel.sendMessage(unloadModule(module))
  }
}
