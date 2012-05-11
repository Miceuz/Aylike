<?php
Library::import('api.models.VideoItem');
Library::import('recess.framework.forms.ModelForm');

/**
 * !RespondsWith Layouts
 * !Prefix videoItem/
 */
class VideoItemController extends Controller {
	
	/** @var VideoItem */
	protected $videoItem;
	
	/** @var Form */
	protected $_form;
	
	function init() {
		$this->videoItem = new VideoItem();
		$this->_form = new ModelForm('videoItem', $this->request->data('videoItem'), $this->videoItem);
	}
	
	/** !Route GET */
	function index() {
		$this->videoItemSet = $this->videoItem->all();
	}

	/** !Route GET, watchingNow */
	function watchingNow() {
		$this->videoItemSet = $this->videoItem->all();
        $this->videoItemSet = $this->videoItemSet->orderBy('id DESC')->limit(3);
        return $this->ok('index');
	}

	/** !Route GET, mostPopular */
	function mostPopular() {
		$this->videoItemSet = $this->videoItem->all();
        $this->videoItemSet = $this->videoItemSet->orderBy('viewCount DESC')->limit(3);
        return $this->ok('index');
	}

	
	/** !Route GET, $id */
	function details($id) {
		$this->videoItem->id = $id;
		if($this->videoItem->exists()) {
			return $this->ok('details');
		} else {
			return $this->forwardNotFound($this->urlTo('index'));
		}
	}
	
	/** !Route GET, new */
	function newForm() {
		$this->_form->to(Methods::POST, $this->urlTo('insert'));
		return $this->ok('editForm');
	}
	
	/** !Route POST */
	function insert() {
		//try {
            if(!isset($this->videoItem->playlistId)){
                $playlist = new Playlist();
                $defaultPlaylists = $playlist->all()->equal('facebookId', $this->videoItem->facebookId)->equal('isDefault', 1);
                if($defaultPlaylists->exists()){
                    $this->videoItem->playlistId = $defaultPlaylists[0]->id;
                } else {
                    $playlist = new Playlist();
                    $playlist->isDefault = 1;
                    $playlist->name = 'ayLike playlist';
                    $playlist->facebookId = $this->videoItem->facebookId;
                    $playlist->save();
                    $this->videoItem->playlistId = $playlist->id;
                }
            }
            $vi = new VideoItem();
            if($vi->all()->
                    equal('facebookId', $this->videoItem->facebookId)->
                    equal('youtubeId', $this->videoItem->youtubeId)->
                    equal('playlistId', $this->videoItem->playlistId)->
                    exists()) {
                //NOTHING
                return $this->conflict('details');
            } else {
                $this->videoItem->insert();
                return $this->forwardOk($this->urlTo('details', $this->videoItem->id));		
            }
		//} catch(Exception $exception) {
        //    echo "Exception occured: ". $exception->;
		//	return $this->conflict('editForm');
		//}
	}
	
	/** !Route GET, $id/edit */
	function editForm($id) {
		$this->videoItem->id = $id;
		if($this->videoItem->exists()) {
			$this->_form->to(Methods::PUT, $this->urlTo('update', $id));
		} else {
			return $this->forwardNotFound($this->urlTo('index'), 'VideoItem does not exist.');
		}
	}
	
	/** !Route PUT, $id */
	function update($id) {
		$oldVideoItem = new VideoItem($id);
		if($oldVideoItem->exists()) {
			$oldVideoItem->copy($this->videoItem)->save();
			return $this->forwardOk($this->urlTo('details', $id));
		} else {
			return $this->forwardNotFound($this->urlTo('index'), 'VideoItem does not exist.');
		}
	}
	
	/** !Route DELETE, $id */
	function delete($id) {
		$this->videoItem->id = $id;
		if($this->videoItem->delete()) {
			return $this->forwardOk($this->urlTo('index'));
		} else {
			return $this->forwardNotFound($this->urlTo('index'), 'VideoItem does not exist.');
		}
	}
}
?>