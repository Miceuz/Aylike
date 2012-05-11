<?php
Part::input($playlist, 'Playlist');
$videoItems = $playlist->videoItems()->from('video_items');
?>{"id": <?php echo json_encode($playlist->id); ?>,"name": <?php echo json_encode($playlist->name); ?>,"isDefault":<? echo ($playlist->isDefault?'true':'false')?>, "videoItems":[
<?
    for($i = 0; $i < count($videoItems); $i++){ 
    $videoItem=$videoItems[$i];
?><?php Part::draw('videoItem/details', $videoItem)?><?
     if($i < count($videoItems)-1){?>,<?}}?>
]}