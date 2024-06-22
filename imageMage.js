//var pixelColors = document.getElementById('pixelColors');

var loadingScreen = document.getElementById("coverScreen");

var palettePresets = [
    {name: "mage", displayName: "Mage", palette: ["#0066A4","#640000","#006400","#FFC300","#FFFFFF","#000000"]},
    {name: "viridis", displayName: "Viridis", palette: ["#fde725","#7ad151","#22a884","#2a788e","#414487","#440154"]},
    {name: "analog", displayName: "Analog", palette: ["#d27575","#675a55","#529b9c","#9cba8f","#eac392","#FFFFFF"]},
    {name: "inferno", displayName: "Inferno", palette: ["#fcffa4","#fca50a","#dd513a","#932667","#420a68","#000004"]},
    {name: "vaporwave", displayName: "Vaporwave", palette: ["#D336BE","#E1A5EE","#05C3DD","#1E22AA","#D1EFED","#FFFFFF"]},
    {name: "bohemian", displayName: "Bohemian", palette: ["#3F2021","#B04A5A","#BA5B3F","#CB9576","#7FA0AC","#EEE5D3"]},
    {name: "earth", displayName: "Earth", palette: ["#8e412e","#ba6f4d","#e6cebc","#a2a182","#687259","#123524"]},
    {name: "primary", displayName: "Primary", palette: ["#c90000","#fff400","#0004ff","#ffffff","#ffffff","#000000"]},
    {name: "custom", displayName: "Custom >>", palette: ["#FFFFFF","#DDDDDD","#BBBBBB","#000000","#000000","#000000"]}
];
var chosenPalette = palettePresets[0].palette;

//set as equal to mage palette upon first load, in RGB space
var chosenPaletteRGBValues = [
    [0, 102, 164],
    [100, 0, 0],
    [0, 100, 0],
    [255, 195, 0],
    [255, 255, 255],
    [0, 0, 0]
];

var isImageLoaded = false;

// var screenWidth = window.innerWidth; // get the width of the browser screen

var WINDOWREDUCTIONS = {
    w: 0.96,
    h: 0.78
}

var actualWidth;
var actualHeight;

var newCanvas = document.createElement('canvas');
var newCtx = newCanvas.getContext('2d');

var pixels;

// Add event listeners to the input boxes

var visualizationChoiceMenu = document.getElementById('visualizationChoice');
var visualizationChoice = visualizationChoiceMenu.value;
visualizationChoiceMenu.addEventListener('change', refresh);

var imageInput = document.getElementById('imageInput');
// ORIGINAL FUNCTION CALL...
imageInput.addEventListener('change', (e) => {
    //readSourceImage(imageInput.value);
});
// NEW FUNCTION CALL...
imageInput.addEventListener('change', (e) => {
    getFile(imageInput.files[0]);

});

var redrawButton = document.getElementById('generate-button');
redrawButton.addEventListener('click', refresh);

var saveButton = document.getElementById('save-image-button');
saveButton.addEventListener('click', () => {
    saveImage();
});

function getRGBAInput(){
    let red = document.getElementById('red');
    red.addEventListener('change', refresh);
    let green = document.getElementById('green');
    green.addEventListener('change', refresh);
    let blue = document.getElementById('blue');
    blue.addEventListener('change', refresh);
    let alpha = document.getElementById('alpha');
    alpha.addEventListener('change', refresh);
    return {r: red.value, g: green.value, b: blue.value, a: alpha.value}
}

function inputSmearWidth(){
    let smear = document.getElementById('smearWidth');
    smear.addEventListener('change', refresh);
    return minmax(smear.value)
}

function inputChosenPixel(){
    let pixel = document.getElementById('chosenPixel');
    chosenPixelInput.addEventListener('change', refresh);
    return minmax(pixel.value)
}

function inputNoiseProbability(){
    let noise = document.getElementById('noiseProbability');
    noise.addEventListener('change', refresh);
    return minmax(noise.value)
}

function inputNoiseColorRange(){
    let range = document.getElementById('noiseColorRange');
    range.addEventListener('change', refresh);
    return minmax(range.value)
}

function rgbColorRange(){
    return inputNoiseColorRange() / 100 * 255;
}

function inputDotSizeFactor(){
    let dsf = document.getElementById('dotSizeFactor');
    dsf.addEventListener('change', refresh);
    return minmax(dsf.value)
}

var backgroundColorInput = document.getElementById('backgroundColorInput');
var backgroundColor = backgroundColorInput.value;

function minmax(input){
    return Math.min(100, Math.max(0, Number(input)));
}

//main method
initPhotoCarousel();
getUserInputs();
initPaletteControls();

parseImage('images/HK2024.jpg', 1, true);
//showDefaultImage();



// Grab new user inputs from control menu
function getUserInputs() {
    console.log("getUserInputs()")

    visualizationChoice = String(visualizationChoiceMenu.value);

    // redShift = parseInt(redInput.value);
    // greenShift = parseInt(greenInput.value);
    // blueShift = parseInt(blueInput.value);
    // alphaShift = parseFloat(alphaInput.value);

    //smearWidth = Math.min(100,Math.max(0,Number(smearWidthInput.value)));
    //chosenPixel = Math.min(100,Math.max(0,Number(chosenPixelInput.value)));
    //noiseProbability = Math.min(100,Math.max(0,Number(noiseProbabilityInput.value)));
    //noiseColorRange = Math.min(100,Math.max(0,Number(noiseColorRangeInput.value)));
    //dotSizeFactor = Math.min(100,Math.max(0,Number(dotSizeFactorInput.value)));

    //rgbColorRange = noiseColorRange/100 * 255;

    if(visualizationChoice == "sketch"){
        backgroundColor = "#FFFFFF";
    } else {
        backgroundColor = backgroundColorInput.value;
    }

    toggleInputMenu();
}

