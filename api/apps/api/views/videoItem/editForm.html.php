<?php 
Layout::extend('layouts/videoItem');
if(isset($videoItem->id)) {
	$title = 'Edit VideoItem #' . $videoItem->id;
} else {
	$title = 'Create New VideoItem';
}
$title = $title;
?>

<?php Part::draw('videoItem/form', $_form, $title) ?>

<?php echo Html::anchor(Url::action('VideoItemController::index'), 'VideoItem List') ?>