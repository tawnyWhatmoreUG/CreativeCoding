// Windows "Not Responding" Dialog Recreation
let dialogX, dialogY;
let dialogWidth = 450;
let dialogHeight = 200;
let closeButtonHover = false;
let endNowButtonHover = false;
let cancelButtonHover = false;

function setup() {
  createCanvas(800, 600);
  // Center the dialog
  dialogX = (width - dialogWidth) / 2;
  dialogY = (height - dialogHeight) / 2;
}

function draw() {
  // Background (desktop)
  background(0, 120, 215); // Windows blue
  
  // Draw the dialog window
  drawDialog();
}

function drawDialog() {
  // Drop shadow
  fill(0, 0, 0, 50);
  noStroke();
  rect(dialogX + 5, dialogY + 5, dialogWidth, dialogHeight, 0);
  
  // Main dialog background
  fill(240, 240, 240);
  stroke(100);
  strokeWeight(1);
  rect(dialogX, dialogY, dialogWidth, dialogHeight, 0);
  
  // Title bar
  fill(255, 255, 255);
  noStroke();
  rect(dialogX, dialogY, dialogWidth, 32);
  
  // Title bar border bottom
  stroke(200);
  strokeWeight(1);
  line(dialogX, dialogY + 32, dialogX + dialogWidth, dialogY + 32);
  
  // Warning icon (left side of title)
  drawWarningIcon(dialogX + 12, dialogY + 8);
  
  // Title text
  fill(0);
  noStroke();
  textSize(13);
  textAlign(LEFT, CENTER);
  text("Program.exe", dialogX + 40, dialogY + 16);
  
  // Close button (X)
  drawCloseButton();
  
  // Warning icon (in content area)
  drawWarningIconLarge(dialogX + 20, dialogY + 60);
  
  // Dialog message
  fill(0);
  textSize(14);
  textAlign(LEFT, TOP);
  text("This program is not responding.", dialogX + 90, dialogY + 55);
  text("If you close the program, you might lose", dialogX + 90, dialogY + 80);
  text("information.", dialogX + 90, dialogY + 100);
  
  // Buttons
  drawButton("End Now", dialogX + dialogWidth - 200, dialogY + dialogHeight - 50, 90, 28, endNowButtonHover);
  drawButton("Cancel", dialogX + dialogWidth - 100, dialogY + dialogHeight - 50, 90, 28, cancelButtonHover);
}

function drawWarningIcon(x, y) {
  // Small warning icon for title bar
  fill(255, 200, 0);
  noStroke();
  circle(x + 8, y + 8, 16);
  
  fill(0);
  textSize(12);
  textAlign(CENTER, CENTER);
  text("!", x + 8, y + 7);
}

function drawWarningIconLarge(x, y) {
  // Large warning icon for content area
  fill(255, 200, 0);
  stroke(200, 150, 0);
  strokeWeight(2);
  circle(x + 25, y + 25, 50);
  
  // Exclamation mark
  fill(0);
  noStroke();
  textSize(32);
  textAlign(CENTER, CENTER);
  text("!", x + 25, y + 22);
}

function drawCloseButton() {
  let btnX = dialogX + dialogWidth - 45;
  let btnY = dialogY;
  let btnW = 45;
  let btnH = 32;
  
  // Button background
  if (closeButtonHover) {
    fill(232, 17, 35); // Red when hovered
  } else {
    fill(255);
  }
  noStroke();
  rect(btnX, btnY, btnW, btnH);
  
  // X symbol
  if (closeButtonHover) {
    stroke(255);
  } else {
    stroke(0);
  }
  strokeWeight(1.5);
  let padding = 14;
  line(btnX + padding, btnY + padding, btnX + btnW - padding, btnY + btnH - padding);
  line(btnX + btnW - padding, btnY + padding, btnX + padding, btnY + btnH - padding);
}

function drawButton(label, x, y, w, h, isHovered) {
  // Button border and background
  if (isHovered) {
    fill(229, 241, 251);
    stroke(0, 120, 215);
  } else {
    fill(225, 225, 225);
    stroke(173, 173, 173);
  }
  strokeWeight(1);
  rect(x, y, w, h, 2);
  
  // Button text
  fill(0);
  noStroke();
  textSize(13);
  textAlign(CENTER, CENTER);
  text(label, x + w/2, y + h/2);
}

function mouseMoved() {
  updateButtonHovers();
}

function mouseDragged() {
  updateButtonHovers();
}

function updateButtonHovers() {
  // Close button
  let closeBtnX = dialogX + dialogWidth - 45;
  let closeBtnY = dialogY;
  closeButtonHover = mouseX > closeBtnX && mouseX < closeBtnX + 45 &&
                     mouseY > closeBtnY && mouseY < closeBtnY + 32;
  
  // End Now button
  let endNowX = dialogX + dialogWidth - 200;
  let endNowY = dialogY + dialogHeight - 50;
  endNowButtonHover = mouseX > endNowX && mouseX < endNowX + 90 &&
                      mouseY > endNowY && mouseY < endNowY + 28;
  
  // Cancel button
  let cancelX = dialogX + dialogWidth - 100;
  let cancelY = dialogY + dialogHeight - 50;
  cancelButtonHover = mouseX > cancelX && mouseX < cancelX + 90 &&
                      mouseY > cancelY && mouseY < cancelY + 28;
}

function mouseClicked() {
  if (closeButtonHover || cancelButtonHover) {
    console.log("Dialog cancelled");
  } else if (endNowButtonHover) {
    console.log("Program ended");
  }
}
