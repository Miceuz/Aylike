function FacebookService(dhtmlService) {
    this.dhtmlService = dhtmlService;
    this.friendIds = new Array();
    this.friendNames = new Array();
    this.myFacebookId = "";
    this.myName = "";
    this.onLoginCallback = null;
    this.onFriendNameAvailableCallback = null;
    this.onUserFriendsAvailableCallback = null;
    this.onUserLikesAvailableCallback = null;
    this.onVideoLinksAvailableCallback = null;
    this.lastVideoitemTimestamp = null;
};

FacebookService.prototype.getUserFriends = function(callback) {
    this.onUserFriendsAvailableCallback = callback;
    var service = this;
    FB.api("/me/friends?format=json&limit=1000", function(response){service.onUserFriendsAvailable(response)});
};

FacebookService.prototype.onUserFriendsAvailable = function(response) {
    if(response.error) {
        alert("ERROR:" + response.error.message);
        return;
    }
    this.onUserFriendsAvailableCallback(response.data);
};

FacebookService.prototype.onVideoLinksAvailable = function (response){
    console.debug("Got " + response.length + " videoLinks form FB", response);

    var loadedVideos = new Array();
    var j = 0;
    for(var i = 0; i < response.length; i++){
        var item = response[i];
        console.debug("Analyzing item", response[i]);
        
        if(item.attachment.media && item.attachment.media[0]){
            if(item.attachment.media[0].href) {
                var url = item.attachment.media[0].href;
            } else if(item.attachment.media[0].video) {
                var url = item.attachment.media[0].video.display_url;
            }
        } else if(item.attachment.href) {
            var url = item.attachment.href;
        } else if(item.message){
            var url = item.message;
        }
        
        console.log("URL is: "+url);
        
        if(url) {
            var youtubeId = getYoutubeId(url);
        } else {
            console.error('could not get URL', item);
            continue;
        }
        
        if(youtubeId == -1) {
            console.warn("Could not decode youtubeId for item ", item);
            continue;
        }
        
        if(!isVideoItem(url)) {
            console.warn("Not video item", item);
            continue;
        }
        
        if(loadedVideos[youtubeId]) {
            console.warn("Already loaded ", item);
            continue;
        }
        
        console.debug(i + " item '" + youtubeId + "' added", item);
        item.youtubeId = youtubeId;
        item.thumbnailUrl=makeThumbnailUrl(youtubeId);
        item.friendId=item.actor_id;
        if(item.attachment.name) {
            item.title=item.attachment.name;
        }

        loadedVideos[youtubeId] = true;
        loadedVideos[j] = item;
        this.lastVideoitemTimestamp = item.created_time;
        j++;
    }
    if(null != this.onVideoLinksAvailableCallback) {
        this.onVideoLinksAvailableCallback(loadedVideos);
    }
};



FacebookService.prototype.loadFriendName = function loadFriendName(friendId, callback) {
    this.onFriendNameAvailableCallback = callback;
    if(!this.friendNames[friendId]) {
        var service = this;
        FB.api("/"+friendId, function(response){
            service.onFriendNameAvailable(response);
        });
    } else {
        this.onFriendNameAvailableCallback(friendId, this.friendNames[friendId]);
    }
};

FacebookService.prototype.onFriendNameAvailable = function (response) {
    if(!response.error) {
        this.friendNames[response.id] = response.name;
        this.onFriendNameAvailableCallback(response.id, response.name);
    }
};


FacebookService.prototype.loadUserLikes = function(callback) {
    var service = this;
    this.onUserLikesAvailableCallback = callback;
    FB.api({
            method: 'fql.query', 
            query:"SELECT url FROM url_like WHERE user_id = me() and strpos(url, 'youtu')>0 limit 5"
            }, 
            function(response){
                service.onUserLikesAvailableCallback(response);
            });
}

