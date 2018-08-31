const Telegraf = require('telegraf')
const { token, ids, who, whom } = require('./config')
const api = require('./api')

const bot = new Telegraf(token)

bot.context.parseMessage = {
    getData: context => {
        const text = context.message.text
        const words = text
            .replace(/[.,?\/#!$%^&*;:{}=\-_`~()]/g, '')
            .replace(/\s{2,}/g, ' ')
            .trim()
            .toLowerCase()
            .split(' ')
        const isPresent = name => words.includes(name.toLowerCase())
        let fromIndex = who.findIndex(isPresent)
        let toIndex = whom.findIndex(isPresent)
        const amount = text.match(/-\d+|\d+/) && Number(text.match(/-\d+|\d+/)[0])
        if (fromIndex === -1 && words.includes('я')) {
            fromIndex = ids.indexOf(context.from.id)
        }
        if (toIndex === -1 && words.includes('мне')) {
            toIndex = ids.indexOf(context.from.id)
        }
        return { fromIndex, toIndex, amount }
    }
}

bot.hears(/сколько|скок/i, context => {
    const { fromIndex, toIndex } = context.parseMessage.getData(context)

    const trolling = fromIndex === toIndex
    const noFrom = fromIndex === -1
    const noTo = toIndex === -1

    if (trolling) {
        context.reply('NaN')
        setTimeout(() => context.reply('Шутник, блядь.'), 5000)

        return
    }

    if (noFrom || noTo) {
        context.reply(`Не поняла. 🤯`)
        noFrom && context.reply(`Кто?`)
        noTo && context.reply(`Кому?`)

        return
    }


    const amount = api.getValue(fromIndex, toIndex)
    const mirrorAmount = api.getValue(toIndex, fromIndex)

    if (amount === 0 && mirrorAmount === 0) {
        return context.reply(`${who[fromIndex]} и ${who[toIndex]} ничего друг другу не должны. 🤝`)
    }

    return context.reply(`${amount > 0 ? who[fromIndex] : who[toIndex]} торчит ${amount > 0 ? whom[toIndex] : whom[fromIndex]} ${amount > 0 ? amount : mirrorAmount}₽.`)
})

bot.hears(/должен|должна|вернул|вернула|отдал|отдала/i, context => {
    const matchedWord = context.match[0].toLowerCase()
    const debt = /должен|должна/.test(matchedWord)
    let { fromIndex, toIndex, amount } = context.parseMessage.getData(context)
    const trolling = fromIndex === toIndex
    const noFrom = fromIndex === -1
    const noTo = toIndex === -1
    const noAmount = !amount

    if (trolling) {
        context.reply('Ебобо?')

        return
    }

    if (noFrom || noTo || noAmount) {
        context.reply(`Не поняла. 🤯`)
        noFrom && context.reply(`Кто ${matchedWord}?`)
        noTo && context.reply(`Кому ${matchedWord}?`)
        noAmount && context.reply(`Сколько?`)

        return
    }

    // если кто-то занял, то плюсуем долг
    // если кто-то вернул, то вычитаем
    amount = debt ? amount : -amount
    api.setValue(fromIndex, toIndex, amount)

    context.reply(`Записала.`)
    const debtFrom = api.getValue(fromIndex, toIndex)
    const debtTo = api.getValue(toIndex, fromIndex)
    if (debtFrom === 0 && debtTo === 0) {
        return context.reply(`Долг возвращён, ${who[fromIndex]} и ${who[toIndex]} ничего друг другу не должны. 🤝`)
    }

    return context.reply(`Теперь ${debtFrom > 0 ? who[fromIndex] : who[toIndex]} торчит ${debtFrom > 0 ? whom[toIndex] : whom[fromIndex]} ${debtFrom > 0 ? debtFrom : debtTo}₽.`)
})

bot.hears(/алис/i, context => context.reply('🖕🏾'))

bot.startPolling()
