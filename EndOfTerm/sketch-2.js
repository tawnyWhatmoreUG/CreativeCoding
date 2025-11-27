let farmData;
let currentStat = 0;
let displayText = "";
let charIndex = 0;
let typewriterSpeed = 2; // characters per frame
let pauseFrames = 300; // pause before showing next stat
let pauseCounter = 280; // initial pause before first stat not set to 0 otherwise takes to long initially 

let failureSound;
let soundOn = false;
let muteButton;

function preload() {
    farmData = loadJSON('farmStats.json');
    soundFormats('mp3');
    failureSound = loadSound('assets/computer-failure.mp3');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont('Courier New');
    textAlign(LEFT, TOP);
    
    // Start the looping sound (disabled by default, user can turn on)
    failureSound.setLoop(true);
    // Sound is off by default - user can enable with mute button
    
    // Create discreet mute button in bottom right corner
    muteButton = createButton('🔇');
    muteButton.position(width - 40, height - 30);
    muteButton.style('background', 'transparent');
    muteButton.style('border', 'none');
    muteButton.style('color', 'rgba(255, 255, 255, 0.3)');
    muteButton.style('font-size', '16px');
    muteButton.style('cursor', 'pointer');
    muteButton.style('padding', '5px');
    muteButton.mousePressed(toggleSound);
}

function draw() {
    // Classic Windows BSOD blue background
    background(0, 0, 170);
    
    // Title bar
    fill(255);
    textSize(24);
    textStyle(BOLD);
    text("Critical system failure has been detected in Ireland's agricultural future.", 40, 40);
    
    textSize(16);
    textStyle(NORMAL);
    
    // Separator line
    stroke(255);
    strokeWeight(2);
    line(40, 100, width - 40, 100);
    noStroke();
    
    let yPos = 130;
    
    // Display statistics with typewriter effect
    if (farmData && farmData.agricultural_system_errors) {
        let error = farmData.agricultural_system_errors[currentStat];
        
        // Typewriter effect
        if (charIndex < displayText.length) {
            let visibleText = displayText.substring(0, charIndex);
            
            // Error code and name
            textSize(16);
            textStyle(BOLD);
            fill(255);
            text(error.error_name, 40, yPos);
            
            yPos += 25;
            textSize(14);
            textStyle(NORMAL);
            fill(200, 200, 255);
            text("Error Code: " + error.error_code, 40, yPos);
            
            yPos += 35;
            
            // Error message with typewriter
            textSize(16);
            textStyle(NORMAL);
            fill(255);
            text(visibleText, 40, yPos, width - 80);
            
            // Add cursor
            let lines = visibleText.split('\n');
            let lastLine = lines[lines.length - 1];
            let textW = textWidth(lastLine);
            let cursorY = yPos + (lines.length - 1) * 22;
            fill(255);
            rect(40 + textW, cursorY, 12, 18);
            
            charIndex += typewriterSpeed;
        } else {
            // Full text displayed
            textSize(16);
            textStyle(BOLD);
            fill(255);
            text(error.error_name, 40, yPos);
            
            yPos += 25;
            textSize(14);
            textStyle(NORMAL);
            fill(200, 200, 255);
            text("Error Code: " + error.error_code, 40, yPos);
            
            yPos += 35;
            
            textSize(16);
            textStyle(NORMAL);
            fill(255);
            text(displayText, 40, yPos, width - 80);
            
            // Pause before next stat
            pauseCounter++;
            if (pauseCounter > pauseFrames) {
                // Move to next statistic
                currentStat = (currentStat + 1) % farmData.agricultural_system_errors.length;
                displayText = farmData.agricultural_system_errors[currentStat].message;
                charIndex = 0;
                pauseCounter = 0;
            }
        }
    }
    
    // System prognosis footer
    fill(255);
    textSize(14);
    let footerY = height - 225;
    
    text("System Prognosis:", 40, footerY);
    footerY += 30;
    
    if (farmData && farmData.system_prognosis) {
        let prognosis = farmData.system_prognosis;
        
        text("*** IMMEDIATE RISK: " + prognosis.immediate_risk, 40, footerY);
        footerY += 25;
        
        text("*** MEDIUM TERM RISK: " + prognosis.medium_term_risk, 40, footerY, width - 80);
        footerY += 45;
        
        text("*** LONG TERM VIABILITY: " + prognosis.long_term_viability, 40, footerY);
        footerY += 25;
        
        text("*** RECOMMENDED ACTION: " + prognosis.recommended_action, 40, footerY);
        footerY += 25;
        
        text("*** TIME TO CRITICAL FAILURE: " + prognosis.time_to_critical_failure, 40, footerY);
    } else {
        text("*** STOP: 0x000000AG (FARM_DATA_OVERFLOW)", 40, footerY);
        footerY += 25;
        
        text("*** FARM.EXE - Has Stopped Working", 40, footerY);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // Reposition mute button on resize
    muteButton.position(width - 40, height - 30);
}

function toggleSound() {
    soundOn = !soundOn;
    if (soundOn) {
        failureSound.play();
        muteButton.html('🔊');
    } else {
        failureSound.pause();
        muteButton.html('🔇');
    }
}

function mousePressed() {
    // Click to advance to next stat immediately
    if (charIndex >= displayText.length) {
        currentStat = (currentStat + 1) % farmData.agricultural_system_errors.length;
        displayText = farmData.agricultural_system_errors[currentStat].message;
        charIndex = 0;
        pauseCounter = 0;
    }
}

// Initialize first display text after preload
if (farmData && farmData.agricultural_system_errors) {
    displayText = farmData.agricultural_system_errors[0].message;
}