/**
 * This sketch takes user key input and mouse input and muddles up inputted letters. 
 * When the shift and control keys pressed a muddling function is called. 
 * When the left mouse is pressed, the size of the text is incremented
 * When the right mouse is pressed, the size of the text is decremented.
 * 
 * Found some interactivity examples from here, threw in a bunch of methods from this. 
 * https://archive.p5js.org/learn/interactivity.html
 */

// Global variables for storing state
let message = "Hello Muddler"; // The text message being displayed and modified
let textSizeValue = 32; // Current size of the main text
let rectAngleWidth = 50; // Width of the vertical rectangles
let bgColor = '#2d5f7a'; // main background
let circleFill = '#ffc8b4'; // peachy circles
let rectColor = '#f4a261'; // orange rectangles
let textColor = '#1a1a1a'; // Dark grey for main text
let instructionColor = '#2c2c2c'; // Dark grey for instruction text

// Setup runs once at the start
function setup() {
  createCanvas(400, 400); // Create a 400x400 pixel canvas
}

// Draw runs continuously (about 60 times per second)
function draw() {
  noStroke(); // Turn off outlines for shapes
  background(bgColor); // Clear the canvas with background color

  // Calculate closest divisible x coordinate based on rectAngleWidth
  // This creates a snapping effect for the rectangles
  let closestX = Math.round(mouseX / rectAngleWidth) * rectAngleWidth;

  // Draw background rectangles based on where the mouse is (top / middle / bottom thirds)
  fill(rectColor);
  if (mouseY < height / 3) {
    rect(closestX, 0, 33, height / 3);  // Top third
  }
  else if (mouseY < (height / 3) * 2) {
    rect(closestX, height / 3, 33, height / 3); // Middle third
  }
  else {
    rect(closestX, (height / 3) * 2, 33, height / 3); // Bottom third
  }

  // Draw four circles at different vertical positions
  // Their horizontal position follows the mouse X position
  let circleSize = height / 4;

  fill(circleFill); // Set circle fill color
  ellipse(mouseX, circleSize / 2, circleSize, circleSize);   // First circle
  ellipse(mouseX / 2, circleSize * 1.5, circleSize, circleSize); // Second circle (half mouse speed)
  ellipse(mouseX * 2, circleSize * 2.5, circleSize, circleSize); // Third circle (double mouse speed)
  ellipse(mouseX/0.75, circleSize * 3.5, circleSize, circleSize); // Fourth circle (faster movement)

  // Draw the main text message in the center
  fill(textColor);
  textSize(textSizeValue);
  textAlign(CENTER, CENTER);
  text(message, width / 2, height / 2);

  // Handle continuous backspace deletion
  // Only delete once every 12 frames to avoid deleting too quickly
  if (frameCount % 12 === 0) {
    if (keyIsDown(BACKSPACE)) {
      message = message.slice(0, -1); // Remove last character
    }
  }


  // Draw instruction text at the bottom
  // Use push/pop to isolate these style changes
  push();
  fill(instructionColor);
  textSize(12);
  textAlign(CENTER, BOTTOM);
  text("enter some text using your keyboard\nPress Shift + Control to Muddle Letters\nLeft Click to Increase Text Size\nRight Click to Decrease Text Size", width / 2, height - 10);
  pop(); // Restore previous drawing settings
}

// Muddle the message by shifting character codes backward (when Control is pressed)
function controlMuddle() { 
  let muddledMessage = "";
  // Loop through each character in the message
  for (let i = 0; i < message.length; i++) {
    let charCode = message.charCodeAt(i); // Get ASCII/Unicode value
    // Muddle by shifting character codes by a random value between -5 and 0
    let muddledCharCode = charCode + floor(random(-5, 0));
    muddledMessage += String.fromCharCode(muddledCharCode); // Convert back to character
  }
  message = muddledMessage; // Update the message
}

// Muddle the message by shifting character codes forward (when Shift is pressed)
function shiftMuddle() { 
  let muddledMessage = "";
  // Loop through each character in the message
  for (let i = 0; i < message.length; i++) {
    let charCode = message.charCodeAt(i); // Get ASCII/Unicode value
    // Muddle by shifting character codes by a random value between 0 and 5
    let muddledCharCode = charCode + floor(random(0, 5));
    muddledMessage += String.fromCharCode(muddledCharCode); // Convert back to character
  }
  message = muddledMessage; // Update the message
}

// Called once when any key is pressed
function keyPressed() {
  // Add typed characters to the message
  if (key.length === 1) { // Only consider single character keys, keep simple.
    message += key;
  }

  // Check for Shift or Control keys and apply muddling effects
  if (keyIsDown(SHIFT)) {
     shiftMuddle(); // Muddle forward
  } else if (keyIsDown(CONTROL)) {
     controlMuddle(); // Muddle backward
  }

  // Handle backspace key - remove last character from message
  if (keyCode === BACKSPACE) {
    message = message.slice(0, -1);
  }
}

// Called once when mouse button is pressed
function mousePressed() {
    textSizeValue = 50; // Temporarily increase text size
}

// Called once when mouse button is released
function mouseReleased() {
    textSizeValue = 32; // Reset text size back to normal
}

