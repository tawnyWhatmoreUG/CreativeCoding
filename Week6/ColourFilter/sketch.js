/*
Colour Filter
Week 6 Exercise 3: Take an other image using your phone etc and bring it into this sketch
https://editor.p5js.org/KevinWorkman/sketches/9rh8yRToQLinks 
Then experiment with getFilterColor() to create your own filters

What it does:
Loads an image and applies a color filter to it by examining each pixel and changing its color based on the filter logic in getFilterColor()
*/

let img; //where our image is loaded into
let originalImg; //keep a copy of the original image

let filterCount = 0; // to cycle through different filters when user clicks

function preload() {
  // load the image before setup
  originalImg = loadImage("officebaby.jpg");
}

function setup() {
  createCanvas(600, 600);

  // Create a copy of the original image to work with
  img = originalImg.get();

  //no continuous drawing computations, just  call the draw function once
  noLoop();
}

function draw() {
  //load in the pixel data from the image
  img.loadPixels();

  // Loop through every pixel in the image, y first
  for (let y = 0; y < img.height; y++) {
    //then x axis
    for (let x = 0; x < img.width; x++) {
      //This way of fetching the pixel colour was causing a lot of lag.
      //in the filter reference below i noticed they accessed the pixel array directly with a funky formula.
      //Reference: https://idmnyu.github.io/p5.js-image/Manipulating_Pixels/index.html

      /////old way - wasn't performant --
      //const colour = img.get(x, y); // get the color of the pixel at (x, y)

      const index = (x + y * img.width) * 4; // Calculate the index for the pixel array

      // Get original color from pixels array
      const r = img.pixels[index]; // red value
      const g = img.pixels[index + 1]; // green value
      const b = img.pixels[index + 2]; // blue value

      //declare filtercolour, later to be assigned based on filter count.
      let filterColor;
      //determine which filter to apply based on filter count
      if (filterCount == 0) {
        //this one is a greyscale posterise effect.
        filterColor = getGreyFilterColor(r, g, b);
      } else if (filterCount == 1) {
        //this is a negative/colour invert effect
        filterColor = getNegativeFilterColor(r, g, b);
      } else if (filterCount == 2) {
        //this swaps the blue and red channel
        filterColor = getRedBlueSwapFilterColor(r, g, b);
      } else {
        //this is a high contrast/posterise sepia effect
        filterColor = getHighContrastSepia(r, g, b);
      }

      //based on the filter colours returned from the functions, we can assign the new colour values back to the pixel array.
      let newRed = red(filterColor);
      let newGreen = green(filterColor);
      let newBlue = blue(filterColor);
      img.set(x, y, color(newRed, newGreen, newBlue));
    }
  }

  //then apply the red eye bar effect on top
  applyEyeBar();

  //all that new pixel data that we set to the image.
  img.updatePixels();

  // Now draw the modified image in the canvas
  image(img, 0, 0);
}

//Image Filters
//some filter samples: https://idmnyu.github.io/p5.js-image/Filters/index.html

// This function is where the magic happens!
// It takes the original r, g, b, color
// and uses that to calculate a "filter" color.
function getGreyFilterColor(r, g, b) {
  const brightness = (r + g + b) / 3;
  if (brightness < 64) {
    return color(0, 0, 0); // Pure black shadows
  } else if (brightness < 96) {
    return color(64, 64, 64); //grey shadows as a buffer between negative and pure black
  } else if (brightness < 128) {
    return color(128, 128, 128); // midtones
  } else if (brightness < 192) {
    return color(192, 192, 192); // highlights
  } else {
    return color(255, 255, 255); // pure white highlights
  }
}

function applyEyeBar() {
  //pixels where the eyes are - figured out through trail and error
  const startPixel = 200;
  const endPixel = 320;
  const eyeYStart = 275;
  const eyeYEnd = 325;
  // Loop through the pixels in the eye area and apply a red bar
  for (let y = eyeYStart; y < eyeYEnd; y++) {
    for (let x = startPixel; x < endPixel; x++) {
      //.get was causing lag, using the pixel array directly instead.
      //let currentRed = img.get(x, y)[0]; // get the current red value

      const index = (x + y * img.width) * 4; // Calculate the index for the pixel array
      let currentRed = img.pixels[index]; // red value

      //set the pixel to a bright red, but keep it within the valid 0-255 range
      img.set(x, y, color(constrain(currentRed + 50, 0, 255), 0, 0)); // set to red
    }
  }
}

// Negative filter function
function getNegativeFilterColor(r, g, b) {
  return color(255 - r, 255 - g, 255 - b);
}

// Red and Blue offset filter function
function getRedBlueSwapFilterColor(r, g, b) {
  return color(b, g, r); // Swap red and blue channels
}

function getHighContrastSepia(r, g, b) {
  const brightness = (r + g + b) / 3;
  if (brightness < 64) {
    return color(0, 0, 0); // Pure black shadows
  } else {
    //sepia - from reference above.
    var tr = r * 0.393 + g * 0.769 + b * 0.189;
    var tg = r * 0.349 + g * 0.686 + b * 0.168;
    var tb = r * 0.272 + g * 0.534 + b * 0.131;
    return color(tr, tg, tb);
  }
}

function mousePressed() {
  if (filterCount == 3) {
    filterCount = 0;
  } else {
    filterCount += 1;
  }
  // reset the image to the original then redraw canvas, otherwise the effects will compound on each other.
  img = originalImg.get();
  redraw();
}
