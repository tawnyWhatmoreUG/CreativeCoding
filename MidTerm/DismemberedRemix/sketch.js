/**
 * Dismembered Remix - Interactive Generational Walker
 * Original: https://openprocessing.org/sketch/1562949 
 * 
 * REMIX CONCEPT:
 * Transforms the original dismembered project to include narrative and basic user interaction.
 * The narrative is about the human lifecycle. User cl		for (let i = 0; i < completeWalkersCount; i++) {
			let walker = walkers[j*completeWalkersCount+i];
			
			// Normal animation when limbs are scattered and not fading
			if (!limbsTogether && !fading) {
				walker.update(); // Update walking animationhe center circle to reassemble and progress to next generation
 * The scattered limb effect from the original remain, symbolising individual paths and experiences within a family. 
 * 
 * KEY INSPIRATIONS FROM ORIGINAL:
 * - Nested loop structure creating ghost/echo effect for dismemberment and rendering the complete walkers
 * - Single limb per dismembered walker 
 * - Circular orbit motion using trigonometric positioning (PI, cos, sin))
 * - Speed variation creating staggered visual rhythm
 * - Minimalist line-based walker representation
 * 
 * REMIX ADDITIONS:
 * - Click interaction for limb reassembly
 * - JSON-driven generation system with messages - I just find it easier to manage these details external json. 
 * - Walker type system (Man, Woman, Child, Elderly) with unique characteristics for the BMlibrary
 * - Hover feedback on center circle to indiciate click interactivity
 */

// ---- CANVAS & VISUAL CONSTANTS ----
let canvasSize = 600; // Square canvas dimensions
let fadeDuration = 1500; // Duration of fade transition between generations (in milliseconds) This amount of time seems to work well visually.

// ---- BACKGROUND PALETTE ----
// Store colors for background
let backgroundColour;
// This one is for the trail when generation is coming together - gives visual steps in the trail effect 
let	backgroundColourTransparent;


// ---- GENERATION DATA ----
// The sketch cycles through different "generations" loaded from embedded data
// Each generation has a unique set of walker types and a message to display
let currentGeneration;      // Currently active generation object
let generations;             // Array of all generation data (embedded below)
let currentGenerationIndex = 0; // Track which generation we're on

// Embedded generations data (previously loaded from JSON)
const GENERATIONS_DATA = [
  {
    "name": "solo_adult",
     "walkers": [{ "type": "man"}],
    "message": "...Hello?"
  },
  {
    "name": "couple",
     "walkers": [
      { "type": "man" },
      { "type": "woman" }
    ],
    "message": "...Fancy a walk? "
  },
  {
    "name": "family",
     "walkers": [
      { "type": "man" },
      { "type": "woman"},
      { "type": "child" }
    ],
    "message": "...Or a run with a little one! "
  },
  {
    "name": "aging",
     "walkers": [
      { "type": "elderly" },
      { "type": "elderly" },
      { "type": "man" }
    ],
    "message": "...What a great time we've had"
  }
];

// ---- WALKER DATA ----
// dismemberedWalkersCount: Number of single limb versions scattered around the circle
// completeWalkersCount: Number of walkers in each set (determined by the JSON)
// Based on the original i kept the dismembered count the same. 
// The walker count then changes based on the generation loaded from JSON
// All walker instances are stored in a single flat array - uses a nested structure: 
// e,g.. [limb1 of walker1, limb1 of walker2,... limb14 of walker1, limb14 of walker2, complete walker1, complete walker2,...]
let walkers = []; 					//all walker and limb instances
let dismemberedWalkersCount = 14; 	//how many limb instances per walker, gives the best visual effect, less than this is scarce. 
let completeWalkersCount = 1;		//will be updated from JSON based on generation

// ---- CIRCLE PARAMETERS ----
// The walkers orbit around a center circle - this defines its radius
// Kept the same as original for visual consistency
let centerRadius = 180; // Distance from center where walkers orbit

// ---- STATE FLAGS ----
// Track the animation state through different phases
let limbsTogether = false;        // True when user clicks center - reassembles walkers
let reachedTarget = false;        // True when complete walkers reach top position
let fading = false;               // True when in fade phase before next generation
let fadeStartTime = 0;            // Timestamp when fade began
let hoveringOverCircle = false;   // True when mouse is over center circle (for visual feedback)

// ---- MESSAGE ANIMATION ----
// Track the angular position of the generation message as it orbits
let messageAngle = 0;             // Current angle of message around the circle (in radians)

