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
	} else if (minutes >= 4 && minutes <= 20) {
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

var desiredDuration = null;
var t = 0;
function RandomWord() {
	if(t == 1) {
		alert('Goddamn, slow down. I have only have so many API calls, geez...');
		return;
	}
	t=1;

	// var wordLength = null;
	desiredDuration = $('#search-input').val()
	$.ajax({
		type: "GET",
		url: "http://randomword.setgetgo.com/get.php",
		dataType: "jsonp",
		// len: wordLength,
		jsonpCallback: 'search'
	});
	console.log("Random word received");

	setTimeout(function(){
		t=0;
		
	}, 3000)
}

// Look for a video with the specified time.
function search(data) {
	console.log("Searching with: " + data.Word + " with length " + timeToDuration(desiredDuration));
	// Create a search.list() API call.
	var request = gapi.client.youtube.search.list({
		type: 'video',
		maxResults: 50,
		part: 'id',
		q: data.Word,
		videoEmbeddable: true,
		desiredDuration: timeToDuration(desiredDuration)
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
		console.log("Video id list built successfully");

		var request = gapi.client.youtube.videos.list({
			id: videoIds.join(','),
			part: 'id,contentDetails'
		});

		request.execute(showResponse);
	}
}

// Helper function to display JavaScript value on HTML page.
function showResponse(response) {
	console.log("Desired duration: " + desiredDuration + " minutes/" + (desiredDuration*60) + " seconds");
	var durationInSeconds = null;
	var topResultId = null;

	var fudgeFactor = null;
	if (desiredDuration < 20) {
		fudgeFactor = 60;
	} else if (desiredDuration < 30) {
		fudgeFactor = 150;
	} else if (desiredDuration < 60) {
		fudgeFactor = 300;
	} else {
		fudgeFactor = 600;
	}

	$.each(response.items, function() {
		durationInSeconds = isoToSeconds(this.contentDetails.duration);
		if (durationInSeconds <= ((desiredDuration*60)+fudgeFactor) && 
			durationInSeconds >= ((desiredDuration*60)-fudgeFactor)) {
			console.log(this.id + " : " + this.contentDetails.duration + "/" + durationInSeconds + " seconds");
			topResultId = this.id
			return false;
		} else {return;}
	});

	if (topResultId == null) {
		console.log("No results with that length. Will search again.");
		t = 0;
		RandomWord();
		return;
	}

	document.getElementById("frame").setAttribute("src", ("https://www.youtube.com/embed/" + topResultId));
}