function toggleInputMenu(){
    console.log("toggleInputMenu()")

    var numColumns = 9;

    //columns: Style, RGBA shift, Smear, Sensitivity, Color Range, Max Dot Size, Palette, Color pickers, Background
    //Value of 1 if the columnn should be shown for that style, 0 if hidden
    var menuControlFlags = [
        {menuOptions: [1,0,0,0,1,1,0,0,0], name: "pointillist"},
        {menuOptions: [1,0,0,1,0,0,0,0,0], name: "sketch"},
        {menuOptions: [1,0,0,1,0,0,0,0,0], name: "roller"},
        {menuOptions: [1,0,0,0,0,0,1,1,0], name: "palletize"},
        {menuOptions: [1,0,0,1,0,0,0,0,0], name: "pixel"},
        {menuOptions: [1,0,0,1,0,0,0,0,1], name: "clippings"},
        {menuOptions: [1,0,0,1,0,0,0,0,0], name: "grid"},
        {menuOptions: [1,0,0,1,0,0,1,1,0], name: "mondrian"},
    ];

    var styleIndex = menuControlFlags.findIndex(obj => obj.name == visualizationChoice);

    for (var idx = 0; idx < numColumns; idx++){
        var className = ".inputCol" + (idx + 1);
        var elements = document.querySelectorAll(className);
        elements.forEach(element => {
            if (menuControlFlags[styleIndex].menuOptions[idx] == 1){
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        });
    }
}

function getFile(file){
    let reader = new FileReader();
     reader.onload = (event) => {
         parseImage(event.target.result);
    };
    reader.readAsDataURL(file);
    isImageLoaded = true;
}

function parseImage(imageData, imagesOnscreen = 2, defaultImage = false){

    //remove any existing images
    let imageContainer = document.getElementById('imageContainer');
    while (imageContainer.firstChild) {
        imageContainer.removeChild(imageContainer.firstChild);
    }

    let newImageContainer = document.getElementById('newImageContainer');
    while (newImageContainer.firstChild) {
        newImageContainer.removeChild(newImageContainer.firstChild);
    }

    let image = new Image();
    image.src = imageData

    image.onload = () => {
        
        actualWidth = image.width;
        actualHeight = image.height;
            
        const scaled = imageScaler(image, imagesOnscreen);

        // Create
        var originalImg = document.createElement('img');
        originalImg.src = image.src; 
        originalImg.width = scaled.w;
        originalImg.height = scaled.h;
        document.getElementById('imageContainer').appendChild(originalImg);

        // Get the pixel colors
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = image.width; 
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
        pixels = ctx.getImageData(0, 0, image.width, image.height).data;
        if (defaultImage == true){
            isImageLoaded = true;
            drawNewImage();
        }

        //add click position event listener
        originalImg.addEventListener('click', (e) => {
            let clickPos = {x: e.offsetX / scaled.ratio, y: e.offsetY / scaled.ratio};
            console.log(`Clicked at (${clickPos.x}, ${clickPos.y})`);
            if (visualizationChoice == "grid"){
                drawNewImage(pixels, clickPos);
            }
        });

        refresh();
    }
}
//--------------------------------------------------------------------------------------------

function imageScaler(source, wMultiplier){

    let max = {
        w: (window.innerWidth * WINDOWREDUCTIONS.w) / 2,
        h: window.innerHeight * WINDOWREDUCTIONS.h
    }

    let width, height, ratio;

    width = (source.width >= max.w) ? max.w : Math.min(max.w, source.width * wMultiplier)
    ratio = width / source.width;
    height = source.height * ratio;

    if (height > max.h){
        width = (max.h / height) * width;
        ratio = width / source.width;
        height = source.height * ratio;
    }

    return {w: width, h: height, ratio: ratio}

}

function refresh(){

    console.log("refresh");

    //show the loading screen
    loadingScreen.classList.remove("hidden");
    loadingScreen.classList.add("lockOn");

    getUserInputs();
    setTimeout(drawNewImage,5);
}

//shortcut key presses
document.addEventListener('keydown', function(event) {
    if (event.key === 'r') {
        refresh();

    } else if (event.key === 's') {
        saveImage();
    }
});

function drawNewImage(pixels, clickPos){

    console.log("drawNewImage()");

    console.log(pixels)

    if (!isImageLoaded) {
        //hide the loading screen
        loadingScreen.classList.remove("lockOn");
        loadingScreen.classList.add("hidden");
        return; // exit the function if isImageLoaded is false
    }

    let originalImage = document.getElementById('imageContainer').querySelector('img');

    // Create a new image
    newCanvas = document.createElement('canvas');
    newCtx = newCanvas.getContext('2d');

    newCanvas.width = actualWidth;
    newCanvas.height = actualHeight;

    //set background color of new canvas
    newCtx.fillStyle = backgroundColor;
    newCtx.fillRect(0, 0, originalImage.width, originalImage.height); //actualWidth, actualHeight);

    console.log("actual width: " + originalImage.width); //+actualWidth);
    console.log("actual height: " + originalImage.height); // +actualHeight);

    //remove any existing new images
    let newImageContainer = document.getElementById('newImageContainer')
    while (newImageContainer.firstChild) {
        newImageContainer.removeChild(newImageContainer.firstChild);
    }

    // Calling the input functions as arguments not only adds the required event
    // listeners only when *needed* but also returns the required input value
    // which is passed into the calling function... two birds, one stone.

    switch (visualizationChoice){
        case "rgba":
            effectRGBA(getRGBAInput());
            break;
        
        case "smear":
            effectSmear(inputChosenPixel());
            break;
        
        case "roller":
            effectRoller(originalImage);
            break;
        
        case "noise":
            effectNoise();
            break;
        
        case "perlin":
            effectPerlin(inputNoiseProbability());
            break;
        
        case "perlin2":
            effectPerlin2(inputNoiseProbability());
            break;
        
        case "perlin3":
            effectPerlin3(inputNoiseProbability());
            break;
        
        case "pixelPop":
            effectPixelPop();
            break;
        
        case "pointillist":
            effectPointillist(inputDotSizeFactor());
            break;
        
        case "sketch":
            effectSketch(inputNoiseProbability());
            break;
        
        case "palletize":
            effectPalettize();
            break;
        
        case "pixel":
            effectPixel(inputNoiseProbability());
            break;
        
        case "clippings":
            effectClippings(inputNoiseProbability());
            break;
        
        case "grid":
            effectGrid(
                imageContainer.querySelector('img'),
                clickPos,
                inputNoiseProbability()
            );
            break;
        
        case "mondrian":
            effectMondrian(originalImage, inputNoiseProbability());
            break;
    }

    const newImageData = newCanvas.toDataURL();
    const newImage = new Image();
    newImage.src = newImageData;
    newImage.style.width = `${imageScaler(originalImage, 2).w}px`;
    newImageContainer.appendChild(newImage);

    resizeTable(originalImage);

    //hide the loading screen
    loadingScreen.classList.remove("lockOn");
    loadingScreen.classList.add("hidden");
}

function effectRGBA(rgbaInput){
    console.log("running rgba visual");

    // Is this even needed?! 
    var rgbaShift = {
        r: rgbaInput.r,
        g: rgbaInput.g,
        b: rgbaInput.b,
        a: rgbaInput.a
    }

    for (let j = 0; j < pixels.length; j += 4) {
        
        let pixel = {
            r: pixels[j] * (rgbaShift.r / 100),
            g: pixels[j + 1] * (rgbaShift.g / 100),
            b: pixels[j + 2] * (rgbaShift.g / 100),
            a: pixels[j + 3] * (rgbaShift.g / 100)
        }

        newCtx.fillStyle = `rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, ${pixel.a})`;
        newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), 1, 1);
    }
}

