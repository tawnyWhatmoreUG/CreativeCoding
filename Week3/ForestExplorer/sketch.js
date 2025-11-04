/**
* This mini game was inspired by minesweeper, I never understood that game -_- so thats a good starting off point! 
* The random elements include the forest grid, randomly picks between two emojis to use
* The hidden animals and threats are randomly placed.
* Could include possible bugs where mulitple elements are placed on the same grid space, but thats too scary to think about fixing.
*
* Gameplay: You are 🏃. You spawn in the middle of the grid. using the arrow keys on the keyboard you have to move around the grid revealing cute fluffy animals. There are some threats mixed in, and if you move into a grid space with a threat in it its game over. A red circle appears when you are near a threat, so you have to carefully navigate around it. 
**/

//number of how many cells per x/y axis in grid.
const cellAmount = 15;
//size of each individual cell in pixels.
const cellSize = 30;
//total size of the grid based on previous two variables.
const gridSize = cellSize * cellAmount;
//size of the canvas is the same as the grid - kept as own variable in case I wanted to add border, or a gui around the grid. 
//i probably should have added a counter for how mnay animals have been found for better user feedback, but 10:30, lazy, sleepy etc. 
const canvasSize = gridSize;
//the number of threats will randomly be placed on the grid.
const threatCount = 3;
//the number of animals to find randomly placed on the grid.
const animalCount = 10;

//player starting position - center of the grid.
let playerGridX = Math.floor(cellAmount / 2); 
let playerGridY = Math.floor(cellAmount / 2); 

//arrays of emojis to randomly select from for hidden items.
const hiddenAnimals = ["🐿️", "🐦‍⬛", "🦌", "🦉", "🦔", "🐇"];
const hiddenThreats = ["🐍", "🕳️", "☠️"];

//2D array to hold the forest grid emojis that'll be randonmly created in the setup function.
let forestGrid = [];
//arrays to hold the coordinates of the hidden items. format is [gridX, gridY, emoji]
let hiddenAnimalCoords = []; 
//array to hold the animals the player has found. Format is [gridX, gridY, emoji]
let foundAnimals = [];
//array to hold the coordinates of the threats. format is [gridX, gridY, emoji]
let hiddenThreatsCoords = []; // Store as [gridX, gridY, emoji]
//this is the max size of the threat circle that appears when player is close to a threat.
let threatIndicatorMaxSize = 100;

//game state variables - intro screen and game over screen
let showIntro = true;
let gameOver = false;

function setup() {
  createCanvas(canvasSize, canvasSize);
  //this is where the forest is generated and hidden items are placed
  initGrid();
}

function draw() {
  //background colour of the canvas and intro/win/game over screens.
  let backgroundColour = color(34, 49, 55);

  background(backgroundColour);
  //intro screen with instructions, true by default to show first. any key press will dismiss it.
  if (showIntro) {
    drawIntro(backgroundColour);

   //game over screen if player hits a threat
  } else if (gameOver) {
    drawGameOver(backgroundColour);
    //winner screen if player finds all the animals
  } else if (foundAnimals.length === hiddenAnimalCoords.length && !gameOver) {
        drawYouWin(backgroundColour);
  } else {
    //main game screen
    background(backgroundColour);
    drawGrid();
    
    //draw the player - centering in the cell, bit fiddly to align. 
    let playerPixelX = playerGridX * cellSize + (cellSize / 2);
    let playerPixelY = playerGridY * cellSize + (cellSize / 2);
    
    //uses the global cell size
    textSize(cellSize);
    text("🏃", playerPixelX, playerPixelY);
    
    //if the player is near a threat, draw a red circle that expands outwards.
    if (threatNearby()) {
      let threatColour = color(255, 128, 128);
      threatColour.setAlpha(55);
      fill(threatColour);
      circle(playerPixelX, playerPixelY, threatIndicatorMaxSize);
      let maxCircleSize = cellSize * 3;
      if (threatIndicatorMaxSize > maxCircleSize) {
        threatIndicatorMaxSize = 0;
      } else {
        threatIndicatorMaxSize += 1;
      }
    } else {
      //reset the fill
      //mostly important to reset the alpha - in browsers like chrome the alpha effect persisted after the circle was gone, dulling the forest.
      fill(0,0,0,255);
    }
  }
}

