function loadData(callback) {
    let dataFile = "./trackEmbed.json"
    var request = new XMLHttpRequest()
    request.overrideMimeType("application/json")
    request.open("GET", dataFile, true)
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == "200") {
            callback(request.responseText)
        }
    }
    request.send()
}

//main
loadData(function(json) {
    var parsed = JSON.parse(json)
    window.addEventListener("DOMContentLoaded", function() {document.getElementById("vid").src=String(parsed[1])})
    window.addEventListener("load", function() {document.getElementById("txt").innerHTML=String(parsed[0])})
    document.getElementById("but").addEventListener("click", function() {document.getElementById("vid").src=String(parsed[1])})
    document.getElementById("but").addEventListener("click", function() {document.getElementById("txt").innerHTML=String(parsed[0])})
})

//window.addEventListener("load", init)