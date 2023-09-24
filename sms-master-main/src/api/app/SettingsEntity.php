<?php

namespace Carterline42\App;

class SettingsEntity
{
	public String $controllersDir;
	public RequestsLimitEntity $requestsLimit;
	public Fail2banEntity $fail2ban;

	function __construct(String $controllersDir, RequestsLimitEntity $requestsLimit, Fail2banEntity $fail2ban)
	{
		$this->controllersDir = $controllersDir;
		$this->requestsLimit = $requestsLimit;
		$this->fail2ban = $fail2ban;
	}
}

?>