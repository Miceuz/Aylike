<?php
Library::import('recess.framework.Application');

class ApiApplication extends Application {
	public function __construct() {
		
		$this->name = 'aylike api';
		
		$this->viewsDir = $_ENV['dir.apps'] . 'api/views/';
		
		$this->assetUrl = $_ENV['url.assetbase'] . 'apps/api/public/';
		
		$this->modelsPrefix = 'api.models.';
		
		$this->controllersPrefix = 'api.controllers.';
		
		$this->routingPrefix = 'api/';
		
	}
}
?>