// ---- SOUND SYSTEM ----
// Whimsical audio feedback with gentle vibrato for Ori-like wonder
let sineOsc;                      // p5.sound oscillator (pure sine wave for bell-like tone)
let vibratoOsc;                   // LFO for gentle pitch modulation (shimmer effect)
let maxSoundDistance = 250;       // Distance at which sound starts (slightly larger range)
let minFrequency = 0;           // Lowest frequency (Hz) - A3, gentle and warm
let maxFrequency = 650;           // Highest frequency (Hz) - A5, sparkly and bright
let currentVolume = 0;            // Current oscillator volume
let targetVolume = 0;             // Target volume for smooth transitions
let audioStarted = false;         // Track if audio context has been started - modern browser seem to block audio until a user interaction has occurred. 

// -----------------------------------------------------
// ---- SETUP FUNCTION ----
// -----------------------------------------------------
// Runs once at startup - initialises the sketch
function setup() {
	// Load embedded generation data
	generations = GENERATIONS_DATA;
	// Define color scheme
	backgroundColour = color('#252424ff'); // Dark grey background
	backgroundColourTransparent = color('#25242422'); //same but lower opacity for when limbs are together - the last 2 hex values are the alpha channel
	  
	// Create square canvas
	createCanvas(canvasSize, canvasSize);
	//Only set the background if the limbs aren't coming together.
	//The walkers will render a trail then while they are returning to the top, looks interesting. 
	if(!limbsTogether) {
		background(backgroundColour);
	}

	// ---- INITIALISE SOUND ----
	// Create whimsical sine oscillator with gentle vibrato for wonder and magic
	// Oscillator will be started on first user interaction (mousePressed)
	sineOsc = new p5.Oscillator('sine');
	sineOsc.amp(0); // Start silent
	
	// Create vibrato (gentle pitch wobble for shimmer effect)
	vibratoOsc = new p5.Oscillator('sine');
	vibratoOsc.disconnect(); // Don't send to speakers
	vibratoOsc.amp(3); // Subtle pitch modulation (+/- 3Hz)
	vibratoOsc.freq(4); // Wobble 4 times per second for gentle shimmer

	//call the loadGeneration function, this will load the first generation from the json to start the sequence
	loadGeneration(0);
}

// ---- LOAD GENERATION FUNCTION ----
// Loads a specific generation configuration from the JSON data
// Creates all walker instances based on generation specifications
// Parameters:
//   index - which generation to load, 0 based
function loadGeneration(index) {
	// Safety check: ensure generations array exists and has data
	if (!generations || !generations.length) {
		console.error("No generations data loaded");
		return;
	}
	
	// Loop back to the first generation if we've reached the end
	// This creates an infinite cycle through all generations
	if (index >= generations.length) {
		index = 0;
		console.log("Completed all generations - restarting from the beginning");
	}

	// Store current generation reference
	currentGenerationIndex = index;
	currentGeneration = generations[index];

	// Safety check: ensure currentGeneration has walkers, no walkers is invalid, log error, escape function
	if (!currentGeneration || !currentGeneration.walkers) {
		console.error("Invalid generation data at index", index);
		return;
	}
	
	// Clear existing walkers array
	// We do this to start fresh with the current generation's walker configuration
	walkers = [];
	
	// Get walker specifications from the generation data
	let walkerData = currentGeneration.walkers;
	completeWalkersCount = walkerData.length; // Set count based on generation data
	
	// ---- WALKER INITIALIZATION PARAMETERS ----
	// These define the initial camera angles for the 3D walker visualization
	let walkerAzimuth = Math.PI/4;  // Azimuth (horizontal angle)
	let walkerElevation = 0;          // Elevation (vertical angle)

	// ---- NESTED LOOP STRUCTURE ----
	// Preserved the structure of these nested loops from the original.
	// OUTER LOOP (j): Creates dismemberedWalkersCount + 1 sets of walkers
	//   - First dismemberedWalkersCount sets: show individual limbs
	//   - Last set (j = dismemberedWalkersCount): complete walkers
	// INNER LOOP (i): Creates completeWalkersCount walkers per set
	//   - Number of walkers determined by generation JSON
	for (let j = 0; j < dismemberedWalkersCount + 1; j++) {
		for (let i = 0; i < completeWalkersCount; i++) {
        // ---- CALCULATE WALKER POSITION ----
        // Calculate base angular position (roll) for this walker slot
        // Maps walker index to position around circle (0 to 2π)
        // INSPIRED BY ORIGINAL: wr = map(i,0,N,0,Math.PI*2)
        let walkerRoll = map(i, 0, completeWalkersCount, 0, Math.PI*2);
        
        // ADD OFFSET based on j to distribute dismembered sets around FULL circle
        // This creates the visual "echo" effect by spacing each set evenly
        // Each dismembered set gets a different starting angle
        let rollOffset = map(j, 0, dismemberedWalkersCount + 1, 0, Math.PI*2);
        walkerRoll += rollOffset;
        
        // Convert polar coordinates (angle + radius) to cartesian (x, y)
        // -Math.PI/2 rotates so 0 degrees is at top of circle
        // INSPIRED BY ORIGINAL: pos = createVector(w/2+cos(-wr-Math.PI/2)*D, w/2+sin(-wr-Math.PI/2)*D)
        // Same trigonometric approach for circular positioning
        let position = createVector(
            width / 2 + cos(-walkerRoll - Math.PI / 2) * centerRadius,
            height / 2 + sin(-walkerRoll - Math.PI / 2) * centerRadius
        );
			
			// ---- CREATE WALKER BASED ON TYPE ----
			// Get the walker type from JSON (man, woman, child, elderly)
			let walkerType = walkerData[i].type;
			
			// Instantiate appropriate Walker subclass based on type
			// Each type has different visual characteristics and movement parameters
			switch(walkerType) {
				case "man":
					walkers[j*completeWalkersCount+i] = new Man();
					break;
				case "woman":
					walkers[j*completeWalkersCount+i] = new Woman();
					break;
				case "child":
					walkers[j*completeWalkersCount+i] = new Child();
					break;
				case "elderly":
					walkers[j*completeWalkersCount+i] = new Elderly();
					break;
				default:
					// Fallback to base Walker class if type not recognised
					walkers[j*completeWalkersCount+i] = new Walker();
			}
			
			// ---- SET DYNAMIC PARAMETERS ----
			// Set position and orientation for this walker
			// Note: We don't overwrite body parameters (height, speed, etc.) 
			// as those are defined by the Walker subclass
			walkers[j*completeWalkersCount+i].updateParam('azimuth', walkerAzimuth);
			walkers[j*completeWalkersCount+i].updateParam('position', position);
			walkers[j*completeWalkersCount+i].updateParam('elevation', walkerElevation);
			walkers[j*completeWalkersCount+i].updateParam('roll', walkerRoll);

		}
	}

	// Just a log to confirm generation loaded for debugging purposes
	console.log("Generation", index + 1, "of", generations.length + ":", currentGeneration.name, "with", completeWalkersCount, "walker(s) -", currentGeneration.message);
}

