import training from "./ai.js";
import handleData from "./handleData.js";
// ADD time?

var snakeTable = document.querySelector(".snakeTable");
var boxes = document.getElementsByClassName("box");
var modul = document.querySelector(".modul");
var start = document.querySelector(".start");
let setInt;
let random;
let scoreElt;
let countESP = !localStorage.getItem("espCount") ? 0 : localStorage.getItem("espCount");
const espElem = document.getElementById("esp")

var table = {
  rowsCols: 30,
  boxes: 30*30
};

var snake = {
  direction: "right",
  position: [[6,10], [7,10], [8,10]],
  interval: 200,
  food: 0,
  score: 0,
  final: 0,
  time: 0,
  canTurn: 0,
  table: {},
  foodPos: [],
  esp: 1,
  esp_discount: 0.9992,
  esp_min: 0.001,
  discount_rate: 0.95,
  learning_rate: 0.01,

  init: function() {
    const headCol = (Math.floor(Math.random() * 30) === 0) ? (Math.floor(Math.random() * 30) + 3) : Math.floor(Math.random() * 30);
    const headRow = Math.floor(Math.random() * 30)
    snake.direction = "right";
    snake.position = [[headCol - 2,headRow], [headCol - 1,headRow], [headCol,headRow]];
    snake.interval = 100;
    snake.food = 0;
    snake.score = 0;
    snake.time = 0;
    snake.canTurn = 0;
    snakeTable.innerHTML = "";
    tableCreation();
  }
};

// init game
snake.init();

start.addEventListener("click", startSnake);

document.addEventListener("keydown", function(e) {
  if (e.keyCode === 13 && snake.time === 0) {
    startSnake();
  }
});

// random 'food'
function randomFood() {
  var randomX = Math.floor(Math.random() * table.rowsCols);
  var randomY = Math.floor(Math.random() * table.rowsCols);
  random = randomX + randomY * table.rowsCols;
  // picks another foodPos if food pops on snake
  while (boxes[random].classList.contains("snake")) {
    randomX = Math.floor(Math.random() * table.rowsCols);
    randomY = Math.floor(Math.random() * table.rowsCols);
    random = randomX + randomY * table.rowsCols;
  }  
  boxes[random].classList.add("food");
  snake.foodPos = [randomX, randomY];
}

// start game
function startSnake() {
  modul.classList.add("hidden");

  // clearInterval(checkPageInterval);
  snake.time = 1;
  renderSnake();
  snake.table = handleData().readData()
  snake.esp = !localStorage.getItem("esp") ? 1 : localStorage.getItem("esp")
  randomFood();
  snake.is_die = false
  snake.prevAction = null
  snake.prevState = ""
  // interval, heart of the game
  
  snake.esp = Math.max(snake.esp * snake.esp_discount, snake.esp_min)
  setInt = setInterval(function() {
    move();
  }, snake.interval);
}

// end of game
function stopp() {
  clearInterval(setInt);
  snake.final = snake.score;
  start.querySelector("span").innerHTML = snake.final + " Points !";
  setTimeout(function() {
    start.querySelector("span").innerHTML = "Play Snake";
  }, 1500);
  snake.init();
  modul.classList.remove("hidden");
  snake.is_die = true;
  countESP++;
  espElem.innerHTML = countESP
  localStorage.setItem("espCount", countESP)
}

// move the snake function
function move() {
  // check if move allowed & then eat food
  hitFood();
  hitBorder();
  hitSnake();
  // actually move the snake
  updatePositions();
  renderSnake();
  // add 14/11
  training(snake)

  snake.is_die && handleData().saveData(snake)
  snake.is_die && startSnake()
  // document.addEventListener("keydown", turn);
  snake.canTurn = 1;
}

