/**
 * Pumpkin Patch
 * This sketch contains a function that renders a pumpkin or a ghost based on given parameters.
 * The user can click on the canvas to place pumpkins on the ground area and ghosts in the sky.
 * 
 */

let canvasSize = 400; // Set the size of our canvas to 400x400 pixels
let pumpkins = []; // Create an empty array to store pumpkin objects
let ghosts = []; // Create an empty array to store ghost objects

function setup() {
  createCanvas(canvasSize, canvasSize); // Create a square canvas using our canvas size
}

function draw() {
  noStroke(); // Turn off outlines for shapes
  background(0, 15, 70); // Paint the background dark blue sky

  // Draw ground
  fill(30, 150, 40); // Set fill color to green
  rect(0, canvasSize - 50, canvasSize, 50); // Draw rectangle for the ground

  //draw all pumpkins in array
  for (let i = 0; i < pumpkins.length; i++) { // Loop through each pumpkin in the array
    let pumpkin = pumpkins[i]; // Get the current pumpkin object
    drawPumpkin(pumpkin.x, pumpkin.y, pumpkin.size); // Draw this pumpkin at its position and size
  }

  //draw all ghosts in array
  for (let i = 0; i < ghosts.length; i++) { // Loop through each ghost in the array
    let ghost = ghosts[i]; // Get the current ghost object
    drawGhost(ghost.x, ghost.y, ghost.size); // Draw this ghost at its position and size
  }
}

function mousePressed() {
  //if click is within ground area. 
 if (mouseY > canvasSize - 50) { // Check if mouse click is in the ground area
  //random pumpkin size
  let pumpkinSize = random(20, 80); // Pick a random size for the new pumpkin
  //mouse x within ground area
  let pumpkinX = constrain(mouseX, 50, canvasSize - 50); // Keep pumpkin x position within ground bounds
  // place pumpkin within ground area based on mouse Y
  let groundTop = canvasSize - 50; // Calculate y position of the top of the ground
  let groundBottom = canvasSize; // Calculate y position of the bottom of the ground
  // allow pumpkins to extend slightly above ground top, but keep bottom within ground
  let pumpkinY = constrain(mouseY, groundTop, groundBottom - pumpkinSize / 2); // Keep pumpkin within ground area

  //add new pumpkin to array
  pumpkins.push({ x: pumpkinX, y: pumpkinY, size: pumpkinSize }); // Add the new pumpkin to our array
}

//if click is within the sky area
if (mouseY <= canvasSize - 50) { // Check if mouse click is in the sky area
  //random ghost size
  let ghostSize = random(30, 70); // Pick a random size for the new ghost
  //mouse x within sky area
  let ghostX = constrain(mouseX, 50, canvasSize - 50); // Keep ghost x position within bounds
  // place ghost within sky area based on mouse Y
  let skyTop = 0; // Calculate y position of the top of the canvas
  let skyBottom = canvasSize - 50; // Calculate y position of the bottom of the sky area
  // allow ghosts to extend slightly below sky bottom, but keep top within canvas
  let ghostY = constrain(mouseY, skyTop + ghostSize / 2, skyBottom); // Keep ghost within sky area
  ghosts.push({ x: ghostX, y: ghostY, size: ghostSize }); // Add the new ghost to our array
}
}

function drawPumpkin(x, y, size) {
  push(); // Save the current drawing settings
  translate(x, y); // Move the drawing origin to the pumpkin position

  // Pumpkin body (multiple overlapping circles for ridges)
  noStroke(); // Turn off outlines
  fill(255, 140, 0); // Set fill color to orange

  let numRidges = 5; // Set how many vertical ridges the pumpkin will have
  for (let i = 0; i < numRidges; i++) { // Loop through each ridge
    let offsetX = map(i, 0, numRidges - 1, -size * 0.4, size * 0.4); // Calculate horizontal position for this ridge
    ellipse(offsetX, 0, size * 0.5, size); // Draw an oval for this ridge
  }

  // Darker shading on sides
  fill(200, 100, 0, 100); // Set fill to darker orange with transparency
  ellipse(-size * 0.3, 0, size * 0.3, size * 0.8); // Draw shadow on left side
  ellipse(size * 0.3, 0, size * 0.3, size * 0.8); // Draw shadow on right side

  // Stem
  fill(101, 67, 33); // Set fill color to brown
  rect(-size * 0.08, -size * 0.6, size * 0.16, size * 0.25); // Draw a small rectangle for the stem

  // Cute face, only appears on larger pumpkins
  if (size > 55) {
    fill(40, 30, 10); // Set fill color to dark brown/black
    // Eyes
    triangle( // Draw left eye as a triangle
      -size * 0.2,
      -size * 0.1,
      -size * 0.25,
      size * 0.05,
      -size * 0.15,
      size * 0.05
    );
    triangle( // Draw right eye as a triangle
      size * 0.2,
      -size * 0.1,
      size * 0.15,
      size * 0.05,
      size * 0.25,
      size * 0.05
    );
    // Mouth
    arc(0, size * 0.15, size * 0.3, size * 0.2, 0, PI); // Draw a smiling mouth as an arc
  }

  pop(); // Restore the previous drawing settings
}

function drawGhost(x, y, size) {
  push(); // Save the current drawing settings
  translate(x, y); // Move the drawing origin to the ghost position

  // Ghost body
  noStroke(); // Turn off outlines
  fill(255, 255, 255, 255); // Set fill color to white
  ellipse(0, 0, size * 0.8, size); // Draw the main round body of the ghost

//ghost bottom 
rectMode(CENTER); // Set rectangle drawing mode to center
rect(0, size * 0.25, size * 0.8, size * 0.5); // Draw the bottom part of the ghost body

  // Eyes
  fill(0); // Set fill color to black
  ellipse(-size * 0.15, -size * 0.1, size * 0.1, size * 0.1); // Draw left eye
  ellipse(size * 0.15, -size * 0.1, size * 0.1, size * 0.1); // Draw right eye

  // Mouth (open circle)
  noFill(); // Turn off fill for the mouth
  stroke(0); // Set stroke color to black
  strokeWeight(2); // Set line thickness
  arc(0, size * 0.1, size * 0.2, size * 0.1, 0, PI); // Draw mouth as a curved line
  
  pop(); // Restore the previous drawing settings
}