// -----------------------------------------------------
// ---- DRAW ----
// -----------------------------------------------------
// Main animation loop - runs every frame
// Performs state checks, walker updates, rendering, and phase transitions
function draw() {
	// Clear the background each frame to prevent trails
	// Without this, walkers would leave a drawn path behind them
	if(!limbsTogether) {
		background(backgroundColour);
	} else { 
		//lower opacity background when limbs are together
		background(backgroundColourTransparent);
	}
	
	// ---- UPDATE SOUND BASED ON MOUSE PROXIMITY ----
	updateProximitySound();
	
	// ---- CHECK FOR GENERATION TRANSITION ----
	// When limbs come together and walkers reach the top, trigger next generation
	let allAtTarget = true; //default to false, further rendering will assess when to set this to true.

	// If limbs are together and not already fading
	// This is a brief phase where we check if all walkers have reached the target position
	if (limbsTogether && !fading) {
		let targetRoll = 0; // Target position top of circle
		let threshold = 0.05; // Bit of a buffer to avoid precision issues when determining if at the target
		
		// Only check the complete walkers (last set in the array)
		// Array index: dismemberedWalkersCount * completeWalkersCount gives start of final set
		for (let i = 0; i < completeWalkersCount; i++) {
			let walkerIndex = dismemberedWalkersCount*completeWalkersCount + i;
			let rollDiff = targetRoll - walkers[walkerIndex].roll;
			
			// Normalise to find shortest path to target angle
			// This handles wraparound (e.g., difference between 0.1 and 6.2 radians)
			while (rollDiff > Math.PI) rollDiff -= 2 * Math.PI;
			while (rollDiff < -Math.PI) rollDiff += 2 * Math.PI;
			
			// If any walker is too far from target, set flag to false
			if (Math.abs(rollDiff) > threshold) {
				allAtTarget = false;
				break; // No need to check remaining walkers
			}
		}

		// ---- FADE TRANSITION ----
		// If all reached target and we haven't triggered generation change yet
		if (allAtTarget && !reachedTarget) {
			reachedTarget = true;		// Set flag to avoid retriggering
			fading = true; 				// Start fade phase
			fadeStartTime = millis(); 	// Record when fade began
			limbsTogether = false; 		// Return to separated limb state
			
			// Trigger fade effect for all walkers
			for (let j = 0; j < dismemberedWalkersCount+1; j++) {
				for (let i = 0; i < completeWalkersCount; i++) {
					walkers[j*completeWalkersCount+i].fadeWalker();
				}
			}
		}
	}
	
	// ---- FADING TO NEXT PHASE ----
	// After walkers reach target, they fade out before loading next generation
	if (fading) {	
		// Check if fade time has elapsed
		if (millis() - fadeStartTime > fadeDuration) {
			// And when it has, reset flags and load next generation
			fading = false;
			reachedTarget = false;
			
			// Load the next generation in the sequence
			let nextIndex = currentGenerationIndex + 1;
			console.log("Switching from generation", currentGenerationIndex, "to", nextIndex);
			loadGeneration(nextIndex);
		} else {
			// Otherwise still in the fade transition, update fade animation for all walkers
			for (let j = 0; j < dismemberedWalkersCount+1; j++) {
				for (let i = 0; i < completeWalkersCount; i++) {
					walkers[j*completeWalkersCount+i].updateFade();
				}
			}
		}
	}
  
	// ---- GENERAL TICKING OVER WALKER STATE ----
	// Update walker animation and limb positions based on current state
	// Nested loop structure preserved from original again.
	for (let j = 0; j < dismemberedWalkersCount+1; j++) {
		for (let i = 0; i < completeWalkersCount; i++) {
			let walker = walkers[j*completeWalkersCount+i];
			
			// Normal animation when limbs are scattered and not fading
			if (!limbsTogether && !fading) {
				walker.update(); // Update walking animation
			} 
			// The complete walkers continue moving to target when limbs are together
			else if (limbsTogether && j === dismemberedWalkersCount) {
				let targetRoll = 0;
				let rollDiff = targetRoll - walker.roll;
				
				
				let threshold = 0.05;
				// Only update if not yet at target
				if (Math.abs(rollDiff) > threshold) {
					walker.update();
				}
			}
		}
	}
	
	// ---- DRAW CENTER CIRCLE ----
	// The circle provides visual hover/click feedback and defines the clickable area to progress the generation
	// INSPIRED BY ORIGINAL: The center circle drawing with diameter calculation
	// Kept a lot of the original structure here for visual consistency
	let diameter = (centerRadius - walkers[0].walkerHeight/2)*0.85;
	
	// Circle fill changes based on interaction state to provide feedback
	if(limbsTogether){
		fill(255,255,255,60);  // Brightest - active state (walkers reassembling)
	} else if(hoveringOverCircle){
		fill(255,255,255,15);  // Medium - hover state (mouse over circle)
	} else {
		fill(255,255,255,0);   // Transparent - default state
	}
	strokeWeight(6);  
	stroke(50); // Dark grey outline
	// Draw the center circle
	circle(width / 2, height / 2, diameter * 2);

	// ---- DRAW POSITION ARCS ----
	// Small arcs show the angular position of each complete walker
	// Kept the arc drawing code with walker roll positioning the same as the original.
	// The arc is centered on walker's roll angle with small angular span
	noFill(); 
	strokeWeight(6);  
	stroke(255,255,255,60); // Semi-transparent white
	
	// Draw one arc for each complete walker
	for (let i = 0; i < completeWalkersCount; i++) {
		let walkerRoll = walkers[dismemberedWalkersCount*completeWalkersCount+i].roll;
		// Arc spans a small angle centered on walker position
		arc(width/2, height/2, 
			diameter * 2,  diameter * 2, 
			-walkerRoll - Math.PI/2-2e-1,  // Start angle
			-walkerRoll - Math.PI/2+2e-1); // End angle
	}

	    // ---- DRAW GENERATION MESSAGE ----
    // Display the message text with each letter distributed evenly around the circle
	// The message is defined in json. 
	if (currentGeneration && currentGeneration.message) {
        let message = currentGeneration.message;
        console.log("Generation message:", message);
        
        // Update message angle for orbital motion (same speed as dismembered limbs)
		// Rotate at the same speed as the limbs: -1e-2 radians per frame
		messageAngle -= 1e-2;
		
		// Calculate text opacity based on fade state
		let textAlpha = 120; // Default opacity (subtle)
		if (fading && walkers.length > 0) {
			// Get the first complete walker's alpha for consistency
			let walker = walkers[dismemberedWalkersCount * completeWalkersCount];
			if (walker && walker.isFading) {
				// Match text fade to walker fade (scale walker's 0-255 alpha to text's 0-150 range)
				textAlpha = map(walker.alpha, 0, 255, 0, 150);
			}
		}
		
        push(); // Save drawing state
		noStroke();
		fill(255, textAlpha); // White text with dynamic opacity
        textFont('Courier New'); // Monospace font for consistent appearance
		textAlign(CENTER, CENTER); // Center horizontally and vertically
		textSize(21);
		
		// Draw each letter at evenly distributed positions around the circle
		for (let i = 0; i < message.length; i++) {
			// Calculate angle for this letter
			// Distribute letters evenly around the full circle (0 to 2π)
			// Negate the mapping to reverse the direction
			let letterAngle = map(i, 0, message.length, 0, -Math.PI * 2);
			// Add the rotating messageAngle offset to make all letters orbit together
			letterAngle += messageAngle;
			
			// Calculate position using trigonometry (same as limb positioning)
			let letterX = width / 2 + cos(-letterAngle - Math.PI / 2) * centerRadius;
			let letterY = height / 2 + sin(-letterAngle - Math.PI / 2) * centerRadius;
			
			// Rotate the letter to align with the circle
			push();
			translate(letterX, letterY);
			rotate(-letterAngle); // Rotate letter to face outward from circle
			text(message[i], 0, 0);
			pop();
		}
		
        pop(); // Restore drawing state
	}
	
	// ---- RENDER LOOP 1: DISMEMBERED WALKERS ----
	// Draw the dismembered walkers that show individual separated limbs
	// Each dismembered walker shows only ONE limb (selected by its j index)
	// This creates the visual trail effect around the circle
	// Again a lot of the loops and structure is preserved from the original
	if (!limbsTogether ) { // Only show when limbs are scattered
		for (let j = 0; j < dismemberedWalkersCount; j++) {
			for (let i = 0; i < completeWalkersCount; i++) {
				let walker = walkers[j*completeWalkersCount+i];
				
				// Set limb color using walker's current alpha (supports fade effect)
				// Doing a similar approach to the original for limb coloring, except not working in hsb (hue, saturation, brightness), but rgb + alpha
				// So instead of adjusting the saturation like the original, we adjust the alpha for transparency
				let limbColor = color(red(walker.colour), green(walker.colour), blue(walker.colour), walker.alpha * 0.31);
				stroke(limbColor);
				fill(limbColor);
				strokeWeight(1); // Thinner lines for the dismembered limbs 
				
				// Get the limb positions with offsets applied
				let limbSegment = walker.lineMarkers; // Returns array of limb segments
				let walkerPosition = walker.pos; // Walker position
                let WalkerHeight = walker.walkerHeight * 0.7; // Scale height down slightly so it isn't too visually cluttered
				
				// Draw only ONE specific limb for this dismembered walker
				// j selects which limb from the lineMarkers array (matches original structure)
				if (limbSegment && limbSegment.length > j && !walker.isFading) {
					// Each limb segment has two points: start [0] and end [1]
					line(walkerPosition.x+limbSegment[j][0].x, walkerPosition.y+limbSegment[j][0].y,  // Start point
						 walkerPosition.x+limbSegment[j][1].x, walkerPosition.y+limbSegment[j][1].y); // End point
					// Draw circles at joints
					circle(walkerPosition.x+limbSegment[j][0].x, walkerPosition.y+limbSegment[j][0].y, WalkerHeight/40);
					circle(walkerPosition.x+limbSegment[j][1].x, walkerPosition.y+limbSegment[j][1].y, WalkerHeight/40);
				}
			}
		}
	}
	
	// ---- RENDER LOOP 2: COMPLETE WALKERS ----
	// Draw the final set of walkers, the completed ones.
	// These show all limbs and are the ones that move to the top when clicked
	// We keep the original structure where drawing complete walkers uses the walker.draw() method
	for (let i = 0; i < completeWalkersCount; i++) {
        let walker = walkers[dismemberedWalkersCount*completeWalkersCount+i];

		// Set limb colour using walker's current alpha - takes the fade effect into account
		let limbColor = color(red(walker.colour), green(walker.colour), blue(walker.colour), walker.alpha * 0.31);
		stroke(limbColor);
		fill(limbColor);
        strokeWeight(3); // Thicker lines for the complete walkers
		walker.draw();
	}
	
	// ---- UPDATE LOOP: DISMEMBERED POSITIONS ----
	// Update circular motion for all walkers
	// Update dismembered walker limbs
	if (!limbsTogether && !fading) {
		for (let j = 0; j < dismemberedWalkersCount; j++) {
			for (let i = 0; i < completeWalkersCount; i++) {
				let walker = walkers[j*completeWalkersCount+i];
				let ws = walker.speed;
				
				// Rotate walker around circle
				// -1e-2 = -0.01 radians per frame (clockwise rotation)
				// This is the same as the original implementation
				// Same rotation speed calculation
				let wr = walker.roll - 1e-2 * ws;
				walker.updateParam('roll', wr);
				
				// Convert new angular position to coordinates
				// Same trigonometric position calculation
				let newPos = createVector(
					width/2+cos(-wr-Math.PI/2)*centerRadius, 
					width/2+sin(-wr-Math.PI/2)*centerRadius
				);
				
				walker.updateParam('position', newPos);
			}
		}
	}
	
	// ---- UPDATE LOOP: COMPLETE WALKER POSITIONS ----
	// Update complete walkers based on current state
	// They either move to top when limbsTogether or orbit normally otherwise
	for (let i = 0; i < completeWalkersCount; i++) {
		let walker = walkers[dismemberedWalkersCount*completeWalkersCount+i];
        
		if (limbsTogether) {
			// When assembled, walkers move to top of circle (roll = 0)
			let targetRoll = 0;
			let currentRoll = walker.roll;
			let rollDiff = targetRoll - currentRoll;
			
			// Normalise to find shortest path to target angle
			// means walker could go backwards to get to target.
			// This handles wraparound
			while (rollDiff > Math.PI) rollDiff -= 2 * Math.PI;
			while (rollDiff < -Math.PI) rollDiff += 2 * Math.PI;
			
			let threshold = 0.05; // Stop when close enough
			if (Math.abs(rollDiff) > threshold) {
				let walkerSpeed = walker.speed;
				// Move in direction of shortest path
				let newRoll = currentRoll + rollDiff * 0.08;
				walker.updateParam('roll', newRoll);
			}
		} else if (!fading) {
			// ---- NORMAL CIRCULAR MOTION ----
			// Continue orbiting around center
			let walkerSpeed = walker.speed;
			let walkerRoll = walker.roll - 1e-2 * walkerSpeed;
			walker.updateParam('roll', walkerRoll);
		}

		// Update coordinate position based on current angular position
		// This is the same as the original implementation.
		let currentRoll = walker.roll;
		let newPosition = createVector(
			width/2+cos(-currentRoll-Math.PI/2)*centerRadius, 
			width/2+sin(-currentRoll-Math.PI/2)*centerRadius
		);
		walker.updateParam('position', newPosition);
	}
}