function effectSmear(chosenPixel){
    console.log("running smear visual");
    for (let j = 0; j < pixels.length; j += 4) {
        var currentColNum = j / 4 % actualWidth;
        var currentRowNum = Math.floor(j / 4 / actualWidth);
        var currentRightPixel = (Math.floor(actualWidth * chosenPixel/100) + (actualWidth*currentRowNum))-1;

        var newRed = pixels[currentRightPixel*4];
        var newGreen = pixels[currentRightPixel*4+1];
        var newBlue = pixels[currentRightPixel*4+2];
        var newAlpha = 1;
        if(currentColNum < (actualWidth * smearWidth/100)){
            newAlpha = pixels[currentRightPixel*4+3];
        } else {
            newAlpha = 0;
        }
        newCtx.fillStyle = `rgba(${newRed}, ${newGreen}, ${newBlue}, ${newAlpha})`;
        newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), 1, 1);
    }
}

function effectRoller(imageSource, smears = 4){
    console.log("running roller visual");

    //faithful reproduction
    newCtx.drawImage(imageSource, 0, 0);

    for (let smearCount = 0; smearCount < smears; smearCount++){
        
        let start = Math.random(); //choose to start with top, right, bottom, or left
        let order = [];
        
        // 1 = Left, 2 = Right, 3 = Top, 4 = Bottom
        if (start <= 0.25){
            order = [3, 2, 4, 1];
        } else if (start <= 0.5){
            order = [2, 4, 1, 3]
        } else if (start <= 0.5){
            order = [4, 1, 3, 2];          
        } else {
            order = [1, 3, 2, 4];          
        }

        for (let idx = 0; idx < order.length; idx++){
            roll(order[idx])
        }
    }
}

function roll(direction = 1){
    console.log("roll(" + direction + ")");

    let smearStartingX = Math.round(Math.random() * actualWidth);
    let smearStartingY = Math.round(Math.random() * actualHeight);

    switch (direction){
        case 1: // Left 
            smearStartingX = 0;
            break;
        case 2: // Right 
            smearStartingX = actualWidth - 1;
            break;
        case 3: // Top 
            smearStartingY = 0;
            break;
        case 4: // Bottom 
            smearStartingY = actualHeight -1;
            break;
    };

    var smearWidth = rollLength(actualWidth);
    var smearHeight = rollLength(actualHeight);

    var pixelSize = Math.ceil(Math.max(actualWidth, actualHeight) / 500);

    for (let i = 0; i < smearWidth; i += pixelSize){

        let idx = ((smearStartingX + i) + (smearStartingY * actualWidth)) * 4;

        let newRed = pixels[idx];
        let newGreen = pixels[idx + 1];
        let newBlue = pixels[idx + 2];

        for (let j = 0; j < smearHeight; j += pixelSize){

            let newAlpha = 1 - (j / smearHeight);

            newCtx.fillStyle = `rgba(${newRed}, ${newGreen}, ${newBlue}, ${newAlpha})`;

            let x = smearStartingX + i;
            let y = smearStartingY + i;

            switch (direction){
                case 1: // Left
                    x = smearStartingX + j;
                    break;
                case 2: // Right
                    x = smearStartingX - j;
                    break;
                case 3: // Top
                    y = smearStartingY + j;
                    break;
                case 4: // Bottom
                    y = smearStartingY - j;
                    break;
            };

            newCtx.fillRect(x, y, pixelSize, pixelSize);
        }
    }
}

