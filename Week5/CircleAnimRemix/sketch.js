/**
 * Circle Animation Remix
 * Remixed by: 
 * - changing the size of the circles based on a sine wave (sin()) to createa pulsing/wave effect.
 * - added 3 different variations of the animation that changes every few seconds. 
 * - changed the colours and strokes a little.
 */

//spacing between the circles
let spacing = 30;

//frames per second
let fps = 24;

//tracks how many frames have ellapsed. this is used to change between animations. 
let framesEllapsed = 0;
//the incrementer to determine how many sseconds each animation runs for.
let frameBreakIncrement = 4;

function setup() {
  createCanvas(300, 300);
  // Set the frame rate
  frameRate(fps);
  stroke(255)
  strokeWeight(2);
  noFill();
}

function draw() {

  background(32);
  //each call of the draw function increments the framesEllapsed counter by 1.
  framesEllapsed += 1

  //two loops to draw a grid of circles. spacing variable value is used as the loop incrementer. 
  for (let circleY = spacing; circleY <= width - spacing; circleY += spacing) {

    for (let circleX = spacing; circleX <= height - spacing; circleX += spacing) {
      //first animation variant
      if (framesEllapsed <= fps * frameBreakIncrement) {
        //wave effect y 
        console.log("wavey")
        //this animation uses the cos function and the circleY position to create a vertical wave effect by changing the size of the circle.
        circle(circleX, circleY, spacing + cos(frameCount * 0.001 * circleY) * 20);
        //second animation variant
      } else if (framesEllapsed > fps * frameBreakIncrement && framesEllapsed < fps * (frameBreakIncrement*2)) {
        //pulsing. 
        console.log("pulsing")
        //this one uses the sine function but doesn't specify x or y, so affects all and looks like a pulsing effect. 
        circle(circleX, circleY, spacing + sin(frameCount * 0.1) * 20);
      } //third animation variant
      else {
        //wave effect x 
        console.log("wavex")
        //this one uses the sin function and the circle x position to create a horizontal wave effect by changing the size of the circle.
        circle(circleX, circleY, spacing + sin(frameCount * 0.001 * circleX) * 20);
        
      }
    }
  }

  //reset framesEllapsed after 3rd variant.
  if (framesEllapsed > fps * (frameBreakIncrement * 3)) {
    //resetting the ellapsed frames counter to 0 means the animation cycle will being again, so loops nicely. 
    framesEllapsed = 0
        console.log("frames reset" + framesEllapsed)

  }
}

/*
// this reference was a playgorund for visualising how the cos and sin functions worked. 
//reference: https://p5js.org/reference/p5/sin/
function draw() {
  // Calculate the coordinates.
  let x = 10 * cos(frameCount * 0.1) + 150;
  let y = 60 * sin(frameCount * 0.2) + 150;

  // Draw the point.
  point(x, y);
}*/
