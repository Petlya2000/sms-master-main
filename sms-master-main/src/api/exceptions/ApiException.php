<?php

namespace Carterline42\Exceptions;

class ApiException extends \Exception {
	public String $stringCode;
	public int $httpCode;
	public function __construct(?String $message = "", int $code = 0, Throwable $previous = null, ?String $stringCode = null) {
		$this->stringCode = $stringCode ?? "UNKNOWN_ERROR";
		$this->httpCode = (is_null($message) ? 500 : 400);
        parent::__construct($message, $code, $previous);
    }
}

?>