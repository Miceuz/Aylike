function DhtmlService() {
    
};

/*
DhtmlService.prototype.addVideo = function(videoItem) {
    var videoElement = document.getElementById(videoItem.youtubeId+'_item');
    if(!videoElement) {
        videoElement = createVideoPlaceholder(videoItem);
    }
    var elBody = "<a href=\"#\" onclick=\"playYoutubeVideo('"+ videoItem.youtubeId +"');return false;\"><img src=\"" + videoItem.thumbnailUrl + "\"/><br/><span id=\""+videoItem.youtubeId+"_title\">"+videoItem.title+"</span></a><br/>[<a href=\"#\" onclick=\"addItemToPlaylist('"+ videoItem.youtubeId +"')\">add to playlist...</a>]<br/>[<a href=\"#\" onclick=\"removeItem('"+ videoItem.youtubeId +"');return false;\">remove</a>]";
    if(videoItem.friendId) {
        elBody = elBody + "<div class=\"friend_"+videoItem.friendId+"\"></div>[<a href=\"#\" onclick=\"removeAllFriendItems(" + videoItem.friendId + ");return false;\">remove all videos from this friend</a>]";
    }
    videoElement.innerHTML = elBody;
};
*/

DhtmlService.prototype.addVideo = function(videoItem) {
    var videoElement = document.getElementById(videoItem.youtubeId+'_item');
    if(!videoElement) {
        videoElement = createVideoPlaceholder(videoItem);
    }

    var friendClass = "";
    if(videoItem.friendId) {
        friendClass = "friend_"+videoItem.friendId;
        videoElement.className += (" " +friendClass); 
    }

    var elBody = "<a href=\"#\" id=\""+videoItem.youtubeId+"_item\" class=\"thumbnail\" onclick=\"playYoutubeVideo('"+ videoItem.youtubeId +"');return false;\"><img src=\"" + videoItem.thumbnailUrl + "\"/><h5 id=\""+videoItem.youtubeId+"_title\">"+videoItem.title.substr(0, 33)+"</h5></a><div class=\"controls\">" +
                "<a class=\"remove\" href=\"#\" onclick=\"removeItem('"+ videoItem.youtubeId +"');return false;\">&times;</a>" +
                "</div>";
    videoElement.innerHTML = elBody;
};


DhtmlService.prototype.createVideoPlaceholder = function(videoItem) {
    var parent = document.getElementById("user-videos-block");
    var videoDiv = document.createElement("li");
    videoDiv.id=videoItem.youtubeId+"_item";
    parent.appendChild(videoDiv);
    return videoDiv;
};

DhtmlService.prototype.hideLoginLink = function() {
    document.getElementById("loginLink").style.display="none";
};

DhtmlService.prototype.showVideoControls = function() {
    document.getElementById("videoButtons").style.display="block";
};

DhtmlService.prototype.updateFriendName = function(friendFacebookId, name) {
    document.getElementById("friendName").innerHTML = name;
    document.getElementById("friendAvatar").src="http://graph.facebook.com/"+friendFacebookId+"/picture";

    document.getElementById("friendHideLink").onclick= function(){
        removeAllFriendItems(friendFacebookId);
        return false;
    };
    document.getElementById("friendBlock").style.display="block";
    document.getElementById("friendInvite").onclick= function() {
        inviteFriend(friendFacebookId);
        return false;
    };
};

DhtmlService.prototype.hideFriendName = function () {
    document.getElementById("friendBlock").style.display="none";
};
DhtmlService.prototype.onLogin = function(userName, userLogin) {
    if(document.getElementById("user-name"))
        document.getElementById("user-name").innerHTML=userName;
        
    if(document.getElementById('user-image'))
        document.getElementById('user-image').src = 'http://graph.facebook.com/' + userLogin + '/picture';
        
    this.hideUnsignedUserBlocks();
    this.showSignedUserBlocks();
};

DhtmlService.prototype.setCSSDisplayForClass = function(cssClass, display) {
    var blocks = document.getElementsByClassName(cssClass)
    for(var i = 0; i < blocks.length; i++) {
        blocks[i].style.display = display;
    }
};

