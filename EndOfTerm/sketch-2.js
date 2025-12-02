// ============================================================================
// BLUE SCREEN OF DEATH (BSOD) - Agricultural Statistics Display - sketch-2.js
// ============================================================================
// This sketch displays Ireland's agricultural crisis statistics in the style
// of a Windows Blue Screen of Death (BSOD). The typewriter effect reveals
// alarming statistics one by one, creating a sense of urgency and system failure.
// ============================================================================

// ====== DATA AND STATE VARIABLES ======
let farmData;           // JSON data containing agricultural statistics
let currentStat = 0;    // Index of currently displayed statistic (0-based) 
let displayText = "";   // Current message being typed out
let charIndex = 0;      // Current character position in typewriter effect

// ====== TYPEWRITER ANIMATION TIMING ======
let typewriterSpeed = 2;    // Characters revealed per frame (higher = faster typing)
                            // At 60fps, 2 chars/frame = 120 characters per second
let pauseFrames = 300;      // Frames to pause after fully displaying a stat
                            // 300 frames at 60fps = 5 seconds viewing time
let pauseCounter = 280;     // Initial counter set high (280) to start first stat quickly
                            // Setting to 0 would mean 5-second wait before first stat

// ====== AUDIO STATE ======
let failureSound;       // Looping error/failure sound effect
let soundOn = false;    // Sound disabled by default (user must opt-in cause it can be annoying!)
let muteButton;         // DOM button element for toggling sound

// ============================================================================
// PRELOAD FUNCTION - Loads assets before setup() runs
// ============================================================================
function preload() {
    // Load agricultural statistics from JSON file
    // Contains error codes, names, and messages styled as system errors
    farmData = loadJSON('farmStats.json');
    
    // Specify audio format for cross-browser compatibility
    soundFormats('mp3');
    
    // Load the failure/error sound effect
    // Reference: https://pixabay.com/sound-effects/sfx19-crash-338379/
    failureSound = loadSound('assets/computer-failure.mp3');
}

// ============================================================================
// SETUP FUNCTION - Initializes canvas and UI elements
// ============================================================================
function setup() {
    // Create full-window 2D canvas for text display
    createCanvas(windowWidth, windowHeight);
    
    // Use monospace font for authentic BSOD appearance
    // Courier New is universally available and matches Windows error screens
    textFont('Courier New');
    textAlign(LEFT, TOP);  // Align text from top-left corner
    
    // Configure audio to loop continuously when enabled
    failureSound.setLoop(true);
    
    // Create mute/unmute button (discreet, bottom-right corner)
    // Sound is OFF by default to avoid annoying users
    muteButton = createButton('🔇');  // Muted speaker emoji
    muteButton.position(width - 40, height - 30);  // 40px from right, 30px from bottom
    
    // Style button to be subtle/semi-transparent
    muteButton.style('background', 'transparent');
    muteButton.style('border', 'none');
    muteButton.style('color', 'rgba(255, 255, 255, 0.3)');  // 30% opacity white
    muteButton.style('font-size', '21px');
    muteButton.style('cursor', 'pointer');
    muteButton.style('padding', '5px');
    muteButton.mousePressed(toggleSound);  // add click handler
}

