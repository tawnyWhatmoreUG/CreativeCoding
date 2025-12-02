// ============================================================================
// FOOD CONTAINER 3D VISUALIZATION - sketch.js
// ============================================================================
// This sketch renders a 3D food container (base + lid) that the user can
// interact with. The container serves as a metaphor for food security in
// Ireland - when opened, it reveals emptiness, triggering a "Windows error"
// dialog (rendered with HTML) before transitioning to sketch-2.js (BSOD agricultural statistics).
// ============================================================================

// ====== 3D MODEL AND TEXTURE ASSETS ======
let containerBase;      // 3D model for the bottom part of the food container
let containerLid;       // 3D model for the lid/top of the container
let containerTexture;   // Texture map image applied to both models 

// ====== LOADING STATE VARIABLES ======
let loadingComplete = false;  // Flag to track when all assets are loaded
let loadingStartTime;         // Timestamp when loading began (for calculating elapsed time)
let minLoadingTime = 4000;    // 4000ms = 4 seconds minimum loading screen display. This ensures the loading message is readable and provides context about the project before the 3D scene appears

// ====== HOVER INTERACTION STATE ======
let isHoveringLid = false;    // True when mouse cursor is over the lid area

// ====== LID ANIMATION STATE ======
// The lid uses smooth interpolation (lerp) between current and target rotation
let lidRotation = 0;          // Current rotation angle in radians (0 = closed)
let targetLidRotation = 0;    // Target rotation angle (0 = closed, -PI/2.2 = open ~82 degrees)
let isLidOpen = false;        // Boolean flag - once true, lid cannot be closed again
let lidAnimationSpeed = 0.08; // Lerp factor: 0.08 means move 8% toward target each frame. Lower values = slower, smoother animation. Higher values = faster, snappier animation

// ====== CAMERA VIEW STATE ======
// Camera smoothly transitions between perspective view and top-down view
let isTopDownView = false;    // Toggle between perspective (false) and top-down (true) views

// Current camera position
let currentViewCamX = 0;      // Horizontal offset from center
let currentViewCamY = -115;   // Vertical position: -115 places camera above the model
let currentViewCamZ = -200;   // Depth position: -200 places camera in front of model

// Target camera position (where camera is moving toward)
let targetViewCamX = 0;
let targetViewCamY = -115;    // -115 provides a good viewing angle looking slightly down
let targetViewCamZ = -200;    // -200 gives adequate distance to see the full container

let cameraTransitionSpeed = 0.05;  // Lerp factor for camera movement
                                   // 0.05 = 5% movement per frame for smooth transitions

// ====== DIALOG AND SKETCH TRANSITION TIMING ======
// These constants control the pacing of the narrative experience
const DIALOG_DISPLAY_DELAY = 4000;  // 4000ms = 4 seconds. Delay after lid opens before showing error dialog. Gives user time to observe the empty container

const SKETCH_SWAP_TIMEOUT = 8000;   // 8000ms = 8 seconds. Time dialog displays before auto-transitioning to BSOD sketch. Allows user to read the error message

let dialogDisplayTimeoutId = null;  // Stores timeout ID so we can cancel if needed
let swapTimeoutId = null;           // Stores timeout ID for sketch transition

// ============================================================================
// PRELOAD FUNCTION - Loads assets before setup() runs
// ============================================================================
// p5.js calls preload() before setup(). All loadImage() and loadModel() calls
// here will complete before setup() begins, ensuring assets are ready.
function preload() {
  loadingStartTime = millis();  // Record when loading started for timing calculations
  
  // Load the texture map for the container, has the surface detail and label design 
  containerTexture = loadImage('assets/textures/food-container-040-col-metalness-4k.png',
    () => {
      console.log('Texture loaded successfully');
    },
    (error) => {
      console.error('Failed to load texture:', error);
    }
  );
  
  // Load the 3D OBJ model for the container base (bottom portion)
  containerBase = loadModel('assets/container-base.obj', 
    () => {
      console.log('Container base loaded');
    },
    (error) => {
      console.error('Failed to load container base:', error);
    }
  );
  
  // Load the 3D OBJ model for the container lid (top portion)
  // Separate from base so it can be animated independently
  containerLid = loadModel('assets/container-lid.obj',
    () => {
      console.log('Container lid loaded');
    },
    (error) => {
      console.error('Failed to load container lid:', error);
    }
  );
}

