var horses = [], track = [], raceResults = [], startingPos = [], randNumbers = [];

var startButton, startLine, betInput,
horseInput, fundsField, timerInterval, betValue, betHorse, lapsInput, innerField, betDiv, resultsDiv, resetY = 0;

var funds = 100;        // Starting funds when betting;
var lapNumber = 1;      // How many laps a race should take;
var riderHeight = 36;   // The size of the rider that can overlap the inner field;
var counter = 0;        // Race timer, starts at 0;
var maxStamina = 100;   // The max stamina a horse could randomly get;
var horsesAmount = 4;   // How many horses there are;
var delay = 20;         // The delay for regenerating stamina;
var depleteVal = 2;      // How fast horse stamina depletes, this cant be higher than 3;

var canStart = false;
var raceStarted = false;

// Constant values for movement and speed of game (lower number means faster game);
// Do not change Move constants;
const MOVE_RIGHT = 1, MOVE_UP = -1, MOVE_LEFT = -1, MOVE_DOWN = 1, GAME_SPEED = 20;
// What happens when the start race button is pressed;
function clickFunction() {

  clearInterval(timerInterval); // Clear any running interval;
  counter = 0;                  // Set counter to 0;
  raceResults = [];             // Empty raceResults array;
  preStartCheck();              // Check if there is any bet in the bet amount field;

  if (canStart) {
    disableInputs(true);
    fixTrackSize();

    console.log(startingPos);

    for (let index = 0; index < horses.length; index++) {
      const horse = horses[index];

      horse.timer = 0;        // Set horse timer to 0;
      // A horse with a higher chance to win will have more stamina;
      horse.stamina = getRandomNum(horse.chance, maxStamina);
      startRace(index);
    }
  }
}
// Set the positio of the horses to the start line;
function moveToStart(horseNum) {

  const horse = horses[horseNum];
  let newPosX = startLine.element.getBoundingClientRect().left;
  let newPosY = (innerField.element.getBoundingClientRect().bottom - 30) + resetY;

  horse.element.style.left = newPosX + 'px';
  horse.element.style.top = newPosY + 'px';
  horse.currLap = 0;
  
  resetY += 32;
  
  if (horseNum == 3) {
    resetY = 0;
  }
}
// Timer function acting as a counter
function startTimer() {

  counter++;
}
// Disable the input fields so that once the race has started these cannot be changed;
function disableInputs(boolean) {

  let toggle = boolean;

  betInput.disabled = toggle;
  horseInput.disabled = toggle;
  lapsInput.disabled = toggle;
}
// Fix the size of the track so that resizing does not affect the race;
function fixTrackSize() {

  let startLineBounds = startLine.element;
  let resultsDivBounds = resultsDiv.getBoundingClientRect();
  let betDivBounds = betDiv.getBoundingClientRect();

  // Fix the outer track size and position:
  track.element.style.width = track.element.clientWidth + "px";
  track.element.style.height = track.element.clientHeight + "px";
  track.element.style.marginTop = track.element.offsetTop + "px";
  track.element.style.marginLeft = track.element.offsetLeft + "px";
  
  // Fix the inner field size and position:
  innerField.element.style.width = innerField.element.clientWidth + "px";
  innerField.element.style.height = innerField.element.clientHeight + "px";
  innerField.element.style.marginTop = innerField.element.offsetTop + "px";
  innerField.element.style.marginLeft = innerField.element.offsetLeft + "px";
  // Fix the start line size and position:
  startLine.element.style.width = startLine.element.clientWidth + "px";
  startLine.element.style.height = startLine.element.clientHeight + "px";
  startLine.element.style.marginTop = startLine.element.offsetTop + "px";
  startLine.element.style.marginLeft = startLine.element.offsetLeft + "px";
}
// Start the race
function startRace(horseNum) {

  var horse = horses[horseNum];

  hideHUD(true);

  if (canStart && horse.currLap < lapNumber) {

      clearInterval(horse.raceInterval);
      raceStarted = true;     // Used to check if race is started when resizing window;

      if (horse.stamina < 1) {

        horse.raceInterval = setInterval(function() {

          updateValues(horseNum);
          moveAhead(horseNum);

        }, GAME_SPEED + 10);
      } else {

        horse.raceInterval = setInterval(function() {

          updateValues(horseNum);
          moveAhead(horseNum);

        }, GAME_SPEED);
      }
  } else {

    if (horse.direction == 'moveRight') {
      clearInterval(horse.raceInterval);
      stopRace(horseNum);
      raceStarted = false;    // Used to check if race is started when resizing window;
    }
  }
}
// Stop the race
function stopRace(horseNum) {

  const horse = horses[horseNum];
  let posRight = startLine.bounds.right + getRandomNum(50, 100); // Get a random value at which the horses stop after the startline;
  let sortedArr = [];

  horse.raceInterval = setInterval(function() {

    getLap(horseNum);
    horse.bounds = horse.element.getBoundingClientRect();
    // Keep moving until posRight value is reached;
    if (horse.bounds.x < posRight) {
      horse.element.style.left = horse.bounds.left + 1 + 'px';

    } else {

      horse.element.className = '';
      horse.element.classList.add('standRight', 'horse');

      clearInterval(horse.raceInterval);
      canStart = false;

      // Creating the results array
      raceResults.push([horse.element, horse.timer]);

      // Update the results table only after the raceResults array has been filled;
      if (raceResults.length == horses.length) {

        resetStartButton();
        hideHUD(false);
        disableInputs(false);
        updateResults();
        updateValues(horseNum);
        addHorseInputOdds();
        clearInterval(timerInterval);
        // Removes the inline css style that was added with javascript, reverting to default styling;
        track.element.removeAttribute("style");
        innerField.element.removeAttribute("style");
        startLine.element.removeAttribute("style");
      }
    }
  }, GAME_SPEED);
}

