const { SourceAPI, PublicAPI } = require("ruffle-selfhosted");

window.RufflePlayer = PublicAPI.negotiate(
    window.RufflePlayer,
    "local",
    new SourceAPI("local")
);

let ruffle;
let player;
let jsonData;

let container = document.getElementById("main");
let author_container = document.getElementById("author-container");
let author = document.getElementById("author");
let sampleFileInputContainer = document.getElementById("sample-swfs-container");
let sampleFileInput = document.getElementById("sample-swfs");
let localFileInput = document.getElementById("local-file");
let animOptGroup = document.getElementById("anim-optgroup");
let gamesOptGroup = document.getElementById("games-optgroup");

window.addEventListener("DOMContentLoaded", () => {
    ruffle = window.RufflePlayer.newest();
    player = ruffle.create_player();
    player.id = "player";
    container.appendChild(player);
    fetch("swfs.json").then((response) => {
        if (response.ok) {
            response.json().then((data) => {
                jsonData = data;
                jsonData.swfs.forEach((item) => {
                    let temp = document.createElement("option");
                    temp.innerHTML = item.title;
                    temp.setAttribute("value", item.location);
                    if (item.type == "Animation") {
                        animOptGroup.append(temp);
                    } else if (item.type == "Game") {
                        gamesOptGroup.appendChild(temp);
                    }
                });
                sampleFileInputContainer.style.display = "inline-block";
                let rn = Math.floor(
                    Math.random() * Math.floor(jsonData.swfs.length)
                );
                sampleFileInput.selectedIndex = rn + 1;
                loadRemoteFile(jsonData.swfs[rn].location);
                author_container.style.display = "block";
                author.innerHTML = jsonData.swfs[rn].author;
                author.href = jsonData.swfs[rn].authorLink;
            });
        } else {
            sampleFileInputContainer.style.display = "none";
        }
    });
});

if (sampleFileInput) {
    sampleFileInput.addEventListener("change", sampleFileSelected, false);
}

if (localFileInput) {
    localFileInput.addEventListener("change", localFileSelected, false);
}

if (window.location.search && window.location.search != "") {
    let urlParams = new URLSearchParams(window.location.search);
    let url = urlParams.get("file");
    if (url && url != "") {
        console.info(url);
        loadRemoteFile(url);
    }
}

function sampleFileSelected() {
    let selected_index = sampleFileInput.selectedIndex - 1; //We subtract 1 here because the dropdown menu inlcudes a "None" option.
    if (selected_index != -1) {
        author_container.style.display = "block";
        author.innerHTML = jsonData.swfs[selected_index].author;
        author.href = jsonData.swfs[selected_index].authorLink;
        localFileInput.value = null;
        loadRemoteFile(jsonData.swfs[selected_index].location);
    } else {
        replacePlayer();
    }
}

function localFileSelected() {
    sampleFileInput.selectedIndex = 0;
    author_container.style.display = "none";
    author.innerHTML = "";
    author.href = "";

    let file = localFileInput.files[0];
    if (file) {
        let fileReader = new FileReader();
        fileReader.onload = () => {
            player.play_swf_data(fileReader.result);
        };
        fileReader.readAsArrayBuffer(file);
    }
}

function loadRemoteFile(url) {
    fetch(url).then((response) => {
        response.arrayBuffer().then((data) => player.play_swf_data(data));
    });
}

function replacePlayer() {
    document.getElementById("main").children[0].remove();
    player = ruffle.create_player();
    player.id = "player";
    container.appendChild(player);
    author_container.style.display = "none";
    author.innerHTML = "";
    author.href = "";
}
