let memory = 0
let toggleEraser = false

const operateA = (arg) => {
    // Break Case, stop if there's infinity
    if (arg.search(/Infinity/) === 0 ) return 'Infinity'
    const input = arg.match(/(?<value>[-+]?\d+\.?\d*)/g)
    if (!input) return Infinity

    // Sum all of the value
    const result = input.reduce((result, item)=> {
        return result += Number(item)
    },0)
    return result.toLocaleString().replace(/\,/g,'')
}

const operateMD = (arg) => {
    // Break Case, stop if there's infinity or no more MD operator left
    if (arg.search(/Infinity/) === 0 ) return 'Infinity'
    if (arg.search(/[x÷]/) === -1){
        return arg
    }

    // Solving 1 Multiplication or 1 Division operation recursively
    const result = arg
        .replace(/(?<value1>[-+]?\d+\.?\d*)(?<operator>[÷x])(?<value2>[-+]?\d+\.?\d*)/, (item)=> {
            const match = item.match(/(?<value1>[-+]?\d+\.?\d*)(?<operator>[÷x])(?<value2>[-+]?\d+\.?\d*)/)
            if (match.groups.operator === 'x') {
                const result = Number(match.groups.value1) * Number(match.groups.value2)
                return result.toLocaleString().replace(/\,/g,'')
            } else if (match.groups.operator === '÷') {
                const result = Number(match.groups.value1) / Number(match.groups.value2)
                return result.toLocaleString().replace(/\,/g,'')
            }
        })
    return operateMD(result).toLocaleString().replace(/\,/g,'')
}

const operateP = (arg)=> {
    // Break Case, stop if there's infinity or no more pharentesis left
    if (arg.search(/Infinity/) === 0 ) return 'Infinity'
    if (arg.search(/[()]/) === -1) {
        return arg
    }

    // Solving 1 parenthesis recursively
    const result = arg.replace(/\([^()]*\)/, (item)=> {
        const match = item.replace(/[()]/, '')
        return operateA(operateMD(match)).toLocaleString().replace(/\,/g,'')
    })
    return operateP(result).toLocaleString().replace(/\,/g,'')
}

const operatePEMDA = (arg) => {
    // Break Case, stop if there's infinity
    if (arg.search(/Infinity/) === 0 ) return 'Infinity'

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
    autoComplete = autoComplete.replace(/((?<=[^-+x÷])\()|(\)(?=[^-+x÷\()])|(%))/g, (item)=> {
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
    const result = operateA(operateMD(operateP(autoComplete)))
    return result
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
    const result = e.target.textContent.match(/(.*\=)\s(.*)/)
    topScreen(result[1])
    const screen2 = document.querySelector('.screen2')
    screen2.textContent = result[2]
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
    screen2.textContent === '0' ? screen2.textContent = '' : null
    if (toggleEraser === true) {
        toggle(arg)
        topScreen(`Ans = ${screen2.textContent}`)
    }
    const [lastEntry] = screen2.textContent.match(/.$/) ?? ''
    switch (true) {
        // Pharenthesis
        case arg === '(':
            screen2.textContent += arg
            break
        case arg === ')':
            const leftPharentesisCount = screen2.textContent.match(/\(/g).length
            const rightPharentesis = screen2.textContent.match(/\)/g) ?? []
            const rightPharentesisCount = rightPharentesis.length
            switch (true){
                case leftPharentesisCount > rightPharentesisCount:
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
                case lastEntry === 'x':
                    break
                case lastEntry === '÷':
                    screen2.textContent = screen2.textContent.match(/.*(?=.$)/)
                    screen2.textContent += arg
                    break
                case lastEntry === '(':
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
                case lastEntry === '÷'|| lastEntry === '(':
                    break
                case lastEntry === 'x':
                    screen2.textContent = screen2.textContent.match(/.*(?=.$)/)
                    screen2.textContent += arg
                    break
                case lastEntry === '(':
                    break
                case !lastEntry:
                    screen2.textContent += '0'
                    screen2.textContent += arg
                    break
            }
            break
        case arg === '%':
            switch (true) {
                default:
                    screen2.textContent += arg
                    break
                case lastEntry === '÷' || lastEntry === 'x' || lastEntry === '(' || lastEntry === '%':
                    break
                case !lastEntry:
                    screen2.textContent += 0
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
                    screen2.textContent = screen2.textContent.match(/.*(?=.$)/)
                    screen2.textContent += arg
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
                    screen2.textContent = screen2.textContent.match(/.*(?=.$)/)
                    screen2.textContent += arg
                    break
            }
            break
        // dot
        case arg === '.':
            switch(true) {
                case lastEntry === '.':
                    break
                case !lastEntry:
                    screen2.textContent = '0.'
                    break
                default:
                    const lastValue = screen2.textContent.search(/\d+\.\d*$/)
                    switch (true) {
                        case lastValue === -1:
                            screen2.textContent += arg 
                    }
                    break
            }
            break
        // CE
        case arg === 'CE':
            switch (true) {
                case lastEntry === 'y':
                    screen2.textContent = '0'
                    break
                default:
                    screen2.textContent = screen2.textContent.match(/.*(?=.$)/)
                    !screen2.textContent ? screen2.textContent = 0 : null
                    break
            }
            break
        // AC
        case arg === 'AC':
            screen2.textContent = '0'
            break
        // Equal
        case arg === '=':
            const result = operatePEMDA(screen2.textContent)
            history(`${screen2.textContent} = ${result}`)
            topScreen(`${screen2.textContent} =`)
            screen2.textContent = result
            toggle(arg)
            break
        // Numbers
        default:
            switch (true) {
                case lastEntry === '%'|| lastEntry === 'y':
                    break
                default:
                    screen2.textContent += arg
                    break
            }
    }
}

const screenHandler = (arg) => {
    bottomScreen(arg)
    addClass(arg)
}

const addClass = (arg) => {
    const button = document.querySelector(`button[data-key='${arg}']`)
    const screen = document.querySelector('#screen')
    screen.classList.add('pressed')
    button ? button.classList.add('pressed') : null
}

const removeClass = (arg) => {
    const button = document.querySelector(`button[data-key='${arg}']`)
    const screen = document.querySelector('#screen')
    screen.classList.add('pressed')
    button ? button.classList.remove('pressed') : null
    screen ? screen.classList.remove('pressed') : null
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