function updatePositions() {
  // remove last snake part (first snake pos)
  if(boxes[snake.position[0][0] + snake.position[0][1] * table.rowsCols]) {
    boxes[snake.position[0][0] + snake.position[0][1] * table.rowsCols].classList.remove("snake");
    snake.position.shift();
    var head = snake.position[snake.position.length - 1];
    switch (snake.direction) {
      case "left":
        snake.position.push([head[0] - 1, head[1]]);
        break;
      case "up":
        snake.position.push([head[0], head[1] - 1]);
        break;
      case "right":
        snake.position.push([head[0] + 1, head[1]]);
        break;
      case "down":
        snake.position.push([head[0], head[1] + 1]);
        break;
      default:
        console.log("no direction !");
    }
  }else {
    console.log("u")
    console.log(snake.position[0][0])
    console.log(snake.position[0][1])
    stopp()
  }
  // add new snake part

}

// checks border contact
function hitBorder() {
  var headPos = snake.position.length-1;
  // goes of limits
  if (((snake.position[headPos][0] === table.rowsCols-1) && (snake.direction === "right")) || ((snake.position[headPos][0] === 0) && (snake.direction === "left")) || ((snake.position[headPos][1] === table.rowsCols-1) && (snake.direction === "down")) ||  ((snake.position[headPos][1] === 0) && (snake.direction === "up"))) {
    // console.log("border hit");
    stopp();
    // startSnake()
  }else if (((snake.position[headPos][0] > table.rowsCols-1)) || (snake.position[headPos][0] < 0) || (snake.position[headPos][1] > table.rowsCols-1) || ((snake.position[headPos][1] < 0))) {
    console.log(snake.position)
    stopp();
    // startSnake()
  }
}

// checks self contact
function hitSnake() {
  var headPos = snake.position.length-1;
  for (var i=0; i<headPos; i++) {
    if (snake.position[headPos].toString() === snake.position[i].toString()) {

      stopp();
      // startSnake()
      break
    }
  }
}

// checks food contact
function hitFood() {
  var head = snake.position[snake.position.length-1];
  var tail = snake.position[0];
  if (head.toString() === snake.foodPos.toString()) {
    boxes[random].classList.remove("food");
    snake.position.unshift(tail);
    randomFood();
    snake.food++;
    snake.score += snake.food;
    scoreElt.innerHTML = snake.score + " pts";
    // increase speed
    clearInterval(setInt);
    snake.interval = snake.interval - snake.interval/40;
    setInt = setInterval(function() {
      move();
    }, snake.interval);
  }
}

// read positions and render the snake
function renderSnake() {
  for (var i=0; i<snake.position.length; i++) {
    if(boxes[snake.position[i][0] + snake.position[i][1] * table.rowsCols]) {
      boxes[snake.position[i][0] + snake.position[i][1] * table.rowsCols].classList.add("snake");
    }else {
      console.log("r")
      console.log(snake.position[i][0])
      console.log(snake.position[i][1])

      stopp()
    }
  }
}

// keypress handling to turn
function turn(e) {
  if (snake.canTurn) {
    switch (e.keyCode) {
      case 13:
        // document.removeEventListener()
        break;
      case 37:// left
        if (snake.direction === "right") return;
        snake.direction = "left";
        break;
      case 38:// up
        if (snake.direction === "down") return;
        snake.direction = "up";
        break;
      case 39:// right
        if (snake.direction === "left") return;
        snake.direction = "right";
        break;
      case 40:// down
        if (snake.direction === "up") return;
        snake.direction = "down";
        break;
      default:
        console.log("wrong key");
    }
    snake.canTurn = 0;
  }

}

// table creation
function tableCreation() {
  if (snakeTable.innerHTML === "") {
    // main table
    for (var i = 0; i<table.boxes; i++) {
      var divElt = document.createElement("div");
      divElt.classList.add("box");
      snakeTable.appendChild(divElt);
    }
    // status bar
    var statusElt = document.createElement("div");
    statusElt.classList.add("status");
    snakeTable.appendChild(statusElt);
    scoreElt = document.createElement("span");
    scoreElt.classList.add("score");
    scoreElt.innerHTML = snake.score + " pts";
    statusElt.appendChild(scoreElt);
  }
}

// handle focus of the page
// function checkPageFocus() {
//   if (document.hasFocus()) {
//     modul.classList.remove("hidden");
//   }
//   else {
//     modul.classList.add("hidden");
//   }
// }
// var checkPageInterval = setInterval(checkPageFocus, 300);

