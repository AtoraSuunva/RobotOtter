// flips coins
module.exports.config = {
  name: 'flip',
  invokers: ['flip', 'coin'],
  help: 'Flips some coins',
  expandedHelp: 'Flips a certain number of coins. That\'s all there is to it.',
  usage: ['Flip a coin', 'flip', 'Flip 3 coins', 'flip 3']
}

const maxCoins = 50
const head = '(H)'
const tail = '(T)'

module.exports.events = {}
module.exports.events.message = (bot, message) => {
  let [cmd, coins] = bot.modules.shlex(message)
  coins = coins !== undefined ? parseInt(coins) : 1
  const prefix = (message.member ? message.member.displayName : message.author.username) + ', '

  if (coins === 1)
    return message.channel.send(prefix + (randInt(0,1) ? head : tail))

  //yay arg checking
  if (Number.isNaN(coins))
    return message.channel.send(prefix + `I need numbers to work with.`)
  if (coins < 0)
    return message.channel.send(prefix + `If I had negative coins I'd be in debt.`)
  if (coins === 0)
    return message.channel.send(prefix + `Here's the result! (nothing what did you expect)`)
  if (coins > maxCoins)
    return message.channel.send(prefix + `I've only got ${maxCoins} coins. I'm on a tight budget.`)

  const finalFlips = flipCoins(coins)
  const occurences = JSON.stringify(countOccurences(finalFlips)).replace(/"/g, '').replace(/([:,])/g, '$1 ')
  const msg = finalFlips.join(', ') +
              `\nHere's the count: ${occurences}`

  if (msg.length < 2000)
    message.channel.send(prefix + '\n' + msg)
  else
    message.channel.send(prefix + 'The result was too long for me to send. Try something smaller.')
}

function flipCoins(coins) {
  return new Array(coins).fill(0).map(v => randInt(0, 1) ? head : tail)
}

//thanks mdn
function randInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function countOccurences(arr) {
  const o = {}
  for (let i of arr)
    o[i] = o[i] ? o[i] + 1 : 1
  return o
}