// -----------------------------------------------------
// ---- SOUND SYSTEM ----
// -----------------------------------------------------
// ---- UPDATE PROXIMITY SOUND ----
// Modulates oscillator with whimsical frequencies and gentle vibrato
function updateProximitySound() {
	// Calculate distance from mouse to center
	let centerX = width / 2;
	let centerY = height / 2;
	let distanceToCenter = dist(mouseX, mouseY, centerX, centerY);
	
	// Only play sound when mouse is within range and limbs aren't together
	if (distanceToCenter < maxSoundDistance && !limbsTogether && !fading) {
		// Map distance to frequency (closer = higher, more sparkly pitch)
		let baseFrequency = map(distanceToCenter, 0, maxSoundDistance, maxFrequency, minFrequency);
		
		// Add gentle movement to the pitch for organic feel
		let wobble = sin(frameCount * 0.02) * 15;
		sineOsc.freq(baseFrequency + wobble);
		
		// Map distance to volume (closer = louder, kept gentle for whimsy)
		targetVolume = map(distanceToCenter, 0, maxSoundDistance, 0.12, 0);
	} else {
		// Fade out when mouse moves away or during transitions
		targetVolume = 0;
	}
	
	// Smooth volume transitions to avoid clicks/pops using lerp
	currentVolume = lerp(currentVolume, targetVolume, 0.08);
	sineOsc.amp(currentVolume, 0.1); // Slower ramp for softer, dreamier transitions
}

