<?php

namespace Carterline42\App\Controllers;

use \Carterline42\Generic;
use \Carterline42\Generic\Interfaces;
use \Carterline42\Exceptions;
class Distribution
{ 
	private Generic\Database $db;
	private Interfaces\IKeyValueStorage $storage;

	function __construct(Generic\Database $db, Interfaces\IKeyValueStorage $storage)
	{
		$this->db = $db;
		$this->storage = $storage;
	}

	// public function list()
	// {

	// }

	public function init(int $taskId): bool
	{
		var_dump(exec('sudo -u www-data php '. __DIR__ . '/../worker.php '.$taskId));
		return true;
	}	

	// public function history()
	// {
		
	// }
}