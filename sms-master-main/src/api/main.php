<?php

namespace Carterline42\App;
date_default_timezone_set('Europe/Moscow');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);
// echo json_encode($_ENV); exit;
include 'vendor/autoload.php';
include 'app/service_locator.php';


use \Throwable;
use \Carterline42\Generic;
use \Carterline42\Exceptions;

Router::load(dirname(__FILE__) . "/app.yml");

header('Content-Type: application/json; charset=utf-8');
// var_dump($_SERVER['HTTP_ORIGIN']);
// print_r($_SERVER['SERVER_NAME']);
// if ($_SERVER['HTTP_ORIGIN'] == 'localhost' || $_SERVER['HTTP_ORIGIN'] == $_SERVER['HTTP_HOST'])
// {
// 	header("Access-Control-Allow-Origin: https://$_SERVER[HTTP_ORIGIN]");
// }
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, origin, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
	header(Generic\HttpStatusCodes::httpHeaderFor(200));  
	exit;  
}

try
{
	$response = Router::handle($_SERVER['REQUEST_URI'] ?? null);
	if (!isset($response['error']) && !isset($response['response'])) $response = ['response' => $response];
	if (isset($response['error'])) header(Generic\HttpStatusCodes::httpHeaderFor(400));
	echo json_encode($response);
	exit;
}
catch (\Throwable $e)
{
	$error = [];
	// $error = ($e instanceof Exceptions\RouterException || $e instanceof Exceptions\ApiException ? ['error' => $e->getMessage(), 'code' => $e->stringCode]: ['error' => 'Unknown error', 'code' => get_class($e)]);
	if ($e instanceof Exceptions\RouterException || $e instanceof Exceptions\ApiException)
	{
		$error = ['error' => $e->getMessage(), 'code' => $e->stringCode];
	}
	else
	{
		$privacyFields = ['password', 'message', 'inviteCode'];

		array_walk($_POST, function(&$value, $key) use ($privacyFields) {
		    foreach($privacyFields as $searchKey) {
		        if(strpos(strtolower($key), strtolower($searchKey)) !== false) {
		            $value = '[modified due to privacy policy]';
		            break;
		        }
		    }
		});

		$error = ['error' => 'Internal server error occured', 'code' => 'INTERNAL_SERVER_ERROR'];
		Generic\GetIt::instance(Generic\Database::class)->doRollback();
		$stackTrace = [];

		$stackTrace[] = PHP_EOL . PHP_EOL . PHP_EOL . '[ERROR: '. date('d.m.Y H:i:s', time()) .']';
		$stackTrace[] = 'Request: '. PHP_EOL . '`' . $_SERVER['REQUEST_URI'] .'` from IP: ' . Generic\DeviceInfo::getClientIp();
		$stackTrace[] = 'Message of exception: ' . $e->getMessage();
		$stackTrace[] = 'Stacktrace of ' . get_class($e) . ':' . PHP_EOL .$e->getTraceAsString();
		$stackTrace[] = 'POST params: `'. json_encode($_POST, JSON_UNESCAPED_UNICODE);
		
		$fp = fopen('logs/' . 'error' . date('d.m.Y', time()) . '.log', 'a');
		fwrite($fp, implode(PHP_EOL . PHP_EOL, $stackTrace));
		fclose($fp);

	}
	header(Generic\HttpStatusCodes::httpHeaderFor($e->httpCode ?? 500));
	echo json_encode($error);
	// throw $e;
	exit;
}


?>