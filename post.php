<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>ayLike</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- Le styles -->
    <link href="assets/css/bootstrap.css" rel="stylesheet">
<!--     <link href="assets/css/bootstrap-responsive.css" rel="stylesheet"> -->
    <link href="http://fonts.googleapis.com/css?family=Glegoo|Open+Sans:400,700,800&subset=latin,latin-ext" rel="stylesheet" type="text/css">
    <link href="assets/css/custom.css" rel="stylesheet">


    <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
      <script src="//html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->

    <!-- Le fav and touch icons -->
<!--
    <link rel="shortcut icon" href="images/favicon.ico">
    <link rel="apple-touch-icon" href="images/apple-touch-icon.png">
    <link rel="apple-touch-icon" sizes="72x72" href="images/apple-touch-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="114x114" href="images/apple-touch-icon-114x114.png">
-->

    <style>
        .container {
            width: 478px;
        }
    </style>
    <script src="assets/js/other/swfobject.js"></script>
    <script src="assets/js/other/util.js"></script>
    <script src="assets/js/services/DhtmlService.js"></script>
    <script src="assets/js/services/FacebookService.js"></script>
    <script src="assets/js/services/YoutubeService.js"></script>
    <script src="assets/js/services/AylikeService.js"></script>
    <script src="assets/js/other/player.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.16/jquery-ui.min.js"></script>
    
    <script>
        var userPlaylists = new Array();
        
        var dhtmlService = new DhtmlService();
        var facebookService = new FacebookService(dhtmlService);
        var aylikeService = new AylikeService();
        
        var postTitle = "<?echo htmlspecialchars( $_GET['t'] );?>";
        var postUrl = "<?echo htmlspecialchars( $_GET['u'] );?>";
        
        var postYoutubeId ="";
        var postThumbnailUrl = "";
        var postViewCount = 0;
        
        function displayDone() {
            dhtmlService.hideSignedUserBlocks();
            document.getElementById("done").style.display = 'block';
            //setTimeout("self.close();", 1000);
        }

        function displayUrlRequirements() {
            dhtmlService.hideUnsignedUserBlocks();
            document.getElementById('urlRequirements').style.display='block';
        }
        
        function isUrlOk(url) {
            return isVideoItem(url) && -1 != getYoutubeId(url);
        }
        
        function onFBApiLoaded() {
            if(isUrlOk(postUrl)) {
                postYoutubeId = getYoutubeId(postUrl);
                postThumbnailUrl = makeThumbnailUrl(postYoutubeId);
                document.getElementById("videoThumbnail").src=postThumbnailUrl;
                facebookService.checkLoggedIn(onLoggedInToFacebook, onNotLoggedInToFacebook);
            } else {
                displayUrlRequirements();
            }
        }

        function loginToFacebook() {
            console.debug('----------- 1 LOGGING IN TO FB -----------------');
            facebookService.loginToFacebook(onLoggedInToFacebook);
        }

        function onLoggedInToFacebook() {
            console.debug('----------- 2 LOGGED ON, LOADING PLAYLISTS OF ME -----------------');
            aylikeService.loadUserPlaylists(facebookService.myFacebookId, facebookService.myName, onOwnPlaylistsLoaded);
        }

        function onNotLoggedInToFacebook() {
            document.getElementById("aylikeIndex").style.display="block";
        }
        
        function onOwnPlaylistsLoaded(playlists, userName) {        
            console.debug('----------- 2.1 ayLike PLAYLISTS LOADED -----------------');
            var playlistsSelect = document.getElementById("playlists");
            playlistsSelect.remove(0);
            for(var i = 0; i < playlists.length; i++) {
                addAylikePlaylist(playlists[i]);
            }
        }
        
        function addAylikePlaylist(playlist) {
//            dhtmlService.addPlaylistOption(userName, playlist, own);
//            if(own) {
//                dhtmlService.addPlaylistToDialog(playlist);
//                if(playlist.isDefault) {
//                    defaultAylikePlaylist = playlist;
//                }
//            }
            var playlistsSelect = document.getElementById("playlists");

            if(playlist.isDefault) {
                playlistsSelect.insertBefore(new Option(playlist.name, playlist.id), playlistsSelect.options[0]);
                playlistsSelect.selectedIndex = 0;
            } else {
                playlistsSelect.options[playlistsSelect.options.length] = new Option(playlist.name, playlist.id);
            }
            userPlaylists[playlist.id] = playlist;
        }        
        
        function postToAylike() {
            var postToFacebook = document.getElementById("postToFacebook").checked;
            var playlistsSelect = document.getElementById("playlists");
            if(postToFacebook) {
                FB.api('/me/feed', 'post', {link:postUrl, actions: [{name:'Discover ayLike', link:'http://aylike.com'}], privacy: {value:'ALL_FRIENDS'}}, function(response) {
                  if (!response || response.error) {
                    alert('Error occured');
                  } else {
                    alert('Post ID: ' + response);
                  }
                });
            }
            if(playlistsSelect.value != "") {
                aylikeService.addToPlaylist(playlistsSelect.value, facebookService.myFacebookId, postYoutubeId, document.getElementById('title').value, postThumbnailUrl, postViewCount,
                    function() {
                        displayDone();
                    }
                );
            } else {
                aylikeService.addToDefaultPlaylist(facebookService.myFacebookId, postYoutubeId, document.getElementById('title').value, postThumbnailUrl, postViewCount,
                    function() {
                        displayDone();
                    }
                );
            }
        }
    </script>
  </head>

  <body>

    <div id="fb-root"></div>
    <script>
    onload=function(){
        if (document.getElementsByClassName == undefined) {
            document.getElementsByClassName = function(className)
            {
                var hasClassName = new RegExp("(?:^|\\s)" + className + "(?:$|\\s)");
                var allElements = document.getElementsByTagName("*");
                var results = [];

                var element;
                for (var i = 0; (element = allElements[i]) != null; i++) {
                    var elementClass = element.className;
                    if (elementClass && elementClass.indexOf(className) != -1 && hasClassName.test(elementClass))
                        results.push(element);
                }

                return results;
            }
        }
    }
      window.fbAsyncInit = function() {
        
        FB.Event.subscribe('auth.statusChange', function(response) {
          console.log('auth.statusChange', response);
        });

        FB.Event.subscribe('auth.authResponseChange', function(response) {
          console.log('auth.statusChange', response);
        });
        
        FB.init({
          appId      : '285413401490779', // App ID
          channelURL : '//aylike.com/channel.html',
          status     : true, // check login status
          cookie     : true, // enable cookies to allow the server to access the session
          oauth      : true, // enable OAuth 2.0
          xfbml      : true  // parse XFBML
        });
        onFBApiLoaded();
        // Additional initialization code here
      };

      // Load the SDK Asynchronously
      (function(d){
         var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
         js = d.createElement('script'); js.id = id; js.async = true;
         js.src = "http://connect.facebook.net/en_US/all.js";
         d.getElementsByTagName('head')[0].appendChild(js);
       }(document));
    </script>

    <div class="navbar">
      <div class="navbar-inner">
        <div class="container">

          <a class="brand" href="#">
            <img src="assets/img/logo.png" />
          </a>

        </div>
      </div>
    </div>

    <div class="container">

        <div id="done" class="row mt40" style="display: none;">
            <div class="span12">
                <p>The video was successfully saved to your ayLike playlist.</p>
                <p>This window will close in 1 second.</p>
                <form class="form-vertical">
                    <div class="form-actions">
                        <input class="btn btn-primary" type="button" value="Close" onclick="self.close();">
                    </div>
                </form>
            </div>
        </div>
        
        <div id="urlRequirements" class="row mt40" style="display: none;">
            <div class="span12">
                <p>The URL you are trying to post is not a YouTube URL. Currently only YouTube videos are supported. Sorry.</p>
                <form class="form-vertical">
                    <div class="form-actions">
                        <input class="btn btn-primary" type="button" value="Close" onclick="self.close();">
                    </div>
                </form>
            </div>
        </div>

        <div class="row signedUser" id="aylikeInner" style="display:none;">
            <div class="span6">
                    <form class="form-horizontal">
                        <fieldset>
                            <legend>Post a new video to ayLike</legend>
                            <div class="control-group">
                                <label class="control-label" for="title">Title: </label>
                                <div class="controls">
                                    <input type="text" class="input-xlarge" id="title" value="<?echo htmlspecialchars( $_GET['t'] );?>">
                                </div>
                            </div>
                            <div class="control-group">
                                <label class="control-label" for="title">Video: </label>
                                <div class="controls">
                                    <img id="videoThumbnail" src=""/>
                                </div>
                            </div>
                            <div class="control-group">
                                <label class="control-label" for="title">Playlist: </label>
                                <div class="controls">
                                    <select id="playlists">
                                        <option value="">Loading...</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-actions">
                                    <p><input class="checkbox" type="checkbox" name="postToFacebook" id="postToFacebook" value="1"/> post this to my facebook too</p>
                                    <input class="btn btn-warning" type="button" value="ayLike!" onclick="postToAylike()">
                                    <input class="btn" type="button" value="Cancel" onclick="self.close();">
                            </div>
                        </fieldset>
                    </form>
            </div>
        </div>
        
        <div class="unsignedUser" id="aylikeIndex" style="display:none;">
            <div class="row mt40">
                <div class="span12">
                    <div class="get-started">
                        <div class="fb-login-button" data-show-faces="false" data-width="150" data-max-rows="1" onlogin="facebookService.onLogin(response);"></div>
                    </div>
                    <form class="form-vertical">
                    <div class="form-actions">
                        <input class="btn btn-primary" type="button" value="Close" onclick="self.close();">
                    </div>
                </form>
                </div>
            </div>
        
        <div class="row">
            <div class="span12 footer">
                Copyright &copy; 2012 ayLike.com. All rights reserved.
            </div>
        </div>
    </div> <!-- /container -->
  </body>
</html>