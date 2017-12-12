module.exports.config = {
  name: 'convert',
  invokers: ['convert', 'conv'],
  help: 'Converts stuff to other stuff',
  expandedHelp: 'Converts stuff to other stuff. You can put "to" between <fromUnits> an <toUnits> if you want.',
  usage: ['Convert from/to', 'conv <num> <fromUnit> <toUnit>', 'Convert from to best', 'conv <num> <unit>', 'Check what you can convert to', 'conv <unit>']
}

const Discord  = require('discord.js')
const convert = require('convert-units')

module.exports.events = {}
module.exports.events.message = (bot, message) => new Promise(send => {
	let args = bot.modules.shlex(message.content).slice(1)

	bot.modules.logger.log(args)

	/*
	> 20f to c
	['20f', 'to', 'c']

	> 20f c
	['20f', 'c']
	*/

	let val = parseFloat(args[0])
	let ini = args[0] ? args[0].replace(/\d|\.|-/g, '') : args[1]
	let end = (args[1] === 'to' || args[2] === 'to' || ini === args[1]) ? ((args[2] === 'to') ? args[3] : args[2]) : args[1]

	let rep = new Map([
    ['years', 'year'], ['months', 'month'], ['weeks', 'week'], ['days', 'd'], ['day', 'd'], ['mins', 'min'],
    ['c', 'C'], ['f', 'F'], ['k', 'K'], ['Freedom units', 'F'], ['Ft', 'ft']
  ])

  for (let [key, val] of rep) {
    if (ini !== undefined)
      ini = ini.replace(new RegExp(`^${key}$`), val)
    if (end !== undefined)
      end = end.replace(new RegExp(`^${key}$`), val)
  }

  val = val.toString() || ''
  ini = ini || ''
  end = end || ''

  val = val.trim()
  ini = ini.trim()
  end = end.trim()

	let description = '¯\\\\_(  )ツ_/¯ '
	let title = `[${[val, ini, end].join(', ')}]`

	try {
		if (Number.isNaN(val) && ini !== undefined) {
			title = `${ini} can be converted to:`
			description = convert().from(ini).possibilities().join(', ')
		} else if (end === undefined) {
			title = convert(val).from(ini).toBest()
			title = `${title.val}${title.unit}`
			description = ''
		} else {
			title = convert(val).from(ini).to(end) + ((['f', 'c'].includes(end.toLowerCase())) ? '°' : '') + end
			description = ''
		}
	} catch(e) {
		description = e
	}

	let embed = new Discord.RichEmbed()
		.setAuthor(title)
		.setDescription(description)

	if (description instanceof Error) embed.setColor('#b71c1c')

	message.channel.send({embed})
})
