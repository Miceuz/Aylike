<?php 
Layout::extend('layouts/playlist');
if(isset($playlist->id)) {
	$title = 'Edit Playlist #' . $playlist->id;
} else {
	$title = 'Create New Playlist';
}
$title = $title;
?>

<?php Part::draw('playlist/form', $_form, $title) ?>

<?php echo Html::anchor(Url::action('PlaylistController::index'), 'Playlist List') ?>