<?php

namespace Carterline42\App;

class RouteEntity
{
	public String $controller;
	public array $unprotectedMethods; // List<String>

	function __construct(String $controller, array $unprotectedMethods)
	{
		$this->controller = $controller;
		$this->unprotectedMethods = $unprotectedMethods;
	}
}

?>