let memory = 0

const operateA = (arg) => {
    const result = arg
        .match(/(\-?|\+?)\d+\.?\d*/g)
        .reduce((result, item)=> {
        return result += Number(item)
    },0)
    return result
}

const operateMD = (arg) => {
    const MD = arg
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
    if(arg === MD) {
        return MD
    } else {
        return operateMD(MD)
    }
}

const operateP = (arg)=> {
    const result = arg.replace(/\(([^\(]+)\)/, (item)=> {
        const match = arg.match(/\(([^\(]+)\)/)
        console.log(match)
        return operateA(operateMD(match[1]))
    })
    return result
}

const operatePEMDA = (arg) => {
    const autoComplete = arg.replace(/(?<=\d)(\()|(\))(?=\d)|(\%)/g, (item)=> {
        if (item === '(') {
            return 'x('
        } else if (item === ')') {
            return ')x'
        } else if (item === '%') {
            return '÷100'
        }
    })
    return operateA(operateMD(operateP(autoComplete)))
}

console.log('operatePEMDA', operatePEMDA('25x4(-1x100%)'))

const screen1 = (arg) => {
    const screen1 = document.querySelector('.screen1')
    let display = screen1.textContent
    display = `Ans = ${display ? 0 : result}`
}

const screen2 = (arg) => {
    const screen2 = document.querySelector('.screen2')
    let display = screen2.textContent
    display += arg
}

const screenHandler = (arg) => {
    console.log(arg)
    const valid = []
    const value = ['1','2','3','4','5','6','7','8','9','0','.','-','+']
    const result = ['=']
    const operator = ['^',]
    
    
    const button = document.querySelector(`button[data-key='${arg}']`)
    button.classList.add('pressed' )
    console.log(screen2.textContent)
}

const removeClass = (arg) => {
    const button = document.querySelector(`button[data-key='${arg}']`)
    button ? button.classList.remove('pressed') : null
}

const mousedownHandler = (e) => {
    screenHandler(e.target.dataset.key)
}

const mouseupHandler = (e) => {
    removeClass(e.target.dataset.key)
}

const keydownHandler = (e) => {
    screenHandler(e.key)
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
