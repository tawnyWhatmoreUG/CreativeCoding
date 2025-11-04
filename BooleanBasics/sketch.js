// Animal characteristics (the booleans are global variables so they can be toggled in the mousepressed function)

//toggle these by clicking in the canvas when the code is running, or else have a cheeky play by changing the values here in the code!  
    let hasBackbone = true; 
    let hasFur = true;
    let laysEggs = false;
    let coldBlooded = false;
    let hasFeathers = false;


//you can ignore the rest for now if you soley wanna focus on booleans
//but if you want to venture down theres a nice if/else flow in the mousePressed function :D


    // Color variables
    let greenColor, redColor;

    function setup() {
      createCanvas(windowWidth, windowHeight);
      
      // init colours in setup. 
      greenColor = color(70, 255, 140);
      redColor = color(255, 100, 100);
    }

    function draw() {
      background(253, 252, 255);
      
      // Title
      fill(20, 40, 60);
      textSize(28);
      textAlign(CENTER);
      text("Boolean Basics", width/2, 50);
      textSize(20);
      text("Click the individual boolean values to toggle their values", width/2, 80);
      
      let y = 120;
    
      textAlign(LEFT);
      
      // Show individual booleans
      fill(hasBackbone ? greenColor : redColor);
      text("let hasBackbone = " + hasBackbone, 80, y);
      y += 50;
      
      fill(hasFur ? greenColor : redColor);
      text("let hasFur = " + hasFur, 80, y);
      y += 50;
      
      fill(laysEggs ? greenColor : redColor);
      text("let laysEggs = " + laysEggs, 80, y);
      y += 50;
      
      fill(coldBlooded ? greenColor : redColor);
      text("let coldBlooded = " + coldBlooded, 80, y);
      y += 50;
      
      fill(hasFeathers ? greenColor : redColor);
      text("let hasFeathers = " + hasFeathers, 80, y);
      y += 80;
      
      //These will change between red(condition is false) and green (condition is true) colour, based on the values of the booleans at the top. 
      let isMammal = hasBackbone && hasFur && !laysEggs;
      fill(isMammal ? greenColor : redColor);
      text("let isMammal = hasBackbone && hasFur && !laysEggs → " + isMammal, 80, y);
      y += 50;
      
      let isBird = hasBackbone && hasFeathers && laysEggs;
      fill(isBird ? greenColor : redColor);
      text("let isBird = hasBackbone && hasFeathers && laysEggs → " + isBird, 80, y);
      y += 50;
      
      let isReptile = hasBackbone && coldBlooded && laysEggs && !hasFeathers;
      fill(isReptile ? greenColor : redColor);
      text("let isReptile = hasBackbone && coldBlooded && laysEggs → " + isReptile, 80, y);
      y += 50;
      
      let isInvertebrate = !hasBackbone;
      fill(isInvertebrate ? greenColor : redColor);
      text("let isInvertebrate = !hasBackbone → " + isInvertebrate, 80, y);
    }

    function mousePressed() {
      
      if (mouseX > 80 && mouseX < 600) {  // Within the text area width
        if (mouseY > 100 && mouseY < 150) {  // hasBackbone area
          hasBackbone = !hasBackbone;
        }
        else if (mouseY > 150 && mouseY < 200) {  // hasFur area
          hasFur = !hasFur;
        }
        else if (mouseY > 200 && mouseY < 250) {  // laysEggs area
          laysEggs = !laysEggs;
        }
        else if (mouseY > 250 && mouseY < 300) {  // coldBlooded area
          coldBlooded = !coldBlooded;
        }
        else if (mouseY > 300 && mouseY < 350) {  // hasFeathers area
          hasFeathers = !hasFeathers;
        }
      }
    }

//mouse hovering - change to cursor when in text area 
    function mouseMoved() {

      if (mouseX > 80 && mouseX < 600 && mouseY > 150 && mouseY < 350) {  // Within the text area width
        cursor('pointer');
      } else {
        cursor('default');
      }
    }


//Small footnote ... You may have seen the fills using a weird ? and : ... this is called a 'ternary operator' - it's essentially an inline if/else condition, handy for consice code, thats all.  :) 
//it's the same as writing if (isInvertebrate) { fill(greenColor) } else  { fill(redColor) } 
//but instead its written in short form like: fill(isInvertebrate ? greenColor : redColor); ,performs the exact same way- what comes after the '?' is the true flow, and what comes after the ':' is the false flow