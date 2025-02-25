-- phpMyAdmin SQL Dump
-- version 5.1.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Creato il: Lug 07, 2023 alle 08:12
-- Versione del server: 10.4.10-MariaDB
-- Versione PHP: 8.1.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cryptowallet`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `addresses`
--

DROP TABLE IF EXISTS `addresses`;
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cointype` varchar(3) NOT NULL,
  `path` varchar(50) NOT NULL,
  `address` varchar(500) NOT NULL,
  `id_utente` int(11) NOT NULL,
  `index` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Address_UNIQUE` (`address`),
  KEY `U_ID_Utente_idx` (`id_utente`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8;

--
-- Dump dei dati per la tabella `addresses`
--

INSERT INTO `addresses` (`id`, `cointype`, `path`, `address`, `id_utente`, `index`) VALUES
(1, 'BNB', 'm/44\'/714\'/0\'/0/0', '0x04A9f16e605d0b2E4a9c77D98c3327599761B054', 2, 0),
(2, 'ETH', 'm/44\'/60\'/0\'/0/0', '0x295C7c1eea803177Ed855d31f8444d08DCf6e50A', 24, 0),
(3, 'ETH', 'm/44\'/60\'/0\'/0/0', '0x2BcCa2b8c5eE1586d3C14359C1428B6847f8588c', 23, 0),
(4, 'ETH', 'm/44\'/60\'/0\'/0/0', '0x37841c4E4Db17c49237E8362aC1E9b9820a74461', 1, 0),
(5, 'BNB', 'm/44\'/714\'/0\'/0/0', '0x3a61f85324282B7763A37e3684d031717d85cb7c', 1, 0),
(6, 'ETH', 'm/44\'/60\'/0\'/0/0', '0x3d08e013Bbf08E4c68Cb537F478a049d732bD3B4', 4, 0),
(7, 'BNB', 'm/44\'/714\'/0\'/0/0', '0x4E71e39192C0f6d3fcdAC36B2013EB39491AE2C2', 24, 0),
(8, 'BNB', 'm/44\'/714\'/0\'/0/0', '0x82e2EeBA6a5e6e08a61AccF31e296046Cfaf0b9d', 23, 0),
(9, 'BNB', 'm/44\'/714\'/0\'/0/0', '0xA786e766522bc223d867882A8d959daa2d8B1f49', 4, 0),
(10, 'ETH', 'm/44\'/60\'/0\'/0/0', '0xA7F29c765b85062CfAE635a3771013E12d747319', 3, 0),
(11, 'BNB', 'm/44\'/714\'/0\'/0/0', '0xAFcbaa4cb629eE7E072A80b3850A45B41B4E045f', 3, 0),
(12, 'BNB', 'm/44\'/714\'/0\'/0/0', '0xDdF795aD702eFeaEBe32Bbe0B17C5b67b41C3FB4', 22, 0),
(13, 'ETH', 'm/44\'/60\'/0\'/0/0', '0xE6553F1fd4104a07da879D1F5822709581843D61', 2, 0),
(14, 'ETH', 'm/44\'/60\'/0\'/0/0', '0xEFf78fE8d18b0448f2b502ee347847594Aefb20B', 22, 0),
(15, 'SOL', 'm/44\'/501\'/0\'/0/0', '4jnunkKLLLXcjiuo6qbALrDr4WTK3LWBFkTkxnzr6nmw', 1, 0),
(16, 'SOL', 'm/44\'/501\'/0\'/0/0', '8wK52pPahBM413dyA2Qu5FJnYMzbrLaSUCtMJdGHdtDY', 2, 0),
(17, 'SOL', 'm/44\'/501\'/0\'/0/0', '94ifBnjM2Nr3WjLSyTkDLAMZJ1UsqsSgrkQq46r8yACK', 22, 0),
(18, 'SOL', 'm/44\'/501\'/0\'/0/0', 'Au81zSit7ZcyYtqtXs9BSPuYLG2Pp9VmnTa7dUaEaRFq', 24, 0),
(19, 'SOL', 'm/44\'/501\'/0\'/0/0', 'BpjJqACPDNQoHogio39Ksn8N6M1raRqZNuqzdTvBBMfj', 23, 0),
(20, 'SOL', 'm/44\'/501\'/0\'/0/0', 'Csj8rjRThjYKUg7y9b6uafJeDeGTiRJipaoxUid41P67', 3, 0),
(21, 'SOL', 'm/44\'/501\'/0\'/0/0', 'EuQNpzUmmyjbuan16rxH34KAWtyyQXbwYcGnbL4gmW5V', 4, 0),
(22, 'BTC', 'm/44\'/0\'/0\'/0/0', 'tb1q37augqwr0uw9683hjtyez6erz5d2vmnu7yv4h9', 1, 0),
(23, 'BTC', 'm/44\'/0\'/0\'/0/3', 'tb1q629mfku3vu4war3wfcstdtljx7ynvxr5sdf4n4', 2, 3),
(24, 'BTC', 'm/44\'/0\'/0\'/0/0', 'tb1q9x57l8ns42tge3te4wwze0puufgr2p00y9en3x', 23, 0),
(25, 'BTC', 'm/44\'/0\'/0\'/0/0', 'tb1qdhaamdpq5rt4kez3n6v9em9hs690ccjm8nhl5y', 4, 0),
(26, 'BTC', 'm/44\'/0\'/0\'/0/0', 'tb1qlqwyf84l6gv3t42jfe08jddd9cwavvknqxr766', 24, 0),
(27, 'BTC', 'm/44\'/0\'/0\'/0/0', 'tb1qnmj0uw5yr6cvvt5k7gd4p2llmssfpd86d79z2j', 2, 0),
(28, 'BTC', 'm/44\'/0\'/0\'/0/0', 'tb1qnqzsafdfy5rpd46adc4fmm7rdk7dd8zkxkyzt5', 22, 0),
(29, 'BTC', 'm/44\'/0\'/0\'/0/1', 'tb1qpehhqfkt9umxwuhhmthfjj0rnrf2wd4c3c82nq', 2, 1),
(30, 'BTC', 'm/44\'/0\'/0\'/0/0', 'tb1qv255qr29kfsj7jtlzc05mux7e63rzrtrqrujfs', 3, 0),
(31, 'BTC', 'm/44\'/0\'/0\'/0/2', 'tb1qycynvwlgtvdj4f3nml3vepqgk3zclpm9kdfl6y', 2, 2),
(32, 'XMR', 'm/44\'/128\'/0\'/0/2', '{primaryAddress:53J97PJeGgm5284Vm6EEJ58jJPfXNDuLuLCybmc6L1nUAdUdT2spqLyEwoidxuUKhm27DzE2w7JcShbq1GNdd4LY2jzxYDb,publicSpendKey:53J97PJeGgm5284Vm6EEJ58jJPfXNDuLuLCybmc6L1nUAdUdT2spqLyEwoidxuUKhm27DzE2w7JcShbq1GNdd4LY2jzxYDb,publicViewKey:53J97PJeGgm5284Vm6EEJ58jJPfXNDuLuLCybmc6L1nUAdUdT2spqLyEwoidxuUKhm27DzE2w7JcShbq1GNdd4LY2jzxYDb}', 2, 2),
(33, 'XMR', 'm/44\'/128\'/0\'/0/1', '{primaryAddress:56NasK9tjwUCsFu23iD7vDDKLXw7ApxrT9JU3fa1scZjH8ZbDBFeVKib7KrQNbFsjfYMzACqucLP42b6tSRPxoguDvmm8UM,publicSpendKey:56NasK9tjwUCsFu23iD7vDDKLXw7ApxrT9JU3fa1scZjH8ZbDBFeVKib7KrQNbFsjfYMzACqucLP42b6tSRPxoguDvmm8UM,publicViewKey:56NasK9tjwUCsFu23iD7vDDKLXw7ApxrT9JU3fa1scZjH8ZbDBFeVKib7KrQNbFsjfYMzACqucLP42b6tSRPxoguDvmm8UM}', 2, 1),
(34, 'XMR', 'm/44\'/128\'/0\'/0/0', '{primaryAddress:9sAvG6bT8mW2jgmavBgttTDNwHuMiAKQecVY9Z1gSGBm617CVPCnj6uP3CzusegUAwUXRa7n3712GX1sbxwsZnt66CZWrou,publicSpendKey:9sAvG6bT8mW2jgmavBgttTDNwHuMiAKQecVY9Z1gSGBm617CVPCnj6uP3CzusegUAwUXRa7n3712GX1sbxwsZnt66CZWrou,publicViewKey:9sAvG6bT8mW2jgmavBgttTDNwHuMiAKQecVY9Z1gSGBm617CVPCnj6uP3CzusegUAwUXRa7n3712GX1sbxwsZnt66CZWrou}', 1, 0),
(35, 'XMR', 'm/44\'/128\'/0\'/0/0', '{primaryAddress:9u7KgPFs8Q51RDQr2qeQ7nS83C738EJM1HNvXG2UVsSzjc484YMr4HK1X7kJP3NoPzG934M6grPt8gQftv5uk2CSM4YyC7X,publicSpendKey:9u7KgPFs8Q51RDQr2qeQ7nS83C738EJM1HNvXG2UVsSzjc484YMr4HK1X7kJP3NoPzG934M6grPt8gQftv5uk2CSM4YyC7X,publicViewKey:9u7KgPFs8Q51RDQr2qeQ7nS83C738EJM1HNvXG2UVsSzjc484YMr4HK1X7kJP3NoPzG934M6grPt8gQftv5uk2CSM4YyC7X}', 4, 0),
(36, 'XMR', 'm/44\'/128\'/0\'/0/7', '{primaryAddress:9uXE8a1SDYahtsmrXeSnTpdPtgH24eqDkHyJ49DzqQmNf6G6awbrTTAWs5eisnvzJA1etV9JVmKarfHmNhFAWhHJTyhY7VL,publicSpendKey:3e235824d1769ff47dddaf5b860f9fd996eb4f66dddabb6575e3f4781dfe59e3,publicViewKey:bab8d8ee35f4ddb28aba9f511450ff03e7cb0668e8fd73e4ea507bad7506a9ef}', 2, 7),
(37, 'XMR', 'm/44\'/128\'/0\'/0/6', '{primaryAddress:9v3U8uBtdDtefjaorXyYuEHyPJMUCeMuLMuGARhBhoiDMGwEdfQvT3gEb2X5DFQeX53iLmEnS8JfmEBgRMuRqcx7ArxwuLU,publicSpendKey:4be5a693980453e13384e0ef29fb71657846db42ae67837cf59289cdbb3b2e79,publicViewKey:36fb04b57c983b513ab4e24c891dfc1037f62be3e917344ed2a1628b2975e857}', 2, 6),
(38, 'XMR', 'm/44\'/128\'/0\'/0/0', '{primaryAddress:9vF2PPNAHA6BdJLhnVWFAEHiWePfWGz3KaAq4BXep5Z6ZFMHce2sK1m6WcSh9Cnz6QCjFp1rFt2hz5CkezXA4SH2K1rkvnJ,publicSpendKey:9vF2PPNAHA6BdJLhnVWFAEHiWePfWGz3KaAq4BXep5Z6ZFMHce2sK1m6WcSh9Cnz6QCjFp1rFt2hz5CkezXA4SH2K1rkvnJ,publicViewKey:9vF2PPNAHA6BdJLhnVWFAEHiWePfWGz3KaAq4BXep5Z6ZFMHce2sK1m6WcSh9Cnz6QCjFp1rFt2hz5CkezXA4SH2K1rkvnJ}', 2, 0),
(39, 'XMR', 'm/44\'/128\'/0\'/0/5', '{primaryAddress:9wEjjKSus13GbfL9F5KkkWUvz1YudS7kkiug3pKVx62HZNHpJakYVouGBLCExbSkQ9WaNgwj64hqSj6Qqf873TBZ8bJ5fS2,publicSpendKey:6b69949cdf557a5d4080b6014c0837a6fcaafd6a620a29fa8d71a062b7a156c1,publicViewKey:8292e4ebb52a785abe79df3a20c172b0d1e10af15fc2a1fba8cbb2e81b389c43}', 2, 5),
(40, 'XMR', 'm/44\'/128\'/0\'/0/4', '{primaryAddress:9xp71esX4ht29QjUxTRk1g5cuEVbKQC6MDpLeYtRnDLRKcX2cRqe5WrAx8PWL48hWBK8TSPUauaKrXQoL6Zms2HzAxnSkYM,publicSpendKey:94fb551948f29f06d86da7f205aeb31b9d73d1f5c71f3a4c9f7aacf2ddd2be6f,publicViewKey:46af923dfcd65b3b7d6fb10a2c4aa46c622dc5a4e6a4f9b5cfbaf9d9bde24d58}', 2, 4),
(41, 'XMR', 'm/44\'/128\'/0\'/0/8', '{primaryAddress:9xPkfy36vtKSdvbcD4ajssifpnujo3CG5GxoqPWcwy6dGS6b3mwJ7khdsRWwEtkNkbdHrnfy8FNkf5ZvUyXWxE2EPsoDU6r,publicSpendKey:89e724a46a38fc9945772065c65e06f91ffc1e4ba519e65f6e86f6ec2163665c,publicViewKey:441c4c6d634ac6dc6d6f71e04ab3dcd8f7bab5ec1a69781b4edb20150fcbc3ca}', 2, 8),
(42, 'XMR', 'm/44\'/128\'/0\'/0/9', '{primaryAddress:9zgAWS9MkCdhxK127WGq4D3VnTc2LyJXRDpP86EUNyiwJS4qmqHuabyedwzzdJak4oAt3P7xPMAspEpnf48a9PzDR9t9DEb,publicSpendKey:c6256782328caef4d882305daf4aa20eec9aa3808325984ca09aed2244bd3868,publicViewKey:385d35f62da4b0e10464497891ca603b119ae36ba9522752a5d61f301d8e7ed6}', 2, 9),
(43, 'XMR', 'm/44\'/128\'/0\'/0/10', '{primaryAddress:9zkRrdcv3PBekkh61koV7RiicgpEjpee5Fy8jxgxS5NT1ymtbWM4Q4UKdL7wpLHjEmi8cKnfcaAKUTaPBQUqibGSMYB5WQQ,publicSpendKey:c8161dde33c086e1b7f70a83a91684f969a474990bc9f2597c9ae6e29340e405,publicViewKey:da2bb8548e1ddd6f5c1c7ffa263196f5e84613a445abcb9ee287c428173e4fb6}', 2, 10),
(44, 'XMR', 'm/44\'/128\'/0\'/0/11', '{primaryAddress:A28LMWdP4LBTw83hu7i7UBEJGBzZAtwNrbGGH14LCyHHcGtQLiAYH1BALd3Ei8yUnpXbmfBLYcYfYQUSLnvJiqAhV5erLEJ,publicSpendKey:ec70e21a9e5e14a105ccf4942b72484f80531be9a77453ccd8975a134b2158d2,publicViewKey:e38d400053969237d47db5ce46343db6f13dedfc4ba8df8c56111b1e51d54af8}', 2, 11),
(45, 'XMR', 'm/44\'/128\'/0\'/0/0', '{primaryAddress:A2b6DAFXTE7fQFChUFdWxjY3NVL1Kk1ceZzgnbGroCURMUjsX9w2dxEXBH2pjEtgvCZUapYKQdzvCHBdhhKPVb8zFHQTjfH,publicSpendKey:A2b6DAFXTE7fQFChUFdWxjY3NVL1Kk1ceZzgnbGroCURMUjsX9w2dxEXBH2pjEtgvCZUapYKQdzvCHBdhhKPVb8zFHQTjfH,publicViewKey:A2b6DAFXTE7fQFChUFdWxjY3NVL1Kk1ceZzgnbGroCURMUjsX9w2dxEXBH2pjEtgvCZUapYKQdzvCHBdhhKPVb8zFHQTjfH}', 3, 0),
(46, 'XMR', 'm/44\'/128\'/0\'/0/3', '{primaryAddress:A2XU9HgNpUuhheTdSjA2N9RGy1TJYLDtFLkWTLgsE6Pp1kAn8QQV9Bgh2oLP7wZpBqiTZnfSytFTPVhXFG6afX9fSDsbBQm,publicSpendKey:A2XU9HgNpUuhheTdSjA2N9RGy1TJYLDtFLkWTLgsE6Pp1kAn8QQV9Bgh2oLP7wZpBqiTZnfSytFTPVhXFG6afX9fSDsbBQm,publicViewKey:A2XU9HgNpUuhheTdSjA2N9RGy1TJYLDtFLkWTLgsE6Pp1kAn8QQV9Bgh2oLP7wZpBqiTZnfSytFTPVhXFG6afX9fSDsbBQm}', 2, 3),
(47, 'BTC', 'm/44\'/0\'/0\'/0/0', 'tb1qdy270qdq8jyt5q2akfl8eyawudaftq28d7gz4g', 27, 0),
(48, 'ETH', 'm/44\'/60\'/0\'/0/0', '0x1C48654942A4E492F55383acaAAc2791E277DE73', 27, 0),
(49, 'BNB', 'm/44\'/714\'/0\'/0/0', '0x8152F588277446fceE1F455ccCF383c47cC2C73d', 27, 0),
(50, 'SOL', 'm/44\'/501\'/0\'/0/0', '4jV7EifxhbAa85xE6eFm4htVcwMc7CH8AMi9qYJAH671', 27, 0),
(51, 'BTC', 'm/44\'/0\'/0\'/0/0', 'tb1quzys4akq2sv0rh2r37t7aq35f4qj4mmv6tqucr', 28, 0),
(52, 'ETH', 'm/44\'/60\'/0\'/0/0', '0x96B83D4fC672485aAAd81DF354FE74dB655B25a7', 28, 0),
(53, 'BNB', 'm/44\'/714\'/0\'/0/0', '0xe719424f9FB89F9ab3323E8b1907129CB10836f4', 28, 0),
(54, 'SOL', 'm/44\'/501\'/0\'/0/0', '8PVnTzb3qutXFmMLwemyAqFHWWS1kVreBDz2Bwq8AJQP', 28, 0),
(55, 'BTC', 'm/44\'/0\'/0\'/0/0', 'tb1qu9swzxvq7u3yqsvqdyxr85kyhtahkvcc0k9qsg', 29, 0),
(56, 'ETH', 'm/44\'/60\'/0\'/0/0', '0x3eaeFE12c363564E46F2dBe0eAeDfFE8b6143e28', 29, 0),
(57, 'BNB', 'm/44\'/714\'/0\'/0/0', '0xeFBe5050dbf1E45A90E5C5Ff2F1F3c75A1D54181', 29, 0),
(58, 'SOL', 'm/44\'/501\'/0\'/0/0', '22ioSgVozvjhskjrPufYHH8ysGw4ug9MM6x75sh2oXed', 29, 0),
(59, 'BTC', 'm/44\'/0\'/0\'/0/0', 'tb1q0g7fqmh0xnya8p2pndj9qxdaccxvdateq3xjrl', 36, 0),
(60, 'ETH', 'm/44\'/60\'/0\'/0/0', '0xd6b6504c1dd3d732291D51D9F810e9FAcCcB1D7D', 36, 0),
(61, 'BNB', 'm/44\'/714\'/0\'/0/0', '0x1C549730B22b0940a6F56E58a7a340495e05EF4e', 36, 0),
(62, 'SOL', 'm/44\'/501\'/0\'/0/0', 'EcGj1pnYhnaV8Q1gtcq3sMwKSFNrPUqQJu4HNHVW4hGb', 36, 0);

-- --------------------------------------------------------

--
-- Struttura della tabella `transactions`
--

DROP TABLE IF EXISTS `transactions`;
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `address_id` int(11) NOT NULL,
  `tx` int(11) NOT NULL,
  `data_insert` datetime NOT NULL,
  `destination_address` varchar(512) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `address_id` (`address_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Struttura della tabella `utenti`
