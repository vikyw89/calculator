let toggleEraser = false


const operateA = (arg) => {
    // Break Case
    const input = arg
        .match(/(?<value>[+-]?\d*\.?\d*e[+-]?\d+)|(?<bigValue>[-+]?\d+\.?\d*)(?!e[+-]?\d+)|(?<infinity>[-+]?Infinity)/g)
    // Sum all of the value
    const result = input.reduce((result, item)=> {
        return result += +item
    },0)
    console.log('A',+result)
    return result
}

const operateMD = (arg) => {
    // Break Case, no more MD operator left
    if (arg.search(/[x÷]/) === -1){
        console.log('MD',arg)
        return arg 
    }

    // Solving 1 Multiplication or 1 Division operation recursively
    const result = arg
        .replace(/(?<value1>(?<valueL>[+-]?\d*\.?\d*e[+-]?\d+)|(?<bigValueL>[-+]?\d+\.?\d*)(?!e[+-]?\d+)|(?<infinityL>[-+]?Infinity))(?<operator>[÷x])(?<value2>(?<valueR>[+-]?\d*\.?\d*e[+-]?\d+)|(?<bigValueR>[-+]?\d+\.?\d*)(?!e[+-]?\d+)|(?<infinityR>[-+]?Infinity))/, (item)=> {
            const match = item.match(/(?<value1>(?<valueL>[+-]?\d*\.?\d*e[+-]?\d+)|(?<bigValueL>[-+]?\d+\.?\d*)(?!e[+-]?\d+)|(?<infinityL>[-+]?Infinity))(?<operator>[÷x])(?<value2>(?<valueR>[+-]?\d*\.?\d*e[+-]?\d+)|(?<bigValueR>[-+]?\d+\.?\d*)(?!e[+-]?\d+)|(?<infinityR>[-+]?Infinity))/)
            let temp = 0
            switch (true) {
                case match.groups.operator === 'x':
                    temp = (+match.groups.value1 * +match.groups.value2 )
                    return temp > 0 ? `+${temp}` : `-${temp}`
                case match.groups.operator === '÷':
                    temp = (+match.groups.value1 / +match.groups.value2 )
                    return temp > 0 ? `+${temp}` : `-${temp}`
            }
        })
    return operateMD(result)
}

const operateP = (arg)=> {
    // Break Case, no more pharentesis left
    if (arg.search(/[()]/) === -1) {
        console.log('P',arg)
        return arg
    }

    // Solving 1 parenthesis recursively
    const result = arg.replace(/\([^()]*\)/, (item)=> {
        const match = item.replace(/[()]/, '')
        return operateA(operateMD(match))
    })
    return operateP(result)
}


const operatePEMDA = (arg) => {
    // Autocomplete user formula, adding pharanthesis where needed
    let autoComplete = arg
    const leftPharentesis = autoComplete.match(/\(/g) ?? []
    const leftPharentesisCount = leftPharentesis.length
    const rightPharentesis = autoComplete.match(/\)/g) ?? []
    const rightPharentesisCount = rightPharentesis.length
    const difference = leftPharentesisCount - rightPharentesisCount
    switch (true){
        case difference !== 0:
            for (let i = 0; i < difference; i++) {
                autoComplete += ')'
            }
            break
    }
    
    // Autocomplete user formula, adding x and translating % where needed
    autoComplete = autoComplete.replace(/(?<closingParenthesis>(?<=[^-+x÷])\()|(?<openingParenthesis>\)(?=[^-+x÷\()]))|(?<percent>%)/g, (item)=> {
        switch (true){
            case item === '(':
                return 'x('
            case item === ')':
                return ')x'
            case item === '%':
                return 'x1÷100'
        }
    })

    // Solving equation, starting from Pharenthesis -> MD -> addition
    const result = +(operateA(operateMD(operateP(autoComplete))))
    console.log('PEMDA', result)
    return ((result < Number.MAX_VALUE) && (result > Number.MIN_VALUE))
        ? (result.toLocaleString("en-US", { useGrouping: false, maximumFractionDigits: 10 , maximumSignificantDigits: 10}).replace(/∞/g, Infinity))
        : 'ERROR'
}

const topScreen = (arg) => {
    const screen1 = document.querySelector('.screen1')
    screen1.textContent = arg
}

const toggle = (arg) => {
    const erase = document.querySelector('#erase')
    switch (true){
        case arg === '=':
            erase.textContent = 'AC'
            erase.dataset.key = 'AC'
            break
        default:
            erase.textContent = 'CE'
            erase.dataset.key = 'CE'
            break
    }
    toggleEraser = !toggleEraser
}

const historyClickHandler = (e) => {
    const result = e.target.textContent.match(/(?<equation>.*\=)\s(?<result>.*)/)
    topScreen(result.groups.equation)
    const screen2 = document.querySelector('.screen2')
    screen2.textContent = result.groups.result
}

const history = (arg) => {
    const parent = document.querySelector('.history-container')
    const newHistory = document.createElement('div')
    newHistory.addEventListener('click', historyClickHandler)
    newHistory.textContent = arg
    parent.insertAdjacentElement('afterbegin', newHistory)
}

