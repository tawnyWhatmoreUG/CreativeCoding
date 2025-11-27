let containerBase;
let containerLid;
let containerTexture;

// Loading state variables
let loadingComplete = false;
let loadingStartTime;
let minLoadingTime = 4000; // Minimum time to show loading screen. this looks better than the default p5js loading, gives the viewer some context of project while waiting for models to load 

// Hover state for lid
let isHoveringLid = false;

// Lid rotation state
let lidRotation = 0; // Current rotation angle
let targetLidRotation = 0; // Target rotation angle (0 = closed, PI/2 = open)
let isLidOpen = false; // Track if lid is open or closed
let lidAnimationSpeed = 0.08; // How fast the lid rotates (lower = smoother)

// Camera view state
let isTopDownView = false; // Track if in top-down view
let currentViewCamX = 0, currentViewCamY = -115, currentViewCamZ = -200; // Current interpolated camera position
let targetViewCamX = 0, targetViewCamY = -115, targetViewCamZ = -200; // Target camera position for view transitions
let cameraTransitionSpeed = 0.05; // How fast the camera transitions between views

// Timeout for dialog display and automatic sketch swap
const DIALOG_DISPLAY_DELAY = 4000; // 4 seconds delay before showing dialog (time to view empty container)
const SKETCH_SWAP_TIMEOUT = 8000; // 8 seconds in milliseconds
let dialogDisplayTimeoutId = null; // Store timeout ID for dialog display
let swapTimeoutId = null; // Store timeout ID to clear if needed

