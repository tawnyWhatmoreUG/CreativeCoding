/*
 * Terminal-Style Binary Pattern Generator
 *
 * This sketch mimics the layout and behaviour of a terminal application.
 *
 * INPUT: The user inputs a value or selects one using the up/down arrows (similar to
 * command history). I purposefully left out any hints to controls, if you've used a terminal interface before i hope it's intuative, otherwise i encourage looking at source code :) 
 * After input, a black-and-white pattern based on the binary string is printed on the screen.
 * The user can press the 'Spacebar' to save a screenshot of the pattern.
 *
 * References for syntax, function calls and maths:
 * https://p5js.org/reference/p5/textFont/
 * https://p5js.org/reference/p5/frameCount/
 * https://p5js.org/reference/p5/input/
 * https://p5js.org/reference/p5.Element/style/
 * https://p5js.org/reference/p5.Element/elt/
 * https://p5js.org/reference/p5/keyPressed/
 * https://www.geeksforgeeks.org/dsa/convert-string-binary-sequence/
 * https://p5js.org/examples/math-and-physics-game-of-life/
 * https://p5js.org/reference/p5/save/
 */

// --- Global Constants ---
const fontSize = 12;
const edgePadding = 5;
const lineHeight = 15;
const frameRate = 10;

const fontFamily = "Courier New";
const fontColour = "white";

const definedDefinitions = [
  "Creative Coder",
  "Algorithimc Designer",
  "Visual Artist",
  "Digital Sculptor",
  "Interaction Designer",
  "Data Poet",
  "Glitch Artist",
  "Pattern Architect",
  "Systems Thinker",
  "Console Logger",
  "Prompt Engineer",
  "Lost",
  "A function looking for an input",
  "Invalid Syntax",
  "Loop(y)ing",
];

// --- Global Variables ---
let inputField;
let userInput = "";
let binaryValue = "";
//tracks how many times we add a new line when printing binary, this is for placing the next command after binary.
let binaryLineBreaks = 0;
//when true the end pattern renders. 
let renderingResult = false;
//defaults to -1 so we dont miss the 0 index value
let currentSearchIndex = -1; 

//pattern related variables
let cellSize = 5;
let columnCount;
let rowCount;
let currentCells = [];
let nextCells = [];

// =========================================================================
// Initialization and Setup
// =========================================================================

function setup() {
  createCanvas(400, 400);
  setFrameRate(frameRate);
  noStroke(); //set global no stroke style for sketch, pattern looks nicer
  background(0);

  setupInputField();
  setupPatternGrid();
}

/**
 * Creates and styles the HTML input field for user commands.
 */
function setupInputField() {
  inputField = createInput("");
  inputField.position(edgePadding * 3, lineHeight + edgePadding);
  inputField.elt.focus(); //enable auto focus for the input
  inputField.style("background", "transparent"); //set background to clear,will be seamless with the canvas colour then.
  inputField.style("border", "0"); //remove borders and outlines for input that are usually applied by default from the browser
  inputField.style("outline", "0");
  inputField.style("width", "100%");
  inputField.style("font-family", fontFamily); //align font family with the entire canvas one.
  inputField.style("color", fontColour); //and same as the font colour.
  inputField.input(updateValue); //update input value variable
}

/**
 * Initializes the grid dimensions and cell arrays for the pattern.
 */
function setupPatternGrid() {
  // Calculate columns and rows
  columnCount = floor(width / cellSize);
  rowCount = floor(height / cellSize);

  // Initialize cells arrays
  for (let column = 0; column < columnCount; column++) {
    currentCells[column] = [];
    nextCells[column] = []; // Initialize nextCells here too
    for (let row = 0; row < rowCount; row++) {
      currentCells[column][row] = 0; // Initialize all cells to dead (0)
      nextCells[column][row] = 0;
    }
  }
}


// =========================================================================
// Main Drawing Loop
// =========================================================================

function draw() {
  if (renderingResult) {
    renderPattern();
    //disable looping otherwise gets a bit laggy
    noLoop();
  } else {
    renderTerminalText();
  }
}

/**
 * Draws the terminal-style text interface.
 */
function renderTerminalText() {
  fill(fontColour);
  textFont(fontFamily, fontSize);
  text("What are you?", edgePadding, edgePadding, width, lineHeight);

  // Blinking cursor appearance
  const cursorCharacter = frameCount % frameRate >= frameRate / 2 ? ">" : "";
  text(cursorCharacter, edgePadding, lineHeight * 2);

  // Binary output
  if (binaryValue.length > 0) {
    text(binaryValue, edgePadding, lineHeight * 3);

    // Final step before the pattern render
    push(); //enter isolated style
    textStyle(BOLD);
    text("Confirm (y)", edgePadding, lineHeight * (4 + binaryLineBreaks));
    pop(); //end isolated style
  }
}

