/**
 * 
 * This circle is very emotional.
 * It likes when you are close, and gets sad when you are far away.
 * Stay away for too long and it will get jittery. 
 * Stay close for a while and it will begin to glow. 
 * If you stay away for too long, it may just fade away. 
 * 
 * Move your mouse around to see how it reacts.
 */
let circleSize = 150;
let circle;
let moodColour;
let circleColour;

let timeLeftAlone = 0;
let moodAlpha = 255;

function setup() {
  createCanvas(400, 400);
  circle = createVector(width / 2, height / 2);
  moodColour = color(200, 200, 255);
  circleColour = color(255, 255, 255);
}

function draw() {
  noStroke();
  background(0);
  fill(moodColour);
  rect(0, 0, width, height);

  evaluateBackgroundColor();
  fill(circleColour);
  ellipse(circle.x, circle.y, circleSize);
  evaluateCircleState();
}



/**
 * This function evaluates the background color based on the mouse position.
 * It uses the map function for smooth colour transitions. 
 * The closer the mouse is to the circle, the warmer the colour.
 * The further away,the cooler the colour.
 * If the mouse is idle for too long, the background will darken.
 * If the mouse is close for too long, the background will lighten.
 */
function evaluateBackgroundColor() {
//calculate the distance from the mouse to the circle. 
//cap it at the size of. the canvas 
  let distanceFromCircle = dist(mouseX, mouseY, circle.x, circle.y);
  distanceFromCircle = constrain(distanceFromCircle, 0, width);

  //map the distance from the circle, to a cool colour, we'll do it 3 times for rgb
  let r = map(distanceFromCircle, 0, width, 255, 120); //red: max 255, min 120
  let g = map(distanceFromCircle, 0, width, 200, 150); //green: max 200, min 150
  let b = map(distanceFromCircle, 0, width, 130, 255); //blue: max 130, min 255

  //set the background colour
  moodColour = color(r, g, b, moodAlpha);
  background(moodColour);
}

/**
 * This function evaluates the state of the circle based on the mouse position and time left alone.
 * If the mouse is close to the circle, it will grow and brighten.
 * If the mouse is far from the circle, it will shrink and darken.
 * If the mouse is left alone for too long, it will start to jitter and eventually fade away.
 * If the mouse is close for too long, it will glow and grow larger.
 */
function evaluateCircleState() {
  let distanceFromCircle = dist(mouseX, mouseY, circle.x, circle.y);
  distanceFromCircle = constrain(distanceFromCircle, 0, width);

  // If the mouse is close to the circle
  if (distanceFromCircle < 100) {
    // Decrease time left alone
    circleSize = min(300, circleSize + 1); // Grow the circle
    let alpha = map(distanceFromCircle, 0, 100, 255, 150);
    circleColour = color(255, 255, 255, alpha); // Brighten the circle
    timeLeftAlone = max(0, timeLeftAlone - 10); // Decrease time left alone
  } else {
    timeLeftAlone += 1; // Increase time left alone
    circleSize = max(50, circleSize - 1); // Shrink the circle
    let alpha = map(distanceFromCircle, 100 , width, 150, 50);
    circleColour = color(255, 255, 255, alpha);

    //start bouncing up and down. 
  
  } // Darken the circle

  // If left alone for too long, start jittering
  if (timeLeftAlone > 300) {
    let jitterAmount = map(max(timeLeftAlone - 300, 0), 300, 600, 0, 20);
    circle.x = width / 2 + random(-jitterAmount, jitterAmount);
    circle.y = height / 2 + random(-jitterAmount, jitterAmount);
  } else {
    circle.x = width / 2;
    circle.y = height / 2;
  }

  // If left alone for too long, start fading away
  if (timeLeftAlone > 600) {
    circleSize = max(0, circleSize - 1); // Shrink the circle to nothing
  }

}

function mousePressed() {
  timeLeftAlone = max(0, timeLeftAlone - 60);  //clicking decreases time left a bit quicker 

}