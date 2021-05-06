//function: randomly selects from array
function randomizer(array) {
    let rand = array[Math.floor(Math.random() * array.length)];
    return rand
}

//function: reads files
function readFile(file, callback) {
    var request = new XMLHttpRequest()
    request.overrideMimeType("application/json")
    request.open("GET", file, true)
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == "200") {
            callback(request.responseText)
        }
    }
    request.send()
}

//sets user-agent?
Object.defineProperty(navigator, 'userAgent', {
    get: function () { return 'kpop-shuffle/0.1.0 ( ericahan.38@gmail.com )' }
});

//nests
//call: gets artist name
function bigFunction(file) {
readFile(file, function(txt) {
    var artList = String(txt)
    var artArray = artList.split(",")
    var artist = randomizer(artArray)
    
    //call: gets artist ID
    readFile("http://musicbrainz.org/ws/2/artist?query="+artist+"&fmt=json", function(json) {
        var data = JSON.parse(json)
        for (i=0;i<data.artists.length;i++) {
            if(data.artists[i].country == "KR") {
                var artistID = data.artists[i].id
            }
            break
        }

        //call: get track name
        readFile("http://musicbrainz.org/ws/2/release?artist="+artistID+"&inc=release-groups+recordings&fmt=json", function(json) {
            var data = JSON.parse(json)
            const unwanted = ['Interview','Live','DJ-mix']
            for (i=0;i<data.releases.length;i++) {
                var secType = data.releases[i]['release-group']['secondary-types']
                if (!secType.some(type => unwanted.includes(type)) && data.releases[i].media.length != 0) {
                    var trkArr = []
                    for (j=0;j<data.releases[i].media[0].tracks.length;j++) {
                        trkArr.push(data.releases[i].media[0].tracks[j].title)
                    }
                    var albumTitle = data.releases[i].title
                }
                break
            }
            var track = randomizer(trkArr)

            //call: get config.json data
            readFile("https://raw.githubusercontent.com/chewtle/kpop-shuffle/5/3/21/config.json?token=ANXIJ22RWHOZQYI6AHZVD33ATRLXI", function(json) {
                var data = JSON.parse(json)

                //call: get youtube video id
                readFile("https://youtube.googleapis.com/youtube/v3/search?part=snippet&q="+artist+" "+track+" kpop&key="+data[1], function(json) {
                    var data = JSON.parse(json)
                    var videoID = data.items[0].id.videoId
                    var embed = "https://www.youtube.com/embed/"+videoID
                    var text = artist+" - "+track

                    document.getElementById("vid").src=embed
                    document.getElementById("txt").innerHTML=text
                })
            })
        })
    })
})
}

//event listeners
window.addEventListener("DOMContentLoaded", function() {
    document.getElementById("vid").src=""
    bigFunction("https://chewtle.github.io/kpop-shuffle/database/artists.txt")
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