// swipe Showcase
$("document").ready(function() {
  $("body")
    .swipeDetector()
    .on("swipeLeft.sd swipeRight.sd swipeUp.sd swipeDown.sd", function(event) {
      if (event.type === "swipeLeft") {
        if (snake.direction === "right") return;
        snake.direction = "left";
      } else if (event.type === "swipeRight") {
        if (snake.direction === "left") return;
        snake.direction = "right";
      } else if (event.type === "swipeUp") {
        if (snake.direction === "down") return;
        snake.direction = "up";
      } else if (event.type === "swipeDown") {
        if (snake.direction === "up") return;
        snake.direction = "down";
      }
      snake.canTurn = 0;
    });
});

// swipe function --> credit: https://codepen.io/AlexEmashev/pen/BKgQdx?editors=0100
(function($) {
  $.fn.swipeDetector = function(options) {
    // States: 0 - no swipe, 1 - swipe started, 2 - swipe released
    var swipeState = 0;
    // Coordinates when swipe started
    var startX = 0;
    var startY = 0;
    // Distance of swipe
    var pixelOffsetX = 0;
    var pixelOffsetY = 0;
    // Target element which should detect swipes.
    var swipeTarget = this;
    var defaultSettings = {
      // Amount of pixels, when swipe don't count.
      swipeThreshold: 30,
      // Flag that indicates that plugin should react only on touch events.
      // Not on mouse events too.
      useOnlyTouch: true
    };

    // Initializer
    (function init() {
      options = $.extend(defaultSettings, options);
      // Support touch and mouse as well.
      swipeTarget.on("mousedown touchstart", swipeStart);
      $("html").on("mouseup touchend", swipeEnd);
      $("html").on("mousemove touchmove", swiping);
    })();

    function swipeStart(event) {
      if (options.useOnlyTouch && !event.originalEvent.touches) return;

      if (event.originalEvent.touches) event = event.originalEvent.touches[0];

      if (swipeState === 0) {
        swipeState = 1;
        startX = event.clientX;
        startY = event.clientY;
      }
    }

    function swipeEnd(event) {
      if (swipeState === 2) {
        swipeState = 0;

        if (
          Math.abs(pixelOffsetX) > Math.abs(pixelOffsetY) &&
          Math.abs(pixelOffsetX) > options.swipeThreshold
        ) {
          // Horizontal Swipe
          if (pixelOffsetX < 0) {
            swipeTarget.trigger($.Event("swipeLeft.sd"));
          } else {
            swipeTarget.trigger($.Event("swipeRight.sd"));
          }
        } else if (Math.abs(pixelOffsetY) > options.swipeThreshold) {
          // Vertical swipe
          if (pixelOffsetY < 0) {
            swipeTarget.trigger($.Event("swipeUp.sd"));
          } else {
            swipeTarget.trigger($.Event("swipeDown.sd"));
          }
        }
      }
    }

    function swiping(event) {
      // If swipe don't occuring, do nothing.
      if (swipeState !== 1) return;

      if (event.originalEvent.touches) {
        event = event.originalEvent.touches[0];
      }

      var swipeOffsetX = event.clientX - startX;
      var swipeOffsetY = event.clientY - startY;

      if (
        Math.abs(swipeOffsetX) > options.swipeThreshold ||
        Math.abs(swipeOffsetY) > options.swipeThreshold
      ) {
        swipeState = 2;
        pixelOffsetX = swipeOffsetX;
        pixelOffsetY = swipeOffsetY;
      }
    }

    return swipeTarget; // Return element available for chaining.
  };
})(jQuery);

// remove scroll for mobile IOS issue
function preventDefault(e){e.preventDefault();}
function disableScroll(){
    document.body.addEventListener('touchmove', preventDefault, { passive: false });
}
function enableScroll(){
    document.body.removeEventListener('touchmove', preventDefault, { passive: false });
}
disableScroll();

// https://www.theodinproject.com/courses/javascript-and-jquery/lessons/jquery-and-the-dom