function keyPressed() {
  //any key press dismisses the intro screen to start. 
if (showIntro) {
    showIntro = false;
    return;
  }
  //if game over or game is won, ignore any key presses.
  if (gameOver || (foundAnimals.length === hiddenAnimalCoords.length)) {
    return;
  }

  //move the player position based on arrow key presses, but only if within the grid bounds.
  let newGridX = playerGridX;
  let newGridY = playerGridY;
  if (keyCode === UP_ARROW && playerGridY > 0) {
    newGridY = playerGridY - 1;
  }
  if (keyCode === DOWN_ARROW && playerGridY < cellAmount - 1) {
    newGridY = playerGridY + 1;
  }
  if (keyCode === LEFT_ARROW && playerGridX > 0) {
    newGridX = playerGridX - 1;
  }
  if (keyCode === RIGHT_ARROW && playerGridX < cellAmount - 1) {
    newGridX = playerGridX + 1;
  }
  
  //update player position globally. 
  playerGridX = newGridX;
  playerGridY = newGridY;
  
  console.log("player at grid " + playerGridX + ", " + playerGridY);
  //check if player is on a threat or animal
  checkIsOnThreat(playerGridX, playerGridY);
  checkIsOnAnimal(playerGridX, playerGridY);
}

//called in the render loop
// Draws the grid of forest emojis, and any found animals or threats.
function drawGrid() {
  textSize(cellSize);
  textAlign(CENTER, CENTER);

  //loop through the 2D array and draw each emoji in its cell.
  for (let x = 0; x < cellAmount; x++) {
    for (let y = 0; y < cellAmount; y++) {
      const xPos = x * cellSize + (cellSize / 2);
      const yPos = y * cellSize + (cellSize / 2);
      //get the emoji from the forest grid
      const emoji = forestGrid[x][y];
      
      //check if the player has found an animal at this grid position
      let foundAnimalAtPos = foundAnimal(x, y);
      if (foundAnimalAtPos != null) {
        //and render the found animal instead of the forest emoji
        text(foundAnimalAtPos[2], xPos, yPos);
      } else {
        //otherwise render the forest emoji
        text(emoji, xPos, yPos);
      }
    }
  }
}

//basic intro screen with some text instructions, nuffing fancy, is the default rendered view when script is first run. 
function drawIntro(backgroundColour) { 
  fill(backgroundColour);
  rect(0, 0, width, height);
  textSize(16);
  textAlign(CENTER, CENTER);
  fill(255);
  //using \n for new lines instead of multiple text calls, easier to position. 
  text("Welcome to Forest Explorer!\n\nUse the arrow keys to move around the forest.\n\nFind all " + animalCount + " hidden animals\n\n" + hiddenAnimals.join(", ") + "\n\nwhile avoiding threats " + hiddenThreats.join(", ") + ".\n\nA red circle indicates a nearby threat.\n\n Navigate carefully!\n\n\n Press any key to start", width / 2, height / 2);
  textSize(16);
}

//game over screen with score and all of the hidden items revealed in their locations.
function drawGameOver(backgroundColour) {
  fill(backgroundColour);
  rect(0, 0, width, height);
  textSize(16);
  textAlign(CENTER, CENTER);
  fill(255);
  text("Game Over!\n\nYou encountered a threat.\n\nYou found " + foundAnimals.length + " out of " + hiddenAnimalCoords.length + " animals.\n\nRefresh to try again.", width / 2, height / 2);
  //draw each threat and animal on screen in their grid locations.
  //nice to know where everything was for that bitter taste of regret.
  textSize(cellSize);
  for (let i = 0; i < hiddenThreatsCoords.length; i++) {
    let threat = hiddenThreatsCoords[i];
    let threatPixelX = threat[0] * cellSize + (cellSize / 2);
    let threatPixelY = threat[1] * cellSize + (cellSize / 2);
    text(threat[2], threatPixelX, threatPixelY);
  }
  for (let j = 0; j < hiddenAnimalCoords.length; j++) {
    let animal = hiddenAnimalCoords[j];
    let animalPixelX = animal[0] * cellSize + (cellSize / 2);
    let animalPixelY = animal[1] * cellSize + (cellSize / 2);
    text(animal[2], animalPixelX, animalPixelY);
  }
}

//win screen if player finds all the animals, i think im too impatient to get this far, 
//to test i lowered the find animal count
function drawYouWin(backgroundColour) { 
  fill(backgroundColour);
  rect(0, 0, width, height);
  textSize(16);
  textAlign(CENTER, CENTER);
  fill(255);
  text("You Win!\n\nYou found all " + foundAnimals.length + " animals!\n\nRefresh to play again.", width / 2, height / 2);
}

//this is called in the setup function to create the forest grid and place hidden items.
//if this was called in the draw function, the forest would constantly change due to the random construction of it. 
//so its only called once at setup, stores the generated grid in a 2D array, then the draw loop can reference that array meaning it won't change.
function initGrid() {
  const forestEmojis = ["🌲", "🌳"];
  for (let x = 0; x < cellAmount; x++) {
    forestGrid[x] = [];
    for (let y = 0; y < cellAmount; y++) {
      forestGrid[x][y] = random(forestEmojis);
    }
  }
  initHiddenItems();
}

