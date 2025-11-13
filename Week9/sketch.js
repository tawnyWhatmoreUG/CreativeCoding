/* 
AI Prompt 1: Getting a prompt to use with AI from my pseudo code idea.
Chat Link: https://gemini.google.com/share/b5333d6ea486 
*/

/* 
AI Prompt 2: Taking the generated prompt from first chat, and getting the AI to draft the code for me. 
Chat Link:  https://claude.ai/share/1958df0e-25a9-4524-aef2-03db05991ff2 

I find having two separate contexts/chats to ioslate prompt building from code generation allows for better results. 
I prefer to use Gemini for language tasks, and Claude for code generation. 
Chat GPT has become my last resort when I hit limits on the other two models ;)

The main code adjustments I made were in colour value, blow duration, and other variable values. 
I reviewed the code and was pretty happy with what the AI produced logically. 
I've added some comments throughout to show my understanding.
*/

// ===== GLOBAL VARIABLES =====
        let mic;                    // p5.AudioIn object for microphone input
        let seeds = [];             // Array to hold all DandelionSeed objects
        let totalSeeds = 350;      // Total number of seeds to create
        let blowThreshold = 0.15;   // Threshold for mic level detection. the lower the value, the more sensitive and easier to trigger the blow .
        let blowDuration = 0;       // Track how long the actual captured sound has been sustained for
        let minBlowDuration = 300;  // Minimum sustained duration in ms to trigger the scatter, trying to distinguish from a shout and a blow
        let blowStartTime = 0;      // Timestamp when threshold was first exceeded. this is needed to calculate the blow duration.
        let isBlowing = false;      // Track if currently blowing into mic 
        let isScattered = false;    // Boolean to track if seeds have been blown, prevents multiple triggers. 
        let scatterSound;           // Audio file to play when scattering begins
        let dandelionBaseX, dandelionBaseY;             // Coordinates for dandelion base, will be centered on canvas
        let noiseOffset = 0;        // For smooth perlin noise wind simulation when seeds are floating

        
        // Audio file URL for scatter sound effect
        const SCATTER_SOUND_URL = 'audio/magic-wand.mp3';

        // ===== DANDELION SEED CLASS =====
        class DandelionSeed {
          //the initialise constructor takes x and y coordinates to position the seed around the dandelion head.
            constructor(x, y) {
                // Calculate random angle and distance for circular distribution around the dandelion head
                let angle = random(TWO_PI);
                let distance = sqrt(random(1)) * 50; // square root for uniform distribution in circle
                
                // Position the seed, offset from the dandelion center
                this.pos = createVector(
                    x + cos(angle) * distance,
                    y + sin(angle) * distance
                );
                // setting the default physics properties
                this.vel = createVector(0, 0);      // Initial velocity is zero
                this.acc = createVector(0, 0);      // Initial acceleration is zero
                this.lifespan = 255;                // Transparency/fade tracker
                this.r = 5;                         // Radius of the seed
                this.angle = random(TWO_PI);        // Random angle for rotation effect
                this.noiseOffsetX = random(1000);   // Unique perlin noise offset
                this.noiseOffsetY = random(1000);   // Unique perlin noise offset
            }

            // Update function is called every frame to update position and physics
            // Apply acceleration, update velocity and position
            update() {
                // Add acceleration to velocity
                // acc is modified by applyWindForce function before update is called
                this.vel.add(this.acc);

                // Apply drag/air resistance (0.98 means 2% speed reduction per frame)
                // This simulates air resistance slowing down the seed over time
                this.vel.mult(0.98);
                
                // Update position based on velocity
                // This sets the new position of the seed each frame based on its velocity 
                this.pos.add(this.vel);
                
                // Reset acceleration to zero after each frame
                // Acc is changed each frame by wind forces, it needs to be reset otherwise forces would accumulate and would be unrealistic.
                this.acc.mult(0);
                
                // Gradually fade out the seed - this is the transparency being reduced essentially 
                this.lifespan -= 0.5;
                
                // Update rotation angle
                // This makes the seed slowly spin as it floats
                this.angle += 0.02;
            }

            // Render the seed on canvas - this is called every frame after update
            // If wind forces have been applied, the seed will be rendered in its new position by way of this function
            display() {
              //enter isolated drawing state
                push();
                // Move to seed position and apply rotation
                translate(this.pos.x, this.pos.y);
                rotate(this.angle);
                
                // Draw seed body (white circle with alpha based on lifespan value)
                noStroke();
                fill(255, 255, 255, this.lifespan);
                //r relates to radius, so diameter is r*2
                ellipse(0, 0, this.r * 2);
                
                // draw the some lines around the seed to simulate the fluffy seed heads.
                stroke(255, 255, 255, this.lifespan * 0.5);
                //very thin line weight for the fluffz
                strokeWeight(0.5);
                // Draw 8 lines radiating out from the seed center
                for (let i = 0; i < 8; i++) {
                  // Calculate angle for each line with maff :S
                    let angle = (TWO_PI / 8) * i;
                    let x = cos(angle) * this.r * 3;
                    let y = sin(angle) * this.r * 3;
                    line(0, 0, x, y);
                }
                //exit isolated drawing state
                pop();
            }

            // Apply gentle perlin noise-based wind force for realistic floating - this is inspired by Dan Shiffman's flocking simulations.
            applyWindForce() {
              // Only apply wind if seeds have been triggered to scatter  
                if (isScattered) {
                    // Create smooth, flowing wind using perlin noise
                    let windX = map(noise(this.noiseOffsetX, noiseOffset), 0, 1, -0.05, 0.05);
                    let windY = map(noise(this.noiseOffsetY, noiseOffset), 0, 1, -0.05, 0.05);
                    
                    // Apply gentle upward drift (seeds float up slightly)
                    windY -= 0.02;
                    
                    // Create wind force vector, this represents the wind pushing on the seed
                    let windForce = createVector(windX, windY);
                    // Apply wind force to acceleration of the seed
                    this.acc.add(windForce);
                    
                    // Increment noise offset for smooth animation
                    this.noiseOffsetX += 0.01;
                    this.noiseOffsetY += 0.01;
                }
            }

            // Check if seed is still alive (visible by way of opacity)
            // this is used to remove seeds from the array when they have fully faded out
            isDead() {
                return this.lifespan <= 0;
            }
        }

        // ===== SETUP FUNCTION =====
        function setup() {
            // Create full-window canvas
            let canvas = createCanvas(windowWidth, windowHeight);
            // Attach canvas to specific container div in the index.html
            canvas.parent('canvas-container');
            
            // Set dandelion base coordinates to center of canvas
            dandelionBaseX = width / 2;
            dandelionBaseY = height / 2;
            
            // Initialise microphone input for capturing blow sound
            mic = new p5.AudioIn();
            //start the mic capture immediately
            mic.start();
            
            // Load scatter sound effect
            //assigning the loaded sound to the scatterSound variable
            scatterSound = loadSound(SCATTER_SOUND_URL, 
                () => console.log('Scatter sound loaded successfully'),
                (err) => console.log('Error loading scatter sound:', err)
            );
            
            // Initialise seeds array with dandelion seeds, positioned around the dandelion head
            initializeSeeds();
            
            // Attach reset function to button - this is defined in the index.html file
            let resetBtn = select('#reset-btn');
            //when pressed the button will call the resetSketch function, defined below
            resetBtn.mousePressed(resetSketch);
        }

        // ===== DRAW DANDELION BASE =====
        //i didn't like the colours AI chose so i changed them here. 
        //AI also named the dandelionBase variables 'DB_' which i feel is vague so i changed them to full words.
        //this draws the stem and head of the dandelion- not the seeds, they are drawn separately and are overlaid. 
        function drawDandelionBase() {
            // Draw stem (always visible) - made taller and thicker
            stroke(40, 180, 120);
            strokeWeight(8);
            line(dandelionBaseX, dandelionBaseY + 150, dandelionBaseX, dandelionBaseY);
            
            // Only draw seed head if seeds haven't been scattered
            if (!isScattered) {
                // Draw dandelion head (yellow/white sphere) - much larger
                noStroke();
                fill(255, 255, 200);
                ellipse(dandelionBaseX, dandelionBaseY, 120, 120);
                
                // Add some texture to the head
                fill(255, 255, 150, 150);
                ellipse(dandelionBaseX, dandelionBaseY, 90, 90);
                
                // Add inner detail
                fill(255, 255, 100, 100);
                ellipse(dandelionBaseX, dandelionBaseY, 60, 60);
            } else {
                // Draw empty seed head after scattering (darker, smaller)
                noStroke();
                fill(150, 140, 80);
                ellipse(dandelionBaseX, dandelionBaseY, 70, 70);
                
                // middle ring
                fill(120, 110, 60);
                ellipse(dandelionBaseX, dandelionBaseY, 50, 50);
                
                // Add inner ring
                fill(80, 70, 40);
                ellipse(dandelionBaseX, dandelionBaseY, 30, 30);
            }
        }

        // ===== INITIALIZE SEEDS =====
        function initializeSeeds() {
            seeds = []; // Clear existing seeds - important for the reset 
            
            // Create seeds clustered around dandelion head 
            for (let i = 0; i < totalSeeds; i++) {
              //adding new DandelionSeed objects to the seeds array
                seeds.push(new DandelionSeed(dandelionBaseX, dandelionBaseY));
            }
        }

        // ===== SCATTER SEEDS (BLOW ACTION) =====
        //this function is called when a valid blow is detected
        //it applices the wind force, starting out strong to simulate the blow
        function scatterSeeds() {
            // Mark as scattered so we don't trigger this again
            isScattered = true;
            
            // Show the reset button - this is done by adding a CSS class.
            // the button itself is defined in the index.html file. 
            let resetBtn = select('#reset-btn');
            resetBtn.addClass('visible');
            
            // Apply outward force to all seeds defined in the array
            for (let seed of seeds) {
                // Calculate angle from center to create radial burst
                let angle = atan2(seed.pos.y - dandelionBaseY, seed.pos.x - dandelionBaseX);
                
                // Add randomness to angle for natural spread
                angle += random(-0.3, 0.3);
                
                // Create strong initial velocity (force of the blow)
                let force = random(5, 12);
                // Calculate initial velocity vector based on angle and force
                let initialVel = createVector(cos(angle) * force, sin(angle) * force);
                // update the seed's velocity to simulate the blow
                seed.vel.add(initialVel);
            }
            
            // Play scatter sound effect when the blow first occurs
            if (scatterSound && scatterSound.isLoaded()) {
                scatterSound.setVolume(0.5);  //not too loud, keep ambient
                scatterSound.play();
            }
        }

        // ===== MAIN DRAW LOOP =====
        function draw() {
            // Clear canvas with gradient background
            background(20, 24, 40);
            
            // Draw dandelion base (stem and head)
            drawDandelionBase();
            
            // Check microphone level for blow detection
            let micLevel = mic.getLevel();
            
            // Blow detection logic: distinguish blow from shout
            if (!isScattered) {
                if (micLevel > blowThreshold) {
                    // Sound is above threshold - we can continue with blow detection
                    if (!isBlowing) {
                        // Start of potential blow - record start time
                        isBlowing = true;
                        blowStartTime = millis();
                    } else {
                        // Continue tracking blow duration
                        blowDuration = millis() - blowStartTime;
                        
                        // If sustained long enough, we'll register it as a blow - some shouts still get through, but less often.
                        if (blowDuration >= minBlowDuration) {
                            scatterSeeds();
                        }
                    }
                } else {
                    // the captured sound dropped below threshold - reset
                    if (isBlowing) {
                        isBlowing = false;
                        blowDuration = 0;
                    }
                }
            }
            
            // Update and display all seeds
            for (let i = seeds.length - 1; i >= 0; i--) {
                let seed = seeds[i];
                
                // Only update physics if seeds have been scattered
                if (isScattered) {
                    seed.applyWindForce();  // Apply gentle wind for floating effect
                    seed.update();          // Update position and physics
                }
                
                seed.display();  // Draw the seed
                
                // Remove dead seeds from array
                if (seed.isDead()) {
                    seeds.splice(i, 1);
                }
            }
            
            // Increment global noise offset for wind simulation
            noiseOffset += 0.01;
            
            // Visual feedback: show mic level indicator
            if (!isScattered) {
                drawMicIndicator(micLevel);
            }
        }

        // ===== MIC LEVEL INDICATOR =====
        function drawMicIndicator(level) {
            // Draw a small visual indicator showing mic level
            // Map mic level to bar width - allow bar to go beyond threshold for visual feedback
            let maxBarWidth = 120;
            let barWidth = map(level, 0, blowThreshold * 2, 0, maxBarWidth);
            // Constrain bar width to not exceed the maximum
            barWidth = constrain(barWidth, 0, maxBarWidth);
            
            noStroke();
            //semi-transparent red bar - change color when above threshold
            if (level > blowThreshold) {
                fill(100, 255, 100, 150); // Green when above threshold
            } else {
                fill(255, 100, 100, 150); // Red when below threshold
            }
            // Draw the bar at the bottom center of the canvas
            rect(width / 2 - 50, height - 30, barWidth, 10, 5);
            
            // Draw threshold line at the actual threshold position
            stroke(255, 255, 255, 200);
            strokeWeight(2);
            // Position threshold line at 60px (representing the threshold level)
            let thresholdX = width / 2 - 50 + 60; // 60px represents the threshold level
            line(thresholdX, height - 35, thresholdX, height - 15);
        }

        // ===== RESET FUNCTION =====
        //this function is called when the reset button is pressed
      //it resets all relevant variables and reinitializes the seeds
        function resetSketch() {
            // Reset scattered state
            isScattered = false;
            
            // Reset blow detection variables
            isBlowing = false;
            blowDuration = 0;
            blowStartTime = 0;
            
            // Hide the reset button
            let resetBtn = select('#reset-btn');
            resetBtn.removeClass('visible');
            
            // Stop scatter sound if playing
            if (scatterSound && scatterSound.isPlaying()) {
                scatterSound.stop();
            }
            
            // Clear existing seeds and reinitialize
            seeds = [];
            initializeSeeds();
            
            // Reset noise offset
            noiseOffset = 0;
        }

        // ===== WINDOW RESIZE HANDLER =====
        //p5js function that is called automatically when the window is resized
        function windowResized() {
          //recalculate canvas size and dandelion position
            resizeCanvas(windowWidth, windowHeight);
            dandelionBaseX = width / 2;
            dandelionBaseY = height / 2;
            
            // Reinitialize if not scattered
            if (!isScattered) {
                initializeSeeds();
            }
        }