DhtmlService.prototype.showSignedUserBlocks = function () {
    this.setCSSDisplayForClass("signedUser", 'block');
};
DhtmlService.prototype.hideSignedUserBlocks = function () {
    this.setCSSDisplayForClass("signedUser", 'none');
};
DhtmlService.prototype.showUnsignedUserBlocks = function () {
    this.setCSSDisplayForClass("unsignedUser", 'block');
};
DhtmlService.prototype.hideUnsignedUserBlocks = function () {
    this.setCSSDisplayForClass("unsignedUser", 'none');
};




DhtmlService.prototype.onLogout = function() {
    document.getElementById("user-name").innerHTML="";
        
    this.hideSignedUserBlocks();
    this.showUnsignedUserBlocks();
    
    var node = document.getElementById('friendsPlaylistBlock');
    this.removeAllChildren(node);
    
    node = document.getElementById('playlistsBlock');
    this.removeAllChildren(node);
    
    //add new playlist option back. dirty hack for now.
    var newPlaylistLi = document.createElement("li");
    newPlaylistLi.innerHTML="<a href=\"#\" onclick=\"onPlaylistOption('new')\"><i class=\"icon-plus\"></i> Create new playlist</a>";
    node.appendChild(newPlaylistLi);
    
    node = document.getElementById('user-videos-block');
    this.removeAllChildren(node);
};

DhtmlService.prototype.removeAllChildren = function(node) {
    while (node.hasChildNodes()) {
        node.removeChild(node.lastChild);
    }    
};

DhtmlService.prototype.onVideosAvailable = function() {
//    document.getElementById("loginLink").style.display="none";
    document.getElementById("user-videos-block").style.display="block";
    document.getElementById("loadingIndicator").style.display="none";
};

DhtmlService.prototype.onStartLoading = function () {
    document.getElementById("loadingIndicator").style.display="block";
};

DhtmlService.prototype.removeVideoItem = function(youtubeId) {
    var item = document.getElementById(youtubeId + "_item");
    console.debug("removing HTML element: " + item);
    item.parentNode.removeChild(item);
};

DhtmlService.prototype.setActiveVideoItem = function(youtubeId) {
    var activeVideos = document.getElementsByClassName("active")
    for(var i = 0; i < activeVideos.length; i++) {
        activeVideos[i].className = activeVideos[i].className.replace(/(?:^|\s)active(?!\S)/, '');
    }
    var newActiveItem = document.getElementById(youtubeId+"_item").children[0];
    newActiveItem.className = newActiveItem.className + " active";
};

DhtmlService.prototype.setVideoItemTitle = function(youtubeId, title) {
    var videoTitle = document.getElementById(youtubeId + "_title");
    videoTitle.innerHTML=title.substr(0,30);   
};

DhtmlService.prototype.addPlaylistHeader = function(header, id) {
    var el = document.createElement("li");
    el.innerHTML = "<h5 data-toggle=\"collapse\" data-target=\"#"+id+"_playlist\">" + header + "</h5>";
    var playlists = document.createElement("ul");
    playlists.id=id + "_playlist";
    playlists.className="collapse";
    
    el.appendChild(playlists);
    
    var playlistsBlock = document.getElementById('friendsPlaylistBlock');
    playlistsBlock.appendChild(el);
};

DhtmlService.prototype.setActivePlaylist = function (playlistId) {
    var activePlaylists = document.getElementsByClassName("activePlaylist")
    for(var i = 0; i < activePlaylists.length; i++) {
        activePlaylists[i].className = activePlaylists[i].className.replace(/(?:^|\s)activePlaylist(?!\S)/, '');
    }
    var newActiveItem = document.getElementById("playlist_" + playlistId);
    newActiveItem.className = newActiveItem.className + " activePlaylist";    
};

DhtmlService.prototype.addPlaylistOption = function(userFacebookId, playlist, own) {
    var playlistsBlock = null;
    var option = document.createElement("li");

    option.id="playlist_"+playlist.id;
    
    if(own) {
        option.innerHTML='<a class="title" href="#" onclick="onPlaylistOption(' + playlist.id + ');return false;">' + playlist.name + '</a>'+
                         (playlist.isDefault ? '' : '<a class="delete" href="#" onclick="deletePlaylist(' + playlist.id + ');return false;">&times;</a>');
        playlistsBlock = document.getElementById('playlistsBlock');
        document.getElementById("ownPlaylists").style.display="block";
    } else {
        option.innerHTML='<a class="title" href="#" onclick="onPlaylistOption(' + playlist.id + ');return false;">' + playlist.name + '</a>';
        playlistsBlock = document.getElementById(userFacebookId+"_playlist");
        document.getElementById("friendsPlaylists").style.display="block";
    }

    if(playlist.isDefault) {
        if(own) {
            if(playlistsBlock.getElementsByTagName("li").length > 1) {
                playlistsBlock.insertBefore(option, playlistsBlock.getElementsByTagName("li")[1]);
            } else {
                playlistsBlock.appendChild(option);
            }
        } else {
            playlistsBlock.insertBefore(option, playlistsBlock.firstChild);
        }
    } else {
        playlistsBlock.appendChild(option);
    }
};