function hideHUD(boolean) {
  let toggle = boolean;

  if (toggle) {
    
    resultsDiv.style.display = "none";
  } else {

    resultsDiv.style.display = "block";
  }
}
// Update the results table;
function updateResults() {

  let resTab = document.getElementById('results').childNodes[3];
  let resRow = resTab.childNodes;
  let resTabArr = [];
  let name;

  raceResults.sort(timerAscending);
  // Get the results table rows and store them in an array;
  for (let index = 0; index < resRow.length; index++) {
    const element = resRow[index];

    if (element.nodeName == 'TR') {
      resTabArr.push(element);
    }
  }

  for (let index = 0; index < resTabArr.length; index++) {
    const element = resTabArr[index].lastElementChild;

    name = raceResults[index][0];   // Store horses name in order of winning;

    element.className = '';         // Add the portrait to the results table
    element.classList.add(name.id);
  }

  for (let index = 0; index < horses.length; index++) {
    const horse = horses[index];

    // Add the winning bet to the funds;
    if (raceResults[0][0].id == horseInput.value && horse.name == horseInput.value) {

      funds += horse.odds * betValue;
      fundsField.innerHTML = funds;
    }

    // raceResults [0][0] refers to the winning horse element;
    if (raceResults[0][0].id == horse.name) {

      horse.racesWon++;

      if (horse.chance > 20) {
        if (horse.odds > 2) {
          horse.odds--;
        }
        horse.chance -= 10;     // Decreasing horse chance to win next round;
        console.log('horse' + index + ' odds ' + horse.odds + '/1' + ' won with ' + horse.chance + ' chance');
        console.log(startingPos);
      }

    } else if (raceResults[0][0].id != horse.name) {

      horse.odds++;
      horse.chance += 10;   // Increasing horse chance to win next round;
      console.log('horse' + index + ' odds ' + horse.odds + '/1' + ' lost with ' + horse.chance + ' chance');
    }
  }
}
// This function can return odds between 2/1 and 10/1 because horse.chance is a random number between 10 and 90, and Math.ceil rounds up;
function getOdds(chance) {

  return Math.ceil((1 - (chance / 100)) * 10) + 1;
}
// Reset the start race button to the default state;
function resetStartButton() {

  // So there are no multiple event listeners added;
  // startButton.removeEventListener('click', clickFunction, false);
  startButton.addEventListener('click', clickFunction);
  startButton.className = '';
  startButton.classList.add('startHover');
  startButton.style.opacity = 1;
}
// Check if input field contain the necessary value and value types;
function preStartCheck() {

  betValue = parseInt(betInput.value);
  let lapsVal = lapsInput.value;
  lapNumber = lapsVal;
  betHorse = getHorseName(horseInput.value);
  let query;

  // Set each horse to starting position;
  for (let index = 0; index < horses.length; index++) {

    moveToStart(index);
  }

  if (betValue === '' || lapsVal === '') {

    window.alert('Bet/Laps field cannot be empty');

  } else if (isNaN(betValue) || isNaN(lapsVal)) {

    window.alert('Bet/Laps amount has to be a number');

  } else if(betValue > funds) {

    window.alert('£' + betValue + ' is more than you currently have');

  } else if (lapsVal < 1) {

    window.alert('Minimum laps allowed is 1');

  } else if (betValue < 1) {

    window.alert('Minimum bet value is 1');

  } else {

    query = confirm('You chose to bet: £' + betValue + ' on ' + betHorse);

    if (query) {

      canStart = true;
      funds -= betValue;
      fundsField.innerHTML = funds;

      startButton.style.opacity = 0.7;
      startButton.style.cursor = 'default';

      startButton.removeEventListener('click', clickFunction, false);
      startButton.classList.remove('startHover');

      timerInterval = setInterval(startTimer, 50);
    }
  }
}
// This function returns a name that is easier to recognise by the user;
function getHorseName(betHorse) {

  switch (betHorse) {
    case 'horse1':
      return 'White';

    case 'horse2':
      return 'Blue';

    case 'horse3':
      return 'Green';

    case 'horse4':
      return 'Brown';
  }
}
// Sorting function, used for sorting the results at the end of the race;
function timerAscending(a,b) {

  return a[1] - b[1];
}
// Lap checker function, increases lap when horse crosses start line, also used for stopping the race;
function getLap(horseNum) {

  const horse = horses[horseNum];
  // Increase horse lap when startline is crossed;
  if ((Math.floor(horse.bounds.right - 5) == Math.floor(startLine.bounds.left)))
  {

    horse.currLap++
    // If final lap is finished, record the timer of crossing startline;
    if (horse.currLap == lapNumber) {

      horse.timer = counter;

      console.log(horse.name + " " + counter);
    }
  }
}
//*************************************************** MOVEMENT FUNCTIONS **********************************************************/
// Move checking function, used to detect turns, increase laps, add movement animation and general movement;
function moveAhead(horseNum) {

  let horse = horses[horseNum];

  if (horse.bounds.left - horse.gap <= innerField.bounds.right
    && horse.bounds.top >= innerField.bounds.bottom - riderHeight) {

    getLap(horseNum);
    animateDirection(horse, 'Right');
    move(horseNum, 'moveRight', MOVE_RIGHT);
    horse.direction = 'moveRight';

  }
  else if (horse.bounds.bottom + horse.gap >= innerField.bounds.top
    && horse.bounds.left >= innerField.bounds.right)  {

    animateDirection(horse, 'Up');
    move(horseNum, 'moveUp', MOVE_UP);
    horse.direction = 'moveUp';
  }
  else if (horse.bounds.right + horse.gap >= innerField.bounds.left
    && horse.bounds.bottom <= innerField.bounds.top) {

    animateDirection(horse, 'Left');
    move(horseNum, 'moveLeft', MOVE_LEFT);
    horse.direction = 'moveLeft';
  }
  else if (horse.bounds.top - horse.gap <= innerField.bounds.bottom
    && horse.bounds.right <= innerField.bounds.left) {

    animateDirection(horse, 'Down');
    move(horseNum, 'moveDown', MOVE_DOWN);
    horse.direction = 'moveDown';
  } else {

    console.log('Cannot move');
  }
}
// Function used to detect what animation class needs to be added, and it adds the specific class;
function animateDirection(horse, direction) {

  horse.element.className = '';
  horse.element.classList.add('run' + direction, 'horse');
}
// This regenerates the stamina value, which is used when horses accelerate, it does so at after a specific delay;
function regenStamina(horseNum) {

  let horse = horses[horseNum];

  if ((horse.stamina === 0 || horse.stamina === -1 || horse.stamina == -2) && horse.currLap < lapNumber) {

    horse.timer = counter;``
  }

  if (horse.timer + delay == counter) {

    horse.stamina = getRandomNum(horse.chance, maxStamina);
  }
}
// ---------------------------------- END MOVEMENT FUNCTIONS ----------------------------------------------------------------
// Function that returns a random unique number;
function getRandomNum(min, max) {

  let randNum = Math.floor(Math.random() * max) + min;

  if (randNumbers.indexOf(randNum) == -1) {
    
    randNumbers.push()
    return randNum;
  } else {

    getRandomNum(min, max);
  }

  if (randNumbers.length == horsesAmount) {
    randNumbers = [];
  }
}

