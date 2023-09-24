<?php

namespace Carterline42\App\Controllers;

use \Carterline42\Generic;
use \Carterline42\Generic\Interfaces;
use \Carterline42\Exceptions;
class Account
{ 
	private Generic\Database $db;
	private Generic\JWTWorker $jwtWorker;
	private Interfaces\IKeyValueStorage $storage;

	function __construct(Generic\Database $db, Interfaces\IKeyValueStorage $storage, Generic\JWTWorker $jwtWorker)
	{
		$this->db = $db;
		$this->storage = $storage;
		$this->jwtWorker = $jwtWorker;
	}

	public function auth(String $login, String $passwordHash): String
	{
		$result = $this->db->checkUserPasswordHash($login, hash('sha256', $passwordHash))[0];
		if (isset($result['error'])) throw new Exceptions\ApiException($result['error'], stringCode: $result['errorCode']);
		$uid = $result['response'] ?? throw new Exceptions\ApiException();
		$tokenStamp = (int)$this->storage->getValueByKey('u' . $uid . 'ts') ?? 0;
		if ($tokenStamp === 0) $this->storage->writeValueWithKey('u' . $uid . 'ts', $tokenStamp);
		return $this->jwtWorker->generate(ttl: 1440, payload: ['u' => $uid, 'ts' => $tokenStamp]);
	}

	public function register(String $inviteCode, String $login, String $screenName, String $passwordHash)
	{
		$this->db->doTransaction();
		$hashedPassHash = hash('sha256', $passwordHash);
		$result = $this->db->registerUser($inviteCode, $login, $screenName, $hashedPassHash);
		$result = $result[0];
		if (isset($result['response']))
		{
			$this->db->doCommit();
			return $this->auth($login, $passwordHash);
		};
		
		
		if (isset($result['error'])) throw new Exceptions\ApiException($result['error'], stringCode: $result['errorCode']);
		throw new Exceptions\ApiException();

	}

	public function invite(int $uid, bool $allowInviteUsers = false)
	{
		$this->db->doTransaction();
		$inviteCode = bin2hex(random_bytes(16) . time());
		$result = $this->db->inviteUser($uid, (int)$allowInviteUsers, $inviteCode)[0];
		$this->db->doCommit();
		return $result;
	}

	public function inviteCodeValid(String $inviteCode)
	{
		return $this->db->isInviteCodeValid($inviteCode)[0];
	}

	public function changePassword(String $uid, String $currentPasswordHash, String $newPasswordHash)
	{
		return $this->db->changePassword($uid, hash('sha256', $currentPasswordHash), hash('sha256', $newPasswordHash))[0];
	}
	// public function terminateAllSessions(): String
	// {

	// }

	public function info(String $uid)
	{
		return $this->db->getProfileInfo($uid)[0];
	}
}