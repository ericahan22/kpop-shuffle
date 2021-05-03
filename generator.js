const MusicBrainzApi = require('musicbrainz-api').MusicBrainzApi;

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

module.exports = {randomizer, getArtistID, getReleaseGroupID, getReleaseID, getTrack}