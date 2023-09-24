<?php
declare(strict_types=1);
namespace Carterline42\Generic;
/**
* 		@author Carterline42
* 		@version v1.0
*		
*    ************************************************
*	 ************************************************
*	 ***										  ***
*	 ***  	               GetIt 				  ***
*	 ***										  ***
*	 ***    A powerful service locator library    ***
* 	 ***										  ***
*    ************************************************
*	 ************************************************
*
**/



use RuntimeException;
use ReflectionClass;
use ReflectionNamedType;

class GetIt
{
    private static array $services = [];
    private static array $interfaces = [];
    private static array $instances = [];
    private static bool $debugMode = false;
    public static function addInstance(string $class, $service)
    {
        self::$instances[$class] = $service;
    }

    public static function register(string $class, array $params = [])
    {
        self::$services[$class] = $params;
        $rclass = new ReflectionClass($class);
        $interface = array_values($rclass->getInterfaces())[0]->name ?? null;
        if (!empty($interface)) {
        	self::$interfaces[$interface] = $class;
        	if (self::$debugMode) echo "class $class associated with interface $interface was registered\n";
        }
        else
        {
        	if (self::$debugMode) echo "class $class was registered\n";
        }
    }
    public static function has(string $interface): bool
    {
        return isset(self::$services[$interface]) || isset(self::$instances[$interface]);
    }

    public static function instance(string $class)
    {
        
        if (isset(self::$instances[$class])) {
            return self::$instances[$class];
        }
        elseif(isset(self::$interfaces[$class]) && isset(self::$instances[self::$interfaces[$class]]))
        {
        	return self::$instances[self::$interfaces[$class]];
        }
        if (self::$debugMode) echo "$class not instancetized\n";
        $class = self::$interfaces[$class] ?? $class;
        $rclass = new ReflectionClass($class);
		$ctor = $rclass->getConstructor();
        $buff = [];
        if (!empty($ctor))
        {
	        foreach ($ctor->getParameters() as $param) {
	        	if (!$param->getType()->isBuiltin())
	        	{
	        		$name = $param->getType()->getName();
	        		if (self::$debugMode) echo "dependency $name found in $class constructor\n";
	        		$buff[] = self::instance($name);
	        	}
	        }
        }

        
        self::$services[$class] = array_merge($buff, self::$services[$class]);
        $object = new $class(...self::$services[$class]);
        unset(self::$services[$class]);
        self::$instances[$class] = $object;
        return $object;
    }
}