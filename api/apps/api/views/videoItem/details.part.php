<?php
Part::input($videoItem, 'VideoItem');
?>
{
        "id":<?php echo json_encode($videoItem->id); ?>,
		"facebookId":<?php echo json_encode($videoItem->facebookId); ?>,
		"playlistId":<?php echo json_encode($videoItem->playlistId); ?>,
		"youtubeId":<?php echo json_encode($videoItem->youtubeId); ?>,
		"title":<?php echo json_encode($videoItem->title); ?>,
		"thumbnailUrl":"<?php echo $videoItem->thumbnailUrl; ?>",
		"viewCount":"<?php echo $videoItem->viewCount; ?>",
		"timeAdded":<?php echo json_encode(date(DATE_ISO8601,$videoItem->timeAdded)); ?>
}