const bottomScreen = (arg) => {
    const screen2 = document.querySelector('.screen2')
    screen2.textContent === '0' ? screen2.textContent = null : null
    const [lastEntry] = screen2.textContent.match(/.$/) ?? ''
    const [lastValue] = screen2.textContent.match(/[-+]?([\d]+\.?[\d]*|Infinity)+$/) ?? ''
    lastEntry === 'R' ? screen2.textContent = '0' : null
    if (toggleEraser) {
        toggle(arg)
        topScreen(`Ans = ${screen2.textContent}`)
    }
    
    switch (true) {
        // Pharenthesis
        case arg === '(':
            screen2.textContent += arg
            break
        case arg === ')':
            const leftPharentesis = screen2.textContent.match(/\(/g) ?? []
            const leftPharentesisCount = leftPharentesis.length
            const rightPharentesis = screen2.textContent.match(/\)/g) ?? []
            const rightPharentesisCount = rightPharentesis.length
            switch (true){
                case (leftPharentesisCount > rightPharentesisCount) && (/[\d%.]/).test(lastEntry):
                    screen2.textContent += arg
                    break
            }
            break
        // Multiplier
        case arg === 'x':
            switch (true){
                default:
                    screen2.textContent += arg
                    break
                case lastEntry === 'x'|| lastEntry === '-' || lastEntry === '(':
                    break
                case lastEntry === '÷':
                    screen2.textContent = screen2.textContent.match(/.*(?=.$)/)
                    screen2.textContent += arg
                    break
                case !lastEntry:
                    screen2.textContent += '0'
                    screen2.textContent += arg
                    break
            }
            break
        // Divider
        case arg === '÷':
            switch (true){
                default:
                    screen2.textContent += arg
                    break
                case lastEntry === '÷'|| lastEntry === '(' || lastEntry === '-':
                    break
                case lastEntry === 'x':
                    screen2.textContent = screen2.textContent.match(/.*(?=.$)/)
                    screen2.textContent += arg
                    break
                case !lastEntry:
                    screen2.textContent += `0${arg}`
                    break
            }
            break
        case arg === '%':
            switch (true) {
                case lastEntry === '÷' || lastEntry === 'x' || lastEntry === '(':
                    break
                case !lastEntry:
                    screen2.textContent += `0${arg}`
                    break
                default:
                    screen2.textContent += arg
                    break
            }
            break
        // Addition
        case arg === '-':
            switch (true) {
                default:
                    screen2.textContent += arg
                    break
                case lastEntry === '-':
                    break
                case lastEntry === '+':
                    screen2.textContent = `${screen2.textContent.match(/.*(?=.$)/)}${arg}`
                    break
            }
            break
        case arg === '+':
            switch (true) {
                default:
                    screen2.textContent += arg
                    break
                case lastEntry === '+':
                    break
                case lastEntry === '-':
                    screen2.textContent = `${screen2.textContent.match(/.*(?=.$)/)}${arg}`
                    break
            }
            break
        // dot
        case arg === '.':
            switch(true) {
                case lastEntry === '.' || lastEntry === '-'|| lastEntry === '+':
                    break
                case !lastEntry:
                    screen2.textContent = `0${arg}`
                    break
                case (/[.]/).test(lastValue):
                    break
                default:
                    screen2.textContent += arg 
                    break
            }
            break
        // CE
        case arg === 'CE':
            switch (true) {
                case lastEntry === 'y':
                    screen2.textContent = screen2.textContent.replace('Infinity','')
                    break
                default:
                    screen2.textContent = screen2.textContent.match(/.*(?=.$)/)
                    break
            }
            break
        // AC
        case arg === 'AC':
            screen2.textContent = '0'
            break
        // Equal
        case arg === '=':
            switch (true) {
                case (/[\d.)%]/).test(lastEntry):
                    const result = operatePEMDA(screen2.textContent)
                    history(`${screen2.textContent} = ${result}`)
                    topScreen(`${screen2.textContent} =`)
                    screen2.textContent = result
                    toggle(arg)
                    break
            }
            break
        // Numbers
        default:
            switch (true) {
                case lastEntry === '%':
                    break
                case lastValue === "0":
                    break
                default:
                    screen2.textContent += arg
                    break
            }
        !screen2.textContent ? screen2.textContent = 0 : null
    }
}

const screenHandler = (arg) => {
    bottomScreen(arg)
    addClass(arg)
}

const addClass = (arg) => {
    const button = document.querySelector(`button[data-key='${arg}']`)
    const screen = document.querySelector('.screen')
    screen.classList.add('pressed')
    button ? button.classList.add('pressed') : null
}

const removeClass = (arg) => {
    const button = document.querySelector(`button[data-key='${arg}']`)
    const screen = document.querySelector('#screen')
    screen.classList.remove('pressed')
    button ? button.classList.remove('pressed') : null
    
}

const mousedownHandler = (e) => {
    screenHandler(e.target.dataset.key)
}

const mouseupHandler = (e) => {
    removeClass(e.target.dataset.key)
}

const keydownHandler = (e) => {
    const arg = e.key
    switch (true){
        case arg === 'Backspace':
            screenHandler('CE')
            break
        case arg.search(/[0-9\-\=\+\%\.\(\)]/) === 0:
            screenHandler(arg)
            break
        case arg === 'Escape':
            screenHandler('AC')
            break
        case arg === '/':
            screenHandler('÷')
            break
        case arg === '*':
            screenHandler('x')
            break
        case arg === 'Enter':
            screenHandler('=')
            break
    }
}

const keyupHandler = (e) => {
    removeClass(e.key)
}

window.addEventListener('keydown', keydownHandler)
window.addEventListener('keyup', keyupHandler)

document.querySelectorAll('button').forEach(item => {
    item.addEventListener('mousedown', mousedownHandler)
    item.addEventListener('mouseup', mouseupHandler)
})
