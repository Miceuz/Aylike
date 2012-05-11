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

    <script src="assets/js/other/swfobject.js"></script>
    <script src="assets/js/other/util.js"></script>
    <script src="assets/js/services/DhtmlService.js"></script>
    <script src="assets/js/services/FacebookService.js"></script>
    <script src="assets/js/services/YoutubeService.js"></script>
    <script src="assets/js/services/AylikeService.js"></script>
    <script src="assets/js/other/player.js"></script>
    <script src="assets/js/other/aylike.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.16/jquery-ui.min.js"></script>
<!--     <script src="assets/js/bootstrap-collapse.js"></script> -->
    <script src="assets/js/bootstrap.js"></script>
    
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
          
          <ul class="nav pull-right">
            
<!--             <li class="loader"><img src="assets/img/ajax-loader.gif" id="loadingIndicator" style="display:none;"/></li> -->
            <!-- simple user -->
            <li class="unsignedUser"><a href="#" onclick="loginToFacebook();return false;">Sign-in via Facebook</a></li>          

            <!-- logged user -->

            <li class="signedUser" style="display:none;"><img class="profile-image" src="#" id="user-image" /></li>
            <li class="signedUser" style="display:none;"><a href="#" id="user-name"> Default Facebook User </a></li>
            <li class="signedUser" style="display:none;"><a class="close" href="#" onclick="FB.logout(function(result){console.debug('logout', result); onLogoutFromFacebook();});return false;">&times;</a></li>
            <!-- end logged user -->
          </ul>

        </div>
      </div>
    </div>

    <div class="container">

        <div class="row loader" id="loadingIndicator" style="display:none;">
            <div class="span12">
                
                <img src="assets/img/ajax-loader-big.gif" />                
                <h1>Please wait while we load your Facebook stream videos</h1>
                
            </div>
        </div>

        <div class="row signedUser" id="aylikeInner" style="display:none;">        
            <div class="span2">
                <div class="playlists">
                    <h4>Streams</h4>
                    <ul>
                        <li id="playlist_facebook" class="activePlaylist"><a href="#" onclick="onPlaylistOption('facebook')">Facebook friends stream</a></li>
                    </ul>
                    <div id="ownPlaylists" style="display:none;">
                        <h4>Playlists</h4>
                        <ul id="playlistsBlock">
                            <li><a href="#" id="newPlaylistOption" onclick="onPlaylistOption('new')"><i class="icon-plus"></i> Create new playlist</a></li>
                        </ul>
                    </div>
                    
<!--                     <h4>Friends</h4> -->
                    
<!--
                    <div id="friendsPlaylists" style="display:none;">
                        <h4>Friends' playlists</h4>
                        <ul id="friendsPlaylistBlock">
                        </ul>
                    </div>
