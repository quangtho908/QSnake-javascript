export default function training(snake) {
  const currentState = getState(snake);

  if(!snake.table[currentState]) {
    snake.table[currentState] = [0, 0, 0, 0]
  }

  const action = getAction(snake, currentState)

  const {reward, newState} = getNext(snake, action)

  if(!snake.table[newState]) {
    snake.table[newState] = [0, 0, 0, 0]
  }

  const nextMax = snake.table[newState][chooseMax(snake.table[newState], Math.max(...snake.table[newState]))]

  snake.table[currentState][action] = snake.table[currentState][action] + snake.learning_rate *
  (reward + snake.discount_rate * nextMax - snake.table[currentState][action]);

}

function getNext(snake, action) {
  const actions = [37, 38, 39, 40 ]
  let reward = 0;
  if (snake.canTurn) {
    switch (actions[action]) {
      case 37:// left
        if (snake.direction === "right") break;
        snake.direction = "left";
        break;
      case 38:// up
        if (snake.direction === "down") break;
        snake.direction = "up";
        break;
      case 39:// right
        if (snake.direction === "left") break
        snake.direction = "right";
        break;
      case 40:// down
        if (snake.direction === "up") break;
        snake.direction = "down";
        break;
      default:
        console.log("wrong key");
    }

    snake.canTurn = 0;
  }

  const cSnake = {...snake}
  reward = nextCheck(cSnake)
  return {
    newState: getState(cSnake),
    reward
  }
}

function nextCheck(cSnake) {
  cSnake.position = JSON.parse(JSON.stringify(cSnake.position))
  const head = cSnake.position.length - 1;
  const tail = cSnake.position[0]
  const col = cSnake.position[head][0]
  const row = cSnake.position[head][1]
  switch(cSnake.direction) {
    case "left":
      cSnake.position.shift()
      cSnake.position.push([col - 1, row]);
      break;
    case "up":
      cSnake.position.shift()
      cSnake.position.push([col, row - 1]);
      break;
    case "right":
      cSnake.position.shift()
      cSnake.position.push([col + 1, row]);
      break;
    case "down":
      cSnake.position.shift()
      cSnake.position.push([col, row + 1]);
      break;
  }

  if(cSnake.position[head].toString() === cSnake.foodPos.toString()){
    cSnake.position.unshift(tail)
  }
  const newHead = cSnake.position.length - 1;
  
  if(isUnsafe(cSnake, cSnake.position[newHead][1], cSnake.position[newHead][0])){
    return -100
  }

  if(newHead > head) {
    return 100
  }

   return 0
}

function getAction(snake, state) {

  if(Math.random() < snake.esp) {
    return Math.floor(Math.random() * 4)
  }

  const max = Math.max(...snake.table[state])

  return chooseMax(snake.table[state], max);
}

function chooseMax(array, max) {
  const indexes = []
  array.forEach((item, index) => {
    (item === max) && indexes.push(index);
  });

  return indexes[Math.floor(Math.random() * indexes.length)]
}

function getState(snake) {
  const head = snake.position[snake.position.length - 1]
  let result = "";
  result += (snake.direction === "left") ? "1" : "0"; // direction left
  result += (snake.direction === "up") ? "1" : "0"; // direction up
  result += (snake.direction === "right") ? "1" : "0"; // direction right
  result += (snake.direction === "down") ? "1" : "0"; // direction down
  result += (head[0] > snake.foodPos[0]) ? "1" : "0"; // food left
  result += (head[1] > snake.foodPos[1]) ? "1" : "0"; // food up
  result += (head[0] < snake.foodPos[0]) ? "1" : "0"; // food right
  result += (head[1] < snake.foodPos[1]) ? "1" : "0"; // food down
  result += isUnsafe(snake, head[1], head[0] - 1) ? "1" : "0"; // danger left
  result += isUnsafe(snake, head[1] - 1, head[0]) ? "1" : "0"; // danger up
  result += isUnsafe(snake, head[1], head[0] + 1) ? "1" : "0"; // danger right
  result += isUnsafe(snake, head[1] + 1, head[0]) ? "1" : "0"; // danger down 

  return result;
  
}

function isUnsafe(snake, row, col) {
  if((row < 0) || (row > 29)) return true;
  if((col < 0) || (col > 29)) return true;

  return hitBody(snake, row, col)
}

function hitBody(snake, row, col) {
  var headPos = snake.position.length-1;
  for (var i=0; i<headPos; i++) {
    if ([col, row].toString() === snake.position[i].toString()) {
      return true;
    }
  }

  return false;
}