// ============================================================================
// SETUP FUNCTION - Initialises the canvas and starts loading check
// ============================================================================
function setup() {
  // Create a full-window WebGL canvas for 3D rendering
  // WEBGL mode enables 3D graphics, lighting, textures, and camera control
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // Begin checking if all assets are loaded
  checkLoadingComplete();
}

// ============================================================================
// LOADING SCREEN MANAGEMENT
// ============================================================================

/**
 * Hides the HTML loading screen with a fade transition
 * The loading screen is defined in index.html and provides context while assets load
 */
function hideLoadingScreen() {
  let loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');  // Triggers CSS fade-out transition
    // Remove from DOM after 500ms transition completes to clean up
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);  // 500ms matches the CSS transition duration
  }
}

/**
 * Recursively checks if loading is complete
 * Waits for: 1) All 3D models loaded, AND 2) Minimum display time elapsed
 */
function checkLoadingComplete() {
  let elapsed = millis() - loadingStartTime;
  
  // Check if all three assets are loaded (truthy check)
  if (containerBase && containerLid && containerTexture) {
    // Calculate how much longer we need to wait to meet minimum time
    let remainingTime = Math.max(0, minLoadingTime - elapsed);
    
    setTimeout(() => {
      loadingComplete = true;
      hideLoadingScreen();
      console.log('Loading complete, hiding loading screen');
    }, remainingTime);
  } else {
    // Models not ready yet - check again in 100ms
    // This creates a polling loop until assets are loaded
    setTimeout(checkLoadingComplete, 100);  // 100ms = 10 checks per second
  }
}

