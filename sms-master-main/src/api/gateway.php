<?php

namespace Carterline42\App;
date_default_timezone_set('Europe/Moscow');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);


include 'vendor/autoload.php';
include 'app/service_locator.php';


use \Carterline42\Generic;
// print_r($_SERVER); exit;


if (empty($_SERVER['PHP_AUTH_USER']) || empty($_SERVER['PHP_AUTH_PW']))
{
	header(Generic\HttpStatusCodes::httpHeaderFor(401)); exit;
}

if (strtolower($_SERVER['PHP_AUTH_USER']) == 'root')
{
	header(Generic\HttpStatusCodes::httpHeaderFor(403)); exit;
}

$db = Generic\GetIt::instance(Generic\Database::class);
$preparedPassword = hash('sha256', hash('sha256', $_SERVER['PHP_AUTH_PW']));
$result = $db->checkUserPasswordHash($_SERVER['PHP_AUTH_USER'], $preparedPassword)[0];
if (!isset($result['response']) || gettype($result['response']) != 'integer')
{
	header(Generic\HttpStatusCodes::httpHeaderFor(401)); exit;
}

$request = explode('/', $_SERVER['REQUEST_URI']);
array_splice($request, 0, 2);
$countRequestEntries = count($request);
if ($countRequestEntries < 2 || $countRequestEntries > 3)
{
	header(Generic\HttpStatusCodes::httpHeaderFor(400)); exit;
};
$number = '';
$action = ''; // 0 rm / 1 mk
if ($request[0] != 'phone')
{
	header(Generic\HttpStatusCodes::httpHeaderFor(404)); exit;
}
if ($countRequestEntries == 2)
{
	$method = $_SERVER['REQUEST_METHOD'];
	$tmpNumber = $request[1];
	if ((string)(int)$tmpNumber != $tmpNumber)
	{
		header(Generic\HttpStatusCodes::httpHeaderFor(400)); exit;
	}
	else
	{
		$number = (int)$tmpNumber;
		unset($tmpNumber);
	}
	if ($method != 'PUT' && $method != 'DELETE')
	{
		header(Generic\HttpStatusCodes::httpHeaderFor(400)); exit;
	};

	if ($method == 'PUT')
	{
		$action = 1;
	};
	if ($method == 'DELETE')
	{
		$action = 0;
	};
};

if ($countRequestEntries == 3)
{

	$tmpNumber = $request[2];
	if ((string)(int)$tmpNumber != $tmpNumber)
	{
		header(Generic\HttpStatusCodes::httpHeaderFor(400)); exit;
	}
	else
	{
		$number = (int)$tmpNumber;
		unset($tmpNumber);
	}
	if ($request[1] != 'add' && $request[1] != 'remove')
	{
		header(Generic\HttpStatusCodes::httpHeaderFor(400)); exit;
	};
	$action = (int)($request[1] == 'add');
}

if (strlen($number) != 11)
{
	header(Generic\HttpStatusCodes::httpHeaderFor(400)); exit;
}

$result = $db->updateAdviceStateForNumber($number, $action)[0];
if (isset($result['response']))
{
	header(Generic\HttpStatusCodes::httpHeaderFor(200)); exit;
}
else
{
	header(Generic\HttpStatusCodes::httpHeaderFor(500)); exit;
}
// if (count($request) > 2 && count($request) < 4)
// {

// }
// print_r([$number, $action]);


?>