// -----------------------------------------------------
// ---- INTERACTION UTILITIES ----
// -----------------------------------------------------
// clickPadding creates a buffer zone so clicks near edge of circle don't trigger
// This ensures user is clicking well within the circle
let clickPadding = 100;
// ---- MOUSE PRESSED EVENT ----
// Triggers when user clicks - checks if click is inside center circle
// If yes then it initiates the assembly animation for end of the generation. 
function mousePressed() {
	// Start audio context on first user interaction (required by browsers)
	if (!audioStarted) {
		userStartAudio().then(() => {
			sineOsc.start();
			vibratoOsc.start();
			// Connect vibrato to main oscillator's frequency for shimmer effect
			sineOsc.freq(vibratoOsc);
			audioStarted = true;
			console.log("Audio context started with whimsical shimmer ✨");
		});
	}
	
	// Safety check - prevent multiple triggers during animation phases
	if (limbsTogether || fading) {
		return; // Ignore clicks during these states
	}
	
	// Calculate distance from click to center of canvas
	let centerX = width / 2;
	let centerY = height / 2;
	let distance = dist(mouseX, mouseY, centerX, centerY);

	// Check if click is within the circle (with padding buffer)
	// Padding ensures user clicks well within the circle boundary
	if (distance < centerRadius - clickPadding) {
		limbsTogether = true; // Trigger assembly animation
	}
}