function rollLength(dimension){
    return Math.round(Math.random() * dimension * (inputNoiseProbability() / 100))
}

function effectNoise(){
    console.log("running noise visual");

    for (let j = 0; j < pixels.length; j += 4) {
        var actualRed = pixels[j];
        var actualGreen = pixels[j + 1];
        var actualBlue = pixels[j + 2] ;
        var actualAlpha = pixels[j + 3];

        var randomRed = chosenColorR - rgbColorRange() /2 + (Math.random() * rgbColorRange());
        var randomGreen = chosenColorG - rgbColorRange() /2 + (Math.random() * rgbColorRange());
        var randomBlue = chosenColorB - rgbColorRange () /2 + (Math.random() * rgbColorRange());
        var randomAlpha = 1;

        if(Math.random() <= noiseProbability/100){
            newCtx.fillStyle = `rgba(${randomRed}, ${randomGreen}, ${randomBlue}, ${randomAlpha})`;
        } else {
            newCtx.fillStyle = `rgba(${actualRed}, ${actualGreen}, ${actualBlue}, ${actualAlpha})`;
        }

        newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), 1, 1);
    }
}

function effectPerlin(noiseProbability){
    console.log("running perlin visual");

    let perlinNoise = generatePerlinNoise();

    let gridSize = perlinGridSize();

    for (let j = 0; j < pixels.length; j += 4) {

        let pixel = getPixel(pixels, j, gridSize, perlinNoise);

        newCtx.fillStyle = `rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, ${pixel.a})`;
        newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), 1, 1);

        //var newRed = chosenColorR * perlinDataValue/(noiseProbability/100);
        var newRed = chosenColorR - (255 * (pixel.perlin - 0.2));
        var newGreen = chosenColorG  - (255 * (pixel.perlin - 0.2));
        var newBlue = chosenColorB;
        var newAlpha = Math.min(0.92, (1 - (pixel.perlin / (noiseProbability / 100))) * 5 - 0.4);

        if (pixel.perlin > noiseProbability / 100){
            //newCtx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
        } else {
            newCtx.fillStyle = `rgba(${newRed}, ${newGreen}, ${newBlue}, ${newAlpha})`;
        }
        newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), 1, 1);
    }
}

function effectPerlin2(noiseProbability){
    console.log("running perlin2 visual");
    
    let perlinNoise = generatePerlinNoise();

    let gridSize = perlinGridSize();

    for (let j = 0; j < pixels.length; j += 4) {

        let pixel = getPixel(pixels, j, gridSize, perlinNoise);

        var randomRed = chosenColorR - rgbColorRange() / 2 + (Math.random() * rgbColorRange());
        var randomGreen = chosenColorG - rgbColorRange() / 2 + (Math.random() * rgbColorRange());
        var randomBlue = chosenColorB - rgbColorRange() / 2 + (Math.random() * rgbColorRange());
        var randomAlpha = 1;

        if((Math.pow(pixel.perlin, 2.5) * Math.random()) < ((noiseProbability / 100) * 0.025) || ((((100 - noiseProbability)/100) * Math.random() * Math.pow(perlinDataValue,2)) < 0.005)){
            newCtx.fillStyle = `rgba(${randomRed}, ${randomGreen}, ${randomBlue}, ${randomAlpha})`;

        } else {
            newCtx.fillStyle = `rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, ${pixel.a})`;
        }
        newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), 1, 1);
    }
}

function effectPerlin3(noiseProbability){
    console.log("running perlin3 visual");

    var maxPixelSize = 15;
    
    let perlinNoise = generatePerlinNoise();

    let gridSize = perlinGridSize();

    for (let j = pixels.length-4; j >= 0; j -= 4) {

        var pixelSize = Math.max(1, Math.round(Math.random() * maxPixelSize * (noiseProbability / 100)));

        let pixel = getPixel(pixels, j, gridSize, perlinNoise);

        var randomRed = chosenColorR - rgbColorRange() / 2 + (Math.random() * rgbColorRange());
        var randomGreen = chosenColorG - rgbColorRange() / 2 + (Math.random() * rgbColorRange());
        var randomBlue = chosenColorB - rgbColorRange() / 2 + (Math.random() * rgbColorRange());
        var randomAlpha = 1;

        if((Math.pow(pixel.perlin,1.6) * Math.random()) < ((noiseProbability/100) * 0.010) || ((((100 - noiseProbability)/100) * Math.random() * Math.pow(perlinDataValue,2)) < 0.0001)){
            newCtx.fillStyle = `rgba(${randomRed}, ${randomGreen}, ${randomBlue}, ${randomAlpha})`;

        } else {
            //pixelSize = 1;
            newCtx.fillStyle = `rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, ${pixel.a})`;
        }
        newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), pixelSize, pixelSize);
    }
}

