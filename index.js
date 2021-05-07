//function: randomly selects from array
function randomizer(array) {
    let rand = array[Math.floor(Math.random() * array.length)];
    return rand
}

//function: reads files
function readFile(file, callback) {

    //checking if file is a url
    if (file.includes("http")) {
        var request = new XMLHttpRequest()
        request.overrideMimeType("application/json")
        request.open("GET", file, true)
        request.onreadystatechange = function() {
            if (request.readyState == 4 && request.status == "200") {
                callback(request.responseText)
            }
            else if (file.includes("youtube") && request.status != "200") {
                callback(request.status)
            }
        }
        request.send()
    }

    //if file is not a url (is artist name), return file
    else {
        callback(file)
    }
}

//sets user-agent?
Object.defineProperty(navigator, 'userAgent', {
    get: function () { return 'kpop-shuffle/0.1.0 ( ericahan.38@gmail.com )' }
});

function bigFunction(file) {

//call: gets artist name
readFile(file, function(txt) {

    //do if artist name is received through database url
    if (file.includes("http")) {
        var artList = String(txt)
        var artArray = artList.split(",")
        var artist = randomizer(artArray)
    }
    //do if artist name is received through text input
    else {
        var artist = file
    }
    var artistAmp = artist.replace("&","%26")
  
    //call: gets artist ID
    readFile("https://beta.musicbrainz.org/ws/2/artist?query="+artistAmp+"&fmt=json", function(json) {
        var data = JSON.parse(json)
        for (i=0;i<data.artists.length;i++) {
            if(data.artists[i].country == "KR") {
                var artistID = data.artists[i].id
                artist = data.artists[i].name
                artistAmp = artist.replace("&","%26")
                break
            }
        }

        //call: get track name
        readFile("https://beta.musicbrainz.org/ws/2/release?artist="+artistID+"&inc=release-groups+recordings&fmt=json", function(json) {
            var data = JSON.parse(json)
            const unwanted = ['Interview','Live','DJ-mix']
            var releaseArr = []
            var secType = data.releases[i]['release-group']['secondary-types']

            //for loop: gather array of VALID releases by artist
            for (i=0;i<data.releases.length;i++) {
                if (!secType.some(type => unwanted.includes(type)) && data.releases[i].media.length != 0) {
                    releaseArr.push(data.releases[i])
                }
            }
            var release = randomizer(releaseArr)
            var trkArr = []

            //for loop: gather array of tracks from release
            for (i=0;i<release.media[0].tracks.length;i++) {
                trkArr.push(release.media[0].tracks[i].title)
            }
            var track = randomizer(trkArr)

            //call: get config.json data
            readFile("https://chewtle.github.io/kpop-shuffle/config.json", function(json) {
                var data = JSON.parse(json)

                //call: get youtube video id
                readFile('https://youtube.googleapis.com/youtube/v3/search?part=snippet&q="'+artistAmp+'" "'+track+'"&key='+data[1], function(json) {
                    var data = JSON.parse(json)
                    try {
                        var videoID = data.items[0].id.videoId
                        var embed = "https://www.youtube.com/embed/"+videoID
                        var text = artist+" - "+track

                        document.getElementById("vid").src=embed
                        document.getElementById("txt").innerHTML=text    
                    }
                    catch {
                        var text = artist+" - "+track
                        document.getElementById("txt").innerHTML=text
                    }
                })
            })
        })
    })
})
}

//function: for input box
function onInput() {
    var inputText = document.getElementById("input").value
    var yes = 0

    //for loop: checking if input contains ANY alphanumeric values
    for (i = 0, len = inputText.length; i < len; i++) {

        code = inputText.charCodeAt(i);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
                null
        }
        else {
            yes = 1
            break
        }
    }
    if (yes == 1) {
        bigFunction(inputText)
    }
}

//event listeners
window.addEventListener("DOMContentLoaded", function() {
    document.getElementById("vid").src=""
})
document.getElementById("butArt").addEventListener("click", function() {
    bigFunction("https://chewtle.github.io/kpop-shuffle/database/artists.txt")
})
document.getElementById("butFem").addEventListener("click", function() {
    bigFunction("https://chewtle.github.io/kpop-shuffle/database/female.txt")
})
document.getElementById("butMal").addEventListener("click", function() {
    bigFunction("https://chewtle.github.io/kpop-shuffle/database/male.txt")
})
document.getElementById("butPop").addEventListener("click", function() {
    bigFunction("https://chewtle.github.io/kpop-shuffle/database/popular.txt")
})
document.getElementById("butInput").addEventListener("click", onInput)
document.getElementById("input").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        onInput()
    }
})
