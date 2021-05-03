//function: randomly selects artist from array
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

//nested local functions
//call: gives artist
readFile("file:///C:/Users/Erica/kpop-shuffle/databases/artists.txt", function(txt) {
    var artList = String(txt)
    var artArray = artList.split(",")
    var artist = randomizer(artArray)

    //call: gives artist ID
    readFile("http://musicbrainz.org/ws/2/artist?query="+artist, function(xml) {
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(xml,"text/xml");
        for (i=0;i<25;i++) {
            if(xmlDoc.getElementsByTagName("country")[0].childNodes[0].nodeValue == "KR") {
                var artistID = xmlDoc.getElementsByTagName("artist")[0]
                break
            }
        }
    }
    //continue here
    )
})

/*
var getReleaseGroupID = async function(art) {
    const res = await mbApi.getArtist(art, ['release-groups'])
    var releaseArray = []
    const unwanted = ['Interview', 'Live', 'DJ-mix'];
    for (i=0; i < res['release-groups'].length; i++) {
        var secType = res['release-groups'][i]['secondary-types']
        if (!secType.some(type => unwanted.includes(type))) {
            releaseArray.push(res['release-groups'][i].id)
        }
    }
    const releaseGroup = randomizer(releaseArray)
    return releaseGroup
}

var getReleaseID = async function(relG) {
    const res = await mbApi.getReleaseGroup(relG, ['releases'])
    const release = res.releases[0].id
    return release
}

var getTrack = async function(rel) {
    const result = await mbApi.getRelease(rel, ['recordings'])
    const tlist = result.media[0].tracks
    var trackArray = []
    for (i=0; i < result.media[0]['track-count']; i++) {
        trackArray.push(tlist[i].title)
    }
    const track = randomizer(trackArray)
    return track
}
//end of generator

var opts = {
    maxResults: 10,
    key: process.env.API_KEY
}

const dataArray = []

const getBothData = () => {
    const artistTrack = getArtistID(artist)
    .then(artID => getReleaseGroupID(artID))
    .then(relG => getReleaseID(relG))
    .then(rel => getTrack(rel))
    .then((trk) => {
        return artist+' - '+trk
    })
    const embed = artistTrack
    .then(a => search(a, opts))
    .then((res) => {
        return "https://www.youtube.com/embed/"+res.results[0].id+"?feature=oembed"
    })
    return Promise.all([artistTrack, embed]).then(function([resultA, resultB]) {
        dataArray.push(resultA, resultB)
    })
}

getBothData().then(() => {
    var json = JSON.stringify(dataArray)
    fs.writeFile("./trackEmbed.json", json, function(err, res) {
        if(err) {console.log(err)}
    })
})*/