function preload() {
  loadingStartTime = millis();
  
  // Load texture - using the color/diffuse map
  containerTexture = loadImage('assets/textures/food-container-040-col-metalness-4k.png',
    () => {
      console.log('Texture loaded successfully');
    },
    (error) => {
      console.error('Failed to load texture:', error);
    }
  );
  
  // Load models with success/error callbacks
  containerBase = loadModel('assets/container-base.obj', 
    () => {
      console.log('Container base loaded');
     
    },
    (error) => {
      console.error('Failed to load container base:', error);
    }
  );
  
  containerLid = loadModel('assets/container-lid.obj',
    () => {
      console.log('Container lid loaded');
    },
    (error) => {
      console.error('Failed to load container lid:', error);
    }
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // Check if models are loaded and hide loading screen
  checkLoadingComplete();
}

// Function to hide loading screen
function hideLoadingScreen() {
  let loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
    // Remove from DOM after transition
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
}

// Check if loading is complete and enough time has passed
function checkLoadingComplete() {
  let elapsed = millis() - loadingStartTime;
  
  // Wait for both: models loaded AND minimum display time
  if (containerBase && containerLid && containerTexture) {
    let remainingTime = Math.max(0, minLoadingTime - elapsed);
    
    setTimeout(() => {
      loadingComplete = true;
      hideLoadingScreen();
      console.log('Loading complete, hiding loading screen');
    }, remainingTime);
  } else {
    // Check again in 100ms if models aren't ready
    setTimeout(checkLoadingComplete, 100);
  }
}

function draw() {
  background(235,240,255); // Light background to contrast with container
  
  // Update target camera position based on view mode
  if (isTopDownView) {
    // Top-down view: camera directly above looking down
    targetViewCamX = 0;
    targetViewCamY = -100; // Position camera high above the model
    targetViewCamZ = 0; // Centered on Z-axis for perfect top-down view
  } else {
    // Normal view with parallax
    let parallaxStrength = 15; // Adjust this for more/less parallax
    let offsetX = map(mouseX, 0, width, -parallaxStrength, parallaxStrength);
    let offsetY = map(mouseY, 0, height, -parallaxStrength, parallaxStrength);
    
    targetViewCamX = offsetX;
    targetViewCamY = -115 + (offsetY * 5); // Base Y position with increased parallax effect
    targetViewCamZ = -200 + offsetY; // Base Z position with parallax
  }
  
  // Smoothly interpolate current camera position to target
  currentViewCamX = lerp(currentViewCamX, targetViewCamX, cameraTransitionSpeed);
  currentViewCamY = lerp(currentViewCamY, targetViewCamY, cameraTransitionSpeed);
  currentViewCamZ = lerp(currentViewCamZ, targetViewCamZ, cameraTransitionSpeed);
  
  // Set camera position
  camera(currentViewCamX, currentViewCamY, currentViewCamZ, 0, 0, 0, 0, 20, 0);

  // Add extra point lights
  //pointLight method signature: pointLight(v1, v2, v3, x, y, z)
  pointLight(255, 255, 255, 200, -200, 200);
  
  // Add ambient light for better material lighting, can appear bit dark without 
  ambientLight(120, 120, 120);
  
  // If lid is open, add interior lighting to illuminate the empty container
  if (isLidOpen) {
    // Multiple point lights positioned to illuminate interior surfaces
    pointLight(255, 255, 240, 0, 30, 50);   // Warm white light from center-top inside
    pointLight(220, 220, 255, 0, 60, 30);   // Cool fill light from mid-height, slightly back
    pointLight(255, 250, 230, -50, 40, 50); // Soft light from left side
    pointLight(255, 250, 230, 50, 40, 50);  // Soft light from right side
    pointLight(240, 240, 255, 0, 70, 80);   // Light from front interior wall
    // Add directional light pointing down into the container
    directionalLight(200, 200, 210, 0, 1, 0); // Soft downward light
    // Increase ambient light when lid is open for better overall interior visibility
    ambientLight(80, 80, 85);
  }
  
  noStroke();
translate(0, 0, 50);
  
  // The Base
  push();
  translate(0, 0, 0); // Move base to origin
  texture(containerTexture);
  shininess(80); // Increased shininess for more depth
  specularMaterial(180); // Add specular highlights to create dimension
  model(containerBase);
  pop();
  
  // Add a subtle interior floor plane when lid is open to help visualize emptiness
  if (isLidOpen) {
    push();
    translate(0, 50, 50); // Position at bottom of container interior
    rotateX(HALF_PI); // Rotate to be horizontal
    fill(240, 240, 245); // Very light blue-gray color
    ambientMaterial(255, 255, 255); // Make it reflect ambient light well
    plane(130, 90); // Adjust size to fit container interior
    pop();
  }
  
  //The Lid
  push();
  translate(0, 0, 0); // Move lid to the right to align with base
  
  // Animate lid rotation smoothly
  // Lerp (linear interpolation) between current and target rotation
  lidRotation = lerp(lidRotation, targetLidRotation, lidAnimationSpeed);
  
  // Apply rotation around the hinge point
  rotateX(lidRotation); // Rotate around X-axis (opens upward)
  
  // Check if mouse is hovering over lid
  checkLidHover();
  
  // Apply whitening effect based on hover state
  if (isHoveringLid) {
    ambientLight(40, 40, 40); // Extra ambient light for overall brightening
  }
  
  // Flip the texture horizontally for the lid to fix backwards text
  push();
  scale(-1, 1, 1); // Flip horizontally so text isn't backwards on the label
  texture(containerTexture); // Apply the imported texture. 
  shininess(50); // More shiny than the base
  specularMaterial(120); // Brighter highlights
  //render the model
  model(containerLid);
  pop();
  pop();
}

// Check if mouse is hovering over the lid model
function checkLidHover() {
  // Get the screen position of the lid center
  // The lid is positioned at (0, 0, 0) in 3D space
  let lidCenter = screenPosition(0, 0, 0);
  
  // Define approximate hover area (you can adjust these values)
  // Based on the lid's size on screen
  let hoverRadius = 200; // Adjust this to match the lid's size
  
  // Calculate distance from mouse to lid center
  let d = dist(mouseX, mouseY, lidCenter.x, lidCenter.y);
  
  // Set hover state based on distance
  isHoveringLid = (d < hoverRadius);
  
  // Update cursor based on hover state and view mode
  if (isHoveringLid) {
    if (isTopDownView) {
      // Top-down view: show arrow cursor indicating 'opening' action
      cursor('n-resize'); // Upward arrow indicates opening
    } else {
      // Not top-down view: show pointer cursor
      cursor('pointer');
    }
  } else {
    // Not hovering: default cursor
    cursor('default');
  }
}

// Helper function to convert 3D position to screen coordinates
function screenPosition(x, y, z) {
  let cam = _renderer._curCamera;
  let p = createVector(x, y, z);
  
  // Get model view projection matrix
  let mvp = cam.projMatrix.copy();
  mvp.apply(cam.cameraMatrix.copy());
  
  // Transform point
  let viewport = [0, 0, width, height];
  let clip = multMatrixVector(mvp, [p.x, p.y, p.z, 1]);
  
  // Perspective divide
  if (clip[3] !== 0) {
    clip[0] /= clip[3];
    clip[1] /= clip[3];
    clip[2] /= clip[3];
  }
  
  // Convert to screen coordinates
  let screen = createVector(
    viewport[0] + (1 + clip[0]) * viewport[2] / 2,
    viewport[1] + (1 - clip[1]) * viewport[3] / 2
  );
  
  return screen;
}

// Helper function to multiply matrix by vector
function multMatrixVector(mat, vec) {
  let result = [0, 0, 0, 0];
  let m = mat.mat4;
  
  result[0] = m[0] * vec[0] + m[4] * vec[1] + m[8] * vec[2] + m[12] * vec[3];
  result[1] = m[1] * vec[0] + m[5] * vec[1] + m[9] * vec[2] + m[13] * vec[3];
  result[2] = m[2] * vec[0] + m[6] * vec[1] + m[10] * vec[2] + m[14] * vec[3];
  result[3] = m[3] * vec[0] + m[7] * vec[1] + m[11] * vec[2] + m[15] * vec[3];
  
  return result;
}

// Handle window resizing
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Handle mouse clicks to toggle lid open/closed
function mousePressed() {
  // Don't handle clicks if the dialog is visible
  let dialog = document.getElementById('windowsDialog');
  if (dialog && dialog.classList.contains('visible')) {
    return; // Ignore clicks when dialog is showing
  }
  
  // First click: Zoom to top-down view
  if (!isTopDownView) {
    isTopDownView = true;
  }
  // When in top-down view: Open the lid (only if hovering over lid and lid is not already open)
  else if (isTopDownView && isHoveringLid && !isLidOpen) {
    // Open the lid (cannot be closed once opened)
    isLidOpen = true;
    targetLidRotation = -PI / 2.2; // Open 90 degrees (negative rotates upward)
    showWindowsDialog(); // Show the dialog when lid opens
  }
}

// Function to show the Windows dialog
function showWindowsDialog() {
  let dialog = document.getElementById('windowsDialog');
  if (dialog) {
    // Trigger glitch animation on the body when lid opens (with 1 second delay)
    setTimeout(() => {
      document.body.classList.add('glitching');
      
      // Remove glitch class after animation completes (0.2s * 2 iterations = 0.4s)
      setTimeout(() => {
        document.body.classList.remove('glitching');
      }, 500);
    }, 1200);
    
    // Delay showing the dialog to give users time to see the empty container
    console.log(`Waiting ${DIALOG_DISPLAY_DELAY / 1000} seconds before showing dialog`);
    dialogDisplayTimeoutId = setTimeout(() => {
      dialog.classList.add('visible');
      
      // Trigger glitch animation on the dialog when it becomes visible
      dialog.classList.add('glitching');
      setTimeout(() => {
        dialog.classList.remove('glitching');
      }, 400);
      
      // Set up repeating glitch effect on the dialog
      startRepeatingGlitch(dialog);
      
      // Start timeout to automatically swap sketches after dialog is shown
      console.log(`Starting ${SKETCH_SWAP_TIMEOUT / 1000} second timeout before sketch swap`);
      swapTimeoutId = setTimeout(() => {
        triggerSketchSwap();
      }, SKETCH_SWAP_TIMEOUT);
    }, DIALOG_DISPLAY_DELAY);
  }
}

// Interval ID for repeating glitch effect
let glitchIntervalId = null;

// Function to create repeating glitch effect
function startRepeatingGlitch(element) {
  // Glitch every 1.5-3 seconds randomly
  function scheduleNextGlitch() {
    let delay = random(1500, 3000); // Random delay between glitches
    glitchIntervalId = setTimeout(() => {
      if (element.classList.contains('visible')) {
        element.classList.add('glitching');
        setTimeout(() => {
          element.classList.remove('glitching');
        }, 400);
        scheduleNextGlitch(); // Schedule next glitch
      }
    }, delay);
  }
  scheduleNextGlitch();
}

// Function to hide the Windows dialog
function hideWindowsDialog() {
  let dialog = document.getElementById('windowsDialog');
  if (dialog) {
    dialog.classList.remove('visible');
    dialog.classList.remove('glitching');
    
    // Clear the repeating glitch effect
    if (glitchIntervalId) {
      clearTimeout(glitchIntervalId);
      glitchIntervalId = null;
    }
    
    // Clear both timeouts if dialog is hidden before they complete
    if (dialogDisplayTimeoutId) {
      clearTimeout(dialogDisplayTimeoutId);
      dialogDisplayTimeoutId = null;
      console.log('Dialog display timeout cleared');
    }
    if (swapTimeoutId) {
      clearTimeout(swapTimeoutId);
      swapTimeoutId = null;
      console.log('Sketch swap timeout cleared');
    }
  }
}

// Handle keyboard input for camera view toggle
function keyPressed() {
  if (key === 't' || key === 'T') {
    isTopDownView = !isTopDownView;
  }
}