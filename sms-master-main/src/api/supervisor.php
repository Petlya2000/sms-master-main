<?php

namespace Carterline42\App;

if(false) declare(ticks=1);

date_default_timezone_set('Europe/Moscow');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


cli_set_process_title("AdviceSupervisor");

// safesleep(999999999999);

$terminateProcess = false;

pcntl_signal(SIGTERM, function(){
	global $terminateProcess;
	$terminateProcess = true;
}, false);

if (is_dir('vendor'))
{
	include 'vendor/autoload.php';
};

if (!is_dir('vendor') || !class_exists("\Carterline42\Generic\GetIt"))
{
	exec("cd /var/www/html/api && composer install --no-interaction --no-plugins --no-scripts --no-dev --prefer-dist && composer dumpautoload -o");
	exit(999);
}

include 'app/service_locator.php';

use \Carterline42\Generic;
use Generic\ProcessController;
$db = Generic\GetIt::instance(Generic\Database::class);
$environment = getenv();
function debugPrint(String $msg)
{
	global $environment;
	if (isset($environment["SMS_DEBUG"]) && $environment["SMS_DEBUG"] == 1) {
		echo "$msg\n";
	};
}
debugPrint("Supervisor process started...");

do {
	checkTerminate();
	$advicesWorking = $db->getAdvicesWorkingState()[0];
	$pid = Generic\ProcessController::getPidByName('AdviceWorker');
	$processActive = (isset($pid) && !empty($pid));
	debugPrint(
		"DB State: " . ($advicesWorking["advicesWorking"] == true ? 'true' : 'false') .
		" | Current state: " . (isset($pid) && !empty($pid) ? 'true' : 'false') . PHP_EOL
		);
	if ($advicesWorking["advicesWorking"] == true) 
	{
		if (!$processActive) {
			debugPrint("Process must work, but it isn't... starting...");
			Generic\ProcessController::start('advicesWorker.php');
		};
	}
	else
	{
		if ($processActive)
		{
			debugPrint("Process must NOT work, but it does... terminating...");
			Generic\ProcessController::terminate('AdviceWorker');
			safesleep(3);
			if (Generic\ProcessController::isProcessAlive('AdviceWorker'))
			{
				debugPrint("Process not responding... ill send another SIGTERM");
				Generic\ProcessController::terminate('AdviceWorker');
				safesleep(15);
				if (Generic\ProcessController::isProcessAlive('AdviceWorker')) {
					debugPrint("Process still not responding... it will be killed now.");
					Generic\ProcessController::kill('AdviceWorker');
				}
				else
				{
					debugPrint("Oh.. it was terminated... fine!");
				}
			}

		}
	}

	safesleep(1);

} while (42);

function checkTerminate(): void
{
	global $terminateProcess;
	if ($terminateProcess)
	{
		debugPrint("SIGTERM!");
		Generic\ProcessController::terminate('AdviceWorker');
		debugPrint("Terminated worker");
		debugPrint("bye!");
		exit(0);
		// echo "SIGTERM handled\n";
		// $fp = fopen("storage/tmp/adv.tmp", "w+");
		// @fwrite($fp, serialize($advicesData));
		// fclose($fp);
		// echo "bye!\n";
		// FastState::final(FastStates::DIED);
	}
}

function safesleep(int $seconds): void
{
	for ($i=0; $i < $seconds*2; $i++) { 
		usleep(500000);
		checkTerminate();
	}
}

?>