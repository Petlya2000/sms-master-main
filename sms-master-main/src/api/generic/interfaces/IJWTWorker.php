<?php

namespace Carterline42\Generic\Interfaces;

interface IJWTWorker
{
	function __construct(String $secret);

	public function generate(int $ttl, array $payload, ?String $attachToIp = null): String;

	public function verify(String $token, ?String $ip = null): Object;

}

?>