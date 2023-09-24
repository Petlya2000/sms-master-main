<?php

namespace Carterline42\Generic;

class FastState
{
	private static $file;
	static function load(String $file)
	{
		self::$file = $file;
		self::fetch(FastStates::STARTING);
	}
	static public function fetch(FastStates $state): void
	{
		$fp = fopen(self::$file, 'w+');
		fwrite($fp, $state->value);
		fclose($fp);
	}

	static public function final(FastStates $state): never
	{
		self::fetch($state);
		exit(0);
	}
}

?>