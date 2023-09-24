<?php

namespace Carterline42\App;

class RequestsLimitEntity
{
	public int $count;
	public int $time;

	function __construct(int $count, int $time)
	{
		$this->count = $count;
		$this->time = $time;
	}
}

?>