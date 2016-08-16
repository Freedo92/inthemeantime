var apiKey = 'AIzaSyDNYoIpIAKuz9A8EoIvAs3wVghpix_cJzI';

// Called automatically when JavaScript client library is loaded.
function onClientLoad() {
    gapi.client.load('youtube', 'v3', onYouTubeApiLoad);
}

// Called automatically when YouTube API interface is loaded (see line 9).
function onYouTubeApiLoad() {
    gapi.client.setApiKey(apiKey);
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

var videoDuration = null;

// Look for a video with the specified time.
function search(data) {
	 videoDuration = $('#search-input').val()
	// Create a search.list() API call. TODO: change snippet to id
    var request = gapi.client.youtube.search.list({
    	type: 'video',
        part: 'snippet',
        q: data.Word,
        videoEmbeddable: true,
		videoDuration: timeToDuration(videoDuration)
    });
	
	request.execute(buildVideoList);
}

// Called automatically with the response of the YouTube API request.
function buildVideoList(response) {
	var videoIds = $.map(response.items, function(item) {
		return item.snippet.resourceId.videoId;
	});

    var request = gapi.client.youtube.videos.list({
    	id: videoIds.join(','),
    	part: 'id,fileDetails'
    });

    request.execute(showResponse);
}

// Helper function to display JavaScript value on HTML page.
function showResponse(response) {
    $.each(response.items, function() {
		if (this.fileDetails.durationMs <= videoDuration+30000 || 
			this.fileDetails.durationMs >= videoDuration-30000) {
			console.log(this.id);
		} else {return;}
	});
}