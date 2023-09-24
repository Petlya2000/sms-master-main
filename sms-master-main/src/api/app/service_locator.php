<?php
namespace Carterline42\App;

use \Carterline42\Generic\GetIt;
use \Carterline42\Generic\JWTWorker;
use \Carterline42\Generic\Database;
use \Carterline42\Generic\Redis;

GetIt::register(Redis::class, ['redis']);
GetIt::register(JWTWorker::class, [$_ENV['JWT_SECRET']]);
GetIt::register(Database::class, ['mariadb', $_ENV['MYSQL_DATABASE'], 'root', $_ENV['MYSQL_ROOT_PASSWORD']]);

?>