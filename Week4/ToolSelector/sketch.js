canvasWidth = 400;
canvasHeight = 700;

let selectedTool;
let selectedClicks = 0;
let largeEmoji;
let largeEmojiText;
let occupation = "";

let toolkitLength = 300;
let tools = ["🪏", "🪚", "🪛", "🔧", "🔨", "🪓"];
let verbs = ["dig", "cut", "twist", "pull", "bang", "chop"];
function setup() {
  createCanvas(canvasWidth, canvasHeight);
}

function draw() {
  noStroke();
  let toolCellSize = toolkitLength / tools.length;
  let toolStartCoord = width / 2 - toolkitLength / 2 + toolCellSize / 3;
  background(220, 250, 255);
  textSize(24);
  if (occupation === "") {
    text("Select a tool", width / 2, 50);
  } else {
    text("You're a " + occupation, width / 2, 50);
  }
  renderBackgroundEmoji();
  fill(40, 60, 70);
  rect(width / 2 - toolkitLength / 2, height - 50, toolkitLength, 40, 10);
  textSize(28);
  textAlign(CENTER, CENTER);
  for (let i = 0; i < tools.length; i++) {
    let toolX = toolStartCoord + toolCellSize * (i + 0.2);
    let toolY = height - 30;
    if (selectedTool === i) {
      fill(80, 100, 120);
      rect(toolX - 20, toolY - 20, 40, 40, 5);
    }
    fill(90, 110, 110);
    text(tools[i], toolX, toolY);
  }

  if (selectedTool !== null) {
    textSize(100);
    text(tools[selectedTool], mouseX, mouseY);
    if (mouseIsPressed) {
      let randomX = random(width);
      let randomY = random(height);
      fill(150, 0, 0);
      textSize(32);
      console.log(verbs[selectedTool]);

      if (frameCount % 5 === 0) {
        text(verbs[selectedTool], randomX, randomY);
      }
    }

}
}

function renderBackgroundEmoji() {
  textSize(50);
  textAlign(CENTER, CENTER);
  
  // Only process if a tool is selected
  if (selectedTool !== null && selectedTool !== undefined) {
    if (tools[selectedTool] == "🪏") {
      //a spade - you're a spud farmer
      largeEmojiText = "🥔";
      occupation = "spud farmer";
    } else if (tools[selectedTool] == "🪚") {
      //a saw - you're a carpenter
      largeEmojiText = "🪵";
      occupation = "carpenter";
    } else if (tools[selectedTool] == "🪛") {
      //a screwdriver - you're a mechanic
      largeEmojiText = "🚗";
      occupation = "mechanic";
    } else if (tools[selectedTool] == "🔧") {
      //a wrench - you're a plumber
      largeEmojiText = "🚽";
      occupation = "plumber";
    } else if (tools[selectedTool] == "🔨") {
      //a hammer - you're a builder
      largeEmojiText = "🧱";
      occupation = "builder";
    } else if (tools[selectedTool] == "🪓") {
      //a hatchet - you're a choppy choppy axe man
      largeEmojiText = "🌲";
      occupation = "woodcutter";
    }
  } else {
    // No tool selected, reset values
    largeEmojiText = "";
    occupation = "";
    return; // Exit early, don't display any emojis
  }
  //calculate how many emojis to show based on clicks
  let startingEmojis = 3;
  let totalEmojis = max(0, startingEmojis - selectedClicks);
  textSize(100);
  
  // Build the emoji string by repeating the single emoji
  let displayText = "";
  for (let i = 0; i < totalEmojis; i++) {
    displayText += largeEmojiText;
  }

  if (displayText !== "" && displayText !== undefined) {
    largeEmoji = text(displayText, width / 2, height / 2);
  }
}

function mousePressed() {
  let toolCellSize = toolkitLength / tools.length;
  let toolStartCoord = width / 2 - toolkitLength / 2 + toolCellSize / 2;
  for (let i = 0; i < tools.length; i++) {
    let toolX = toolStartCoord + toolCellSize * (i + 0.2);
    let toolY = height - 30;
    if (dist(mouseX, mouseY, toolX, toolY) < 20) {
      if (selectedTool === i) {
        selectedTool = null;
      } else {
        selectedTool = i;
        selectedClicks = 0;
      }
    }
  }

  if (selectedTool !== null) {
    //boolean to check if within the large emoji area.
    let withinLargeEmojiArea =
      dist(mouseX, mouseY, width / 2, height / 2) < 100;
    if (withinLargeEmojiArea) {
      selectedClicks++;
      console.log(selectedClicks);
    } else {
      selectedClicks = max(0, selectedClicks - 1);
    }
  }
}

