function YoutubeService() {
    this.onVideoDataLoadedCallback = null;
    this.apiCallCounter = 0;
};

YoutubeService.prototype.loadVideoData = function(videoItem, callback) {
    this.onVideoDataLoadedCallback = callback;
    var apiCallback = 'callback' + this.apiCallCounter++;
    var youtubeId = videoItem.youtubeId;
    this[apiCallback] = function(loaded){console.debug('Got youtube response for ' + youtubeId); this.onVideoDataLoadedCallback(loaded, ''+youtubeId)};
    var scriptTagId = videoItem.youtubeId+"_script";
    var oldScriptTag = document.getElementById(scriptTagId);
    if (oldScriptTag) {
        oldScriptTag.parentNode.removeChild(oldScriptTag);
    }
    var script = document.createElement('script');
    script.setAttribute('src', 
      "https://gdata.youtube.com/feeds/api/videos/"+videoItem.youtubeId+"?v=2&alt=jsonc&callback=youtubeService."+apiCallback);
    script.setAttribute('id', scriptTagId);
    script.setAttribute('type', 'text/javascript');
    document.getElementsByTagName('head')[0].appendChild(script);    
};

YoutubeService.prototype.onVideoDataLoaded = function(loaded) {
    this.onVideoDataLoadedCallback(loaded);
};
