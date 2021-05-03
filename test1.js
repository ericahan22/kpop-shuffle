var MusicBrainzApi = require('musicbrainz-api').MusicBrainzApi //why doesn't anything past this work
var search = require('youtube-search')
require("dotenv").config()
var fs = require("fs");

const mbApi = new MusicBrainzApi({
  appName: 'kpop-shuffle',
  appVersion: '0.1.0',
  appContactInfo: 'ericahan.38@gmail.com'
});

function randomizer(array) {
    let rand = array[Math.floor(Math.random() * array.length)];
    return rand
}

var getArtistID = async function(art) {
    const result = await mbApi.searchArtist(art)
    for (i=0; i < result.artists.length; i++) {
        if (result.artists[i].country == 'KR') {
            var artistID = result.artists[i].id
            break
        }
    }
    return artistID
}

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
var artList = fs.readFileSync("./databases/artists.txt").toString('utf-8');
var artArray = artList.split(",")
var artist = randomizer(artArray)

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
})

module.exports = function (n) { return n * 111 }