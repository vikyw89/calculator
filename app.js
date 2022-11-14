let memory = 0

const add = (a, b) => {
    return a + b
}

console.log(add(1,2,3,4,5))

const substract = (a, b) => {
    return a - b
}

const multiply = (a, b) => {
    return a * b
}

const divide = (a, b) => {
    return a / b
}

console.log(add(2,2), substract(1,2), multiply(2,2), divide(2,2))

const operate = (a, b, c) => {
    return b(a,c)
}

const screen2Handler = (arg) => {
    console.log(arg)
    const numbers = ['1','2','3','4','5','6','7','8','9','0','.']
    const result = ['=']
    const screen1 = document.querySelector('.screen-row1')
    const screen2 = document.querySelector('.screen-row2')
    const button = document.querySelector(`button[data-key='${arg}']`)
    if (screen2.textContent.length >= 12) {
        return
    }

    button ? button.classList.add('pressed') : null
    if (numbers.includes(arg)) {
        screen2.textContent += arg
    }
}

const mousedownHandler = (e) => {
    screen2Handler(e.target.dataset.key)
}

const mouseupHandler = (e) => {
    removeClass(e.target.dataset.key)
}

const keydownHandler = (e) => {
    screen2Handler(e.key)
}

const keyupHandler = (e) => {
    removeClass(e.key)
}

const removeClass = (arg) => {
    const button = document.querySelector(`button[data-key='${arg}']`)
    button ? button.classList.remove('pressed') : null
}

window.addEventListener('keydown', keydownHandler)
window.addEventListener('keyup', keyupHandler)

document.querySelectorAll('button').forEach(item => {
    item.addEventListener('mousedown', mousedownHandler)
    item.addEventListener('mouseup', mouseupHandler)
})

console.log(operate(5,multiply,5))
