<?php
Library::import('api.models.Playlist');
Library::import('recess.framework.forms.ModelForm');

/**
 * !RespondsWith Layouts
 * !Prefix playlist/
 */
class PlaylistController extends Controller {
	
	/** @var Playlist */
	protected $playlist;
	
	/** @var Form */
	protected $_form;
	
	function init() {
		$this->playlist = new Playlist();
		$this->_form = new ModelForm('playlist', $this->request->data('playlist'), $this->playlist);
	}
	
	/** !Route GET */
	function index() {
		$this->playlistSet = $this->playlist->all();
	}
    
    /** !Route GET, ofUser/$facebookId */
    function ofUser($facebookId) {
		$this->playlistSet = $this->playlist->all();
        $this->playlistSet=$this->playlistSet->equal('facebookId', $facebookId)->orderBy("id desc");
        return $this->ok('index');
    }
    
    /** !Route GET, ofFriends */
    function ofFriends() {
        $this->playlistSet = $this->playlist->all();
        if(isset($this->request->get['friendIds'])) {
            $friendIds = $this->request->get['friendIds'];
            if(is_array($friendIds)) {
                $this->playlistSet=$this->playlistSet->in('facebookId', $friendIds);

            } else {
                $this->playlistSet=$this->playlistSet->equal('facebookId', $friendIds);
            }
//            echo "Friend ids: $friendIds<br/>";
            echo $this->playlistSet->toSql();
            echo "<br/>----<br/>";
            return $this->ok('index');
        }
    }

    /** !Route GET, ofFriends/$friendIds */
    function ofFriends2($friendIds) {
        $this->playlistSet = $this->playlist->all();
            $friendArray = explode(',', $friendIds);
            echo $friendArray;
            if(is_array($friendArray)) {
                $this->playlistSet=$this->playlistSet->in('facebookId', $friendArray);
            }
            echo $this->playlistSet->toSql();
            echo "<br/>----<br/>";
            return $this->ok('index');
    }


	
	/** !Route GET, $id */
	function details($id) {
		$this->playlist->id = $id;
		if($this->playlist->exists()) {
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
		try {
			$this->playlist->insert();
			return $this->forwardOk($this->urlTo('details', $this->playlist->id));		
		} catch(Exception $exception) {
			return $this->conflict('editForm');
		}
	}
	
	/** !Route GET, $id/edit */
	function editForm($id) {
		$this->playlist->id = $id;
		if($this->playlist->exists()) {
			$this->_form->to(Methods::PUT, $this->urlTo('update', $id));
		} else {
			return $this->forwardNotFound($this->urlTo('index'), 'Playlist does not exist.');
		}
	}
	
	/** !Route PUT, $id */
	function update($id) {
		$oldPlaylist = new Playlist($id);
		if($oldPlaylist->exists()) {
			$oldPlaylist->copy($this->playlist)->save();
			return $this->forwardOk($this->urlTo('details', $id));
		} else {
			return $this->forwardNotFound($this->urlTo('index'), 'Playlist does not exist.');
		}
	}
	
	/** !Route DELETE, $id */
	function delete($id) {
		$this->playlist->id = $id;
		if($this->playlist->delete()) {
			return $this->forwardOk($this->urlTo('index'));
		} else {
			return $this->forwardNotFound($this->urlTo('index'), 'Playlist does not exist.');
		}
	}
}
?>