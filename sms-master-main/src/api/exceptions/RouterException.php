<?php

namespace Carterline42\Exceptions;

class RouterException extends \Exception {
	public String $stringCode;
	public int $httpCode;
	public function __construct(String $message, int $code = 0, Throwable $previous = null, array $stringCode = null) {
		$this->stringCode = $stringCode[0];
		$this->httpCode = $stringCode[1] ?? 400;
        parent::__construct($message, $code, $previous);
    }
}

?>