<?php

namespace Carterline42\App;

use Exception;
use InvalidArgumentException;
use \Carterline42\Exceptions\RouterException;
use \Carterline42\Generic;
use \ReflectionClass;

class Router
{
	private static AppConfig $appConfig;

	public static function load(String $filepath): bool
	{
		$appConfigYaml = @yaml_parse_file($filepath);
		if (empty($appConfigYaml)) throw new InvalidArgumentException("Unable to parse app config");

		self::$appConfig = AppConfigFactory::fromYaml($appConfigYaml['app']);
		unset($appConfigYaml);
		return true;
	}

	public static function handle($requestUrl)
	{
		if (isset($_POST['uid'])) unset($_POST['uid']);
		$request = @explode('/', $requestUrl);
		$tokenPayload = null;
		@array_shift($request);
		if (empty($request) || count($request) == 0) throw new RouterException("Unable to parse input request url", stringCode: RouterErrorTypes::INVALID_REQUEST);
		if (!isset(self::$appConfig->routes[$request[1] ?? null])) throw new RouterException("Controller is not defined for this request", stringCode: RouterErrorTypes::INVALID_METHOD);
		$controller = self::$appConfig->routes[$request[1]];
		include __DIR__ . '/../' . self::$appConfig->settings->controllersDir . $controller->controller . ".php";
		$controllerNamespaced = self::$appConfig->namespace . "\App\Controllers\\" . $controller->controller;
		if (!isset($request[2]) || empty($request[2]) || !method_exists($controllerNamespaced, $request[2])) throw new RouterException("Method is not defined in controller", stringCode: RouterErrorTypes::INVALID_METHOD);
		if (!in_array($request[2], self::$appConfig->routes[$request[1]]->unprotectedMethods))
		{
			if ($_SERVER['HTTP_AUTHORIZATION'] ?? null)
			{
				$token = @str_replace('Bearer ', '', stristr($_SERVER['HTTP_AUTHORIZATION'], 'bearer '));
				try
				{
					
					$tokenPayload = Generic\GetIt::instance(Generic\JWTWorker::class)->verify($token, Generic\DeviceInfo::getClientIp());
					// $_POST['uid'] = $tokenPayload->payload->u;
				}
				catch (\Throwable $e)
				{
					// throw $e;
					throw new RouterException("Incorrect authorization credentials", stringCode: RouterErrorTypes::INVALID_CREDENTIALS);
				}
				if (empty($tokenPayload)) throw new RouterException("Incorrect authorization credentials", stringCode: RouterErrorTypes::INVALID_CREDENTIALS);
			}
			else
			{
				throw new RouterException("Authorization required", stringCode: RouterErrorTypes::INVALID_CREDENTIALS);
			}
		}
		$rclass = new ReflectionClass($controllerNamespaced);
		$mth = $rclass->getMethod($request[2]);
		$buff = array_map(fn($param) => $param->getName(), $mth->getParameters());
		$unpassedParams = array_diff($buff, array_keys($_POST));
		if (in_array('uid', $unpassedParams))
		{
			$_POST['uid'] = $tokenPayload->payload->u;
			unset($unpassedParams[array_search('uid', $unpassedParams)]);
		}
		if (count($unpassedParams) > 0) throw new RouterException("Method `$request[2]` must include missing params: " . implode(', ', $unpassedParams), stringCode: RouterErrorTypes::MISSING_PARAMS);

		$buff = array_replace(array_flip($buff), $_POST);


		foreach ($mth->getParameters() as $key => $value) {
			$predefinedType = $value->getType()->getName();
			$buffKey = $value->getName();
			if (($predefinedType != 'bool' && $predefinedType != 'int') && $predefinedType != 0)
			{
				if (empty($buff[$buffKey]) && (!$value->isDefaultValueAvailable() || $value->getDefaultValue() == null) && !$value->allowsNull())
				{
					throw new RouterException("Parameter `$buffKey` cannot be null", stringCode: RouterErrorTypes::TYPE_MISMATCH);
				}
			}

			$actualType = getType($buff[$buffKey]);
			if ($predefinedType != $actualType)
			{
				if ($predefinedType == 'bool')
				{
					
					settype($buff[$buffKey], $predefinedType);
				}
				else
				{
					$tmpActualValue = $buff[$buffKey];
					settype($tmpActualValue, $predefinedType);
					settype($tmpActualValue, $actualType);
					if ($tmpActualValue == $buff[$buffKey])
					{
						settype($buff[$buffKey], $predefinedType);
					}
					else
					{
						throw new RouterException("Parameter `$buffKey` must be of type $predefinedType", stringCode: RouterErrorTypes::TYPE_MISMATCH);
					}
				}

			}
		}

		// var_dump($buff);
		Generic\GetIt::register($controllerNamespaced);
		$controller = Generic\GetIt::instance($controllerNamespaced);
		// return \call_user_method_array($request[2], $controller, $buff);

		return call_user_func_array(array($controller, $request[2]), $buff);

	}
}

class RouterErrorTypes
{
	const MISSING_PARAMS = ["MISSING_PARAMS"];
	const INVALID_CREDENTIALS = ["INVALID_CREDENTIALS", 401];
	const INVALID_REQUEST = ["INVALID_REQUEST"];
	const INVALID_METHOD = ["INVALID_METHOD"];
	const UNKNOWN_ERROR = ["UNKNOWN_ERROR", 500];
	const TYPE_MISMATCH = ["TYPE_MISMATCH"];
}
?>