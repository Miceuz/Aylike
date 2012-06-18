    var dhtmlService = new DhtmlService();
    var facebookService = new FacebookService(dhtmlService);
    var youtubeService = new YoutubeService();
    var aylikeService = new AylikeService();
    
    var userPlaylists = new Array();
    var defaultAylikePlaylist = null;


    function onFBApiLoaded() {
        facebookService.checkLoggedIn(onLoggedInToFacebook, onNotLoggedInToFacebook);
    }

    function loginToFacebook() {
        console.debug('----------- 1 LOGGING IN TO FB -----------------');

        facebookService.loginToFacebook(onLoggedInToFacebook);
    }
    
    var fbLoadingSemaphore = false;
    
    function onLoggedInToFacebook() {
        console.debug('----------- 2 LOGGED ON, LOADING FB VIDEO LINKS AND PLAYLISTS OF ME -----------------');
        if(canStartVideo()) {
            startVideo();
        } else {
            dhtmlService.onStartLoading();
        }
        dhtmlService.setPlaylistTitle("Your Facebook stream");
        facebookService.loadVideoLinks(10, onFBVideoLinksLoaded);
        fbLoadingSemaphore = true;
        aylikeService.loadUserPlaylists(facebookService.myFacebookId, facebookService.myName, onOwnPlaylistsLoaded);
    }
    
    function onNotLoggedInToFacebook() {
        document.getElementById("aylikeIndex").style.display="block";
        console.debug('----------- 1 == NOT == LOGGED ON, LOADING MOST POPULAR THING AND WATCHING NOW VIDEOS -----------------');
        aylikeService.getWatchingNow(onWatchingNowLoaded);
        aylikeService.getMostPopular(onMostPopularLoaded);
    }
    
    function onLogoutFromFacebook() {
        userPlaylists.length = 0;
        playlist.length = 0;
        
        dhtmlService.onLogout();
    }

    function onFBVideoLinksLoaded(loadedVideoItems) {
        console.debug('----------- 3 VIDEO LINKS LOADED -----------------');
        if (cancelFBStreamLoad) {
            cancelFBStreamLoad = false;
            console.debug("FB video links load cancelled");
            return;
        }
        dhtmlService.onVideosAvailable();

        facebookService.onVideoLinksAvailableCallback = null;
        addToPlaylist(loadedVideoItems, true);
        console.debug("Playlist length now is: " + playlist.length);
        if(playlist.length < 20) {
            console.debug('----------- 3.1 FB PLAYLIST CONTAINS ' + playlist.length + ' ITEMS, LOADING MOAR!!!');
            facebookService.loadVideoLinks(60, onFBVideoLinksLoaded);
        } else {
            console.debug('----------- 3.2 FB PLAYLIST CONTAINS ' + playlist.length + ' ITEMS, LOADING FRIENDS OF ME');
            facebookService.getUserFriends(onUserFriendsAvailable);
        }
    }
        
    function onOwnPlaylistsLoaded(playlists, userName, userFacebookId) {        
        console.debug('----------- 2.1 ayLike PLAYLISTS LOADED -----------------');
        onUserPlaylistsLoaded(playlists, userName, facebookService.myFacebookId, true);
    }

    function onUserFriendsAvailable(friends) {
        console.debug('----------- 4 ayLike FRIENDS LOADED, LOADING FRIEND AYLIKE PLAYLISTS; LOADING FB LIKES OF ME() -----------------');
        for(var i = 0; i < friends.length; i++) {
            aylikeService.loadUserPlaylists(friends[i].id, friends[i].name, onUserPlaylistsLoaded);
        }
        facebookService.loadUserLikes(onUserLikesLoaded);
    }

    
    function onUserPlaylistsLoaded(playlists, userName, userFacebookId, own) {
        if (own) {
            for(var i = 0; i < playlists.length; i++) {
                addAylikePlaylist(playlists[i], userFacebookId, userName, own);
            }
            return;
        }
        
        var hasAylikeVideos = false;
        
        for(var i = 0; i < playlists.length; i++) {
            if(playlists[i].videoItems.length > 0) {
                hasAylikeVideos = true;
                break;
            }
        }
        
        if(!hasAylikeVideos) {
            return;
        }
        
        dhtmlService.addPlaylistHeader(userName, userFacebookId);
        for(var i = 0; i < playlists.length; i++) {
            addAylikePlaylist(playlists[i], userFacebookId, userName, own);
        }
    }
    
    function initNewUserPlaylists(playlistId) {
        defaultAylikePlaylist = {
                                    id:playlistId, 
                                    name:"ayLike playlist", 
                                    isDefault:true, 
                                    videoItems:[]};
        addAylikePlaylist(defaultAylikePlaylist, facebookService.myFacebookId, facebookService.myName, true);
    }
    
    function addAylikePlaylist(playlist, userFacebookId, userName, own) {
        playlist.userName = userName;
        playlist.isOwn = own;
        
        dhtmlService.addPlaylistOption(userFacebookId, playlist, own);
        if(own) {
            dhtmlService.addPlaylistToDialog(playlist);
            if(playlist.isDefault) {
                defaultAylikePlaylist = playlist;
            }
        }
        userPlaylists[playlist.id] = playlist;
    }

    function onUserLikesLoaded(likes) {
        console.debug('----------- 5 LIKES OF ME() LOADED, IMPORTING TO ayLike -----------------');
        for(var i = 0; i < likes.length; i++) {
            console.debug("likes " + i, likes[i]);
            if(likes[i].url) {
                var youtubeId = getYoutubeId(likes[i].url);
                console.debug("importing liked on FB video: youtubeId: ", youtubeId);
                if(youtubeId) {
                    youtubeService.loadVideoData({'youtubeId': youtubeId}, onLikedVideoDataLoaded);
                }
            }
        }
    }
    
    function onLikedVideoDataLoaded(loaded, youtubeId) {
         if(!loaded.error && loaded.data.accessControl.embed && loaded.data.accessControl.embed == "allowed" && !loaded.data.status){
            var importedVideoItem = {
                facebookId:facebookService.myFacebookId, 
                youtubeId:loaded.data.id, 
                title:loaded.data.title, 
                thumbnailUrl:loaded.data.thumbnail.sqDefault
            };
            setTimeout(function(){
                console.debug(">>>>>>>----------------posting liked video from facebook to aylike at random time point", +new Date);
                aylikeService.addToDefaultPlaylist(facebookService.myFacebookId, loaded.data.id, loaded.data.title, loaded.data.thumbnail.sqDefault, loaded.data.viewCount,
                    function(data, textStatus, jqXHR) {
                        onAyliked(data);
                        console.debug("!!!!! >>>>>>>>>>>>>>>> imported like from facebook: ", importedVideoItem);
                    }
                );
            }, 500 + Math.random() * 10000);
        }
    }
    
    function onLastPlaylistItemStarted() {
        console.debug("Loading more items from Facebook...");
        loadMore();
    }

