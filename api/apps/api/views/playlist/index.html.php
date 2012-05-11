[<?
    for($i = 0; $i < count($playlistSet); $i++){ 
?><?php Part::draw('playlist/details', $playlistSet[$i]) ?><?
     if($i < count($playlistSet)-1){?>,<?}}?>]