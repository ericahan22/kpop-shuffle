const {randomizer, getArtistID, getReleaseGroupID, getReleaseID, getTrack} = require('./generator.js');
var search = require('youtube-search')
require("dotenv").config()
var fs = require("fs");

var artList = fs.readFileSync("./databases/artists.txt").toString('utf-8');
var artArray = artList.split(",")
var artist = randomizer(artArray)

var opts = {
    maxResults: 10,
    key: process.env.API_KEY
}

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
    
const printArtTrk = () => {
    artistTrack.then(a => console.log(a))
}

const printEmbed = () => {
    embed.then(a => console.log(a))
}

printArtTrk()
printEmbed()