// ============================================================================
// DRAW FUNCTION - Main render loop 
// ============================================================================
function draw() {
  // Light blue-gray background provides clean contrast with the container
  background(235, 240, 255);
  
  // ====== CAMERA POSITION CALCULATION ======
  // Update target camera position based on current view mode
  if (isTopDownView) {
    // Top-down view: camera positioned directly above, looking straight down
    // This view is activated on first click and allows user to "look into" container
    targetViewCamX = 0;      // Centered horizontally
    targetViewCamY = -100;   // -100 units above origin (negative Y is up in p5 WEBGL)
    targetViewCamZ = 0;      // Centered on Z-axis for perfect overhead view
  } else {
    // Normal perspective view with mouse-controlled parallax effect
    // Parallax creates subtle 3D depth as user moves mouse
    let parallaxStrength = 15;  // Maximum offset in pixels (adjustable for effect intensity)
    
    // Map mouse position to parallax offset
    // mouseX at 0 -> -15, mouseX at width -> +15
    let offsetX = map(mouseX, 0, width, -parallaxStrength, parallaxStrength);
    let offsetY = map(mouseY, 0, height, -parallaxStrength, parallaxStrength);
    
    targetViewCamX = offsetX;                  // Horizontal shift based on mouse X
    targetViewCamY = -115 + (offsetY * 5);     // Vertical shift with 5x multiplier for more dramatic effect
    targetViewCamZ = -200 + offsetY;           // Depth shift creates subtle zoom effect
  }
  
  // ====== SMOOTH CAMERA INTERPOLATION ======
  // Use lerp (linear interpolation) to smoothly transition camera to target position, prevents jarring movements
  currentViewCamX = lerp(currentViewCamX, targetViewCamX, cameraTransitionSpeed);
  currentViewCamY = lerp(currentViewCamY, targetViewCamY, cameraTransitionSpeed);
  currentViewCamZ = lerp(currentViewCamZ, targetViewCamZ, cameraTransitionSpeed);
  
  // Apply camera transformation
  // camera(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ)
  // Eye position is where camera is located
  // Center is the point the camera looks at (origin 0,0,0)
  // Up defines a slight camera tilt for visual interest
  camera(currentViewCamX, currentViewCamY, currentViewCamZ, 0, 0, 0, 0, 20, 0);

  // ====== LIGHTING SETUP ======
  // Main key light - white point light positioned upper-right-front
  // Position (200, -200, 200) creates dramatic shadows and highlights
  pointLight(255, 255, 255, 200, -200, 200);
  
  // Ambient light fills in shadows to prevent pure black areas
  // RGB(120, 120, 120) = neutral gray, 47% brightness
  ambientLight(120, 120, 120);
  
  // ====== INTERIOR LIGHTING (only when lid is open) ======
  // When lid opens, reveal the emptiness with dramatic interior lighting
  // Without this, it was hard to make out the inside surfaces against dark shadows
  if (isLidOpen) {
    // Multiple point lights positioned to illuminate all interior surfaces
    pointLight(255, 255, 240, 0, 30, 50);   // Center-top: main interior illumination
    pointLight(220, 220, 255, 0, 60, 30);   // Mid-height, slightly back
    
    // Side lights for even coverage
    pointLight(255, 250, 230, -50, 40, 50); // Left side
    pointLight(255, 250, 230, 50, 40, 50);  // Right side (symmetric)
    pointLight(240, 240, 255, 0, 70, 80);   // Front interior wall light
    
    // Directional light pointing straight down into container
    directionalLight(200, 200, 210, 0, 1, 0);
    
    // Additional ambient light when lid is open, slightly blue-tinted for cold, empty feeling
    ambientLight(80, 80, 85);
  }
  
  // ====== 3D MODEL RENDERING ======
  noStroke();  // No wireframe outlines on 3D models
  translate(0, 0, 50);  // Move entire scene 50 units toward camera for better framing, I couldn't seem to move the model itself which would have made more sense! 
  
  // ====== CONTAINER BASE RENDERING ======
  push();  // Save transformation state
  translate(0, 0, 0);  // Base positioned at origin
  texture(containerTexture);  // Apply the diffuse texture
  shininess(80);  // shininess of 80 gives a semi-glossy plastic appearance
  specularMaterial(180);  // 180 = moderately reflective surface
  model(containerBase);  // Render the 3D model
  pop();  // Restore transformation state
  
  // ====== CONTAINER LID RENDERING ======
  push(); // Save lid transformation state
  translate(0, 0, 0);  // Lid starts at origin (same as base - they share hinge point)
  
  // Animate lid rotation using smooth interpolation
  // lerp(current, target, amount) moves current 8% toward target each frame
  lidRotation = lerp(lidRotation, targetLidRotation, lidAnimationSpeed);
  
  // Apply rotation around X-axis (the "hinge" of the lid)
  // Positive X rotation would tilt toward camera, negative tilts away (opens up)
  rotateX(lidRotation);
  
  // Update hover detection for cursor feedback
  checkLidHover();
  
  // Visual feedback when hovering: brighten the lid slightly
  if (isHoveringLid) {
    ambientLight(40, 40, 40);  // Additional ambient light brightens hovered object
  }
  
  // Flip texture horizontally to correct label orientation
  // The 3D model's UV mapping results in backwards text without this
  push();
  scale(-1, 1, 1);  // Mirror on X-axis (horizontal flip)
  texture(containerTexture); 
  shininess(50);         // Less shiny than base (50 vs 80) for subtle material variation
  specularMaterial(120); // Lower specular (120 vs 180) - slightly more matte finish
  model(containerLid);   // Render the lid 3D model
  pop();  // Restore texture flip
  pop();  // Restore lid transformation
}

// ============================================================================
// HOVER DETECTION - Determines if mouse is over the lid
// ============================================================================
/**
 * Uses distance-based detection to approximate if mouse is hovering over lid
 * This is simpler than ray-casting and works well for single-object interaction
 */
function checkLidHover() {
  // Convert the lid's 3D position (0,0,0) to 2D screen coordinates
  let lidCenter = screenPosition(0, 0, 0);
  
  // Define circular hover area around lid center
  // 200 pixels approximates the lid's visual size
  let hoverRadius = 200;
  
  // Calculate distance from mouse to lid center
  let d = dist(mouseX, mouseY, lidCenter.x, lidCenter.y);
  
  // Mouse is "hovering" if within the radius
  isHoveringLid = (d < hoverRadius);
  
  // Update cursor to provide visual feedback about interaction possibilities
  if (isHoveringLid) {
    if (isTopDownView) {
      // In top-down view: n-resize cursor (upward arrow) hints at "open" action
      cursor('n-resize');
    } else {
      // In perspective view: pointer indicates clickable element
      cursor('pointer');
    }
  } else {
    // Default cursor when not hovering
    cursor('default');
  }
}

