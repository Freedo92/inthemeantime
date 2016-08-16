var apiKey = 'AIzaSyDNYoIpIAKuz9A8EoIvAs3wVghpix_cJzI';

// Called automatically when JavaScript client library is loaded.
function onClientLoad() {
	gapi.client.load('youtube', 'v3', onYouTubeApiLoad);
	console.log("Loaded YouTube client");
}

// Called automatically when YouTube API interface is loaded (see line 9).
function onYouTubeApiLoad() {
	gapi.client.setApiKey(apiKey);
	console.log("API key set");
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

function isoToSeconds(input) {
	var reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
	var hours = 0, minutes = 0, seconds = 0, totalseconds;

	if (reptms.test(input)) {
		var matches = reptms.exec(input);
		if (matches[1]) hours = Number(matches[1]);
		if (matches[2]) minutes = Number(matches[2]);
		if (matches[3]) seconds = Number(matches[3]);
		totalseconds = hours * 3600  + minutes * 60 + seconds;
	}

	return (totalseconds);
}

function RandomWord() {
	$.ajax({
		type: "GET",
		url: "http://randomword.setgetgo.com/get.php",
		dataType: "jsonp",
		jsonpCallback: 'search'
	});
	console.log("Random word received");
}

var videoDuration = null;

// Look for a video with the specified time.
function search(data) {
	console.log("Searching with: " + data.Word);
	videoDuration = $('#search-input').val()
	// Create a search.list() API call.
	var request = gapi.client.youtube.search.list({
		type: 'video',
		part: 'id',
		q: data.Word,
		videoEmbeddable: true,
		videoDuration: timeToDuration(videoDuration)
	});
	
	request.execute(buildVideoList);
	console.log("Completed search");
}

// Called automatically with the response of the YouTube API request.
function buildVideoList(response) {
	if ('error' in response) {
		displayMessage(response.error.message);
	} else {
		var videoIds = $.map(response.items, function(item) {
			return item.id.videoId; // .snippet. was here too
		});
		console.log("Video id list built successfully: " + videoIds);

		var request = gapi.client.youtube.videos.list({
			id: videoIds.join(','),
			part: 'id,contentDetails'
		});

		request.execute(showResponse);
	}
}

// Helper function to display JavaScript value on HTML page.
function showResponse(response) {
	console.log("Desired duration: " + videoDuration + " minutes/" + (videoDuration*60) + " seconds")
	var durationInSeconds = null;
	$.each(response.items, function() {
		durationInSeconds = isoToSeconds(this.contentDetails.duration);
		if (durationInSeconds <= ((videoDuration*60)+60) && 
			durationInSeconds >= ((videoDuration*60)-60)) {
			console.log(this.id + " : " + this.contentDetails.duration + "/" + durationInSeconds + " seconds");
		} else {return;}
	});
}