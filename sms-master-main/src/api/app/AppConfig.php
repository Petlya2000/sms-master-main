<?php

namespace Carterline42\App;

class AppConfig
{
	public String $namespace;
	public SettingsEntity $settings;
	public array $routes; // Dictionary<String, RouteEntity>

	function __construct(String $namespace, SettingsEntity $settings, array $routes)
	{
		$this->namespace = $namespace;
		$this->settings = $settings;
		$this->routes = $routes;
	}
}

?>