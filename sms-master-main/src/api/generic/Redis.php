<?php

namespace Carterline42\Generic;

use \Carterline42\Generic\Interfaces\IKeyValueStorage;

class Redis implements IKeyValueStorage
{
    private \Predis\Client $client;
    function __construct(String $host, int $port = 6379, ?String $login = null, ?String $password = null)
    {
        $this->client = new \Predis\Client([
            'host'   => $host,
            'port'   => $port
        ]);
        if (!empty($password)) $this->auth($password);
        return 1;
    }

    public function getValueByKey(String $key): ?String
    {
        return $this->client->get($key);
    }

    public function writeValueWithKey(String $key, ?String $value, ?int $expires = 0): bool
    {
        $this->client->set($key, $value);
        if ($expires > 0) $this->client->expire($key, $expires);
        return 1;
    }

    public function removeValueWithKeyByKey(String $key): bool
    {
        
        $this->client->delete($key);
        return 1;
    }
}

?>