function getPixel(pixels, i, gridSize, perlinNoise){
    var pixelX = i / 4 % actualWidth;
    var pixelY = Math.floor(i / 4 / actualWidth);
    var perlinX = Math.floor(pixelX / gridSize.x);
    var perlinY = Math.floor(pixelY / gridSize.y);

    return {r: pixels[i], g: pixels[i + 1], b: pixels[i + 2], a: pixels[i + 3], perlin: perlinNoise[perlinY][perlinX]}
}

function perlinGridSize(){
    return {x: actualWidth / dataWidth, y: actualHeight / dataHeight}
}

function effectPixelPop(){
    console.log("running pixelPop visual");

    var numChangePixels = 300;
    var maxWidth = 500;
    var maxHeight = 500;
    var backgroundAlphaValue = 0.8;
    var foregroundAlphaValue = 0.5;


    for(i=0; i<numChangePixels; i++){
        var currentPixelX = Math.round(Math.random() * actualWidth);
        var currentPixelY = Math.round(Math.random() * actualHeight);
        var pixelDataValue = (currentPixelY*actualWidth + currentPixelX) * 4;

        var actualRed = pixels[pixelDataValue];
        var actualGreen = pixels[pixelDataValue + 1];
        var actualBlue = pixels[pixelDataValue + 2];

        var pixelSize = Math.random() * maxWidth;
        newCtx.fillStyle = `rgba(${actualRed}, ${actualGreen}, ${actualBlue}, ${backgroundAlphaValue})`;
        newCtx.fillRect(currentPixelX, currentPixelY, pixelSize, pixelSize);

    }

    for (let j = 0; j < pixels.length; j += 4) {
        
        //Re-produce full picture
        var actualRed = pixels[j];
        var actualGreen = pixels[j + 1];
        var actualBlue = pixels[j + 2];

        newCtx.fillStyle = `rgba(${actualRed}, ${actualGreen}, ${actualBlue}, ${foregroundAlphaValue})`;
        newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), 1, 1);
    }
}

function effectPointillist(dotSizeFactor, minPixelStep = 1, maxPixelStep = 5, numPoints = 300000){
    console.log("running pointillist visual");

    const minPointRadius = 1;
    let maxPointRadius = Math.round(actualWidth / 120) * (dotSizeFactor / 100 + 0.5);
    let pointRadiusRange = maxPointRadius - minPointRadius;
    
    // let pixelStepRange = maxPixelStep - minPixelStep;

    for (let j = 0; j < numPoints; j++) {
        
        let currentPixel = Math.round( (Math.random() * (pixels.length / 4)) );

        let pixel = {
            r: pixels[currentPixel * 4] - rgbColorRange() / 2 + (Math.random() * rgbColorRange()),
            g: pixels[currentPixel * 4 + 1] - rgbColorRange() / 2 + (Math.random() * rgbColorRange()),
            b: pixels[currentPixel* 4 + 2],
            a: 1.
        }

        newCtx.beginPath();
        newCtx.arc(
            currentPixel % actualWidth,
            Math.floor(currentPixel / actualWidth),
            minPointRadius + Math.random() * pointRadiusRange,
            randomAngle(),
            randomAngle()
        );
        newCtx.fillStyle = `rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, ${pixel.a})`;
        newCtx.fill();
    }
}

function randomAngle(){
    return Math.random() * (2 * Math.PI)
}

function effectSketch(noiseProbability){
    console.log("running sketch visual");

    for (let j = pixels.length-4; j > 0; j -= 4) {
        
        var currentRed = pixels[j];
        var currentGreen = pixels[j + 1];
        var currentBlue = pixels[j + 2];

        var previousRed = pixels[j-4];
        var previousGreen = pixels[j-4+1];
        var previousBlue = pixels[j-4+2];

        var redDelta = Math.abs(currentRed - previousRed);
        var greenDelta = Math.abs(currentGreen - previousGreen);
        var blueDelta = Math.abs(currentBlue - previousBlue);

        var pixelColor = Math.max(0,255-(redDelta + greenDelta + blueDelta)*3);
        var alpha = Math.pow(Math.min(1,Math.max(0,(redDelta + greenDelta + blueDelta)/100)), 4);

        var primaryThreshold = 14 * (Math.pow((noiseProbability/100 + 0.5),5));

        var pixelWidth = Math.round(Math.random()*actualWidth*0.006);
        var pixelHeight = Math.round(Math.random()*5);

        if(redDelta > primaryThreshold || greenDelta > primaryThreshold || blueDelta > primaryThreshold){
            //newCtx.fillStyle = `rgba(${pixelColor}, ${pixelColor}, ${pixelColor}, ${alpha})`; //this will do black&white
            newCtx.fillStyle = `rgba(${currentRed}, ${currentGreen}, ${currentBlue}, ${alpha})`; //colour sketch
            newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), pixelWidth, pixelHeight);

        } else {
            //newCtx.fillStyle = "white";
            //newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), 1, 1);
        }

    }
}

