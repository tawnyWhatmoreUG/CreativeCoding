/**
 * Wrong Lines
 * Reference:  https://editor.p5js.org/KevinWorkman/sketches/O4Hm1Apln
 * 
 * Remixed by:
 * Curving the lines at the vertices with curveVertex()
 * Reducing the range of randomness for the y axis
 * Increasing the line spacing to further smooth the lines and have less vertices.
 * Added additional loop using shades of grey. 
 */
const margin = 25;
// Starting grey value for the lines
const grey = 64;

function setup() {
  createCanvas(600, 800);
  noLoop();
  strokeWeight(2);
}

function draw() {
  //dark grey background
  background(32);
  //initial stroke set to white for the rectangle border.
  stroke(255);
  //no fill for rectangle. 
  noFill();
  rect(margin, margin, width - margin * 2, height - margin * 2);



  //calculating the number of lines that will fit on the canvas.
  //subtracting the margins from the height top and bottom (*2)
  let numberOfLines = height - margin * 2;

  //loops through shades of grey incrementing to lighten until white is reached.
  for(let shade = grey; shade <= 255; shade += 32) {
    //many grey lines. 
    stroke(shade);
    //original loop to draw lines every 25 pixels down the canvas.
    for (let y = margin * 4; y < numberOfLines; y += 25) {
      drawLine(y);
    }
  }


}

/**
 * Draws a curvy line at a specific y position. 
 * The curviness depends upon the range calculation within the function
 * @param {*} lineY  The y position to draw the line at.
 */
function drawLine(lineY) {
  //syntax map(value, start1, stop1, start2, stop2)
  //reversed the start2 and stop2 values so the range decreases as the y increases.
  //that means the lines at the top are more curvey and the ones at the bottom are more straight. 
  const range = map(lineY, margin * 2, height - margin, 25, 0);
  const lineSpacing = 30;

  //reference: https://archive.p5js.org/learn/curves.html
  //creating the line.
  beginShape();
  //loops through the vertices of the line. 
  for (let x = margin; x <= width - margin; x += lineSpacing) {
    const y = lineY + random(-range, range);
    curveVertex(x, y);

  }
  endShape();
}