// ---- MOUSE MOVED EVENT ----
// Tracks mouse position to provide hover feedback on center circle
// Changes cursor and circle opacity when mouse is over clickable area
function mouseMoved() {
	// Calculate distance from mouse to center of canvas
	let centerX = width / 2;
	let centerY = height / 2;
	let distance = dist(mouseX, mouseY, centerX, centerY);

	// Check if mouse is within the clickable circle area
	if (distance < centerRadius - clickPadding) {
		hoveringOverCircle = true;
		// Change cursor to pointer (hand) when hovering
		// This provides visual feedback that the circle is clickable
		cursor(HAND);
	} else {
		hoveringOverCircle = false;
		// Reset cursor to arrow when not hovering
		cursor(ARROW); 
	}
}

// -----------------------------------------------------
// ---- WALKER CLASSES ----
// -----------------------------------------------------
// These classes define different walker types with unique characteristics
// Base Walker class provides core functionality, subclasses customize parameters
// ---- BASE WALKER CLASS ----
// Handles biomechanical walking animation and limb positioning
// Uses BMWalker library for realistic human movement
// Library reference: https://github.com/tetunori/BMWalker.js
// This is derived from the original's myWalker class structure
class Walker {
	constructor(_speed=1, x=canvasSize/2, y=canvasSize/2) {
		this.bmw = new BMWalker(); // biological motion walker instance, library from tetunori
		this.walkerHeight = 180;    // Default height in pixels
		this.lineMarkers = [];      // Array of limb segments (lines with start/end points)
		this.pos = createVector(x, y); // Current position on canvas
		this.limbOffsets = [];      // Offset vectors for scattered limbs
		this.limbVelocities = [];   // Velocities for limb physics (unused currently)
		this.straySpeed = 0.5;      // How fast limbs can move when scattered
		this.strayDistance = 50;    // Maximum distance limbs can stray from body
        this.colour = color(200, 200, 200); // Default grey color
		this.alpha = 255;           // Opacity (255 = fully opaque)
		this.initParam();           // Initialise movement parameters
	}
	