function effectPalettize(){
    console.log("running palletize visual");
    console.log("Color Palette: " + paletteChoice);

    for (let j = 0; j < pixels.length; j += 4) {
        
        var red = pixels[j];
        var green = pixels[j + 1];
        var blue = pixels[j + 2];

        var lowestDistance = 0;
        var targetR;
        var targetG;
        var targetB;
        var alpha = 1;

        for(i=0; i<chosenPaletteRGBValues.length; i++){

            var currentDistance = Math.sqrt(
                (red - chosenPaletteRGBValues[i][0]) ** 2 +
                (green - chosenPaletteRGBValues[i][1]) ** 2 +
                (blue - chosenPaletteRGBValues[i][2]) ** 2
            );

            if(i==0 || currentDistance < lowestDistance){
                lowestDistance = currentDistance;
                targetR = chosenPaletteRGBValues[i][0];
                targetG = chosenPaletteRGBValues[i][1];
                targetB = chosenPaletteRGBValues[i][2];
            }
        }

        newCtx.fillStyle = `rgba(${targetR}, ${targetG}, ${targetB}, ${alpha})`; //colour sketch
        newCtx.fillRect(j / 4 % actualWidth, Math.floor(j / 4 / actualWidth), 1, 1);
    }
}

function effectPixel(noiseProbability){

    console.log("running pixel visual");

    var newPixelSize = Math.floor(Math.max(1, noiseProbability)); //width and height of new pixel square
    var numRows = actualHeight / newPixelSize;
    var numCols = actualWidth / newPixelSize;

    var alpha = 1;

    for(var cellY=0; cellY < Math.ceil(numRows); cellY++ ){
        for(var cellX=0; cellX < Math.ceil(numCols); cellX++ ){

            var cellPixels = [];

            for(var pixelY=0; pixelY<newPixelSize; pixelY++){
                
                for(var pixelX=0; pixelX<newPixelSize; pixelX++){

                    var currentXPosition = cellX*newPixelSize + pixelX;
                    var currentYPosition = cellY*newPixelSize + pixelY;

                    var currentPixelDataValue = (currentYPosition * actualWidth + currentXPosition) * 4;

                    if(currentXPosition < actualWidth && currentYPosition < actualHeight){
                        cellPixels.push(pixels[currentPixelDataValue]);
                        cellPixels.push(pixels[currentPixelDataValue + 1]);
                        cellPixels.push(pixels[currentPixelDataValue + 2]);
                        cellPixels.push(pixels[currentPixelDataValue + 3]);
                    }

                }
            }

            var avgColor = getAverageColor(cellPixels);
            newCtx.fillStyle = `rgba(${avgColor[0]}, ${avgColor[1]}, ${avgColor[2]}, ${alpha})`;
            newCtx.fillRect(cellX*newPixelSize, cellY*newPixelSize, newPixelSize, newPixelSize);

        }

    }
}

function effectClippings(noiseProbability, minClips = 4, maxClips = 25, alpha = 1){
    console.log("running clippings visual");

    var clipsRange = maxClips - minClips;
    var numClips = Math.ceil(minClips + (noiseProbability/100)*clipsRange);
    
    for (let windowCounter = 0; windowCounter < numClips; windowCounter++){
        var startX = Math.floor(Math.random() * actualWidth);
        var startY = Math.floor(Math.random() * actualHeight);
        var windowWidth = Math.floor(Math.random() * actualWidth * 0.5);
        var windowHeight = Math.floor(Math.random() * actualHeight * 0.5);
        var numPixels = windowWidth * windowHeight;

        for (let row = 0; row < windowHeight; row++){
            for (let col = 0; col < windowWidth; col++){
                var currentXPosition = startX + col;
                var currentYPosition = startY + row;
                var currentPixelDataValue = (currentYPosition * actualWidth + currentXPosition) * 4;

                var red = pixels[currentPixelDataValue];
                var green = pixels[currentPixelDataValue + 1];
                var blue = pixels[currentPixelDataValue + 2];
                
                newCtx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
                newCtx.fillRect(currentXPosition, currentYPosition, 1, 1);
            }

        }

    }
}


//Pop-up for grid visual style
var popup = document.querySelector('.popup');
popup.addEventListener('click', () => {
    popup.style.display = 'none';
});

var gridLoadCounter = 0;

function effectGrid(imageSource, clickPos = undefined, noiseProbability, strokeColor = "#D336BE", strokeColor2 = "#05C3DD"){
 
    console.log("run grid visual");

    if(gridLoadCounter == 0){
        // show the popup
        popup.style.display = 'block';
    }
    gridLoadCounter++;

    //faithful reproduction
    newCtx.drawImage(imageSource, 0, 0);

    if (!clickPos){
        clickPos = {x: actualWidth / 2, y: actualHeight / 2};
    }    

    if ('x' in clickPos){
        console.log("clickPos has a mf x!");
    }

    var numHorizontalLines = 6 * ((noiseProbability / 100) + 0.5);
    var startingHeight = clickPos.y; //clickYPosition;
    var endingHeight = actualHeight;
    var heightRange = endingHeight - startingHeight;
    var strokeWidth = actualWidth / 100 / 2;
    var alpha = 0.8;

    var numAngleLines = 8 * ((noiseProbability/100)+0.5);
    var xSpacing = actualWidth / (numAngleLines+1)

    for(var i=0; i<numAngleLines; i++){

        var startingXPosition = (i+1) * xSpacing;
        //var distanceFromCenter = (startingXPosition - actualWidth/2) / (actualWidth/2);
        var slope = (startingXPosition - clickPos.x) / clickPos.x;
        var lineYShift = heightRange;
        var lineXShift = lineYShift * slope;

        //draw vertical lines
        newCtx.beginPath();
        newCtx.moveTo(startingXPosition, startingHeight); // starting point
        newCtx.lineTo(startingXPosition, 0); // ending point
        newCtx.strokeStyle = strokeColor2;
        newCtx.lineWidth = strokeWidth;
        newCtx.globalAlpha = alpha/2;
        newCtx.stroke();

        //draw angle lines
        newCtx.beginPath();
        newCtx.moveTo(startingXPosition, startingHeight); // starting point
        newCtx.lineTo(startingXPosition+lineXShift, endingHeight); // ending point
        newCtx.strokeStyle = strokeColor;
        newCtx.lineWidth = strokeWidth;
        newCtx.globalAlpha = alpha;
        newCtx.stroke();

    }

    //draw top horizontal lines
    var numTopHorizontalLines = 6 * ((noiseProbability/100)+0.5);
    var topSpacing = startingHeight / numTopHorizontalLines;

    for(var i=0; i<numTopHorizontalLines; i++){
        newCtx.beginPath();
        newCtx.moveTo(0, i*topSpacing); // starting point
        newCtx.lineTo(actualWidth, i*topSpacing); // ending point
        newCtx.strokeStyle = strokeColor2;
        newCtx.lineWidth = strokeWidth;
        newCtx.globalAlpha = alpha/2;
        newCtx.stroke();
    }

    //draw horizontal lines
    for(var i=0; i<numHorizontalLines; i++){
        
        var currentHeight = startingHeight + heightRange * Math.pow(i/(numHorizontalLines-1),1.5);
        newCtx.beginPath();
        newCtx.moveTo(0, currentHeight); // starting point
        newCtx.lineTo(actualWidth, currentHeight); // ending point
        newCtx.strokeStyle = strokeColor;
        if(i==0){
            newCtx.lineWidth = strokeWidth*2;
        } else{
            newCtx.lineWidth = strokeWidth;
        }
        newCtx.globalAlpha = alpha;
        newCtx.stroke();
    }            
}