function updateValues(horseNum) {

  let horse = horses[horseNum];

  horse.bounds = horse.element.getBoundingClientRect();
  innerField.bounds = innerField.element.getBoundingClientRect();

  // Get random gap value when horse reaches inner field corner, this value is used when horse is turning left;
  if ((Math.floor(horse.bounds.right) == Math.floor(innerField.bounds.right) && horse.direction == 'moveRight')
    || (Math.floor(horse.bounds.top) == Math.floor(innerField.bounds.top) && horse.direction == 'moveUp')
    || (Math.floor(horse.bounds.left) == Math.floor(innerField.bounds.left) && horse.direction == 'moveLeft')
    || (Math.floor(horse.bounds.bottom) == Math.floor(innerField.bounds.bottom) && horse.direction == 'moveDown')) {

    horse.gap = getRandomNum(1, 50);
  }
}

function move(horseNum, direction, value) {
  var horse = horses[horseNum];

  if (direction == 'moveUp' || direction == 'moveDown')
  {

    horse.element.style.top = horse.bounds.top + (value) + 'px';
    horse.stamina -= depleteVal;
  }
  else if (direction == 'moveRight' || direction == 'moveLeft')
  {

    horse.element.style.left = horse.bounds.left + (value) + 'px';
    horse.stamina -= depleteVal;

  }

  if (horse.stamina < 1) {

    regenStamina(horses.indexOf(horse));
    startRace(horses.indexOf(horse));

  } else {

    startRace(horses.indexOf(horse));
  }
}

