<?php

namespace Carterline42\App;

class AppConfigFactory
{
	public static function fromYaml($yaml): AppConfig
	{
		$routesBuff = [];
		foreach ($yaml['routes'] as $routeName => $routeDetails) {
			$routesBuff[$routeName] = new RouteEntity(
				controller: $routeDetails['controller'],
				unprotectedMethods: $routeDetails['unprotectedMethods'] ?? [],
			);
		};

		return new AppConfig(
			namespace: $yaml['namespace'],

			settings: new SettingsEntity(
				controllersDir: $yaml['settings']['controllersDir'],
				requestsLimit: new RequestsLimitEntity(
					count: $yaml['settings']['requestsLimit']['count'],
					time: $yaml['settings']['requestsLimit']['time'],
				),

				fail2ban: new Fail2banEntity(
					count: $yaml['settings']['fail2ban']['count'],
					time: $yaml['settings']['fail2ban']['time'],
					jailedUntil: $yaml['settings']['fail2ban']['jailedUntil'],
				),
			),

			routes: $routesBuff
		);
	}
}

?>