--

DROP TABLE IF EXISTS `utenti`;
CREATE TABLE IF NOT EXISTS `utenti` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(45) NOT NULL,
  `cognome` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `masternode` text NOT NULL,
  `privacy` tinyint(4) NOT NULL DEFAULT 1,
  `termini` tinyint(4) NOT NULL DEFAULT 1,
  `stato` int(4) NOT NULL DEFAULT 1,
  `data_insert` datetime NOT NULL DEFAULT current_timestamp(),
  `data_update` datetime DEFAULT NULL,
  `data_delete` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8;

--
-- Dump dei dati per la tabella `utenti`
--

INSERT INTO `utenti` (`id`, `nome`, `cognome`, `email`, `password`, `masternode`, `privacy`, `termini`, `stato`, `data_insert`, `data_update`, `data_delete`) VALUES
(1, 'alex', 'cav', 'alex@live.it', 'root', 'U2FsdGVkX19gHfphe0AgXaIfKqW+IJQyzKUpYwde+RNJJWQuL8nO/IstB0bKhoss5s1b2SqWqeV+qHSGrQTTzfPke+Az6/7jKrdKIrbBDv4CvEilG5WnKDz2CW9+gWliokqxrmAzd5ufBAOL3C8+l/ila8YmePgdOCW++F1dmI0=', 0, 0, 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(2, 'gio', 'cav', 'gio@live.it', 'gio', 'U2FsdGVkX18fA21x9UHm64rlG+pNGgzxH3UKr/KoTe0z0pMlIvrvjOJytlS0rAKWOWWDGFbE0TbP+yhgV+mjW5xxGEJqCDqgSEec0ffbIxvXZTvL4lW3q0Gbh3LI1C+FnXSLZvOq025nNNRXAeAX/TZXkC83VTfNXM/DtmYlZWw=', 0, 0, 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(3, 'carm', 'cav', 'carm@live.it', 'carm', 'U2FsdGVkX1+rtshCOLKRSelBlZ/tFny7gEoMk9LHNFmYNrwYqzo5zLTf5jO0w9Xy5wvKN8cAy3TuPchkRbv42ztVDxJHOKWZJsanzCakcMycE1Bm2sZ4dYoT/KXEfRNj5V7rH/93Ual7WVcHEjCukjU8KO8FafxVJSlFbrFJ4u4=', 0, 0, 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(4, 'marco', 'cav', 'marco@live.it', 'marco', 'U2FsdGVkX18Xyl8kray2L8FixdIioln5Dp4bOEifCMrg2WBoR8dfgZt9iLSs+WXDHQ1/GY3hJ6Av90qzY6udNTsV/YYNBbuKie2pfbAT4UM6R1SY7XvbAK5FiZVSFw62XUQK8RP5MwfVpCaW9yGhDbi0VzINL2v/eZPOep4vxu8=', 0, 0, 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(36, 'Marco', 'Casaburi', 'marcs84@gmail.com', '1e4e888ac66f8dd41e00c5a7ac36a32a9950d271', 'U2FsdGVkX19A2mDvuRLeX2Xjy/aiHOQpO2sJggx+Ks4+3dGwqdPLnmIlJHFNj6TrFUcpKawt+Wtx7g2kThxHK6/K/XAcFAoU5bNBwl+CNCDopGHFgkLsTyGrUJfC1UXbO1HNTioaTAbCp2e50lxNg8IP9tsxrVUMHWhAAqbo0ws=', 1, 1, 1, '2023-07-04 22:17:33', NULL, NULL);

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`ID_Utente`) REFERENCES `utenti` (`id`);

--
-- Limiti per la tabella `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
