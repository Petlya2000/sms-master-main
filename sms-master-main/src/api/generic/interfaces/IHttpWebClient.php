<?php

namespace Carterline42\Generic\Interfaces;

interface IHttpWebClient
{
    public function get(?String $url, array $params = [], array $headers = []);
    public function post(?String $url, array $params = [], array $headers = []);
    public function request(?String $url, ?String $httpMethod, array $params = [], array $headers = []);
}