//------ UI ------
    function loadMore() {
        facebookService.loadVideoLinks(30, function(loadedVideoItems){addToPlaylist(loadedVideoItems, true);});
    }
    
    var cancelFBStreamLoad = false;
    
    function onPlaylistOption(playlistId){
        if("facebook" == playlistId) {
            clearPlaylist();
            facebookService.loadVideoLinks(30, function(loadedVideoItems){addToPlaylist(loadedVideoItems, true); dhtmlService.onVideosAvailable();}, true);
            dhtmlService.setPlaylistTitle("Your Facebook stream");
            dhtmlService.onStartLoading();
            dhtmlService.setActivePlaylist(playlistId);
            
            return;
        } else if("aylike" == playlistId) {
            clearPlaylist();
            
            aylikeService.getAylikeStream(0, 30, onAylikeStreamLoaded);
            
            dhtmlService.setPlaylistTitle("ayLike stream");
            dhtmlService.onStartLoading();
            dhtmlService.setActivePlaylist(playlistId);  
            return;          
        } else if("new" == playlistId) {
            $( '#newPlaylistDialog' ).modal('show');
            return;
        } else {
            cancelFBStreamLoad = true;
            loadPlaylist(playlistId);
        }
    }
    
    function onAylikeStreamLoaded (loadedVideoItems){
        for(var i = 0; i < loadedVideoItems.length; i++) {
            loadedVideoItems[i].actor_id = loadedVideoItems[i].facebookId;//pasidedam i actor_id, kad playeris galetu parodyt draugo veida
        }
        addToPlaylist(loadedVideoItems, false); 
        dhtmlService.onVideosAvailable();
        playPlaylistItem(0);
    }
    
    function ayLike() {
        var likedItem = currentVideoItem;
        dhtmlService.disableAylikeButton();
        aylikeService.addToDefaultPlaylist(facebookService.myFacebookId, currentVideoItem.youtubeId, currentVideoItem.title, currentVideoItem.thumbnailUrl, currentVideoItem.viewCount,
            function(data, textStatus, jqXHR) {
                onAyliked(data);
                dhtmlService.notifyAyliked(likedItem.title, defaultAylikePlaylist.name)
            },
            function() {
                dhtmlService.enableAylikeButton();
            }
        );
    }
    
    function onAyliked(videoItem) {
        if(null == defaultAylikePlaylist) {
            initNewUserPlaylists(videoItem.playlistId);
        }
        defaultAylikePlaylist.videoItems.unshift(videoItem); 
    }
    
    function addItemToPlaylist(youtubeId) {
        $('#addToPlaylistDialog').data('itemToAdd', getVideoItem(youtubeId));
        $('#addToPlaylistDialog').modal('show');
    }
    
    function addCurrentItemToPlaylist() {    
        $('#addToPlaylistDialog').data('itemToAdd', currentVideoItem);
        $('#addToPlaylistDialog').modal('show');
    }
    
    function addVideoItemToPlaylist(playlistId) {
        var playlist = userPlaylists[playlistId];
        
        var itemToAdd = $('#addToPlaylistDialog').data('itemToAdd');
        console.debug("Adding item ", itemToAdd, " to playlist ", playlist);

        itemToAdd.facebookId = facebookService.myFacebookId;
        aylikeService.addToPlaylist(playlist.id, facebookService.myFacebookId, itemToAdd.youtubeId, itemToAdd.title, itemToAdd.thumbnailUrl, itemToAdd.viewCount, function() { 
            
            $('#addToPlaylistForm').hide();
            $('#addToPlaylistDone').show();
            $('#addToPlaylistTitle').html( playlist.name );

            setTimeout( function() {
                
                $('#addToPlaylistDialog').modal('hide');
                $('#addToPlaylistForm').show();
                $('#addToPlaylistDone').hide();
                
            }, 2000 );

        } );
        playlist.videoItems.unshift(itemToAdd);

        $('#addToPlaylistDialog').removeData('itemToAdd');
//        $('#addToPlaylistDialog').modal('hide');
    }
    
    function addNewPlaylist() {
        $('#addToPlaylistDialog').modal('hide');
        $('#newPlaylistDialog').modal('show');
    }
    
    function createPlaylist(name) {
        if("" != name.trim()){
            console.debug("Creating playlist " + name);
            aylikeService.createPlaylist(facebookService.myFacebookId, name, onAylikePlaylistCreated)
        }
        $('#newPlaylistDialog').modal('hide');
    }
    
    function deletePlaylist(playlistId) {
        if(confirm("Do you really want to delete this playlist")){
            aylikeService.deletePlaylist(playlistId);
            dhtmlService.removePlaylist(playlistId);
        }
    }
    
    function onAylikePlaylistCreated(newPlaylist) {
        addAylikePlaylist(newPlaylist, facebookService.myFacebookId, facebookService.myName, true);
        if($('#addToPlaylistDialog').data('itemToAdd')) {
            addVideoItemToPlaylist(newPlaylist.id);
        }
    }
    
    function share() {
        facebookService.post(currentVideoItem);
    }
    
    var aimakaliush = new Array();
    function onWatchingNowLoaded(videoItems) {
        for(var i = 0; i < videoItems.length; i++){
            dhtmlService.addWatchingNowVideoItem(videoItems[i]);
            aimakaliush[videoItems[i].youtubeId] = videoItems[i];
        }
    }
    
    function onMostPopularLoaded(videoItems) {
        for(var i = 0; i < videoItems.length; i++){
            dhtmlService.addMostPopularVideoItem(videoItems[i]);
            aimakaliush[videoItems[i].youtubeId] = videoItems[i];
        }
    }
    
    function loginAndPlay(youtubeId) {
        addVideo(aimakaliush[youtubeId]);
        loginToFacebook();
    }
    
	function sendEmail() {
        document.getElementById("feedback-form").style.display="none";
        document.getElementById("thanks").style.display="block";
        var comment = document.getElementById("feedbackText").value;
		if(null != comment && comment.trim() != ""){
            var params = "name=" + facebookService.myName + "&facebookId=" + facebookService.myFacebookId + "&comment=" + encodeURIComponent(document.getElementById("feedbackText").value) ; 
			var request = new XMLHttpRequest();

            request.open("POST", "emails.php" + "?t=" + Math.random(), true);

            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            request.setRequestHeader("Content-length", params.length);
            request.setRequestHeader("Connection", "close");
            
			request.send(params);
            document.getElementById("feedbackText").value = "";
		}
        setTimeout("document.getElementById(\"feedback-form\").style.display=\"block\"; document.getElementById(\"thanks\").style.display=\"none\";", 2000);

        return false;
	}
    
    function inviteFriend(friendFacebookId) {
        facebookService.inviteFriend(friendFacebookId);
    }
