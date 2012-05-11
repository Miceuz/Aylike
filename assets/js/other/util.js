Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

    function isVideoItem(url) {
        return ((url.indexOf("youtu") > -1));
    }

    function getYoutubeId(link) {
        if(link.indexOf("v=") > -1){
            return link.split("v=")[1].substring(0, 11)
        } else if(link.indexOf("youtu.be") > -1) {
            return link.split("youtu.be/")[1].substring(0, 11)
        } else {
            return -1;
        }
    }
    
    function idsAsString(ids) {
        var ret = "";
        for(var i = 0; i < ids.length; i++) {
            ret += ids[i] + (i < ids.length-1?"," : "");
        }
        return ret;
    }

    
    function debug(msg) {
        var debugDiv = document.getElementById("debug");
        var line = document.createElement("p");
        line.innerHTML = msg;
        debugDiv.appendChild(line);
    }
    
    function makeThumbnailUrl(youtubeId) {
        return "http://i.ytimg.com/vi/" + youtubeId + "/default.jpg";
    }