// ============================================================================
// 3D TO 2D COORDINATE CONVERSION
// This implementation was generated by an AI model based on the core logic 
// of the 'p5js-screenPosition' library (e.g., by @bohnacker) which provides 
// 3D-to-2D projection for p5.js WebGL rendering.
// Reference: https://github.com/bohnacker/p5js-screenPosition/blob/master/addScreenPositionFunction.js
// ============================================================================
/**
 * Converts a 3D world position to 2D screen coordinates
 * Used for hover detection - maps lid position to where it appears on screen
 * 
 * @param {number} x - X position in 3D world space
 * @param {number} y - Y position in 3D world space  
 * @param {number} z - Z position in 3D world space
 * @returns {p5.Vector} - 2D screen position (x, y)
 */
function screenPosition(x, y, z) {
  // Access p5's internal camera object for matrix calculations
  let cam = _renderer._curCamera;
  let p = createVector(x, y, z);
  
  // Combine projection and view matrices into Model-View-Projection matrix
  // This transforms 3D coordinates through the full rendering pipeline
  let mvp = cam.projMatrix.copy();
  mvp.apply(cam.cameraMatrix.copy());
  
  // Define viewport boundaries (full canvas)
  let viewport = [0, 0, width, height];
  
  // Transform 3D point to clip space (homogeneous coordinates)
  // The 4th component (w=1) enables perspective transformation
  let clip = multMatrixVector(mvp, [p.x, p.y, p.z, 1]);
  
  // Perspective divide: convert from homogeneous to Cartesian coordinates
  // Dividing by w creates the perspective effect (distant objects smaller)
  if (clip[3] !== 0) {
    clip[0] /= clip[3];
    clip[1] /= clip[3];
    clip[2] /= clip[3];
  }
  
  // Convert normalized device coordinates (-1 to 1) to screen pixels
  // X: maps [-1, 1] to [0, width]
  // Y: maps [-1, 1] to [height, 0] (inverted because screen Y increases downward)
  let screen = createVector(
    viewport[0] + (1 + clip[0]) * viewport[2] / 2,
    viewport[1] + (1 - clip[1]) * viewport[3] / 2
  );
  
  return screen;
}

/**
 * Matrix-vector multiplication for 4x4 transformation matrices
 * Used in the 3D-to-2D coordinate conversion pipeline
 * 
 * @param {p5.Matrix} mat - 4x4 transformation matrix
 * @param {number[]} vec - 4-component vector [x, y, z, w]
 * @returns {number[]} - Transformed 4-component vector
 */
