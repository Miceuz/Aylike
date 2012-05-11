<?php
/**
 * !Database Default
 * !Table playlists
 * !HasMany videoItems, Key: playlistId, onDelete: Delete
 */
class Playlist extends Model {
	/** !Column PrimaryKey, Integer, AutoIncrement */
	public $id;

	/** !Column String */
	public $name;

	/** !Column String */
	public $facebookId;
    
    /** !Column Boolean */
    public $isDefault;
}
?>