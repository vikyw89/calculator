const operateA = (arg) => {
  // Break Case
  const input = arg
      .match(/(?<value>[+-]?\d*\.?\d*e[+-]?\d+)|(?<bigValue>[-+]?\d+\.?\d*)(?!e[+-]?\d+)|(?<infinity>[-+]?Infinity)/g);
  // Sum all of the value
  const result = input.reduce((result, item)=> {
    return result += +item;
  }, 0);
  return result;
};

const operateMD = (arg) => {
  // Break Case, no more MD operator left
  if (!arg.match(/[x÷]/)) {
    return arg;
  }

  // Solving 1 Multiplication or 1 Division operation recursively
  const result = arg
      .replace(/(?<value1>(?<valueL>[+-]?\d*\.?\d*e[+-]?\d+)|(?<bigValueL>[-+]?\d+\.?\d*)(?!e[+-]?\d+)|(?<infinityL>[-+]?Infinity))(?<operator>[÷x])(?<value2>(?<valueR>[+-]?\d*\.?\d*e[+-]?\d+)|(?<bigValueR>[-+]?\d+\.?\d*)(?!e[+-]?\d+)|(?<infinityR>[-+]?Infinity))/, (item)=> {
        const match = item
            .match(/(?<value1>(?<valueL>[+-]?\d*\.?\d*e[+-]?\d+)|(?<bigValueL>[-+]?\d+\.?\d*)(?!e[+-]?\d+)|(?<infinityL>[-+]?Infinity))(?<operator>[÷x])(?<value2>(?<valueR>[+-]?\d*\.?\d*e[+-]?\d+)|(?<bigValueR>[-+]?\d+\.?\d*)(?!e[+-]?\d+)|(?<infinityR>[-+]?Infinity))/);
        let temp = 0;
        switch (true) {
          case match.groups.operator === 'x':
            temp = (+match.groups.value1 * +match.groups.value2 );
            return temp > 0 ? `+${temp}` : `-${temp}`;
          case match.groups.operator === '÷':
            temp = (+match.groups.value1 / +match.groups.value2 );
            return temp > 0 ? `+${temp}` : `-${temp}`;
        }
      });
  return operateMD(result);
};

const operateP = (arg)=> {
  // Break Case, no more pharentesis left
  if (!arg.match(/[()]/)) {
    return arg;
  }
  console.log('raw equation =>', arg)
  // Solving 1 parenthesis recursively
  const result = arg.replace(/\([^()]*\)/, (item)=> {
    const match = item.replace(/[()]/g, '');
    const result = operateA(operateMD(match))
    console.log('solving this first =>',item,'=',result)
    return result
  });
  console.log('solved equation =>', result)
  return operateP(result);
};