/**
 * Renders the black and white binary pattern on the canvas.
 */
function renderPattern() {
  console.log("rendering pattern")
  for (let column = 0; column < columnCount; column++) {
    for (let row = 0; row < rowCount; row++) {
      // Get cell value (0 or 1)
      let cell = currentCells[column][row];

      // Convert cell value to get white (255) for alive (1) or black (0) for dead (0)
      fill(cell == 1 ? 255 : 0);
      rect(column * cellSize, row * cellSize, cellSize, cellSize);
    }
  }
}

// =========================================================================
// Input and Event Handlers
// =========================================================================

/**
 * Callback function for the HTML input field; updates the internal variable.
 */
function updateValue() {
  userInput = inputField.value();
}

function keyPressed() {
  if (keyCode === ENTER) {
    if (!renderingResult) {
      convertInputToBinary(userInput);
    }
  } else if (key === " ") {
    // Save a screenshot of the pattern.
    if (renderingResult) {
      let fileName = "iam_" + userInput.replace(/[^a-zA-Z0-9]/g, "_") + ".jpg"; // Clean up filename
      console.log("saving " + fileName);
      //prompt to save the canvas/pattern as an image
      save(fileName);
    }
  } else if (keyCode === DOWN_ARROW) {
    //mimic console history - feed values from a defined array (moving backwards/down)
    let newIndex = currentSearchIndex - 1;
    prefillOption(newIndex);
  } else if (keyCode === UP_ARROW) {
    //mimic console history - feed values from a defined array (moving forwards/up)
    let newIndex = currentSearchIndex + 1;
    prefillOption(newIndex);
  } else if (key === "y" && binaryValue.length > 0 && !renderingResult) {
    // check renderingResult to prevent key 'y' in new string causing premature render
    generatePattern();
    renderingResult = true;
    //hide the text input field otherwise the value will display through the pattern.
    inputField.hide();
    loop(); // Resume the loop to render the pattern once
  }
}


// =========================================================================
// Core Logic and Utility Functions
// =========================================================================

/**
 * Converts the user input string into its binary representation.
 */
function convertInputToBinary(stringValue) {
  let length = stringValue.length;
  // Reset binary value at start
  binaryValue = "";
  //and the line breaks stored.
  binaryLineBreaks = 0;

  for (let i = 0; i < length; i++) {
    //get ASCII value from character in string index.
    let asciiVal = stringValue[i].charCodeAt(0);

    // This will hold the binary for this ascii character
    let binaryString = "";
    let tempAscii = asciiVal;

    while (tempAscii > 0) {
      //check modulo - left over then a 1, no leftover is a 0
      binaryString += tempAscii % 2 == 1 ? "1" : "0";

      //reduce ascii value
      tempAscii = Math.floor(tempAscii / 2);
    }

    //reverse binary order
    // space between every character,
    binaryValue += reverse(binaryString) + " ";
    //and new line every fifth character - stops the binary falling off the edge of the canvas and wraps it to next line.
    if ((i + 1) % 5 === 0 && i < length - 1) {
      binaryValue += "\n";
      binaryLineBreaks++;
    }
  }
  //internal function to conversion function
  function reverse(input) {
    let reversed = input.split("").reverse().join("");
    return reversed;
  }
}

/**
 * Generates the final artwork, a binary pattern of black and white.
 */
function generatePattern() {
  // Loop through the binary string and use each '1' to set a cell's state.
  let binaryStringClean = binaryValue.replace(/[\s\n]/g, ""); // Remove spaces and newlines, regex.
  let binaryLength = binaryStringClean.length;
  //loop through every cell in the grid.
  let currentBinaryIndex = 0;

  //outer loop for columns
  for (let column = 0; column < columnCount; column++) {
    //inner loop for rows
    for (let row = 0; row < rowCount; row++) {
      currentCells[column][row] =
        binaryStringClean.charAt(currentBinaryIndex) === "1" ? 1 : 0;
      currentBinaryIndex++;
      //check index against length, reset if exceeded.
      if (currentBinaryIndex >= binaryLength) {
        currentBinaryIndex = 0;
      }
    }
  }
}

/**
 * Prefills the input field with a value from the predefined list,
 * mimicking command history navigation with UP/DOWN arrows.
 */
function prefillOption(index) {
  //check if given index is within range of the definitions.
  if (index >= 0 && index < definedDefinitions.length) {
    //increment the search index globally.
    currentSearchIndex = index;
    //update the input field value directly to the definition at the index.
    inputField.value(definedDefinitions[currentSearchIndex]);
    //update the global variable storing the input value.
    updateValue();
  } else {
    //when the given index is not within range
    //clear the input value.
    inputField.value("");
    //and update the global variable to keep aligned.
    updateValue();
    //reset the index so we start from the beginning on next search.
    currentSearchIndex = -1;
  }
}