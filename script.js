// Define the scenes
var scenes = ["index.html", "scene2.html", "scene3.html"];
var currentScene = 0;

// Handle the Previous button click
d3.select("#prev").on("click", function() {
    if (currentScene > 0) {
        currentScene--;
        window.location.href = scenes[currentScene];
    }
});

// Handle the Next button click
d3.select("#next").on("click", function() {
    if (currentScene < scenes.length - 1) {
        currentScene++;
        window.location.href = scenes[currentScene];
    }
});
