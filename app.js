let memory = 0
let toggleEraser = false


const operateA = (arg) => {
    const input = arg.match(/([\-\+]?)\d+\.?\d*/g)
    if (!input) return Infinity

    const result = input.reduce((result, item)=> {
        return result += Number(item)
    },0)
    console.table('operateA', arg, result)
    return result
}

const operateMD = (arg) => {
    if (arg.search(/[x÷]/) === -1){
        return arg
    }
    const result = arg
        .replace(/((\-|\+?)\d+\.?\d*)(÷|x)((\-|\+?)\d+\.?\d*)/, ()=> {
            const match = arg.match(/((\-|\+?)\d+\.?\d*)(÷|x)((\-|\+?)\d+\.?\d*)/)
            if (match[3] === 'x') {
                const result = Number(match[1]) * Number(match[4])
                return result
            } else if (match[3] === '÷') {
                const result = Number(match[1]) / Number(match[4])
                return result
            }
        })
    return operateMD(result)
}

const operateP = (arg)=> {
    if (arg.search(/[\)\()]/) === -1) {
        return arg
    }
    const result = arg.replace(/\([^\(\)]*\)/g, (item)=> {
        const match = item.replace(/[\(\)]/, '')
        return operateA(operateMD(match))
    })
    console.table('operateP', arg, result)
    return operateP(result)
}

const operatePEMDA = (arg) => {
    if (arg.search(/Infinity/) === 0 ) return 'Infinity'

    let autoCompleteP = arg.replace(/(?<=\d)(\()|(\))(?=\d)|(\%)/g, (item)=> {
        switch (true){
            case item === '(':
                return 'x('
            case item === ')':
                return ')x'
            case item === '%':
                return 'x1÷100'
        }
    })

    const leftPharentesis = autoCompleteP.match(/\(/g) ?? []
    const leftPharentesisCount = leftPharentesis.length
    const rightPharentesis = autoCompleteP.match(/\)/g) ?? []
    const rightPharentesisCount = rightPharentesis.length
    const difference = leftPharentesisCount - rightPharentesisCount
    switch (true){
        case difference !== 0:
            for (let i = 0; i < difference; i++) {
                autoCompleteP += ')'
            }
            break
    }
    
    const result = operateA(operateMD(operateP(autoCompleteP)))
    console.table('operatePEMDA', autoCompleteP, result)
    return result
}

const screen1 = (arg) => {
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
    console.log(e.target.textContent)
    const result = e.target.textContent.match(/(.*\=)\s(.*)/)
    console.log(result)
    screen1(result[1])
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


const screen2 = (arg) => {
    const screen2 = document.querySelector('.screen2')
    screen2.textContent === '0' ? screen2.textContent = '' : null
    if (toggleEraser === true) {
        toggle(arg)
        screen1(`Ans = ${screen2.textContent}`)
    }
    
    const [lastEntry] = screen2.textContent.match(/.$/) ?? ''
    console.log(lastEntry)
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
            console.log('x')
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
            const lastValue = screen2.textContent.search(/(?<=[+\-x÷]|\b)\d*\.\d*$/)
            switch(true) {
                case lastValue === -1:
                    screen2.textContent += arg
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
            screen1(`${screen2.textContent} =`)
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
    screen2(arg)
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