DhtmlService.prototype.removePlaylist = function(playlistId) {
    var playlistOption = document.getElementById("playlist_" + playlistId);
    if(playlistOption) {
        playlistOption.parentNode.removeChild(playlistOption);
    }
};

DhtmlService.prototype.updateVideoListWidth = function( playlist ) {
    
    var videoBlock = document.getElementById("user-videos-block");
    var videoWidth = 85;    
//    var playerWidth = jQuery( window ).height() <= 800 ? 700 : 789;
//    var playerHeight = jQuery( window ).height() <= 800 ? 450 : 562;
    var playerWidth = 644;
    var playerHeight = 414;
        
    videoBlock.style.width = (playlist.length*videoWidth) + 'px';
    videoBlock.parentNode.style.width = playerWidth + 'px';
    
}

/*
DhtmlService.prototype.addPlaylistToDialog = function(playlist) {
    var t = document.createElement('a');
    t.innerHTML = playlist.name;
    t.onclick = function() {addVideoItemToPlaylist(playlist); return false;};
    t.href="#";
    
    var dialog = document.getElementById('playlistsInDialog');
    dialog.appendChild(t);
    dialog.appendChild(document.createElement('br'));
};
*/

DhtmlService.prototype.addPlaylistToDialog = function(playlist) {
    var t = new Option(playlist.name, playlist.id);
    
    var dialog = document.getElementById('playlistsInDialog');
    dialog.options[dialog.options.length] = t;
};



DhtmlService.prototype.addFPVideoItem = function(parentElementId, videoItem) {
    var parent = document.getElementById(parentElementId);
    var item = document.createElement("li");
    item.innerHTML=""+
    "<img src=\"" + videoItem.thumbnailUrl+ "\">" +
    "<a class=\"title\" href=\"#\" onclick=\"loginAndPlay('" + videoItem.youtubeId + "');return false;\">" + videoItem.title + "</a>" +
    "<span class=\"views\">" + videoItem.viewCount + " views</span>" +
    "<a href=\"#\" class=\"btn\" onclick=\"loginAndPlay('" + videoItem.youtubeId + "');return false;\"> add to my playlist </a>"
    parent.appendChild(item);
}

DhtmlService.prototype.addWatchingNowVideoItem = function(videoItem) {
    this.addFPVideoItem("watchingNow", videoItem);
    document.getElementById("watchingNowBlock").style.display="block";
};

DhtmlService.prototype.addMostPopularVideoItem = function(videoItem) {
    this.addFPVideoItem("mostPopular", videoItem);
    document.getElementById("mostPopularBlock").style.display="block";
};

DhtmlService.prototype.setPlaylistTitle = function(title) {
    var titleEl = document.getElementById("playlistTitle");
    if(titleEl) {
        titleEl.innerHTML=title;
    }
};

DhtmlService.prototype.disableAylikeButton = function() {
    document.getElementById("aylikeButton").className += " disabled";
};

DhtmlService.prototype.enableAylikeButton = function() {
    document.getElementById("aylikeButton").className = document.getElementById("aylikeButton").className.replace(/(?:^|\s)disabled(?!\S)/, '');
};

DhtmlService.prototype.notifyAyliked = function(videoItemTitle, playlistTitle) {
    this.enableAylikeButton();
    
    var notifyDiv = document.createElement("div");
    notifyDiv.id = "notify";
    if(playlistTitle == "ayLike playlist") {
        notifyDiv.innerHTML = 'Video ' + videoItemTitle + ' saved to your ayLike playlist'; 
    } else {
        notifyDiv.innerHTML = 'Video ' + videoItemTitle + ' saved to your ayLike playlist ' + playlistTitle; 
    }
    
    var parent = document.getElementById("videoButtons");
    parent.appendChild(notifyDiv);
    setTimeout("var el = document.getElementById('notify'); el.parentNode.removeChild(el);", 3000);
};
