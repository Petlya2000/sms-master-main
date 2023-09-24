/*
 Navicat Premium Data Transfer

 Source Server         : a
 Source Server Type    : MariaDB
 Source Server Version : 100521 (10.5.21-MariaDB-1:10.5.21+maria~ubu2004)
 Source Host           : localhost:3306
 Source Schema         : servicesms

 Target Server Type    : MariaDB
 Target Server Version : 100521 (10.5.21-MariaDB-1:10.5.21+maria~ubu2004)
 File Encoding         : 65001

 Date: 10/07/2023 07:29:59
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for advices
-- ----------------------------
DROP TABLE IF EXISTS `advices`;
CREATE TABLE `advices`  (
  `phoneNumber` bigint(11) NULL DEFAULT NULL,
  `lastAdviceTime` int(11) NULL DEFAULT 0,
  `seenAdvices` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT '[]' CHECK (json_valid(`seenAdvices`))
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for advicesDictionary
-- ----------------------------
DROP TABLE IF EXISTS `advicesDictionary`;
CREATE TABLE `advicesDictionary`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `adviceText` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `priority` int(11) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for advicesHistory
-- ----------------------------
DROP TABLE IF EXISTS `advicesHistory`;
CREATE TABLE `advicesHistory`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `phoneNumber` bigint(11) NULL DEFAULT NULL,
  `adviceId` int(11) NULL DEFAULT NULL,
  `statusSended` int(11) NULL DEFAULT NULL,
  `dateSended` int(11) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for configuration
-- ----------------------------
DROP TABLE IF EXISTS `configuration`;
CREATE TABLE `configuration`  (
  `advicesWorking` tinyint(1) NULL DEFAULT 0,
  `advicesIntervalPerNumber` int(11) NULL DEFAULT 28800,
  `rootPasswordChanged` tinyint(1) NULL DEFAULT 0,
  `workingTimeInterval` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '08:00-22:00'
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for distributions
-- ----------------------------
DROP TABLE IF EXISTS `distributions`;
CREATE TABLE `distributions`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `distributionName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `selectedCount` int(11) NULL DEFAULT 0,
  `sendedCount` int(11) NULL DEFAULT 0,
  `deliveredCount` int(11) NULL DEFAULT 0,
  `distributionStatus` int(11) NULL DEFAULT NULL COMMENT '-1 - internal error, 0 - paused, 1 - finished',
  `createdTime` int(11) NULL DEFAULT NULL,
  `finishedTime` int(11) NULL DEFAULT NULL,
  `distributionText` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `responsibleProcessId` int(11) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for districts
-- ----------------------------
DROP TABLE IF EXISTS `districts`;
CREATE TABLE `districts`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for phones
-- ----------------------------
DROP TABLE IF EXISTS `phones`;
CREATE TABLE `phones`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `phoneNumber` bigint(11) NULL DEFAULT NULL,
  `failedDeliveryAttempts` int(11) NULL DEFAULT 0,
  `districtId` int(11) NULL DEFAULT NULL,
  `is_blacklisted` tinyint(1) NULL DEFAULT 0,
  `allowAdvices` tinyint(1) NULL DEFAULT 0,
  `allowAds` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for registration
-- ----------------------------
DROP TABLE IF EXISTS `registration`;
CREATE TABLE `registration`  (
  `uid` int(11) NULL DEFAULT NULL,
  `codeHash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `expiresAt` int(11) NULL DEFAULT NULL
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `login` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `passhash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `screenName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `role` int(11) NULL DEFAULT 0,
  `suspended` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Procedure structure for addAdvice
-- ----------------------------
DROP PROCEDURE IF EXISTS `addAdvice`;
delimiter ;;
CREATE PROCEDURE `addAdvice`(`i_text` longtext, `i_priority` int(11))
BEGIN

INSERT INTO advicesDictionary SET adviceText = `i_text`, priority = `i_priority`;
SELECT LAST_INSERT_ID() as response;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for addToAdviceHistory
-- ----------------------------
DROP PROCEDURE IF EXISTS `addToAdviceHistory`;
delimiter ;;
CREATE PROCEDURE `addToAdviceHistory`(`i_phone` bigint(11), `i_adviceId` int(11), `i_status` int(11))
BEGIN
	INSERT INTO advicesHistory SET phoneNumber = `i_phone`, adviceId = `i_adviceId`, statusSended = `i_status`, dateSended = UNIX_TIMESTAMP();
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for changePassword
-- ----------------------------
DROP PROCEDURE IF EXISTS `changePassword`;
delimiter ;;
CREATE PROCEDURE `changePassword`(`i_uid` int(11), `i_oldPassword` varchar(255), `i_newPassword` varchar(255))
BEGIN
	DECLARE dbOldPassword VARCHAR(255);
	SET dbOldPassword = (SELECT passhash FROM users WHERE id = `i_uid`);
	
	IF `i_oldPassword` != dbOldPassword THEN
		SELECT "Current password is not associated with user" as error, "PASSWORDS_NOT_MATCH" as errorCode;
	ELSE
		IF `i_oldPassword` = `i_newPassword` THEN
			SELECT "New password must be different from current" as error, "PASSWORD_EQUALS" as errorCode;
		ELSE
			UPDATE users SET passhash = `i_newPassword` WHERE id = `i_uid`;
			IF `i_uid` = 1 THEN
				UPDATE configuration SET rootPasswordChanged = 1 WHERE 1;
			END IF;
			SELECT 1 as response;
		END IF;
	END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for checkInviteCode
-- ----------------------------
DROP PROCEDURE IF EXISTS `checkInviteCode`;
delimiter ;;
CREATE PROCEDURE `checkInviteCode`(i_code varchar(255), OUT result TINYINT(1))
BEGIN
	SELECT uid FROM registration WHERE codeHash = `i_code` AND expiresAt >= UNIX_TIMESTAMP() INTO result;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for checkUserPasswordHash
-- ----------------------------
DROP PROCEDURE IF EXISTS `checkUserPasswordHash`;
delimiter ;;
CREATE PROCEDURE `checkUserPasswordHash`(`i_login` varchar(255),`i_passhash` varchar(255))
BEGIN
	DECLARE uid INT(11);
	SET uid = (SELECT id FROM users WHERE login = i_login AND passhash = i_passhash);
	IF uid THEN
		SELECT uid as response;
	ELSE
		SELECT "invalid credentials" as error, "INVALID_CREDENTIALS" as errorCode;
	END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for getAdvicePhoneList
-- ----------------------------
DROP PROCEDURE IF EXISTS `getAdvicePhoneList`;
delimiter ;;
CREATE PROCEDURE `getAdvicePhoneList`(`i_count` int(11))
BEGIN
	SELECT 
		p.phoneNumber, a.lastAdviceTime, a.seenAdvices 
		FROM phones p 
		INNER JOIN advices a 
			ON p.phoneNumber = a.phoneNumber 
		WHERE allowAdvices = 1 
			AND lastAdviceTime + (SELECT advicesIntervalPerNumber FROM configuration) < UNIX_TIMESTAMP()
			ORDER BY RAND()
			LIMIT i_count;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for getAdvicesText
-- ----------------------------
DROP PROCEDURE IF EXISTS `getAdvicesText`;
delimiter ;;
CREATE PROCEDURE `getAdvicesText`(i_offset int(11), i_limit int(11))
BEGIN
	SELECT id, adviceText as `text` FROM advicesDictionary LIMIT i_limit OFFSET i_offset;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for getAdvicesWorkingState
-- ----------------------------
DROP PROCEDURE IF EXISTS `getAdvicesWorkingState`;
delimiter ;;
CREATE PROCEDURE `getAdvicesWorkingState`()
BEGIN
	SELECT advicesWorking, workingTimeInterval FROM configuration;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for getCounters
-- ----------------------------
DROP PROCEDURE IF EXISTS `getCounters`;
delimiter ;;
CREATE PROCEDURE `getCounters`()
BEGIN
	SELECT (SELECT COUNT(*) FROM phones WHERE allowAdvices = 1) as activeNumbers, (SELECT COUNT(*) FROM advicesDictionary) as advicesCount;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for getCurrentSettings
-- ----------------------------
DROP PROCEDURE IF EXISTS `getCurrentSettings`;
delimiter ;;
CREATE PROCEDURE `getCurrentSettings`()
BEGIN
	SELECT workingTimeInterval, advicesIntervalPerNumber FROM configuration;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for getDistricts
-- ----------------------------
DROP PROCEDURE IF EXISTS `getDistricts`;
delimiter ;;
CREATE PROCEDURE `getDistricts`()
BEGIN
	SELECT * FROM districts;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for getProfileInfo
-- ----------------------------
DROP PROCEDURE IF EXISTS `getProfileInfo`;
delimiter ;;
CREATE PROCEDURE `getProfileInfo`(`i_uid` int(11))
BEGIN
	IF `i_uid` = 1 AND (SELECT rootPasswordChanged FROM configuration WHERE 1) != 1 THEN
		SELECT id, login, screenName, role, 1 as defaultPasswordAlert FROM users WHERE id = i_uid;
	ELSE
		SELECT id, login, screenName, role FROM users WHERE id = i_uid;
	END IF;
	
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for initialSetup
-- ----------------------------
DROP PROCEDURE IF EXISTS `initialSetup`;
delimiter ;;
CREATE PROCEDURE `initialSetup`()
BEGIN
	IF (SELECT COUNT(*) FROM configuration) > 0 THEN
		SELECT "not allowed" as error, "NOT_ALLOWED" as errorCode;
	ElSE
		INSERT INTO configuration VALUES ();
		INSERT INTO users SET login = 'root', passhash = '8737fe2e24535f5a4ffafdf7e7e4da78b4805aed77e8bb6ab36ea079bbfb8c1c', screenName = 'root', role = 1;
	END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for insertPhones
-- ----------------------------
DROP PROCEDURE IF EXISTS `insertPhones`;
delimiter ;;
CREATE PROCEDURE `insertPhones`(`json` JSON)
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE phone_data JSON;
		DECLARE ignored_phones JSON;
    DECLARE v_phone_number BIGINT;
    DECLARE v_city INT;
		
    SET i = 0;
		SET ignored_phones = JSON_ARRAY(); 
		
		WHILE i < JSON_LENGTH(`json`) DO
			SET phone_data = JSON_EXTRACT(`json`, CONCAT('$[',i,']'));
			SET v_phone_number = JSON_EXTRACT(`phone_data`, '$[0]');
			
			
			IF EXISTS(SELECT id FROM phones WHERE phoneNumber = v_phone_number) THEN
				SET ignored_phones = JSON_ARRAY_APPEND(ignored_phones, '$', v_phone_number);
			ELSE
				SET v_city = JSON_EXTRACT(`phone_data`, '$[2]');
				INSERT INTO phones 
				SET phoneNumber = v_phone_number, 
						city = v_city,
						allowAds = 1;
			END IF;

			SET i = i + 1;
			
		END WHILE;
		
		SELECT ignored_phones as ignored, JSON_LENGTH(`json`) - JSON_LENGTH(`ignored_phones`) as inserted, JSON_LENGTH(`json`) as count;

END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for inviteUser
-- ----------------------------
DROP PROCEDURE IF EXISTS `inviteUser`;
delimiter ;;
CREATE PROCEDURE `inviteUser`(`i_inviterId` int(11), `i_role` int(11), `i_inviteCode` varchar(255))
BEGIN
	IF (SELECT role FROM users WHERE id = `i_inviterId`) > 0 THEN
		INSERT INTO users SET role = `i_role`;
		INSERT INTO registration SET uid = LAST_INSERT_ID(), codeHash = `i_inviteCode`, expiresAt = (UNIX_TIMESTAMP() + 86400);
		SELECT i_inviteCode as inviteCode;
	ELSE
		SELECT "you do not have permission to perform this action" as error, "PERMISSION_DENIED" as errorCode;
	END IF;

END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for isInviteCodeValid
-- ----------------------------
DROP PROCEDURE IF EXISTS `isInviteCodeValid`;
delimiter ;;
CREATE PROCEDURE `isInviteCodeValid`(`i_inviteCode` varchar(255))
BEGIN
	DECLARE valid TINYINT(1);
	SET valid = 0;
	CALL checkInviteCode(i_inviteCode, valid);
	IF valid > 0 THEN 
		SET valid = 1;
	ELSE
		SET valid = 0;
	END IF;
	
	SELECT valid as response;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for markPhoneAsBlacklisted
-- ----------------------------
DROP PROCEDURE IF EXISTS `markPhoneAsBlacklisted`;
delimiter ;;
CREATE PROCEDURE `markPhoneAsBlacklisted`(`i_phone` bigint(11))
BEGIN
	UPDATE phones SET is_blacklisted = 1 WHERE phoneNumber = i_phone;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for registerUser
-- ----------------------------
DROP PROCEDURE IF EXISTS `registerUser`;
delimiter ;;
CREATE PROCEDURE `registerUser`(`i_inviteCode` varchar(255),`i_login` varchar(255),`i_screenName` varchar(255), `i_passhash` varchar(255))
BEGIN
	DECLARE invitationCodeUid INT;
	CALL checkInviteCode(i_inviteCode, invitationCodeUid);
	IF invitationCodeUid IS NULL THEN
		SELECT "invalid invite code" as error, "INVALID_INVITE_CODE" as errorCode;
	ELSE
		IF EXISTS(SELECT id FROM users WHERE login = i_login) IS TRUE THEN
			SELECT "this login aleady has taken" as error, "LOGIN_TAKEN" as errorCode;
		ELSE
			UPDATE users SET login = i_login, passhash = i_passhash, screenName = i_screenName WHERE id = invitationCodeUid;
			DELETE FROM registration WHERE uid = invitationCodeUid;
			SELECT invitationCodeUid as response;
		END IF;
	END IF;
	
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for removeAdvice
-- ----------------------------
DROP PROCEDURE IF EXISTS `removeAdvice`;
delimiter ;;
CREATE PROCEDURE `removeAdvice`(`i_id` int(11))
BEGIN
IF EXISTS(SELECT id FROM advicesDictionary WHERE id = i_id) THEN
	DELETE FROM advicesDictionary WHERE id = i_id;
	SELECT 1 as response;
ELSE
	SELECT "Advice not exists" as error, "ADVICE_NOT_FOUND" as errorCode;
END IF;

END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for setAdviceDaemonState
-- ----------------------------
DROP PROCEDURE IF EXISTS `setAdviceDaemonState`;
delimiter ;;
CREATE PROCEDURE `setAdviceDaemonState`(`i_status` tinyint)
BEGIN
	UPDATE configuration SET advicesWorking = i_status;
	SELECT 1 as response;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for setNewTimeForPhoneNumber
-- ----------------------------
DROP PROCEDURE IF EXISTS `setNewTimeForPhoneNumber`;
delimiter ;;
CREATE PROCEDURE `setNewTimeForPhoneNumber`(`i_phone` bigint(11))
BEGIN
	UPDATE advices SET lastAdviceTime = UNIX_TIMESTAMP() WHERE phoneNumber = `i_phone`;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for suspendAccountState
-- ----------------------------
DROP PROCEDURE IF EXISTS `suspendAccountState`;
delimiter ;;
CREATE PROCEDURE `suspendAccountState`(`i_uid` int(11),`i_targetUid` int(11),`state` int(11))
BEGIN
	IF `i_targetUid` = 1 THEN
		SELECT "Couldn't change root suspend state" as error, "IMMUNITY_ERROR" as errorCode;
	ELSE
		IF `i_uid` = `i_targetUid` THEN
			SELECT "Current user and target user is equals" as error, "LOOPBACK_ERROR" as errorCode;
		ELSE
			IF EXISTS(SELECT id FROM users WHERE `i_targetUid`) THEN
				UPDATE users SET suspended = `state` WHERE id = `i_targetUid`;
				SELECT 1 as response;
			ELSE
				SELECT "Target user not found" as error, "NOT_FOUND" as errorCode;
			END IF;
		END IF;
	END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for unmarkPhoneAsBlacklisted
-- ----------------------------
DROP PROCEDURE IF EXISTS `unmarkPhoneAsBlacklisted`;
delimiter ;;
CREATE PROCEDURE `unmarkPhoneAsBlacklisted`(`i_phone` bigint(11))
BEGIN
	UPDATE phones SET is_blacklisted = 0 WHERE phoneNumber = i_phone;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for updateAdvicesIntervalPerNumber
-- ----------------------------
DROP PROCEDURE IF EXISTS `updateAdvicesIntervalPerNumber`;
delimiter ;;
CREATE PROCEDURE `updateAdvicesIntervalPerNumber`(`i_interval` int(11))
BEGIN
	UPDATE configuration SET advicesIntervalPerNumber = `i_interval` WHERE 1;
	SELECT 1 as response;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for updateAdviceStateForNumber
-- ----------------------------
DROP PROCEDURE IF EXISTS `updateAdviceStateForNumber`;
delimiter ;;
CREATE PROCEDURE `updateAdviceStateForNumber`(`phone` bigint(11), `newValue` int(11))
BEGIN
	IF EXISTS(SELECT id FROM phones WHERE phoneNumber = phone) IS TRUE THEN
		UPDATE phones SET allowAdvices = newValue WHERE phoneNumber = phone;
		SELECT 1 as response;
	ELSE
		INSERT INTO phones SET phoneNumber = phone, allowAdvices = newValue;
		INSERT INTO advices SET phoneNumber = phone;
		SELECT 1 as response;

	END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for updatePhoneNumberSeenAdvices
-- ----------------------------
DROP PROCEDURE IF EXISTS `updatePhoneNumberSeenAdvices`;
delimiter ;;
CREATE PROCEDURE `updatePhoneNumberSeenAdvices`(`i_phone` bigint(11),`i_adviceId` int(11))
BEGIN
  DECLARE array_length INT;
  SELECT JSON_LENGTH(seenAdvices) INTO array_length FROM advices WHERE phoneNumber = `i_phone`;
  UPDATE advices SET seenAdvices = JSON_ARRAY_INSERT(seenAdvices, CONCAT('$[', array_length, ']'), `i_adviceId`), lastAdviceTime = UNIX_TIMESTAMP() WHERE phoneNumber = `i_phone`;

END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for updateWorkingTimeInterval
-- ----------------------------
DROP PROCEDURE IF EXISTS `updateWorkingTimeInterval`;
delimiter ;;
CREATE PROCEDURE `updateWorkingTimeInterval`(`i_interval` varchar(255))
BEGIN
	UPDATE configuration SET workingTimeInterval = `i_interval` WHERE 1;
	SELECT 1 as response;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;

CALL initialSetup();