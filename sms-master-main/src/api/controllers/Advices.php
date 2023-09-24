<?php

namespace Carterline42\App\Controllers;

use \Carterline42\Generic;
use \Carterline42\Generic\Interfaces;
use \Carterline42\Exceptions;
class Advices
{ 
	private Generic\Database $db;

	function __construct(Generic\Database $db)
	{
		$this->db = $db;
	}

	public function allowNumber(String $phone = null)
	{
		return $this->db->updateAdviceStateForNumber($phone, 1)[0];
	}
	public function disallowNumber(String $phone)
	{
		return $this->db->updateAdviceStateForNumber($phone, 0)[0];
	}
	public function add(String $text, int $priority)
	{
		return $this->db->addAdvice($text, $priority)[0];
	}
	public function remove(int $id)
	{
		return $this->db->removeAdvice($id)[0];
	}
	public function get(int $offset = 0, int $limit = 1000)
	{
		return $this->db->getAdvicesText($offset, $limit);
	}
	public function counters()
	{
		return $this->db->getCounters()[0];
	}
	public function pause()
	{
		return $this->db->setAdviceDaemonState(0)[0];
	}
	public function resume()
	{
		return $this->db->setAdviceDaemonState(1)[0];
	}
	public function getConfig()
	{
		return $this->db->getCurrentSettings()[0];

	}
	public function updateWorkingTimeInterval(String $interval)
	{
		$this->db->doTransaction();
		if (!preg_match('/^\d\d[:]\d\d-\d\d[:]\d\d$/', $interval)) throw new Exceptions\ApiException("invalid time format");
		$tmpTime = explode('-', $interval);
		if ($tmpTime[0] == $tmpTime[1]) throw new Exceptions\ApiException("Please don't break :(");
		$result = $this->db->updateWorkingTimeInterval($interval)[0];
		$this->db->doCommit();
		return $result;
	}
	public function updateAdvicesInterval(int $interval)
	{
		$this->db->doTransaction();
		if ($interval == 0) throw new Exceptions\ApiException("Invalid interval");
		$result = $this->db->updateAdvicesIntervalPerNumber($interval)[0];
		$this->db->doCommit();
		return $result;
	}
	

	public function status()
	{
		$advicesWorking = $this->db->getAdvicesWorkingState()[0];
		$adviceData = @unserialize(file_get_contents( __DIR__ . '/../storage/tmp/adv.tmp'));
		$adviceStatus = file_get_contents( __DIR__ . '/../storage/tmp/fast.state');
		if (!empty($adviceData))
		{
			$details = 
			[
				'phones' => array_map(fn($item) => ['phone' => $item['phoneNumber'], 'sendedCount' => @count(json_decode($item['seenAdvices']))], $adviceData['listNumbers']),
				'assigned' => $adviceData['assignedList'],
				'results' => $adviceData['results'],
			];
		}
		else
		{
			$details = null;
		};
		$result = [
			'status' => (int)$adviceStatus,
			'advicesWorking' => $advicesWorking['advicesWorking'],
			'details' => $details
		];

		$timeIntervalDb = $advicesWorking['workingTimeInterval'];
		$timeInterval = explode('-', $timeIntervalDb);
		$timezone = new \DateTimeZone('GMT+3');
		$currentTime = new \DateTime('now', $timezone);
		$startTime = new \DateTime($timeInterval[0], $timezone);
		$endTime = new \DateTime($timeInterval[1], $timezone);
		
		if ($currentTime <= $startTime || $currentTime >= $endTime) {
			$result['nightTimeUntil'] = $startTime->getTimestamp();
		};
		return $result;
		// return $this->db->setAdviceDaemonState(1)[0];
	}
}