-->
                    <div class="bookmarklet">
                        <a class="btn" title="ayLike!" href="javascript:var%20d=document,w=window,f='http://aylike.com/post.php',l=d.location,e=encodeURIComponent,p='?u='+e(l.href)%20+'&t='+e(d.title),u=f+p;a%20=function(){if(!w.open(u,'t','toolbar=0,resizable=0,status=1,width=550,height=425'))l.href=u;};if(/Firefox/.test(navigator.userAgent))setTimeout(a,0);else%20a();void(0);">ayLike</a> 
                        <p><span class="arr">&uarr;</span><br />Drag this button to your bookmarks bar and click it when you see a video you like.</p>
                     </div>
                </div>
            </div>    
            <div class="span10">
                <div class="content">
                
                    <h1 id="playlistTitle"></h1>
                    <div class="row">
                        <div class="span8">
                
                                <div id="ytapiplayer" style="width:644px; height:414px;background-color:black;"></div>
                                
                                <div id="videoButtons" style="display:none;">
                                    <a href="#" class="btn" id="aylikeButton" onclick="ayLike(); return false;"><i class="icon-play"></i> ayLike</a>
                                    <a href="#" class="btn" onclick="addCurrentItemToPlaylist(); return false;"><i class="icon-plus-sign"></i> Add to my playlist</a>
                                    <a href="#" class="btn" onclick="share(); return false;"><i class="icon-share-alt"></i> Share</a>                
                                    <a href="#" class="btn" onclick="playNext();return false;"><i class="icon-arrow-right"></i> Play next</a>                
                                </div>
                                
                                <div class="videos">
                                    <ul class="thumbnails" id="user-videos-block">
                    
                                    </ul>
                                </div>
                                
                        </div>
                        <div class="span2 sidebar-right">
                            <div id="friendBlock" style="display:none;">
                                <img class="pull-left" id="friendAvatar" src="http://graph.facebook.com/talandis/picture" />
                                <div class="profile pull-left">
                                    <h3 id="friendName"></h3>
                                </div>
                                <div class="clearfix"></div>
                                    
                                <a id="friendHideLink" class="hide-link" href="#" >&times; Hide friend from streams</a>                
                            </div>
                            
                            <div class="playlists">
                                <div id="friendsPlaylists" style="display:none;">
                                    <h4>Playlists</h4>
                                    <ul id="friendsPlaylistBlock">
                                    </ul>
                                </div>
                            </div>                
                        </div>
                     </div>                   
                </div>
            </div>      
        </div>
        
        <div class="unsignedUser" id="aylikeIndex" style="display:none;">
            <h1 class="title">Watch all your videos in a single place</h1>

            <div class="row mt40">
                <div class="span4 step">               
                    <img src="assets/img/step1.png" />                                 
                    <h2><span>1.</span> Collect all your videos</h2>
                </div>
                <div class="span4 step">
                    <img src="assets/img/step2.png" />             
                    <h2><span>2.</span> Sort videos into playlists</h2>
                </div>
                <div class="span4 step">
                    <img src="assets/img/step3.png" />             
                    <h2><span>3.</span> Share with friends</h2>
                </div>
            </div>
            <div class="row mt40">
                <div class="span12">
                    <div class="get-started">
                        The easiest way to start collecting videos is to
                        <div class="fb-login-button" data-show-faces="false" data-width="150" data-max-rows="1" onlogin="facebookService.onLogin(response);"></div>
                        <span class="small">or <a href="#">take a quick tour</a> to learn more</span>
                    </div>
                </div>
            </div>
            <div class="row mt40">
                <div id="watchingNowBlock" class="span6" style="display:none">
                    <h3>Others are watching</h3>
                    
                    <ul id="watchingNow" class="title-videos">
                        <!--li>
                            <img src="assets/img/tmp-img.png" />
                            <a class="title" href="#">Ken Block - Gymkhana 4(HD) Hollywood</a>
                            <span class="views">32332 views</span>                        
                            <a href="#" class="btn"> add to my playlist </a>
                        </li-->
                    </ul>                
                    
                </div>
                <div id="mostPopularBlock" class="span6" style="display:none">
                    <h3>Most interesting videos</h3>
                    
                    <ul id="mostPopular" class="title-videos">
                    </ul>
                    
                </div>
            </div>

        </div>
        
        
        <div class="row">
            <div class="span12 footer">
                Copyright &copy; 2012 ayLike.com. All rights reserved.
            </div>
        </div>


    </div> <!-- /container -->

    <div class="modal new-playlist" id="newPlaylistDialog" style="display:none">

        <div class="modal-header">
            <h3>Create new playlist</h3>
        </div>

        <div id="newPlaylistDone" style="display: none;">
            <div class="modal-body">
                <div class="alert alert-success"> Playlist created </div>
            </div>
        </div>
        <div id="newPlaylistForm">
            <div class="modal-body">
                <label for="newPlaylistName">Name your playlist:</label>
                <input class="input-xlarge" name="newPlaylistName" id="newPlaylistName"/>        
            </div>    
            <div class="modal-footer">
                <a href="#" class="btn btn-cancel">Cancel</a>
                <a href="#" class="btn btn-warning btn-create">Create playlist</a>
            </div> 
        </div>               
    </div>

    <div class="modal add-to-playlist" id="addToPlaylistDialog" style="display:none">
        <div class="modal-header">
            <h3>Pick a playlist</h3>
        </div>

        <div id="addToPlaylistDone" style="display: none;">
            <div class="modal-body">
                <div class="alert alert-success"> Video succesfully added to playlist <strong id="addToPlaylistTitle">playlistName</strong> </div>
            </div>
        </div>        
        <div id="addToPlaylistForm">
        
            <div class="modal-body">
                <select id="playlistsInDialog">
                </select>
                <!--div id="playlistsInDialog">
                </div -->        
            </div>        
            <div class="modal-footer">
                <a href="#" class="btn btn-cancel">Cancel</a>
                <a href="#" class="btn" onclick="addNewPlaylist();return false;">Create new playlist</a>
                <a href="#" class="btn" onclick="addVideoItemToPlaylist(document.getElementById('playlistsInDialog').options[document.getElementById('playlistsInDialog').selectedIndex].value);return false;">OK</a>            
            </div>
        
        </div>
    </div>
    
    <script type="text/javascript">
        $( '#newPlaylistDialog' ).modal( { show: false } );

        $( '#newPlaylistDialog .btn-create' ).click( function() {
        
            createPlaylist(document.getElementById('newPlaylistName').value);                 
            document.getElementById('newPlaylistName').value = '';                   
            
            $('#newPlaylistDone').show();
            $('#newPlaylistForm').hide();
            
            setTimeout( function() {

                $('#newPlaylistDialog').modal('hide');
                $('#newPlaylistDone').hide();
                $('#newPlaylistForm').show();
            
            }, 1000 );
            
            return false;
        
        } );

        $( '#newPlaylistDialog .btn-cancel' ).click( function() {
        
            document.getElementById('newPlaylistName').value = '';        
            $('#addToPlaylistDialog').removeData('itemToAdd');
            $('#newPlaylistDialog').modal('hide');
            
            return false;            
        
        } );

    
/*
        $('#newPlaylistDialog').dialog({
            autoOpen: false,
            title:'New playlist',
            buttons:{
                "Create": function(){createPlaylist(document.getElementById('newPlaylistName').value)}, 
                "Cancel": function(){$(this).dialog("close"); $('#addToPlaylistDialog').removeData('itemToAdd')}
            }
        });
*/
        
        $('#addToPlaylistDialog').modal( { show: false } );
        
        $('#addToPlaylistDialog .btn-cancel').click( function() {            

            $( '#addToPlaylistDialog').removeData('itemToAdd');
            $( '#addToPlaylistDialog').modal('hide');
            return false;

        } );
                
/*
        $('#addToPlaylistDialog').dialog({
            autoOpen: false,
            title:'Add to playlist:',
            buttons:{
                "Cancel": function(){$(this).dialog("close"); $('#addToPlaylistDialog').removeData('itemToAdd')}
            }
        });
*/

   </script>
    <script type="text/javascript">

      var _gaq = _gaq || [];
      _gaq.push(['_setAccount', 'UA-31209873-1']);
      _gaq.push(['_trackPageview']);

      (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
      })();

    </script>
  </body>
</html>