FacebookService.prototype.loadVideoLinks = function(countToLoad, callback, fromStart) {
    this.onVideoLinksAvailableCallback = callback;
    var service = this;
    if(fromStart) {
        this.lastVideoitemTimestamp = null;
    }
    console.debug("select message, attachment, created_time, actor_id from stream where type=80 and filter_key in (select filter_key from stream_filter where uid = me() and name='Links') and (strpos(message, 'youtu') > 0 or strpos(attachment.href, 'youtu') > 0) " + (this.lastVideoitemTimestamp? " and created_time < " + this.lastVideoitemTimestamp : "") + " order by created_time desc limit " + countToLoad);
    FB.api(
        {
         method: 'fql.query',
         //query:"select message, attachment, created_time, actor_id from stream where source_id in (select uid2 from friend where uid1=me()) and (strpos(message, 'youtu') > 0 or strpos(attachment.href, 'youtu') > 0) order by created_time desc limit 300"
         //query: "select message, attachment, created_time, actor_id from stream where  filter_key='others' and (strpos(message, 'youtu') > 0 or strpos(attachment.href, 'youtu') > 0) order by created_time desc limit 500"
         //query: "select message, attachment, created_time, actor_id from stream where type=80 and filter_key in (select filter_key from stream_filter where uid = me() and (type = 'application' or type='newsfeed') ) and (strpos(message, 'youtu') > 0 or strpos(attachment.href, 'youtu') > 0) order by created_time desc limit 100"
         query: "select message, attachment, created_time, actor_id from stream where type=80 and filter_key in (select filter_key from stream_filter where uid = me() and (type = 'application' or type='newsfeed') ) and (strpos(message, 'youtu') > 0 or strpos(attachment.href, 'youtu') > 0) " + (this.lastVideoitemTimestamp? " and created_time < " + this.lastVideoitemTimestamp : "") + " order by created_time desc limit " + countToLoad
        },
        function(links){
            console.debug("Got " + links.length + " items");
            //debug("Got " + links.length + " items");
            service.onVideoLinksAvailable(links);
        }
    );
};

FacebookService.prototype.onLoginComplete = function(response) {
    if(response.error) {
        var service = this;
        FB.api('/me', function(response){service.onLoginComplete(response)});
        return;
    }
    console.log("FacebookService.onLoginComplete is here!");
    this.myFacebookId = response.id;
    this.myName = response.name;
    this.dhtmlService.onLogin(this.myName, response.username );
    this.onLoginCallback();
};

FacebookService.prototype.onLogin = function(response){
    console.log("FacebookService.onLogin is here!");
    if (response.authResponse) {
        console.log("...calling /me");
        var service = this;
        FB.api('/me', function(response){service.onLoginComplete(response)});
    } else {
        console.log('User cancelled login or did not fully authorize.');
    }
};

FacebookService.prototype.checkLoggedIn = function(callbackLoggedIn, callbackNotLoggedIn) {
    this.onLoginCallback = callbackLoggedIn;
    this.onNotLoggedInCallback = callbackNotLoggedIn;
    var service = this;
    FB.getLoginStatus(function(response) {
              if (response.authResponse) {
                console.log("is logged on");
                service.onLogin(response);
              } else {
                console.log("not logged on");
                service.onNotLoggedInCallback();
              }
    });
};

FacebookService.prototype.loginToFacebook = function(callback) {
    this.onLoginCallback = callback;
    var service = this;
    FB.login(function(response){service.onLogin(response);}, {scope: 'read_stream, publish_stream, user_likes'});
};

FacebookService.prototype.post = function(currentVideoItem) {
    var obj = {
          method: 'feed',
          link: 'http://www.youtube.com/watch?v=' + currentVideoItem.youtubeId,
          name: currentVideoItem.title,
          caption: 'ayLike.com - create, share and watch video playlists from various sources',
          actions: [{name:'Discover ayLike', link:'http://aylike.com'}],
          display: 'iframe'
        };
          /*caption: 'Reference Documentation',*/
          /*picture: currentVideoItem.thumbnailUrl,*/
    FB.ui(obj, function(response){});
};

FacebookService.prototype.inviteFriend = function(friendFacebookId) {
    var obj= {
          method: 'send',
          link: 'http://aylike.com',
          description: 'Create, share and watch video playlists from various sources',
          picture: 'http://aylike.com/assets/img/step3.png',
          name: 'ayLike',
          to: this.myFacebookId,
          display: 'iframe'
    };
    FB.ui(obj, function(response){
        console.log(response);
    });
};