<?php

namespace Carterline42\Generic;

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;
use \Throwable;
use \Carterline42\Generic\Interfaces\IJWTWorker;

class JWTWorker implements IJWTWorker
{
	private String $secret;

	function __construct(String $secret)
	{
		$this->secret = $secret;
	}

	public function generate(int $ttl, array $payload, ?String $attachToIp = null): String
	{
        $issuedAt = time();
        $expire = $issuedAt + 60 * $ttl;
        $data = [
            'iat' => $issuedAt,
            'exp' => $expire,
            'nbf' => $issuedAt,
            'payload' => $payload
        ];
        if (!empty($attachToIp)) $data['iid'] = $attachToIp; // iis -- issuer ip address
        return JWT::encode($data, $this->secret, 'HS512');
	}

	public function verify(String $token, ?String $ip = null): Object
	{
		try
		{
			$token = JWT::decode($token, new Key($this->secret, 'HS512'));
			if (isset($token->iid) && !empty($token->iid))
			{
				if ($token->iid != $ip) throw new Exception("security issue");
			}
			return $token;
		}
		catch (Throwable $e)
		{
			throw $e;
		}
		
	}
}

?>