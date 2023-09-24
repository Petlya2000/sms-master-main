<?php

namespace Carterline42\Generic;
/**
*	@author consulive@live.com
*	@version 0.1.0
*/

use \PDO;

class Database extends PDO
{
	private $pdo;
	private bool $hasTransaction = false;

	function __construct(String $host, String $database, String $user, String $password)
	{
		$driver = 
		[
			PDO::ATTR_EMULATE_PREPARES   => false,
			PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
			PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
		];
		try
		{
			$this->pdo = new PDO("mysql:dbname=$database;host=$host;charset=utf8mb4", $user, $password, $driver);
		} catch (\Throwable $e)
		{
			throw $e;
		}
		return true;
	}

	private function buildQuery($procedureName, $params)
	{
		$preparedParams = [];
		foreach ($params as $key => $value) $preparedParams[':p' . $key] = $value;
		$statement = $this->pdo->prepare("CALL $procedureName(" . implode(", ", array_keys($preparedParams)) . ")");
		
		$statement->execute($preparedParams);
		$result = $statement->fetchAll();
		return $result;
	}

	public function doTransaction(): void
	{
		$this->pdo->beginTransaction();
		$this->hasTransaction = true;
	}

	public function doRollback(): void
	{
		if ($this->hasTransaction == true)
		{
			echo "\nROLLBACK CALLED!\n";
			$this->pdo->rollBack();
			$this->hasTransaction = false;
		}
		

	}

	public function doCommit(): void
	{
		$this->pdo->commit();
		$this->hasTransaction = false;
	}

	public function __call($method, $params)
	{
		if (!$this->pdo || empty($this->pdo)) throw new DatabaseException("Connection not initialized");
		return $this->buildQuery($method, $params);
	}
}


class DatabaseException extends \Exception {}

?>