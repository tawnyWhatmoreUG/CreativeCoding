/*
  Kaleidoscope
  Remixing from Pierre Rossel to include automatic mask movement instead of controls

  Assignment Week 6 Exercise 2: 
  Create a new program using an image that you have taken (on your phones etc), experiment with it using different image functions and what you have learned so far

  reference: https://blog.prossel.info/90-kaleidoscope/
  
  What it does:
  Extracts a circular sector from an image and reproduces it several times
  to create a kaleidoscope effect

*/


// the photo that'll be come the kaleidoscope
var img;

var nFaces = 12; // how many wedges make up the kaleidoscope (always even)

var xCenter = 200; // where the wedge center is horizontally in the source image
var yCenter = 200; // where the wedge center is vertically in the source image
var iRadius = 180; // how big the wedge is
var fRotation = 0; // which way the wedge is pointing
var grMask; // creates the wedge shape
var grTriangle; // holds the image piece we're cutting out
var masked; // the final wedge-shaped piece of image

// variables to make things move on their own
var xSpeed = 0; // how fast we're moving left/right
var ySpeed = 0; // how fast we're moving up/down
var rotationSpeed = 0; // how fast we're spinning

let canvasSize = 400;
let showSource = false; // toggle to show/hide the source image
let toggleButton; // button to control visibility


function preload() {
  img = loadImage("pergola.jpeg"); // load the image before setup
}
function setup() {
  createCanvas(canvasSize, canvasSize * 2); // make a tall canvas for source image + kaleidoscope
  grMask = createGraphics(iRadius, iRadius) // make a canvas for the wedge mask
  grTriangle = createGraphics(iRadius, iRadius) // make a canvas to extract the image piece
  
  // create the toggle button
  toggleButton = createButton('Hide Source');
  toggleButton.position(10, 10);
  toggleButton.mousePressed(toggleSource);
  
  // give everything some random starting speeds
  xSpeed = random(-2, 2); // start moving randomly left or right
  ySpeed = random(-2, 2); // start moving randomly up or down
  rotationSpeed = random(-0.02, 0.02); // start spinning randomly clockwise or counterclockwise
}


function toggleSource() {
  showSource = !showSource; // flip the toggle
  toggleButton.html(showSource ? 'Hide Source' : 'Show Source'); // update button text
}

function draw() {
  background(0); // clear to black each frame

  // move and rotate the wedge automatically
  xCenter += xSpeed; // shift the wedge left or right
  yCenter += ySpeed; // shift the wedge up or down
  fRotation += rotationSpeed; // spin the wedge
  
  // bounce off the edges so we dont lose the wedge
  if (xCenter < iRadius || xCenter > width - iRadius) { // if we hit left or right edge
    xSpeed = -xSpeed + random(-0.5, 0.5); // reverse direction and add a little randomness
  }
  if (yCenter < iRadius || yCenter > height/2 - iRadius) { // if we hit top or bottom edge
    ySpeed = -ySpeed + random(-0.5, 0.5); // reverse direction and add a little randomness
  }
  
  // 1% chance each frame to randomly change things up
  if (random() < 0.01) { // every 100 frames or so...
    xSpeed += random(-0.5, 0.5); // adjust the horizontal speed
    ySpeed += random(-0.5, 0.5); // adjust the vertical speed
    rotationSpeed += random(-0.01, 0.01); // adjust the spin speed

    // don't let things get too mental, constrain the speed 
    xSpeed = constrain(xSpeed, -3, 3); // keep horizontal speed within reasonable range
    ySpeed = constrain(ySpeed, -3, 3); // keep vertical speed within reasonable range
    rotationSpeed = constrain(rotationSpeed, -0.05, 0.05); // keep spin speed within reasonable range
  }

  var fAngle = TWO_PI / nFaces; // calculate the angle of each wedge using the number of faces. 2pi is 360 degrees

  // only draw the source image section if showSource is true
  // the kaleidoscope will still work even when the source isn't drawn because it uses the original image as its reference.
  if (showSource) {
    push(); // save the current drawing state
    {
      translate(0, height / 2); // move to the top half of the canvas
      image(img, 0, 0, width, height/2); // draw the source image to fit the top half
      // draw the wedge outline on the source image so we can see what we're extracting
      noFill(); // just an outline, no fill
      stroke(255); // white lines
      translate(xCenter, yCenter); // move to where the wedge center is
      rotate(fRotation); // rotate to the wedge's angle
      arc(0, 0, 2*iRadius, 2*iRadius, 0, fAngle); // draw the curved edge of the wedge
      line(0, 0, iRadius, 0); // draw the first straight edge
      rotate(fAngle); // rotate to the other side
      line(0, 0, iRadius, 0); // draw the second straight edge
      //thats the wedge drawn
    }
    pop(); // revert to the previous drawing state
  }

  // make the wedge-shaped image mask
  grMask.clear() // start fresh
  grMask.arc(0, 0, 2*iRadius, 2*iRadius, 0, fAngle + 0.008); // draw the wedge shape (tiny bit extra to avoid gaps)

  // cut out that wedge from the source image
  grTriangle.push(); // save the graphics state
  grTriangle.rotate(-fRotation); // undo the rotation so we grab from the right spot
  grTriangle.translate(-xCenter, -yCenter); // move so the center is at origin
  grTriangle.image(img, 0, 0, width, height/2); // draw the image
  grTriangle.pop() // restore the graphics state

  masked = grTriangle.get() // grab what we just drew
  masked.mask(grMask) // cut it into a wedge shape using the mask
  
  // now draw the kaleidoscope by repeating the wedge
  smooth(); // this smooth function makes the edges less jagged when rotating/scaling
  push(); // save drawing state
  {
    translate(width/2, height/4); // move to center of kaleidoscope area
    for (let i = 0; i < nFaces/2; i++) { // loop through half the wedges (we mirror each one)
      image(masked, 0, 0); // draw the wedge
      scale(1, -1); // flip vertically for the mirror effect
      image(masked, 0, 0); // draw the flipped wedge
      scale(1, -1); // flip back to normal
      rotate(2 * fAngle); // rotate to the next pair of wedges
    }
  }
  pop(); // revert to the previous drawing state



}
