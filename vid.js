// Called automatically when JavaScript client library is loaded.
function onClientLoad() {
    gapi.client.load('youtube', 'v3', onYouTubeApiLoad);
}

// Called automatically when YouTube API interface is loaded (see line 9).
function onYouTubeApiLoad() {
    gapi.client.setApiKey('AIzaSyDNYoIpIAKuz9A8EoIvAs3wVghpix_cJzI');
}

$(function() {
    var searchField = $('#search-input');

    $('#search-form').submit(function(e) {
        e.preventDefault();
    });
});

function timeToDuration(minutes) {
	if (minutes < 4) {
		return 'short';
	} else if (minutes >= 4 || minutes <= 20) {
		return 'medium';
	} else {
		return 'long';
	}
}

function RandomWord() {
    $.ajax({
        type: "GET",
        url: "http://randomword.setgetgo.com/get.php",
        dataType: "jsonp",
        jsonpCallback: 'search'
    });
}

var videoDuration= null;

// Look for a video with the specified time.
function search(data) {
	 videoDuration = $('#search-input').val()
	// Create a search.list() API call. TODO: change snippet to id
    var request = gapi.client.youtube.search.list({
    	type: 'video',
        part: 'contentDetails',
        q: data.Word,
        videoEmbeddable: true,
		videoDuration: timeToDuration(videoDuration)
    });
	
	request.execute(locateVideo);
}

// Called automatically with the response of the YouTube API request.
function locateVideo(response) {
    showResponse(response);
}

// Helper function to display JavaScript value on HTML page.
function showResponse(response) {
    var responseString = JSON.stringify(response, '', 2);
    console.log(responseString);
}