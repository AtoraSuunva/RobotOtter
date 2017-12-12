module.exports.config = {
  name: 'lookup',
  invokers: ['lookup', 'whois'],
  help: 'Fetches info for a user by id, even if no servers are shared.',
  expandedHelp: 'Magic!',
  usage: ['Fetch info', 'lookup <id>']
}

const Discord = require('discord.js')
// TODO: make this customizable
const banServerID = '211956704798048256' //server id where to ban people to fetch info by id
let banServer

module.exports.events = {}
module.exports.events.message = async (bot, message) => {
  let [cmd, user] = bot.modules.shlex(message)

  banServer = banServer || bot.guilds.get(banServerID)

  if (banServer.members.has(user))
    return sendLookup(message.channel, banServer.members.get(user))

  banServer.ban(user, `User lookup requested by ${message.author.tag}`).then(u => {
    banServer.unban(user).then(userInfo => sendLookup(message.channel, userInfo))
  }).catch(e=>{})

}

function sendLookup(channel, user) {
  if ( !(user instanceof Discord.User) ) return channel.send('Did not find info for that user.')
  channel.send({embed: new Discord.RichEmbed()
    .setTitle(`**${Discord.Util.escapeMarkdown(user.username)}**#${user.discriminator} ${user.bot?'[BOT]':''}`)
    .setThumbnail(user.displayAvatarURL)
    .setDescription(`**ID:** ${user.id}`)
    .addField('\nAccount Age:', `${time.since(user.createdAt).format()}`)
    .setFooter(`Created at `)
    .setTimestamp(user.createdAt)
  })
}

const MS_SEC  = 1000,
      MS_MIN  = MS_SEC * 60,
      MS_HOUR = MS_MIN * 60,
      MS_DAY  = MS_HOUR * 24,
      MS_WEEK = MS_DAY * 7,
      MS_YEAR = MS_WEEK * 52

let time = {
  since(date) {
    return {
      get millis () { return Date.now() - date },
      get seconds() { return Math.floor(this.millis / MS_SEC )},
      get minutes() { return Math.floor(this.millis / MS_MIN )},
      get hours  () { return Math.floor(this.millis / MS_HOUR)},
      get days   () { return Math.floor(this.millis / MS_DAY )},
      get weeks  () { return Math.floor(this.millis / MS_WEEK)},
      get years  () { return Math.floor(this.millis / MS_YEAR)},

      format() { return (this.years  ? this.years      + ' years, ' : '') +
                        (this.weeks  ? this.weeks  %52 + ' weeks, ' : '') +
                        (this.days   ? this.days   %7  + ' days, ' : '') +
                        (this.hours  ? this.hours  %24 + ' hours, ' : '') +
                        (this.minutes? this.minutes%60 + ' minutes, ': '') +
                        (this.seconds? this.seconds%60 + ' seconds, ': '') +
                        (this.millis ? this.millis %1000 + ' millis' : '')
               }
    }
  }
}
