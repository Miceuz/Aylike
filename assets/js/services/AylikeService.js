function AylikeService() {
};

AylikeService.prototype.loadUserPlaylists = function(userId, userName, callback) {
    $.ajax({
        url: 'api/index.php/api/playlist/ofUser/' + userId,
        type: 'GET',
        dataType: 'json',
        success: function(playlists){
            callback(playlists, userName, userId)
        }, 
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("Error while loading user playlist: " + textStatus, errorThrown, jqXHR);
        }
    });
};

AylikeService.prototype.getMostPopular = function(callback) {
    $.ajax({
        url: 'api/index.php/api/videoItem/mostPopular',
        type: 'GET',
        dataType: 'json',
        success: function(videoItems){
            callback(videoItems)
        }, 
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("Error while loading most interesting videos: " + textStatus, errorThrown, jqXHR);
        }
    });
};

AylikeService.prototype.getWatchingNow = function(callback) {
    $.ajax({
        url: 'api/index.php/api/videoItem/watchingNow',
        type: 'GET',
        dataType: 'json',
        success: function(videoItems){
            callback(videoItems)
        }, 
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("Error while loading watching now videos: " + textStatus, errorThrown, jqXHR);
        }
    });
};

AylikeService.prototype.getAylikeStream = function(from, count, callback) {
    $.ajax({
        url: 'api/index.php/api/videoItem/watchingNow/'+from+'/'+count,
        type: 'GET',
        dataType: 'json',
        success: function(videoItems){
            callback(videoItems)
        }, 
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("Error while loading watching now videos: " + textStatus, errorThrown, jqXHR);
        }
    });
};


AylikeService.prototype.addToDefaultPlaylist = function (facebookId, youtubeId, title, thumbnailUrl, viewCount, successCallback, errorCallback) {
    $.ajax({
        url: 'api/index.php/api/videoItem',
        type: 'POST',
        dataType: 'json',
        data: 'videoItem[facebookId]=' + facebookId + 
              '&videoItem[youtubeId]=' + youtubeId + 
              '&videoItem[viewCount]=' + viewCount + 
              '&videoItem[title]=' + title + 
              '&videoItem[thumbnailUrl]=' + thumbnailUrl, 
        success: function(data, textStatus, jqXHR){
            successCallback(data, textStatus, jqXHR);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error(errorThrown, textStatus);
            if(errorCallback) {
                errorCallback();
            }
        },
        statusCode: {
            409: function() {
              console.warn('Already in playlist');
            }
        }
    });
};

AylikeService.prototype.addToPlaylist = function (playlistId, facebookId, youtubeId, title, thumbnailUrl, viewCount, successCallback) {
    $.ajax({
        url: 'api/index.php/api/videoItem',
        type: 'POST',
        dataType: 'json',
        data: '&videoItem[playlistId]=' + playlistId + 
              '&videoItem[facebookId]=' + facebookId + 
              '&videoItem[youtubeId]=' + youtubeId + 
              '&videoItem[viewCount]=' + viewCount + 
              '&videoItem[title]=' + title + 
              '&videoItem[thumbnailUrl]=' + thumbnailUrl, 
        success: function(data, textStatus, jqXHR){
            successCallback(data, textStatus, jqXHR);
        },
        statusCode: {
            409: function() {
              console.warn('Already in playlist');
            }
        }
    });
};

AylikeService.prototype.deleteVideoItem = function(videoItem) {
    $.ajax({
        url:  'api/index.php/api/videoItem/'+videoItem.id,
        type: 'DELETE',
        success: function() {console.debug("VideoItem deleted successfully", videoItem);}
    });
};

AylikeService.prototype.deletePlaylist = function(playlistId) {
    $.ajax({
        url:  'api/index.php/api/playlist/'+playlistId,
        type: 'DELETE',
        success: function() {console.debug("Playlist deleted successfully");}
    });
};

AylikeService.prototype.createPlaylist = function (facebookId, name, successCallback) {
    var callback = function(createdPlaylist) { 
        alert('Playlist "' + createdPlaylist.name + '" has been created') 
    };
    if(successCallback) {
        callback = successCallback;
    }
    $.ajax({
        url: 'api/index.php/api/playlist',
        type: 'POST',
        dataType: 'json',
        data: 'playlist[facebookId]=' + facebookId + '&playlist[name]='+name, 
        success: callback
    });
};