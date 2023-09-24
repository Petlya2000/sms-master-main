<?php

namespace Carterline42\Generic;

class ProcessController
{
	public static function getPidsByName(String $name): array|null
	{
		$output = [];
		exec("ps aux | grep '$name' | grep -v grep | awk '{print $2}'", $output);
		if (!empty($output)) return $output;
		return null;
	}

	public static function getPidByName(String $name): int|null
	{
		$output = self::getPidsByName($name);
		if ($output != null) return $output[0];
		return $output;
	}

	public static function start(String $source, array $args = []): void
	{
		$args = (count($args) > 0 ? implode(' ', $args) : null);
		exec("php '$source' $args > /dev/null 2>&1 &");
		usleep(500000);
	}

	private static function signalToProcess(String|int $identifier, int $signal): void
	{
		$pid = $identifier;
		if (gettype($identifier) == 'string')
		{
			$pid = self::getPidByName($identifier);
		}

		echo "\n\n" . "kill -$signal $pid" . "\n\n";
		exec("kill -$signal $pid");
	}

	public static function kill(String|int $identifier): void
	{
		self::signalToProcess($identifier, SIGKILL);
	}

	public static function terminate(String|int $identifier): void
	{
		self::signalToProcess($identifier, SIGTERM);
	}

	public static function isProcessAlive(String|int $identifier): bool
	{
		$pid = self::getPidByName($identifier);
		return (isset($pid) && !empty($pid));
	}

}

?>