function addHorseInputOdds() {
  // Make an array with all the horse options;
  let elementsArr = Array.from(horseInput.childNodes).filter(horse => horse.nodeName == 'OPTION');

  for (let index = 0; index < elementsArr.length; index++) {
    const element = elementsArr[index];

    element.innerHTML = getHorseName(element.value) + ' ' + horses[index].odds + '/' + 1;
  }

}

function timedResize() {

  if (!raceStarted) {

    resizeDelay = setTimeout(function() {

      startLine.bounds = document.getElementById('startline').getBoundingClientRect();

      for (let index = 0; index < horses.length; index++) {
        moveToStart(index);
      }
    }, 500);
  }
}

// ********************** ON LOAD FUNCTION STARTS HERE **********************************************
document.addEventListener('DOMContentLoaded', onLoadFunction);

// When browser window is resized the below function resets the position of the horses to the startline;
// It only does so if a race has not started yet, also it is on a delay so it does not consume too many resources;
function onLoadFunction() {
  window.addEventListener('resize', timedResize);

  startButton = document.getElementById('start');
  startLine = {
    element: document.getElementById('startline'),
    bounds: document.getElementById('startline').getBoundingClientRect()
  };
  betDiv = document.getElementById("bet");
  resultsDiv = document.getElementById("results");
  betInput = document.getElementById('amount');
  horseInput = document.getElementById('bethorse');
  fundsField = document.getElementById('funds');
  lapsInput = document.getElementById('laps');

  startButton.addEventListener('click', clickFunction);
  // Remove any classes;
  startButton.className = '';
  // Add Class for hover effect;
  startButton.classList.add('startHover');
  // Add the funds value to the funds field;
  fundsField.innerHTML = funds;

  // Creating the horses array, which contains all 4 horses with their properties;
  // Starting array at index 1 so will have to remove the null value at index 0;
  innerField = {
    element: document.getElementById('innerField'),
    bounds: document.getElementById('innerField').getBoundingClientRect()
  };

  track = {
    element: document.getElementById('outerTrack'),
    bounds: document.getElementById('outerTrack').getBoundingClientRect()
  };

  for (let index = 0; index < horsesAmount; index++)
  {

    horses[index] = {
      element: document.getElementById('horse' + (index + 1)),
      name: 'horse' + (index + 1),
      bounds: document.getElementById('horse' + (index + 1)).getBoundingClientRect(),
      currLap: 0,
      direction: '',
      raceInterval: 0,
      chance: 0,
      racesWon: 0,
      odds: 0,
      timer: 0,
      stopRace: 0,
      gap: 0,
      stamina: 0
    };

    // No matter what the screen size is, the horses will have a starting position on the left of the startline;
    // They are positioned to start after startLine as to not trigger a lap increase;
    startingPos[index] = horses[index].bounds.y;
    horses[index].chance = getRandomNum(10, 90);
    horses[index].odds = getOdds(horses[index].chance);

    moveToStart(index);

  }
  addHorseInputOdds();
  
}
// ----------------------------------END ON LOAD FUNCTION------------------------------------------------