	// ---- INITIALISE PARAMETERS ----
	// Set default values for walker parameters
	// These control the walking style, body proportions, and camera angle
	// The initParam() method setting BMWalker properties comes from the original
	initParam() {
		this.speed = 1;              // Walking speed multiplier
		this.bodyStructure = 1.0;    // Body proportions (-ve = child-like, +ve = adult)
		this.weight = -0.2;          // Perceived weight (affects gait)
		this.nervousness = 0.0;      // Nervous energy in movement
		this.happiness = 3.1;        // Emotional state affecting movement
		this.azimuth = Math.PI / 4;  // Horizontal camera angle
		this.angularVelocity = 0;    // Camera rotation speed
		this.elevation = Math.PI / 4;// Vertical camera angle
		this.roll = 0;               // Position around circle (in radians)
		this.alpha = 255;            // Full opacity
		this.setParam();             // Apply parameters to BMWalker
	}
	
	// ---- UPDATE ANIMATION ----
	// Calculate current frame of walking animation
	// p parameter allows phase offset for multiple walkers
	// Same approach as original here for frame-based animation
	update(p=0) {
		// getLineMarkers returns array of limb segments for current animation frame
		this.lineMarkers = this.bmw.getLineMarkers(this.walkerHeight, 1000/60*frameCount+p);
	}
	
	// ---- DRAW WALKER ----
	// Render complete walker with all limbs
	// Inspired by original draw() method.
	// Pulled a few variables out of the function call for clarity and tidiness
	draw() {
		push(); // Save transformation state
		translate(this.pos.x, this.pos.y); // Move to walker position
		
		// Draw all limb segments as lines
		this.lineMarkers.forEach((m) => { 
			line(m[0].x, m[0].y, m[1].x, m[1].y); 
		});
		
		// Draw circles at joints
		this.lineMarkers.forEach((m) => { 
			circle(m[0].x, m[0].y, this.walkerHeight/40);
			circle(m[1].x, m[1].y, this.walkerHeight/40);
		});
		pop(); // Restore transformation state
	}
	
	// ---- UPDATE PARAMETER ----
	// Change a specific walker parameter and apply to BMWalker
	// This allows dynamic modification of walker characteristics
	// Original had same parameter system - a lot is the same here.
	updateParam(param, v) {
		if (param == 'position') { this.pos = v; }
		if (param == 'speed') { this.speed = v; }
		if (param == 'bodyStructure') { this.bodyStructure = v; }
		if (param == 'weight') { this.weight = v; }
		if (param == 'nervousness') { this.nervousness = v; }
		if (param == 'happiness') { this.happiness = v; }
		if (param == 'azimuth') { this.azimuth = v; }
		if (param == 'angularVelocity') { this.angularVelocity = v; }
		if (param == 'elevation') { this.elevation = v; }
		if (param == 'roll') { this.roll = v; }
		if (param == 'enableTranslation') { this.enableTranslation = v; }
		this.setParam(); // Apply changes to BMWalker
	}
	
