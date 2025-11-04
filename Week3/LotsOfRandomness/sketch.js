
/**
* This program uses random in all sorts of ways. random for visuals like colours, shapes, sizes, emojis, characters. it uses random for probibilites too in conditional statements. 
* 
* With this script you can click on the screen to pause and export the state of the canvas to a png. then you could go mint an NFT from it. #2021 babay!
*
* Theres also a little easter egg where if you click a unicorn it'll neigh. 
**/
let canvasSize = 600;
let canvasMiddle = canvasSize / 2;
let shapeDrawingArea = canvasSize;
//boolean to track if the drawing loop is active, so we can toggle the pause/play on and off.
let isDrawing = true;
//when and if a unicorn is drawn, the coordinates will be stored here.
//its small easter egg so that when a unicorn is clicked, p5 sound will be used to play a neigh.
let unicornCoordinates = [];

function setup() {
  createCanvas(canvasSize, canvasSize);
  // lower the frame rate to slow down the draw loop, see more patterns then.
  frameRate(4);
}

function draw() {
  //random background colour within a min/max range.
  background(random(20, 255), random(100, 200), random(150, 255));
  //clear unicorn coordinates at the start of each frame
  unicornCoordinates = [];
  //render all the randomness
  fillWithShapes();
  //check if drawing is paused to show the save button.
  if (!isDrawing) {
    //show an input to name the masterpiece artwork and save as png.
    let saveButton = createButton("Save Your Picasso");
    saveButton.mousePressed(() => {
      let artworkName = prompt("Enter a name for your artwork:");
      if (artworkName) {
        //p5 native function to save the canvas as a png
        saveCanvas(artworkName, "png");
      }
    });
  } else {
    //remove the button if drawing is active, otherwise we get a bunch of duplicates.
    let buttons = selectAll("button");
    for (let btn of buttons) {
      btn.remove();
    }
  }
}

function mouseClicked() {
  //toggle drawing on and off with mouse click
  if (isDrawing) {
    //stop the draw loop to pause rendering.
    noLoop();
    isDrawing = false;
  } else {
    //drawing is paused.
    //first see if theres unicorn coordinates and if the mouse is within range.
    if (unicornCoordinates.length > 0) {
      let unicornClicked = false;
      //loop through the coordinates to see if the mouse was close when clicked.
      for (let coords of unicornCoordinates) {
        //calculate the distance
        let distanceFromMouse = dist(mouseX, mouseY, coords[0], coords[1]);
        //is the mouse click within 20 pixels of a unicorn
        if (distanceFromMouse < 20) {
          //play a neigh sound using p5 sound library
          let neighSound = loadSound(
            "https://cdn.pixabay.com/download/audio/2024/11/07/audio_167d994a73.mp3",
            () => {
              neighSound.play();
            }
          );
          unicornClicked = true;
          break; //finish loop - only play one sound per click
        }
      }

      if (!unicornClicked) {
        //if no unicorn was clicked, continue drawing new frames
        loop();
        isDrawing = true;
      }
    } else {
      //if no unicorns rendered, continue drawing new frames
      loop();
      isDrawing = true;
    }
  }
}

function fillWithShapes() {
  //set up text properties
  //custom fonts defined in index.html headers, loaded from google fonts. Selecting a random one each time.
  textFont(random(["Monoton", "Spicy Rice", "UnifrakturMaguntia"]));

  //random stroke
  //random divisor to effect the grid size and the amount of shapes that'll be drawn.
  let rowDivisor = random(shapeDrawingArea / 20, shapeDrawingArea / 12);
  //calculate how many shapes fit in the drawing area
  let shapesPerRow = shapeDrawingArea / rowDivisor;
  //calculate the rows in the same way.
  let rows = shapeDrawingArea / rowDivisor;

  //loop creates the shapes.
  for (let x = 0; x < rows; x++) {
    for (let y = 0; y < shapesPerRow; y++) {
      //random size for the shapes within a range.
      let shapeSize = random(shapeDrawingArea / 20, shapeDrawingArea / 12);
      //50/50 random chance to render a shape, otherwise will be blank within the grid.
      if (random() < 0.5) {
        //random coloured stroke or no stroke
        if (random() < 0.5) {
          noStroke();
        } else {
          stroke(random(255), random(255), random(255));
          //if we have a stroke, then we can randomise the weight too sure.
          strokeWeight(random(1, 4));
        }
        //random fill colours
        fill(random(255), random(255), random(255));

        //randomise the shape that is drawn, circle or square
        if (random() < 0.5) {
          rect(x * shapeSize, y * shapeSize, shapeSize, shapeSize);
        } else {
          ellipse(
            x * shapeSize + shapeSize / 2,
            y * shapeSize + shapeSize / 2,
            shapeSize
          );
        }
      }

      //random chance to draw a letter number or symbol in the grid space too.
      if (random() < 0.3) {
        //a string of characters to randomly select from.
        let characters =
          "AaBbCcDdEeFfgGHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789!@£$%^&*()";
        //array of emojis to randomly select. with array you can use random function directly on it.
        let emojis = [
          "🌸",
          "🦋",
          "✨",
          "🌙",
          "🍃",
          "🌺",
          "🎭",
          "🔮",
          "🌊",
          "🕊️",
          "🌈",
          "🍄",
          "🎨",
          "🦚",
          "🌟",
          "🧿",
          "🌷",
          "🦢",
          "🎪",
          "🌴",
          "🍯",
          "🎀",
          "🌻",
          "🍑",
          "🎭",
          "🌵",
          "🍊",
          "🎯",
          "🌹",
          "🎪",
        ];
        //randomly pick either an emoji or a character, a greater chance for emoji.
        let randomChar =
          random() < 0.7
            ? random(emojis)
            : characters.charAt(floor(random(characters.length)));
        //set a random dark fill colour.
        fill(random(0, 50), random(0, 75), random(0, 100));
        //text half the size of the grid shape.
        textSize(shapeSize / 2);
        //center it in the grid space.
        textAlign(CENTER, CENTER);
        //draw the character
        text(
          randomChar,
          x * shapeSize + shapeSize / 2,
          y * shapeSize + shapeSize / 2
        );
      }

      //small chance to draw a unicorn emoji, has an easter egg if clicked on.
      if (random() < 0.05) {
        text(
          "🦄",
          x * shapeSize + shapeSize / 2,
          y * shapeSize + shapeSize / 2
        );
        //store the unicorn coordinates for the easter egg click event
        unicornCoordinates.push([
          x * shapeSize + shapeSize / 2,
          y * shapeSize + shapeSize / 2,
        ]);
      }
    }
  }
}
