<?php

namespace Carterline42\App;

class Fail2banEntity
{
	public int $count;
	public int $time;
	public int $jailedUntil;

	function __construct(int $count, int $time, int $jailedUntil)
	{
		$this->count = $count;
		$this->time = $time;
		$this->jailedUntil = $jailedUntil;
	}
}


?>