	// ---- APPLY PARAMETERS TO BMWALKER ----
	// Push all current parameter values to the walker library
	// Again kept original implementation 
	setParam() {
		this.bmw.setSpeed(this.speed);
		this.bmw.setWalkerParam(this.bodyStructure, this.weight, this.nervousness, this.happiness);
		this.bmw.setCameraParam(this.azimuth, this.angularVelocity, this.elevation, this.roll);
		this.bmw.setTranslationParam(this.enableTranslation);
	}

	
	// ---- FADE WALKER ----
	// Mark walker as fading (triggers fade-out animation during dispersal)
    fadeWalker() {
        this.isFading = true;
    }
	
	// ---- UPDATE FADE EFFECT ----
	// Gradually reduce opacity during dispersal phase
	updateFade() {
		//safety check: only proceed if fading is active
		if (!this.isFading) return;
		
		const fadeStep = 8; // Opacity reduction per frame, controls the speed of the fade.
		this.alpha = max(0, this.alpha - fadeStep); // Don't go below 0
		this.colour.setAlpha(this.alpha); // Apply new opacity to color
	}

}

// ---- CHILD WALKER CLASS ----
// Represents children - shorter, faster, more energetic movement
// REMIX ADDITION: Walker type system not in original
// Original used single walker type; we created types to tell lifecycle story
class Child extends Walker {
	initParam() {
        this.colour = color(44, 160, 44); 	// Green color
        this.walkerHeight = 100;          	// Shorter than adults
		this.speed = 2;                   	// Faster walking speed
		this.bodyStructure = -6.0;         	// Child-like proportions
		this.weight = -6;                 	// Lighter weight
		this.nervousness = -3;            	// Energetic, playful movement
		this.happiness = 5.0;              	// Very happy movement
		this.azimuth = Math.PI / 4;			// Default camera angle
		this.angularVelocity = 0.0;			// No camera rotation
		this.elevation = Math.PI / 4;		// Default camera elevation
		this.roll = 0;						// Start position
		this.enableTranslation = false;		// No translation
		this.setParam();					// Apply parameters to BMWalker
	}
}

// ---- MAN WALKER CLASS ----
// Represents adult men - tall, steady, confident movement
// REMIX ADDITION: Walker type system for lifecycle narrative
class Man extends Walker {
	initParam() {
        this.colour = color(31, 119, 180);  // Blue color
        this.walkerHeight = 170;            // Tall
		this.speed = 1.0;                   // Normal walking speed
		this.bodyStructure = 6.0;           // Adult male proportions
		this.weight = 2;                 	// Moderate weight
		this.nervousness = 0.0;             // Calm, steady
		this.happiness = 3.0;               // Neutral mood
		this.azimuth = Math.PI / 4;			// Default camera angle
		this.angularVelocity = 0.0;			// No camera rotation
		this.elevation = Math.PI / 4;		// Default camera elevation
		this.roll = 0;						// Start position
		this.enableTranslation = false;		// No translation
		this.setParam();					// Apply parameters to BMWalker
	}
}

// ---- WOMAN WALKER CLASS ----
// Represents adult women - medium height, graceful but anxious movement
// REMIX ADDITION: Walker type system for lifecycle narrative
class Woman extends Walker {
	initParam() {
        this.colour = color(255, 100, 100);  // Pink/red color
        this.walkerHeight = 150;             // Slightly shorter than men
		this.speed = 1;                      // Normal walking speed
		this.bodyStructure = -6;             // More delicate proportions
		this.weight = -0;                    // Light weight
		this.nervousness = 0;                // Calm, steady
		this.happiness = 3;                  // Slightly happy mood
		this.azimuth = Math.PI / 4;			 // Default camera angle
		this.angularVelocity = 0.0;			 // No camera rotation
		this.elevation = Math.PI / 4;		 // Default camera elevation
		this.roll = 0;						 // Start position
		this.enableTranslation = false;		 // No translation
		this.setParam();					 // Apply parameters to BMWalker
	}
}

// ---- ELDERLY WALKER CLASS ----
// Represents elderly people - shorter, slower, weighted movement
// REMIX ADDITION: Walker type system for lifecycle narrative
class Elderly extends Walker {
	initParam() {
        this.colour = color(120, 120, 130);  // Grey color
        this.walkerHeight = 140;             // Shorter due to age
		this.speed = 0.5;                    // Much slower walking speed
		this.bodyStructure = 4;              // Aged proportions
		this.weight = 6;                     // Heavy, weighted movement
		this.nervousness = 6;                // Uncertain, shaky
		this.happiness = -6;                 // Unhappy mood
		this.azimuth = Math.PI / 4;			 // Default camera angle
		this.angularVelocity = 0.0;			 // No camera rotation
		this.elevation = Math.PI / 4;		 // Default camera elevation
		this.roll = 0;						 // Start position
		this.enableTranslation = false;		 // No translation
		this.setParam();					 // Apply parameters to BMWalker
	}
}