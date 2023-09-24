<?php

namespace Carterline42\App;

if(false) declare(ticks=1);

date_default_timezone_set('Europe/Moscow');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

cli_set_process_title("AdviceWorker");

$terminateProcess = false;

pcntl_signal(SIGTERM, function(){
	global $terminateProcess;
	$terminateProcess = true;
}, false);

date_default_timezone_set('Europe/Moscow');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include 'vendor/autoload.php';
include 'app/service_locator.php';

use \Carterline42\Generic;

use \Carterline42\Generic\FastState;
use \Carterline42\Generic\FastStates;
use \Carterline42\Generic\SmsGate;

FastState::load('storage/tmp/fast.state');

$fp = @fopen("storage/tmp/adv.tmp", 'r+');
$tmpSize = filesize("storage/tmp/adv.tmp");
$advicesData = ($tmpSize > 0 ? @unserialize(fread($fp, $tmpSize)) : null);

$defaultAdvicesData = [
	'countNumbers' => 10,
	'listNumbers' => [],
	'listAdvices' => [],
	'assignedList' => [],
	'results' => [],
];
$advicesData = (empty($advicesData) ? $defaultAdvicesData : $advicesData);
$listAdviceTexts = [];
$db = Generic\GetIt::instance(Generic\Database::class);
SmsGate::prepare();
echo "Started\n";
do
{
	$timeIntervalDb = $db->getAdvicesWorkingState()[0]['workingTimeInterval'];
	$timeInterval = explode('-', $timeIntervalDb);
	print_r($timeIntervalDb);
	print_r($timeInterval);
	$timezone = new \DateTimeZone('GMT+3');
	$currentTime = new \DateTime('now', $timezone);
	$startTime = new \DateTime($timeInterval[0], $timezone);
	$endTime = new \DateTime($timeInterval[1], $timezone);
	
	if ($currentTime >= $startTime && $currentTime <= $endTime) {
		FastStates::RESUMING;
	} else {
		FastState::fetch(FastStates::SLEEPING_NIGHT_TIME);
		safesleep(60);
		continue;
	}

	checkTerminate(); // каждый цикл проверяем SIGTERM

	if (count($advicesData['results']) != 0) // Проверим, нет ли результатов предыдущей итерации
	{
		$advicesData = $defaultAdvicesData; // сбросим данные если были результаты
	}

	if (count($advicesData['listAdvices']) == 0) // Если в сохранённых нет списка советов, подтянем
	{
		FastState::fetch(FastStates::PREPARING_ADVICES);
		$listAdviceTexts = $db->getAdvicesText(0, 1000);

		if (count($listAdviceTexts) == 0) // Пропускаем итерацию цикла с ожиданием, если список советов из бд пуст
		{
			FastState::fetch(FastStates::SLEEPING_NO_ADV_TEXT);
			safesleep(10);
			continue;
			// $listAdviceTexts = array_reduce($tmpAdvicesText, function($result, $item) {
			//     $result[$item['id']] = $item['text'];
			//     return $result;
			// }, []);
			// unset($tmpAdvicesText);
		}
		else
		{
			$advicesData['listAdvices'] = $listAdviceTexts; // сохраним 
			saveData();
		}
	}
	else
	{
		$listAdviceTexts = $advicesData['listAdvices'];
	}


	if (count($advicesData['listNumbers']) == 0) // подтянем список номеров если пуст в сохранённых
	{
		FastState::fetch(FastStates::PREPARING_NUMBERS);
		$listNumbers = $db->getAdvicePhoneList($advicesData['countNumbers']);
		if (count($listNumbers) == 0) // пропустим итерацию цикла с ожиданием, если список номеров из бд пуст
		{
			FastState::fetch(FastStates::SLEEPING_NO_TARGETS);
			safesleep(10);
			continue;
		}
		else
		{
			$advicesData['listNumbers'] = $listNumbers; // сохраним
			saveData();
		}
	};
	checkTerminate();
	$assignList = [];
	if (count($advicesData['assignedList']) == 0)  // Если в сохранённых нет списка привязанных советов к номерам, подтянем
	{
		FastState::fetch(FastStates::ASSIGNING_ADVICES_TO_NUMBERS);
		foreach ($advicesData['listNumbers'] as $index => $number) {
			
			$seenAdvices = (array)json_decode($number['seenAdvices']);
			$adviceAssigned = false;
			$assignRetries = 0;
			$maxAssignRetries = count($listAdviceTexts);
			do {
				$tmpAdviceIndex = rand(0, count($listAdviceTexts) - 1);
				// print($tmpAdviceIndex);
				$tmpAdviceId = $listAdviceTexts[$tmpAdviceIndex]['id'];
				if (!in_array($tmpAdviceId, $seenAdvices))
				{
					$assignList[$number['phoneNumber']] = ['index' => $tmpAdviceIndex, 'id' => $tmpAdviceId];
					$adviceAssigned = true;
				}
				$assignRetries++;
				print("$assignRetries/$maxAssignRetries\n");
				var_dump($assignRetries < $maxAssignRetries);
			} while (!$adviceAssigned && $assignRetries < $maxAssignRetries);
			if ($assignRetries >= $maxAssignRetries)
			{
				$db->setNewTimeForPhoneNumber($number['phoneNumber']);
			}
		}
	}
	else
	{
		$assignList = $advicesData['assignedList'];
	}
	checkTerminate();
	if (count($assignList) == 0)
	{
		FastState::fetch(FastStates::SLEEPING_NO_TARGETS);
		$advicesData = $defaultAdvicesData;
		saveData();
		safesleep(10);
		continue;
	}
	else
	{
		$advicesData['assignedList'] = $assignList;
		saveData();
		$preparedAdvicesAndReceivers = [];
		foreach ($assignList as $target => $advice) {
			if ($advice > -2)
			{
				$adviceText = $listAdviceTexts[$advice['index']]['text'];
				$preparedAdvicesAndReceivers[$target] = $adviceText;
			}
			
		};
		if (count($preparedAdvicesAndReceivers) == 0)
		{
			FastState::fetch(FastStates::SLEEPING_NO_TARGETS);
			$advicesData = $defaultAdvicesData;
			saveData();
			safesleep(10);
			continue;
		}
		else
		{
			FastState::fetch(FastStates::SENDING);
			$result = SmsGate::send('5557', $preparedAdvicesAndReceivers);
			foreach ($result as $receiver => $status) {
				if ($status == 200)
				{
					$db->updatePhoneNumberSeenAdvices($receiver, $assignList[$receiver]['id']);
					$db->addToAdviceHistory($receiver, $assignList[$receiver]['id'], $status);
				}
				
				$advicesData['results'] = $result;
				saveData();
			}
			safesleep(5);
		}
		
	}
} while (42);


function checkTerminate(): void
{
	global $terminateProcess;
	if ($terminateProcess)
	{
		echo "SIGTERM handled\n";
		saveData();
		echo "bye!\n";
		FastState::final(FastStates::DIED);
	}
}

function saveData(): void
{
	global $advicesData;
	$fp = fopen("storage/tmp/adv.tmp", "w+");
	@fwrite($fp, serialize($advicesData));
	fclose($fp);
}

function safesleep(int $seconds): void
{
	for ($i=0; $i < $seconds*2; $i++) { 
		usleep(500000);
		checkTerminate();
	}
}

?>