function effectMondrian(originalImage, noiseProbability){
    //draw Mondrian grid
    newCtx.beginPath();
    newCtx.lineWidth = 0;

    var xPad = Math.floor(actualWidth * 0.1); //actualWidth * 0.1);
    var yPad = Math.floor(actualHeight * 0.1); //actualHeight * 0.1);

    var initialRect = new Rectangle(new Point(0, 0), new Point(actualWidth, actualHeight));
    initialRect.split(xPad, yPad, 0, 4, newCtx);

    newCtx.stroke();

    //faithful reproduction
    newCtx.globalAlpha = Math.min(1, Math.max(0,1 - (noiseProbability / 100)));
    newCtx.drawImage(originalImage, 0, 0);
}

//Helper Functions

function saveImage(){
    const image = document.getElementById('newImageContainer').querySelector('img'); //newImageContainer.querySelector('img');
    const imageUrl = image.src;
    const link = document.createElement('a');
    const date = new Date();
    const filename = `image_${date.toLocaleDateString()}_${date.toLocaleTimeString()}.png`;
    
    // Create a blob from the image
    fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        });
}

function extractRGB(rgbString) {
    const rgbRegex = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/;
    const match = rgbString.match(rgbRegex);
    if (match) {
        return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        };
    } else {
        return null;
    }
}

function getAverageColor(chosenPixels) {
    var r = 0;
    var g = 0;
    var b = 0;
    var count = chosenPixels.length / 4;
    for (let i = 0; i < count; i++) {
        r += chosenPixels[i * 4];
        g += chosenPixels[i * 4 + 1];
        b += chosenPixels[i * 4 + 2];
    }
    return [r / count, g / count, b / count];
}