function multMatrixVector(mat, vec) {
  let result = [0, 0, 0, 0];
  let m = mat.mat4;  // Access raw matrix data (column-major order)
  
  // Standard 4x4 matrix-vector multiplication
  // Matrix indices: 0-3 = column 1, 4-7 = column 2, 8-11 = column 3, 12-15 = column 4
  result[0] = m[0] * vec[0] + m[4] * vec[1] + m[8] * vec[2] + m[12] * vec[3];
  result[1] = m[1] * vec[0] + m[5] * vec[1] + m[9] * vec[2] + m[13] * vec[3];
  result[2] = m[2] * vec[0] + m[6] * vec[1] + m[10] * vec[2] + m[14] * vec[3];
  result[3] = m[3] * vec[0] + m[7] * vec[1] + m[11] * vec[2] + m[15] * vec[3];
  
  return result;
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handles window resize events
 * Ensures canvas always fills the browser window
 */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/**
 * Handles mouse click interactions
 * Implements a two-stage interaction:
 *   1. First click: Transition to top-down view
 *   2. Second click (on lid): Open the lid and trigger dialog
 */
function mousePressed() {
  // Ignore clicks when the Windows error dialog is visible
  // This prevents interaction during the transition to sketch-2
  let dialog = document.getElementById('windowsDialog');
  if (dialog && dialog.classList.contains('visible')) {
    return;
  }
  
  // STAGE 1: First click transitions to top-down view
  // This zooms in and positions camera to look into the container
  if (!isTopDownView) {
    isTopDownView = true;
  }
  // STAGE 2: When in top-down view, clicking the lid opens it
  // Conditions: must be in top-down view, hovering lid, and lid not already open
  else if (isTopDownView && isHoveringLid && !isLidOpen) {
    isLidOpen = true;  // Permanently mark lid as open (cannot close)
    
    // Set target rotation for lid animation
    // -PI/2.2 ≈ -1.43 radians ≈ -82 degrees (slightly less than 90°)
    // Using 2.2 instead of 2 opens the lid to a natural-looking angle
    // Negative value rotates the lid upward/backward
    targetLidRotation = -PI / 2.2;
    
    // Trigger the Windows error dialog sequence
    showWindowsDialog();
  }
}

// ============================================================================
// WINDOWS DIALOG FUNCTIONS
// ============================================================================

/**
 * Shows the Windows-style error dialog with glitch effects
 * This dialog appears after the lid opens, revealing the empty container
 * After a timeout, automatically transitions to sketch-2.js (BSOD)
 */
function showWindowsDialog() {
  let dialog = document.getElementById('windowsDialog');
  if (dialog) {
    // Initial glitch effect on the page background
    // 1200ms delay gives moment to register the empty container
    setTimeout(() => {
      document.body.classList.add('glitching');
      
      // Remove glitch after animation (500ms duration)
      setTimeout(() => {
        document.body.classList.remove('glitching');
      }, 500);  // 500ms = half second glitch duration
    }, 1200);   // 1200ms = 1.2 second delay before first glitch
    
    // Show the dialog after delay (allows viewing empty container)
    console.log(`Waiting ${DIALOG_DISPLAY_DELAY / 1000} seconds before showing dialog`);
    dialogDisplayTimeoutId = setTimeout(() => {
      dialog.classList.add('visible');  // CSS class triggers fade-in
      
      // Glitch effect when dialog appears
      dialog.classList.add('glitching');
      setTimeout(() => {
        dialog.classList.remove('glitching');
      }, 400);  // 400ms glitch duration for dialog
      
      // Start ongoing glitch effects for unsettling atmosphere
      startRepeatingGlitch(dialog);
      
      // After dialog displays, transition to BSOD sketch
      console.log(`Starting ${SKETCH_SWAP_TIMEOUT / 1000} second timeout before sketch swap`);
      swapTimeoutId = setTimeout(() => {
        triggerSketchSwap();  // Defined in index.html - loads sketch-2.js
      }, SKETCH_SWAP_TIMEOUT);
    }, DIALOG_DISPLAY_DELAY);
  }
}

// ============================================================================
// GLITCH EFFECT SYSTEM
// ============================================================================

// Stores timeout ID for cancellation when dialog is hidden
let glitchIntervalId = null;

/**
 * Creates ongoing random glitch effects on an element
 * Glitches occur at random intervals (1.5-3 seconds) for unpredictable feel
 * 
 * @param {HTMLElement} element - DOM element to apply glitch effect to
 */
function startRepeatingGlitch(element) {
  //internal function to schedule the next glitch

  function scheduleNextGlitch() {
    // Random delay between 1500-3000ms for unpredictable timing
    let delay = random(1500, 3000);
    
    glitchIntervalId = setTimeout(() => {
      // Only glitch if element is still visible
      if (element.classList.contains('visible')) {
        element.classList.add('glitching');
        
        // Remove glitch class after 400ms
        setTimeout(() => {
          element.classList.remove('glitching');
        }, 400);
        
        // Schedule next glitch recursively
        scheduleNextGlitch();
      }
    }, delay);
  }
  //initial call to start the cycle
  scheduleNextGlitch();  // Start the cycle
}

/**
 * Hides the Windows dialog and cleans up all timers
 * Called if user interaction interrupts the automatic flow
 */
function hideWindowsDialog() {
  //get the dialog element by id selector
  let dialog = document.getElementById('windowsDialog');
  //check if dialog exists
  if (dialog) {
    //remove visibility 
    dialog.classList.remove('visible');
    //important so we stop any glitching when dialog is hidden 
    dialog.classList.remove('glitching');
    
    // Clean up repeating glitch timer
    if (glitchIntervalId) {
      clearTimeout(glitchIntervalId);
      glitchIntervalId = null;
    }
    
    // Clean up dialog display timer
    if (dialogDisplayTimeoutId) {
      clearTimeout(dialogDisplayTimeoutId);
      dialogDisplayTimeoutId = null;
      console.log('Dialog display timeout cleared');
    }
    
    // Clean up sketch swap timer
    if (swapTimeoutId) {
      clearTimeout(swapTimeoutId);
      swapTimeoutId = null;
      console.log('Sketch swap timeout cleared');
    }
  }
}

