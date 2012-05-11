    var playlist = new Array();
    var currentVideoIndex = 0;
    var currentVideoItem = new Object();
    var videoStarted = false;
    var isFacebookPlaylist = true;
    var waitForVideos = true;

    function getVideoIndex(youtubeId) {
        for(var i = 0; i < playlist.length; i++) {
            if(playlist[i].youtubeId && playlist[i].youtubeId == youtubeId) {
                return i;
            }
        }
        return -1;
    }
    
    function getVideoItem(youtubeId) {
        var i = getVideoIndex(youtubeId);
        if(-1 != i) {
            return playlist[i];
        }
        return null;
    }

    function isFromAylikePlaylist(videoItem) {
        return null != videoItem.id;
    }

    function removeFromPlaylist(youtubeId) {
        var indexToRemove = getVideoIndex(youtubeId);
        
        if(-1 != indexToRemove) {
            console.debug('removing playlist item number ' + indexToRemove);
            var itemToRemove = playlist[indexToRemove];
            
            if(isFromAylikePlaylist(itemToRemove)) { 
                aylikeService.deleteVideoItem(itemToRemove);
            }
            
            playlist.remove(indexToRemove);
            
            if(currentVideoIndex == indexToRemove) {
                currentVideoIndex--;
                playNext();
            } else if(currentVideoIndex > indexToRemove) {
                currentVideoIndex --;
            }
        }
    }

    function removeItem(youtubeId) {
        removeFromPlaylist(youtubeId);
        dhtmlService.removeVideoItem(youtubeId);
    }
    
    function removeAllFriendItems(friendId) {
        var elements = document.getElementsByClassName("friend_"+friendId);
        var itemsToRemove = new Array();
        for(var i = 0; i < elements.length; i++) {
            itemsToRemove[i] = elements[i].id.substring(0, elements[i].id.indexOf("_item"))
        }
        for(var i = 0; i < itemsToRemove.length; i++) {
            removeItem(itemsToRemove[i]);
        }
    }

    function addToPlaylist(videos, fromFacebook) {
        console.log("\n\n\n-- adding videos to playlist. from facebook: ", fromFacebook);
        if(fromFacebook) {
            isFacebookPlaylist = true;
        } else {
            isFacebookPlaylist = false;
        }
        for(var i = 0; i < videos.length; i++) {
            addVideo(videos[i]);            
        }
        
        dhtmlService.updateVideoListWidth( playlist );
    }
    
    function loadPlaylist(playlistId) {
        if(userPlaylists[playlistId].isOwn) {
            dhtmlService.setPlaylistTitle(userPlaylists[playlistId].name);
        } else {
            dhtmlService.setPlaylistTitle(userPlaylists[playlistId].name + " from " + userPlaylists[playlistId].userName);
        }

        dhtmlService.setActivePlaylist(playlistId);
        
        clearPlaylist();

        addToPlaylist(userPlaylists[playlistId].videoItems, false);
//        for(var i = 0; i < userPlaylists[playlistId].videoItems.length; i++) {
//            addVideo(userPlaylists[playlistId].videoItems[i], i);
//        }
        playPlaylistItem(0);
    }

    function addVideo(item){
        var index = playlist.length;
        playlist[index] = item;
        dhtmlService.createVideoPlaceholder(item);

        if(!item.title) {
            item.title = "Loading title...";
        }
        
        if(item.facebookId) {//tai aylike videoItem
            dhtmlService.addVideo(item);
        }else {//tai fb post
            dhtmlService.addVideo(item);
            youtubeService.loadVideoData(playlist[index], onVideoDataLoaded);
        }
    }
    
    function canStartVideo() {
        return !videoStarted && playlist.length > 0;
    }

    function startVideo() {
        dhtmlService.showVideoControls();
        videoStarted = true;
//        currentVideoIndex = 0;
        if(playerCreated) {
            console.debug("Continuing to play playlist after additional videos loaded. At index", currentVideoIndex);
            playPlaylistItem(currentVideoIndex);
        } else {
            console.debug("Creating player");
            currentVideoItem = playlist[currentVideoIndex];
            createPlayer(currentVideoItem.youtubeId);
            dhtmlService.setActiveVideoItem(currentVideoItem.youtubeId);
            loadFriendName(currentVideoItem);
        }
    }

    function onVideoDataLoaded(loaded, youtubeId) {
        if(loaded.error) {
            console.warn('- removing video ' + youtubeId + ' because it is a error in YouTube');
            removeItem(youtubeId);
            return;
        }
        if(loaded.data.accessControl.embed && loaded.data.accessControl.embed != "allowed"){
            console.debug("- removing video " + loaded.data.title + " as it cannot be embeded");
            removeItem(loaded.data.id);
            return;
        }
        if(loaded.data.status && loaded.data.status.value == 'restricted' && loaded.data.status.reason == 'requesterRegion') {
            console.debug("- removing video " + loaded.data.title + " as it is restricted in your country");
            removeItem(loaded.data.id);
            return;
        }
/*
        if(loaded.data.status && loaded.data.status.value == 'restricted' && loaded.data.status.reason == 'limitedSyndication') {
            console.warn("!!!!Restricted: ", loaded.data.status);
            console.debug("- removing video " + loaded.data.title + " as it is limitedSyndication");
            removeItem(loaded.data.id);
            return;
        }
*/
        console.debug('+ YouTube data for ' + loaded.data.title + " loaded successfully", loaded);
        fillInPlaylistData(loaded.data);
        if(!videoStarted) {
            startVideo();
        }
        waitForVideos = false;
    }
    
    function fillInPlaylistData(data) {
        var index = getVideoIndex(data.id);
        if(-1 != index) {
            playlist[index].title = data.title;
            playlist[index].viewCount = data.viewCount
            dhtmlService.setVideoItemTitle(data.id, data.title);
        }
    }
    
    
    // ----------- player

    var PLAYER_STATE_ENDED = 0;
    
    function onStateChange(code) {
        console.log("PLAYER state: " + code);
        if(PLAYER_STATE_ENDED == code) {
            playNext();
        }
    }    
    
    function onPlayerError(code) {
        console.log("PLAYER ERROR CODE: " + code);
        //console.error("PLAYER ERROR CODE: " + code);
        playNext();
    }
    
    function onYouTubePlayerReady(playerId){
        var player = getPlayer();
        player.addEventListener("onError", "onPlayerError");
        player.addEventListener("onStateChange", "onStateChange");
    }
    
    
    function playNext() {
        if(currentVideoIndex + 1 >= playlist.length) {
            if(waitForVideos) {
                console.debug("waiting for additional videos to load...");
                currentVideoIndex ++;
                stop();
            } else {
                if(isFacebookPlaylist) {
                    console.error("DOES NOT HAPPEN! We are at the end of FB playlist, but are not loading videos!");
                    waitForVideos = true;
                    onLastPlaylistItemStarted();
                    playPlaylistItem(0);
                } else {
                    console.log("STOP as playlist has ended.");
                }
            }
        } else {
            playPlaylistItem(currentVideoIndex + 1);
        }
    }

    function playPlaylistItem(index) {
        currentVideoIndex = index;
        currentVideoItem = playlist[currentVideoIndex];
        if(!playerCreated) {
            startVideo();
        }
        if(currentVideoIndex == playlist.length-1) {
            console.debug("playing last item in playlist");
            if(isFacebookPlaylist) {
                waitForVideos = true;
                onLastPlaylistItemStarted();
            } else {
                console.debug("Not loading more videos as it's not FB stream playlist");
            }
        }
        console.log("currentVideoIndex " + currentVideoIndex + " playlist length: " + playlist.length);
        playVideoItem(currentVideoItem);
    }
    
    function playYoutubeVideo(youtubeId) {
        var indexToPlay = getVideoIndex(youtubeId);
        if(-1 != indexToPlay) {
            playPlaylistItem(indexToPlay);
        }
    }
    
    function playVideoItem(videoItem) {
        if(getPlayer() && getPlayer().loadVideoById) {
            getPlayer().loadVideoById(videoItem.youtubeId);
            dhtmlService.setActiveVideoItem(videoItem.youtubeId);
            loadFriendName(videoItem);
        }
    }
    
    function loadFriendName(videoItem) {
        if(videoItem.actor_id) {
            facebookService.loadFriendName(videoItem.actor_id, onFriendNameAvailable);
        } else {
            dhtmlService.hideFriendName();
        }
    }

    function onFriendNameAvailable(friendId, friendName) {
        dhtmlService.updateFriendName(friendId, friendName);
    }

    function getPlayer() {
        return document.getElementById("player");
    }
    
    function stop() {
        videoStarted = false;
        if(getPlayer()) {
            getPlayer().stopVideo();
            getPlayer().clearVideo();
        }
    }
    
    function clearPlaylist() {
        stop();
        playlist = new Array();
        document.getElementById("user-videos-block").innerHTML="";
        currentVideoItem = null;
        currentVideoIndex = 0;
    }
    
    var playerCreated = false;
    function createPlayer(youtubeId) {
        playerCreated = true;

/*
        var playerWidth = jQuery( window ).height() <= 800 ? 700 : 789;
        var playerHeight = jQuery( window ).height() <= 800 ? 450 : 562;
*/

        var playerWidth = 644;
        var playerHeight = 414;
        
        var params = { allowScriptAccess: "always", allowfullscreen: true };
        var atts = { id: "player", allowfullscreen: true };
        swfobject.embedSWF("http://www.youtube.com/e/" + youtubeId + "?enablejsapi=1&version=3&fs=1&autoplay=1&rel=0",
                           "ytapiplayer", playerWidth, playerHeight, "8", null, null, params, atts);
    }