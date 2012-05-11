[<?
    for($i = 0; $i < count($videoItemSet); $i++){ 
?><?php Part::draw('videoItem/details', $videoItemSet[$i]) ?><?
     if($i < count($videoItemSet)-1){?>,<?}}?>]