const operatePEMDA = (arg) => {
  console.clear()
  console.log('starting calculation...')
  // Autocomplete user formula, adding pharanthesis where needed
  let autoComplete = arg;
  const leftPharentesis = autoComplete.match(/\(/g) ?? [];
  const leftPharentesisCount = leftPharentesis.length;
  const rightPharentesis = autoComplete.match(/\)/g) ?? [];
  const rightPharentesisCount = rightPharentesis.length;
  const difference = leftPharentesisCount - rightPharentesisCount;
  switch (true) {
    case difference > 0:
      for (let i = 0; i < difference; i++) {
        autoComplete += ')';
      }
      break;
    case difference < 0:
      for (let i = 0; i < difference*-1; i++) {
        autoComplete = '('+autoComplete
      }
      break
  }
  for (let i = 0; i < leftPharentesisCount; i++) {
    autoComplete = '('+autoComplete+')'
  }

  // Autocomplete user formula, adding x and translating % where needed
  autoComplete = autoComplete
      .replace(/(?<openingParenthesis>(?<=[^-+x÷(])\()|(?<closingParenthesis>\)(?=[^-+x÷\()%]))|(?<percent>%)/g, (item)=> {
        switch (true) {
          case item === '(':
            return 'x(';
          case item === ')':
            return ')x';
          case item === '%':
            return '÷100';
        }
      });

  // Solving equation, starting from Pharenthesis -> MD -> addition
  const result = +(operateA(operateMD(operateP(autoComplete))));
  console.log('final result =>', result);
  switch (true) {
    case result < Number.MIN_SAFE_INTEGER:
      return 'Error';
    case result > Number.MAX_SAFE_INTEGER:
      return 'Infinity';
    default:
      // return result
      return result
          .toLocaleString('fullwide', {useGrouping: false, maximumFractionDigits: 10})
          .replace(/∞/g, Infinity);
  }
};

const topScreen = (arg) => {
  const screen1 = document.querySelector('.screen1');
  screen1.textContent = arg;
};

const toggle = (arg) => {
  const erase = document.querySelector('#erase');
  switch (true) {
    case arg === '=':
      erase.textContent = 'AC';
      erase.dataset.key = 'AC';
      break;
    default:
      erase.textContent = 'CE';
      erase.dataset.key = 'CE';
      break;
  }
};

const historyClickHandler = (e) => {
  const result = e.target.textContent.match(/(?<equation>.*\=)\s(?<result>.*)/);
  topScreen(result.groups.equation);
  const screen2 = document.querySelector('.screen2');
  screen2.textContent = result.groups.result;
};

const history = (arg) => {
  const parent = document.querySelector('.history-container');
  const newHistory = document.createElement('div');
  newHistory.addEventListener('click', historyClickHandler);
  newHistory.textContent = arg;
  parent.insertAdjacentElement('afterbegin', newHistory);
};

const bottomScreen = (arg) => {
  const screen2 = document.querySelector('.screen2');
  screen2.textContent === '0' ? screen2.textContent = null : null;

  const [lastEntry] = screen2.textContent
      .match(/.$/) ?? '';
  const [lastValue] = screen2.textContent
      .match(/[-+]?([\d]+\.?[\d]*|Infinity)+$/) ?? '';
  lastEntry === 'R' || lastEntry === 'y' ? screen2.textContent = '0' : null;

  if (document.querySelector('#erase').textContent === 'AC') {
    toggle(arg);
    topScreen(`Ans = ${screen2.textContent}`);
  }

  switch (true) {
    // Pharenthesis
    case arg === '(':
      screen2.textContent += arg;
      break;
    case arg === ')':
      switch (true) {
        case lastEntry.match(/[\d%.)]/) != undefined:
          screen2.textContent += arg;
          break;
      }
      break;
      // Multiplier
    case arg === 'x':
      switch (true) {
        default:
          screen2.textContent += arg;
          break;
        case lastEntry === 'x'|| lastEntry === '-' || lastEntry === '(':
          break;
        case lastEntry === '÷':
          screen2.textContent = screen2.textContent.match(/.*(?=.$)/);
          screen2.textContent += arg;
          break;
        case !lastEntry:
          screen2.textContent += '0';
          screen2.textContent += arg;
          break;
      }
      break;
      // Divider
    case arg === '÷':
      switch (true) {
        default:
          screen2.textContent += arg;
          break;
        case lastEntry === '÷'|| lastEntry === '(' || lastEntry === '-':
          break;
        case lastEntry === 'x':
          screen2.textContent = screen2.textContent.match(/.*(?=.$)/);
          screen2.textContent += arg;
          break;
        case !lastEntry:
          screen2.textContent += `0${arg}`;
          break;
      }
      break;
    case arg === '%':
      switch (true) {
        case !lastEntry:
          screen2.textContent += `0${arg}`;
          break;
        case lastEntry.match(/[\d).]/) != undefined:
          screen2.textContent += arg;
          break;
      }
      break;
      // Addition
    case arg === '-':
      switch (true) {
        default:
          screen2.textContent += arg;
          break;
        case lastEntry === '-':
          break;
        case lastEntry === '+':
          screen2.textContent = `${screen2.textContent
              .match(/.*(?=.$)/)}${arg}`;
          break;
      }
      break;
    case arg === '+':
      switch (true) {
        default:
          screen2.textContent += arg;
          break;
        case lastEntry === '+':
          break;
        case lastEntry === '-':
          screen2.textContent = `${screen2.textContent
              .match(/.*(?=.$)/)}${arg}`;
          break;
      }
      break;
      // dot
    case arg === '.':
      switch (true) {
        case lastEntry === '.' || lastEntry === '-'|| lastEntry === '+':
          break;
        case !lastEntry:
          screen2.textContent = `0${arg}`;
          break;
        case lastValue.match(/[.]/) != undefined:
          break;
        case lastValue.match(/[\d)]/) != undefined:
          screen2.textContent += arg;
          break;
      }
      break;
      // CE
    case arg === 'CE':
      switch (true) {
        case lastEntry === 'y':
          screen2.textContent = screen2.textContent.replace('Infinity', '');
          break;
        default:
          screen2.textContent = screen2.textContent.match(/.*(?=.$)/);
          break;
      }
      break;
      // AC
    case arg === 'AC':
      screen2.textContent = '0';
      break;
      // Equal
    case arg === '=':
      switch (true) {
        case (/[\d.)%]/).test(lastEntry):
          const result = operatePEMDA(screen2.textContent);
          history(`${screen2.textContent} = ${result}`);
          topScreen(`${screen2.textContent} =`);
          screen2.textContent = result;
          toggle(arg);
          break;
      }
      break;
      // Numbers
    default:
      switch (true) {
        case lastEntry === '%':
          break;
        case lastValue === '+0'|| lastValue === '-0' || lastValue === '0':
          break;
        default:
          screen2.textContent += arg;
          break;
      }
      break;
  }
  !screen2.textContent ? screen2.textContent = 0 : null;
};

const screenHandler = (arg) => {
  bottomScreen(arg);
  addClass(arg);
};

const addClass = (arg) => {
  const button = document.querySelector(`button[data-key='${arg}']`);
  const screen = document.querySelector('.screen');
  screen.classList.add('pressed');
    button ? button.classList.add('pressed') : null;
};

const removeClass = (arg) => {
  const button = document.querySelector(`button[data-key='${arg}']`);
  const screen = document.querySelector('#screen');
  screen.classList.remove('pressed');
    button ? button.classList.remove('pressed') : null;
};

const mousedownHandler = (e) => {
  screenHandler(e.target.dataset.key);
};

const mouseupHandler = (e) => {
  removeClass(e.target.dataset.key);
};

const keyboardTranslate = (arg)=> {
  switch (true) {
    case arg === 'Backspace':
      return 'CE';
    case arg.search(/[0-9\-\=\+\%\.\(\)x]/) === 0:
      return arg;
    case arg === 'Escape':
      return 'AC';
    case arg === '/':
      return '÷';
    case arg === '*':
      return 'x';
    case arg === 'Enter':
      return '=';
    default:
      return '';
  }
};

const keydownHandler = (e) => {
  screenHandler(keyboardTranslate(e.key));
};

const keyupHandler = (e) => {
  removeClass(keyboardTranslate(e.key));
};

document.querySelector('body').addEventListener('keydown', keydownHandler);
document.querySelector('body').addEventListener('keyup', keyupHandler);

document.querySelectorAll('button').forEach((item) => {
  item.addEventListener('pointerdown', mousedownHandler);
  item.addEventListener('pointerout', mouseupHandler);
});