//places the hidden animals and threats on the grid, 
//tried to ensure that the threats dont spawn too close to the player start position.
function initHiddenItems() {
  //using the size of the hidden items arrays to determine how many to place
  //then loop through placement logic that many times.
  for (let i = 0; i < animalCount; i++) {
    //random x and y grid positions are generated, floor is needed to round down to whole number 
    const randomCellX = floor(random(cellAmount));
    const randomCellY = floor(random(cellAmount));
    let randomAnimal = random(hiddenAnimals);

    //here i should really add some logic to check if the random position is already taken by another hidden item
    //this would prevent multiple items being placed on the same grid space.
    //but im feeling lazy now :')
    hiddenAnimalCoords[i] = [randomCellX, randomCellY, randomAnimal];
    console.log("animal " + i + " at grid " + randomCellX + ", " + randomCellY);
  }

  
  //placing the threats, similar to above
  //but with a check to ensure they dont spawn too close to the player start position.
  //'cause that would be unfair!
  for (let j = 0; j < threatCount; j++) {
    //valid cell is used to flag when a suitable position is found.
    let isValidCell = false;
    let randomCellX, randomCellY;
    
    //this loop logic was killing me for a while, actually not me, but the web p5 editor.
    //auto refresh plus while loop without a condition change == infinite loop crash.
    //i ended up swapping to work in VS code as i lost progress once or twice because of this. 
    
    //anyways, loop runs while a valid cell hasn't been assigned. 
    while (!isValidCell) { 
      //generate random coords
      randomCellX = floor(random(cellAmount));
      randomCellY = floor(random(cellAmount));
      
      //calculate the distance these coords are from the player start position.
      const distanceFromSpawn = Math.abs(randomCellX - playerGridX) + Math.abs(randomCellY - playerGridY);
      
      //if the distance is greater than 2, its a valid cell, so we can exit the loop.
      if (distanceFromSpawn > 2) {
        //the important change for avoiding infinite loop sadness!
        isValidCell = true;
      }
    }
    
    //once we have valid coords, store them with a random threat emoji.
    let randomThreat = random(hiddenThreats);
    hiddenThreatsCoords[j] = [randomCellX, randomCellY, randomThreat];
    console.log("threat " + j + " at grid " + randomCellX + ", " + randomCellY);
  }
}

//checks if the player has found an animal at the given grid position
//returns the animal data if found, otherwise null.
function foundAnimal(gridX, gridY) {
  //if no animals found yet, return null early, no point in working through the loop logic.
  if (foundAnimals.length == 0) {
    return null;
  }

  //loop through the found animals to see if any match the given grid position
  for (let i = 0; i < foundAnimals.length; i++) {
    //if we find a match, return the animal data, will use this to render the emoji in the grid.
    if (gridX == foundAnimals[i][0] && gridY == foundAnimals[i][1]) {
      return foundAnimals[i];
    }
  }
  //no match, return nothing.
  return null;
}

//checks if the player is on a grid position with a hidden animal
//if so, adds it to the found animals array.
function checkIsOnAnimal(gridX, gridY) {
  for (let i = 0; i < hiddenAnimalCoords.length; i++) {
    if (gridX == hiddenAnimalCoords[i][0] && gridY == hiddenAnimalCoords[i][1]) {
      console.log("DING DING DING!! Player found " + hiddenAnimalCoords[i][2]);
      // Check if this animal is already found by looking to see if we have the same x and y coords stored already.
      // need to do this because there was a bug that would add the same animal again after it was found should the user visit that grid cell again.
      let alreadyFound = foundAnimals.some(animal => 
        animal[0] === hiddenAnimalCoords[i][0] && 
        animal[1] === hiddenAnimalCoords[i][1]
      );
      
      if (!alreadyFound) {
        console.log("Adding found animal " + hiddenAnimalCoords[i])
        foundAnimals.push(hiddenAnimalCoords[i]);
      }
    }
  }
}

//checks if the player is on a grid position with a hidden threat
//if so, sets game over to true
function checkIsOnThreat(gridX, gridY) {
  for (let i = 0; i < hiddenThreatsCoords.length; i++) {
    if (gridX == hiddenThreatsCoords[i][0] && gridY == hiddenThreatsCoords[i][1]) {
      console.log("Oh No! you found a " + hiddenThreatsCoords[i][2]);
      gameOver = true;
    }
  }
}

//checks if the player is near any threats, within 2 grid spaces in any direction
//used to trigger the red circle warning indicator.
//returns true if a threat is nearby, otherwise false.
function threatNearby() {
  for (let i = 0; i < hiddenThreatsCoords.length; i++) {
    let threatGridX = hiddenThreatsCoords[i][0];
    let threatGridY = hiddenThreatsCoords[i][1];
    
    if (Math.abs(threatGridX - playerGridX) <= 2 && Math.abs(threatGridY - playerGridY) <= 2) {
      console.log("close to threat at grid " + threatGridX + ", " + threatGridY);
      return true;
    }
  }
  return false;
}
