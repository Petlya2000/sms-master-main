<?php

namespace Carterline42\Generic;

class SmsGate
{
	public static $outputUrl;
	public static function prepare()
	{
		self::$outputUrl = sys_get_temp_dir() . '/' . 'php_smsgate.tmp';
	}

	private static function checkTmpLinesCount(): int
	{
		$lines = 0;
		$handle = fopen(self::$outputUrl, "r");
		while(!feof($handle)){
		  $line = fgets($handle);
		  $lines++;
		}
		fclose($handle);
		return $lines - 1;
	}

	private static function clearTmp(): void
	{
		unlink(self::$outputUrl);
	}	

	public static function send(String $sender, array $receiverAndText): array
	{
		$startOfArray = array_key_first($receiverAndText);
		foreach ($receiverAndText as $receiver => $text) {
			exec("curl -m 3 -s -o /dev/null -w '\n$receiver:%{http_code}' 'http://62.182.8.69:8001/submit?s=$sender&d=$receiver' -d '$text' >> " . self::$outputUrl . " &");
		};
		$retries = 0;
		$maxRetries = 10;

		do
		{
			$retries++;
			sleep(1);
		} while (self::checkTmpLinesCount() != count($receiverAndText) && $retries < $maxRetries);

		$fp = fopen(self::$outputUrl, 'r');
		$fsize = filesize(self::$outputUrl);
		$data = ($fsize ? fread($fp, $fsize) : null);
		fclose($fp);
		$rows = @explode(PHP_EOL, $data);
		@array_shift($rows);
		$numberStates = [];
		if (count($rows) != 0)
		{
			foreach ($rows as $row) {
				$row = explode(':', $row);
				$numberStates[$row[0]] = $row[1];
			}
		};

		self::clearTmp();
		return $numberStates;
	}
}

?>