function resizeTable(source){

    const scaled = imageScaler(source, 2);

    const table = document.getElementById('imageTable'); 
    table.getElementsByTagName('td')[0].style.width = `${scaled.w}px`; 
    table.getElementsByTagName('td')[1].style.width = `${scaled.w}px`;
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

//perlin data variables
var perlinDataArray = []; //store perlin data here (0-1 range)
var GRID_SIZE = 3; //number of seed points
var RESOLUTION = 100;
var dataWidth = GRID_SIZE * RESOLUTION; //total data points will be this squared (L*W)
var dataHeight = dataWidth;
var numPerlinDataPoints = dataWidth * dataHeight;

//generate perlin noise field
function generatePerlinNoise(gridSize = 3, resolution = 100){

    perlin.seed();
    let perlinDataArray = [];

    //Display perlin noise field on the page

    let cnvs = document.getElementById('cnvs');
    cnvs.width = cnvs.height = (window.innerWidth * WINDOWREDUCTIONS.w) / 2;
    let ctx = cnvs.getContext('2d');

    const COLOR_SCALE = 250;

    let pixel_size = cnvs.width / resolution;
    let num_pixels = gridSize / resolution;

    var stepSize = num_pixels / gridSize;

    for (let y = 0; y < gridSize; y += num_pixels / gridSize){
        
        var yDataValue = Math.round(y/stepSize);
        perlinDataArray[yDataValue] = [];

        for (let x = 0; x < gridSize; x += num_pixels / gridSize){
            
            var xDataValue = Math.round(x / stepSize);
            
            let v = parseFloat(perlin.get(x, y));

            ctx.fillStyle = 'hsl('+v*COLOR_SCALE+',50%,50%)';
            ctx.fillRect(
                x / gridSize * cnvs.width,
                y / gridSize * cnvs.width,
                pixel_size,
                pixel_size
            );

            //store perlin data value in the range of 0 to 1
            perlinDataArray[yDataValue][xDataValue] = v/2 + 0.5;

        }
    }
    return {data: perlinDataArray}
}

function initPaletteControls(){

    console.log('Initialising Palette Controls...')

    // The pickers array is initialised here because it's scope doesn't need to be global.
    let pickers = [
        document.getElementById('color-picker'),
        document.getElementById('color-picker2'),
        document.getElementById('color-picker3'),
        document.getElementById('color-picker4'),
        document.getElementById('color-picker5'),
        document.getElementById('color-picker6')
    ];

    let paletteChoiceInput = document.getElementById('paletteChoice');
    paletteChoiceInput.addEventListener('change', (e) => {
        changePalette(pickers, paletteChoiceInput.value);
    });

    // Use palettePresets to populate the UI drop-down...
    palettePresets.forEach((preset) => {
        const option = document.createElement('option');
        option.value = preset.name;
        option.text = preset.displayName;
        paletteChoiceInput.appendChild(option);
    });

    for (let idx = 0; idx < pickers.length; idx++){
        pickers[idx].addEventListener('change', (e) => {
            updateColorPickers(idx, pickers, paletteChoiceInput.value);
        });
    }

    backgroundColorInput.addEventListener('change', (e) => {
        refresh();
    });  
}

function changePalette(pickers, paletteChoice){
    
    for (let idx = 0; idx < palettePresets.length; idx++){
        if (palettePresets[idx].name == paletteChoice){
            chosenPalette = palettePresets[idx].palette;
            break;
        }
    }

    for (let idx = 0; idx < pickers.length; idx++){
        pickers[idx].value = chosenPalette[idx];
    }
    
    updateColorPickers(-1, pickers, paletteChoice);    
}

function updateColorPickers(picker = -1, pickers, paletteChoice){

    let [start, end] = [0, pickers.length];

    if (picker >= 0){ [start, end] = [picker, picker + 1]; };

    for (let idx = start; idx < end; idx++){
        var currentColor = pickers[idx].value;
        chosenPalette[idx] = currentColor;
        var currentColorRGB = hexToRgb(currentColor);
        chosenPaletteRGBValues[idx] = [currentColorRGB.r, currentColorRGB.g, currentColorRGB.b];
    }

    //Modify and save changes to custom palette
    var customIndex = palettePresets.findIndex(obj => obj.name === "custom");
    console.log("Palette choice: " + paletteChoice);
    if(paletteChoice == "custom"){
        palettePresets[customIndex].palette = chosenPalette;
    }

    refresh();
}


function initPhotoCarousel(){

    const carousel = document.querySelector('.carousel');
    const carouselInner = carousel.querySelector('.carousel-inner');
    const carouselItems = carouselInner.querySelectorAll('.carousel-item');
    const carouselDots = carousel.querySelectorAll('.carousel-dot');

    let currentSlide = 0;

    carouselDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            updateCarousel();
        });
    });

    function updateCarousel() {
        
        if (currentSlide < 0) {
            currentSlide = carouselItems.length - 1;
        } else if (currentSlide >= carouselItems.length) {
            currentSlide = 0;
        }
        
        carouselItems.forEach((item, index) => {
            item.classList.remove('active');
            if (index === currentSlide) {
            item.classList.add('active');
            }
        });

        carouselDots.forEach((dot, index) => {
            dot.classList.remove('active');
            if (index === currentSlide) {
            dot.classList.add('active');
            }
        });
    }
    
    //Autoplay only twice
    let iterationCount = 0;
    let autoplayIntervalId = setInterval(() => {
        currentSlide++;
        updateCarousel();
        iterationCount++;
        if (iterationCount >= 2) {
            clearInterval(autoplayIntervalId);
        }
    }, 4000); //milliseconds before slide change

}

// Mondrian object and functions

function randInt (min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

class Point {
    constructor (x, y) {
        this.x = x
        this.y = y
    }
}

class Rectangle {
    constructor (min, max) {
        this.min = min
        this.max = max
    }

    get width () {
        return this.max.x - this.min.x
    }

    get height () {
        return this.max.y - this.min.y
    }

    draw (ctx) {
        // Draw clockwise
        ctx.moveTo(this.min.x, this.min.y)
        ctx.lineTo(this.max.x, this.min.y)
        ctx.lineTo(this.max.x, this.max.y)
        ctx.lineTo(this.min.x, this.max.y)
        ctx.lineTo(this.min.x, this.min.y)
    }

    split (xPad, yPad, depth, limit, ctx) {
        ctx.fillStyle = chosenPalette[randInt(0, chosenPalette.length)]
        ctx.fillRect(this.min.x, this.min.y, this.max.x, this.max.y)
        this.draw(ctx)

        // Check the level of recursion
        if (depth === limit) {
        return
        }

        // Check the rectangle is enough large and tall
        if (this.width < 2 * xPad || this.height < 2 * yPad) {
        return
        }

        // If the rectangle is wider than it's height do a left/right split
        var r1 = new Rectangle()
        var r2 = new Rectangle()
        if (this.width > this.height) {
        var x = randInt(this.min.x + xPad, this.max.x - xPad)
        r1 = new Rectangle(this.min, new Point(x, this.max.y))
        r2 = new Rectangle(new Point(x, this.min.y), this.max)
        // Else do a top/bottom split
        } else {
        var y = randInt(this.min.y + yPad, this.max.y - yPad)
        r1 = new Rectangle(this.min, new Point(this.max.x, y))
        r2 = new Rectangle(new Point(this.min.x, y), this.max)
        }

        // Split the sub-rectangles
        r1.split(xPad, yPad, depth + 1, limit, ctx)
        r2.split(xPad, yPad, depth + 1, limit, ctx)
    }
}
