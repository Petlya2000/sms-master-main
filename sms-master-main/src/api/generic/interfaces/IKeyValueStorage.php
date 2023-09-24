<?php

namespace Carterline42\Generic\Interfaces;

interface IKeyValueStorage
{
    function __construct(String $host, int $port, ?String $login = null, ?String $password = null);
    public function getValueByKey(String $key): ?String;
    public function writeValueWithKey(String $key, ?String $value, ?int $expires = 0): bool;
    public function removeValueWithKeyByKey(String $key): bool;
}