// ============================================================================
// DRAW FUNCTION - Main render loop 
// ============================================================================
function draw() {
    // Classic Windows BSOD blue: RGB(0, 0, 170) pretty iconic
    background(0, 0, 170);
    
    // ====== HEADER SECTION ======
    fill(255);  // White text
    textSize(24);
    textStyle(BOLD);
    // Main title - frames the agricultural data as a "system failure"
    text("Critical system failure has been detected in Ireland's agricultural future.", 40, 40);
    
    // Reset text style for body content
    textSize(16);
    textStyle(NORMAL);
    
    // White horizontal separator line below title
    stroke(255);  // White stroke
    strokeWeight(1);  // 1px thick line
    line(40, 100, width - 40, 100);  // Horizontal line with 40px margins
    noStroke();  // Disable stroke for subsequent elements
    
    // Track vertical position for text layout
    // 130px starts content below the separator line (at y=100) with padding
    let yPos = 130;
    
    // ====== STATISTICS DISPLAY WITH TYPEWRITER EFFECT ======
    // Only render if data is loaded and contains error entries
    if (farmData && farmData.agricultural_system_errors) {
        // Get current statistic to display
        let error = farmData.agricultural_system_errors[currentStat];
        
        // TYPEWRITER ANIMATION: Still revealing characters
        if (charIndex < displayText.length) {
            // Extract only the portion of text revealed so far
            let visibleText = displayText.substring(0, charIndex);
            
            // Display error name. bold, white
            textSize(16);
            textStyle(BOLD);
            fill(255);
            text(error.error_name, 40, yPos);
            
            // Display error code
            yPos += 25;  // 25px line spacing
            textSize(14);
            textStyle(NORMAL);
            fill(200, 200, 255);  // Light blue - RGB(200, 200, 255)
            text("Error Code: " + error.error_code, 40, yPos);
            
            yPos += 35;  // Extra spacing before message body
            
            // Display the message with typewriter effect
            textSize(16);
            textStyle(NORMAL);
            fill(255);
            // text(string, x, y, maxWidth) - wraps text within maxWidth
            text(visibleText, 40, yPos, width - 80);  // 80px total margin (40 each side)
            
            // ====== BLINKING CURSOR EFFECT ======
            // Calculate cursor position based on last line of wrapped text
            let lines = visibleText.split('\n');
            let lastLine = lines[lines.length - 1];
            let textW = textWidth(lastLine);  // Width of last line in pixels
            let cursorY = yPos + (lines.length - 1) * 22;  // 22px line height
            
            // Draw cursor as small white rectangle
            fill(255);
            rect(40 + textW, cursorY, 12, 18);  // 12px wide x 18px tall cursor
            
            // Advance typewriter by speed value each frame
            charIndex += typewriterSpeed;
            
        } else {
            // Full text shown, waiting before next stat
            
            // Display error name
            textSize(16);
            textStyle(BOLD);
            fill(255);
            text(error.error_name, 40, yPos);
            
            // Display error code
            yPos += 25;
            textSize(14);
            textStyle(NORMAL);
            fill(200, 200, 255);
            text("Error Code: " + error.error_code, 40, yPos);
            
            yPos += 35;
            
            // Display full message
            textSize(16);
            textStyle(NORMAL);
            fill(255);
            text(displayText, 40, yPos, width - 80);
            
            if (charIndex >= displayText.length) {
                // Calculate height of displayed text to position "click to continue" below it
                let messageLines = displayText.split('\n').length;
                let approxLines = Math.ceil(textWidth(displayText) / (width - 80)) + messageLines;
                let messageHeight = approxLines * 22;
                
                // Display "click to continue" prompt with blinking effect
                let blinkAlpha = (sin(frameCount * 0.1) + 1) * 127.5; // oscillates 0-255
                fill(200, 200, 255, blinkAlpha);
                textSize(14);
                textStyle(ITALIC);
                text("Click to continue...", 40, yPos + messageHeight + 20);
            }
            // pause before cycling to next statistic
            pauseCounter++;
            if (pauseCounter > pauseFrames) {
                // Cycle to next statistic (loops back to 0 when reaching end)
                // Modulo (%) ensures index wraps around: 0, 1, 2, ... n-1, 0, 1, ...
                currentStat = (currentStat + 1) % farmData.agricultural_system_errors.length;
                
                // Load new message and reset animation state
                displayText = farmData.agricultural_system_errors[currentStat].message;
                charIndex = 0;     // Reset typewriter to beginning
                pauseCounter = 0;  // Reset pause timer
            }
        }
    }
    
    // ====== FOOTER SECTION: SYSTEM PROGNOSIS ======
    // Fixed position at bottom of screen with summary of agricultural outlook
    fill(255);
    textSize(14);
    // Start footer 225px from bottom - ensures visibility on most screens
    let footerY = height - 225;
    
    text("System Prognosis:", 40, footerY);
    footerY += 30;  // 30px spacing after header
    
    // Display prognosis data if available
    if (farmData && farmData.system_prognosis) {
        let prognosis = farmData.system_prognosis;
        
        // Display each prognosis category with "***" prefix (BSOD style)
        text("*** IMMEDIATE RISK: " + prognosis.immediate_risk, 40, footerY);
        footerY += 25;  // Standard 25px line spacing
        
        // Medium term risk may wrap - extra height (45px) accounts for this
        text("*** MEDIUM TERM RISK: " + prognosis.medium_term_risk, 40, footerY, width - 80);
        footerY += 45;
        
        text("*** LONG TERM VIABILITY: " + prognosis.long_term_viability, 40, footerY);
        footerY += 25;
        
        text("*** RECOMMENDED ACTION: " + prognosis.recommended_action, 40, footerY);
        footerY += 25;
        
        text("*** TIME TO CRITICAL FAILURE: " + prognosis.time_to_critical_failure, 40, footerY);
    } else {
        // Fallback error messages if prognosis data missing
        text("*** STOP: 0x000000AG (FARM_DATA_OVERFLOW)", 40, footerY);
        footerY += 25;
        
        text("*** FARM.EXE - Has Stopped Working", 40, footerY);
    }
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handles window resize events
 * Resizes canvas and repositions UI elements to maintain layout
 */
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // Keep mute button in bottom-right corner
    muteButton.position(width - 40, height - 30);
}

/**
 * Toggles audio on/off and updates button icon
 */
function toggleSound() {
    soundOn = !soundOn;
    if (soundOn) {
        failureSound.play();
        muteButton.html('🔊');  // Speaker with sound waves
    } else {
        failureSound.pause();   // Pause sound
        muteButton.html('🔇');  // Muted speaker emoji
    }
}

/**
 * Handles mouse click to skip to next statistic
 * Only works when current stat is fully displayed (not during typewriter animation)
 * Allows impatient users to browse statistics faster
 */
function mousePressed() {
    // Only allow skipping if typewriter effect is complete
    if (charIndex >= displayText.length) {
        // Advance to next statistic (with wraparound)
        currentStat = (currentStat + 1) % farmData.agricultural_system_errors.length;
        displayText = farmData.agricultural_system_errors[currentStat].message;
        charIndex = 0;      // Reset typewriter
        pauseCounter = 0;   // Reset pause timer
    }
}