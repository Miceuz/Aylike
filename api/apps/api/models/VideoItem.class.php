<?php
/**
 * !Database Default
 * !Table video_items
 * !BelongsTo playlist
 */
class VideoItem extends Model {
	/** !Column PrimaryKey, Integer, AutoIncrement */
	public $id;

	/** !Column String */
	public $facebookId;

	/** !Column String */
	public $playlistId;

	/** !Column String */
	public $youtubeId;

	/** !Column String */
	public $title;

	/** !Column String */
	public $thumbnailUrl;

	/** !Column Integer */
	public $viewCount;

	/** !Column Timestamp */
	public $timeAdded;

}
?>