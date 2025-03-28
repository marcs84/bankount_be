-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 28, 2025 at 10:24 AM
-- Server version: 8.0.40
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `app_new`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` int NOT NULL,
  `cointype` varchar(3) NOT NULL,
  `address` text NOT NULL,
  `address_name` varchar(100) NOT NULL,
  `id_utente` int NOT NULL,
  `index` int NOT NULL,
  `start_block` int DEFAULT NULL,
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tatumStatus` enum('NOT-SYNCED','SYNCED') NOT NULL,
  `addressStatus` varchar(20) NOT NULL DEFAULT 'Active',
  `wallet_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `cointype`, `address`, `address_name`, `id_utente`, `index`, `start_block`, `created_time`, `tatumStatus`, `addressStatus`, `wallet_id`) VALUES
(10, 'BNB', '0xd026393fcaab135c6197f9f87aab20959486ecd2', 'Address 2', 156, 4, 2550368, '2025-01-08 13:48:52', 'SYNCED', 'Inactive', 1),
(11, 'BTC', 'n4n6ce7HwmABYpFbDys5rkfsX7nHaSTCn2', '', 156, 5, 2550369, '2025-01-08 13:50:31', 'SYNCED', 'Inactive', 1),
(12, 'SOL', '9EFYr34WHyminDqwWGhbPwqMiHpMfVFJWnMc7HuYMkKc', '', 156, 6, 2550370, '2025-01-09 07:23:23', 'SYNCED', 'Inactive', 1),
(14, 'ETH', '0x0eA02D0a39B46371D63eE8d458882771AAC148f8', '', 156, 6, 2550371, '2025-01-09 07:36:28', 'SYNCED', 'Inactive', 1),
(18, 'BNB', 'D45602HqyYmkjD77HH3DdBp9TWtYVoVox6ZmFtyto', '', 16, 4, 2550368, '2025-01-10 10:51:17', 'NOT-SYNCED', 'Active', 7),
(19, 'ETH', '0xe998a7d2e296a39fcfbdc9b527cec5fad7650f6c', '', 154, 0, 7460592, '2025-01-10 11:17:04', 'SYNCED', 'Active', 14),
(20, 'BNB', '0xd232f0a85cb6e98169ea8412e66e28e5273d1f02', '', 154, 0, 47262078, '2025-01-10 11:17:06', 'SYNCED', 'Active', 14),
(21, 'SOL', '5bkT3RwfGuZjqxBCZBPAr5zPaEcoksPDTJwaSpgNRmE6', '', 154, 0, 270668907, '2025-01-10 11:17:07', 'SYNCED', 'Active', 14),
(22, 'BTC', 'mi7VM2EmmiFF6VwhLkUsnRh7XAT66w3vfq', '', 154, 0, 3612932, '2025-01-10 11:17:09', 'SYNCED', 'Active', 14),
(23, 'ETH', '0xf5817e06534f37b849b05be0e02dc4e9a514835d', '', 156, 0, 7480713, '2025-01-13 06:31:17', 'SYNCED', 'Inactive', 15),
(54, 'ETH', '0x6b18a280d1b5354e068ae1c19193125349e8e993', 'Address 1', 162, 0, 7602603, '2025-01-30 10:50:44', 'SYNCED', 'Active', 19),
(55, 'BNB', '0x5b370512b40c269abb4e47b51296a7dbe504b647', 'Address 1', 162, 0, 47837550, '2025-01-30 10:50:44', 'SYNCED', 'Active', 19),
(56, 'SOL', 'sx9ou2qquFUpXA2v8wVT1VV315H6v8wV7Xa5jqh9esG', 'Address 1', 162, 0, 273661697, '2025-01-30 10:50:44', 'SYNCED', 'Active', 19),
(57, 'BTC', 'mqMBkQVzxyYyiR2Pgk87KtzRRMC7Ao7NcS', 'Address 1', 162, 0, 3660165, '2025-01-30 10:50:44', 'SYNCED', 'Active', 19),
(124, 'ETH', '0x8251a0A0813BD153AD3d115581FDE0A55A58a9A2', 'address name', 156, 6, 2550371, '2025-02-11 07:54:33', 'NOT-SYNCED', 'Active', 1),
(158, 'ETH', '0xe97859b84b2dd08d94a05675589c6179e8a04da6', 'Address 1', 187, 0, 7692835, '2025-02-12 13:58:38', 'SYNCED', 'Active', 63),
(159, 'BNB', '0xe97859b84b2dd08d94a05675589c6179e8a04da6', 'Address 2', 187, 0, 48215655, '2025-02-12 13:58:38', 'SYNCED', 'Active', 63),
(160, 'SOL', 'CBuNHodFxR2yryyN1EKJ8NpAEcoAiiEV9oUnaysXzQc2', 'Address 2', 187, 0, 275761095, '2025-02-12 13:58:38', 'SYNCED', 'Active', 63),
(161, 'BTC', 'mt86rNfisPu9qFdhqpRo7w8dQa3ups7TRB', 'Address 3', 187, 0, 3775713, '2025-02-12 13:58:38', 'SYNCED', 'Active', 63),
(186, 'ETH', '0xf430fc5b609cc6461a15191d9d94166b1105a2ba', 'Address 1', 191, 1, 7746093, '2025-02-20 06:45:49', 'SYNCED', 'Active', 70),
(187, 'BNB', '0x6b08ca1b43ff3c817679b31169fae85ec4857eac', 'Address 2', 191, 2, 48437182, '2025-02-20 06:45:49', 'SYNCED', 'Active', 70),
(188, 'SOL', 'CgoNT8Cq2od7PDstDE7sqTrvnv41UrPsEpMz7N83tWtg', 'Address 3', 191, 3, 276757808, '2025-02-20 06:45:49', 'SYNCED', 'Active', 70),
(189, 'BTC', 'mmFPovZLg82M7aGofEkm1ujtN3fFTAgtQh', 'Address 4', 191, 4, 3803659, '2025-02-20 06:45:49', 'SYNCED', 'Active', 70),
(190, 'ETH', '0x8da2379101ead7cfbe3b7161e09bdf72c2530cbe', 'Address 1', 191, 1, 7727337, '2025-02-21 12:38:39', 'NOT-SYNCED', 'Inactive', 68),
(191, 'BNB', '0xd0f7a59efcac743d775b419a509cb0dc81a4cc8a', 'Address 2', 191, 2, 48359697, '2025-02-21 12:38:40', 'NOT-SYNCED', 'Inactive', 68),
(192, 'SOL', 'CRfVnz8vmtRPdbBujPsmJWsdWYjNcXD7tCxh7gyvokEv', 'Address 3', 191, 3, 276394208, '2025-02-21 12:38:40', 'NOT-SYNCED', 'Inactive', 68),
(193, 'BTC', 'mkpuvXBC1L2vujAoLaxijXZJNHroHrCdER', 'Address 4', 191, 4, 3802520, '2025-02-21 12:38:41', 'NOT-SYNCED', 'Inactive', 68),
(194, 'ETH', '0x41bc7be963af77ff8d5928662bd46d95263aed4a', 'Address 1', 193, 1, 7782817, '2025-02-25 12:57:10', 'SYNCED', 'Inactive', 71),
(195, 'BNB', '0xa309bdc7ae979ee43eb242446d8fdfe03238f7b3', 'Address 2', 193, 2, 48588564, '2025-02-25 12:57:10', 'SYNCED', 'Inactive', 71),
(197, 'BTC', 'mr8mYyHjQzDzaX8SXhGWJPnkgnYovUsY6B', 'Address 4', 193, 4, 3900961, '2025-02-25 12:57:10', 'SYNCED', 'Inactive', 71),
(198, 'ETH', '0xe04dca74c33fc30f5fbc4ce5cf3929349e31f3a3', 'Address 1', 197, 1, 7783135, '2025-02-25 14:08:34', 'SYNCED', 'Active', 72),
(199, 'BNB', '0x4bd8bb3681fc4d1ea75869a1402ad3fbcb2dd57f', 'Address 2', 197, 2, 48589995, '2025-02-25 14:08:34', 'SYNCED', 'Active', 72),
(200, 'SOL', '5cLK59rfBce9pdmdgCnQ6XKqTLNZqXvT8nhccp2yw8DD', 'Address 3', 197, 3, 277458448, '2025-02-25 14:08:34', 'SYNCED', 'Active', 72),
(201, 'BTC', 'mn9ubNCbNW8cdqr3u4XyBp8mniu68MfyW3', 'Address 4', 197, 4, 3901035, '2025-02-25 14:08:34', 'SYNCED', 'Active', 72),
(202, 'ETH', '0x9c55d7fd728352e369fe54852d76d32c272bcab8', 'Address 1', 198, 1, 7787833, '2025-02-26 06:17:08', 'SYNCED', 'Active', 73),
(203, 'BNB', '0xe5708508cb223db3c3902a2aa180c3406354e05c', 'Address 2', 198, 2, 48609367, '2025-02-26 06:17:08', 'SYNCED', 'Active', 73),
(204, 'SOL', '9H65UdyX1GMcTBYGAqJbm7xU1oMiGXDErH2TsVRexXJX', 'Address 3', 198, 3, 277544084, '2025-02-26 06:17:08', 'SYNCED', 'Active', 73),
(205, 'BTC', 'mwVVfPU12E5HjwcZquAmFqnvn7dM5MgQSu', 'Address 4', 198, 4, 3902065, '2025-02-26 06:17:08', 'SYNCED', 'Active', 73),
(206, 'SOL', 'HDzsGN3yDFTH2nPjnJtLcyRTtUkVmenpSJ4E48zp9sFm', 'Address 3', 193, 3, 277452447, '2025-02-26 06:22:47', 'NOT-SYNCED', 'Inactive', 71),
(237, 'ETH', '0x3b1a341c2bd467edbea65d25f59760dd2f14d720', 'Address 1', 193, 1, NULL, '2025-02-28 07:36:11', 'NOT-SYNCED', 'Active', 77),
(238, 'BNB', '0xc515e89d9e5584fd056217cbf5f206022682cdc0', 'Address 2', 193, 2, NULL, '2025-02-28 07:36:11', 'NOT-SYNCED', 'Active', 77),
(239, 'SOL', '8ZkaTy2TsqNYuhunmjYUg7MCdSv7e3B6ZeovwQQ5Lk8B', 'Address 3', 193, 3, NULL, '2025-02-28 07:36:12', 'NOT-SYNCED', 'Active', 77),
(240, 'BTC', 'n1FiqwarjGPW9mpGHS3uSXcUHdRj6HYkYd', 'Address 4', 193, 4, NULL, '2025-02-28 07:36:14', 'NOT-SYNCED', 'Active', 77),
(241, 'ETH', '0x8227968c26a38344b6093b3883e05ea577187f6d', 'Neeraj ', 193, 5, NULL, '2025-02-28 07:36:15', 'NOT-SYNCED', 'Active', 77),
(242, 'ETH', '0xe6767a4eff7a07c582f0a14e72dd11d5ce39d7cb', 'Neeraj ', 193, 6, NULL, '2025-02-28 07:36:16', 'NOT-SYNCED', 'Active', 77),
(243, 'ETH', '0x89b76929b6df508343d7cf4edc87bd14861c1fcc', 'Neeraj ', 193, 7, NULL, '2025-02-28 07:36:17', 'NOT-SYNCED', 'Active', 77),
(244, 'ETH', '0xf51a5f7abb49e76b386250d0fb149f93b0fe7bbe', 'Neeraj ', 193, 8, NULL, '2025-02-28 07:36:17', 'NOT-SYNCED', 'Active', 77),
(267, 'ETH', '0x875c8f9acdecbd3f409c67285d298627f22f0bbf', 'Address 1', 213, 1, NULL, '2025-02-28 11:12:46', 'SYNCED', 'Active', 213),
(268, 'BNB', '0x55154e6c3b39bf1572264619282083097bd521d3', 'Address 2', 213, 2, NULL, '2025-02-28 11:12:46', 'SYNCED', 'Active', 213),
(269, 'SOL', 'Cz7Czy3gZscLcj8Em4WrrP5sHJu3vWHh1RcnNERQ7CDx', 'Address 3', 213, 3, NULL, '2025-02-28 11:12:46', 'SYNCED', 'Active', 213),
(270, 'BTC', 'myVrYEirxfHeEuYMTvnFkQn9kxwAAeCLr2', 'Address 4', 213, 4, NULL, '2025-02-28 11:12:47', 'SYNCED', 'Active', 213),
(271, 'ETH', '0x58e892b487e9d6d3cccb3f5a56390ae595e22655', 'Address 1', 212, 0, NULL, '2025-02-28 11:22:14', 'SYNCED', 'Active', 212),
(272, 'BNB', '0x58e892b487e9d6d3cccb3f5a56390ae595e22655', 'Address 2', 212, 0, NULL, '2025-02-28 11:22:14', 'SYNCED', 'Active', 212),
(273, 'SOL', 'BhTpYFQ7VqTUR71ZhQxXzZRckiPLp6Yr9nvHSdTn1oy', 'Address 2', 212, 0, NULL, '2025-02-28 11:22:14', 'SYNCED', 'Active', 212),
(274, 'BTC', 'mpZUSrKhWBVmh3VPRvyNwLXrv4x9UpWmj1', 'Address 3', 212, 0, NULL, '2025-02-28 11:22:14', 'SYNCED', 'Active', 212),
(275, 'ETH', '0x7e577c17134a2de82d36a00d31b04c7e1f330d13', 'Address 1', 214, 1, NULL, '2025-02-28 13:44:44', 'SYNCED', 'Active', 86),
(276, 'BNB', '0xdd7ca4ebcd11cbf243f39bc53ce524f978c1ecc1', 'Address 2', 214, 2, NULL, '2025-02-28 13:44:44', 'SYNCED', 'Active', 86),
(277, 'SOL', 'E7XZ5dwpvvxCok6akE7tZUeVkUKTGLcFeqp9hFQEHbu5', 'Address 3', 214, 3, NULL, '2025-02-28 13:44:44', 'SYNCED', 'Active', 86),
(278, 'BTC', 'mfhx3pmQj4NkQGm5C8L1HXdR2Eohg7Fyyu', 'Address 4', 214, 4, NULL, '2025-02-28 13:44:44', 'SYNCED', 'Active', 86),
(279, 'ETH', '0x91971239bc6806f608c2a6c956aff1f22ceb6166', 'Address 1', 217, 1, NULL, '2025-03-01 10:58:09', 'NOT-SYNCED', 'Active', 78),
(280, 'BNB', '0xceb84c4ca6b89400a3ec9aa37c222b24c62affb3', 'Address 2', 217, 2, NULL, '2025-03-01 10:58:10', 'NOT-SYNCED', 'Active', 78),
(281, 'SOL', 'J7EDThPj3suBqTYbdFKKsYncbZERWwsunYgVjztpgray', 'Address 3', 217, 3, NULL, '2025-03-01 10:58:10', 'NOT-SYNCED', 'Active', 78),
(282, 'BTC', 'moZsamg66AoG1ENm6RxW2t2ewUb3rvgH6u', 'Address 4', 217, 4, NULL, '2025-03-01 10:58:10', 'NOT-SYNCED', 'Active', 78),
(283, 'BNB', '0x1c2bba139c82f14f2e1a1925a86ff252a029c2d4', 'bnb my address', 217, 5, NULL, '2025-03-01 10:58:11', 'NOT-SYNCED', 'Active', 78),
(284, 'SOL', 'Aio9iMUntxbkTKDupQ9m7VzC4ZN4WfcQwRFTS2N3U8fq', 'my solana wallet 2', 217, 6, NULL, '2025-03-01 10:58:11', 'NOT-SYNCED', 'Active', 78),
(285, 'ETH', '0x2581519e5e1183adc0528d555201b2eaa8613805', 'Address 1', 219, 1, NULL, '2025-03-03 06:44:38', 'SYNCED', 'Inactive', 87),
(286, 'BNB', '0x68762a2d7f11982d583f3a4e63db206e5735c831', 'Address 2', 219, 2, NULL, '2025-03-03 06:44:38', 'SYNCED', 'Inactive', 87),
(287, 'SOL', 'BJv8snLVD5Nuemg7u8FyxBrULr4s623LyBVeq3UdKfMr', 'Address 3', 219, 3, NULL, '2025-03-03 06:44:38', 'SYNCED', 'Inactive', 87),
(288, 'BTC', 'my3Adg7vFuq6r7PCn69rUBe5NCw89gbnvR', 'Address 4', 219, 4, NULL, '2025-03-03 06:44:38', 'SYNCED', 'Inactive', 87),
(289, 'ETH', '0x66e365114f255dccf66186a28976eb98208a2fc2', 'Address 1', 219, 1, NULL, '2025-03-03 12:26:49', 'SYNCED', 'Active', 88),
(290, 'BNB', '0x6e40de6c49e79c9902cd1cc1074a0bf7aabd13e7', 'Address 2', 219, 2, NULL, '2025-03-03 12:26:49', 'SYNCED', 'Active', 88),
(291, 'SOL', '2DB8MS4Q4zfzpRX3JdayTukWAR7cHBabW7ThWYSY3t5p', 'Address 3', 219, 3, NULL, '2025-03-03 12:26:49', 'SYNCED', 'Active', 88),
(292, 'BTC', 'mq4AMRQTvBFQ3YsC8pwh9wMr88zodnoVVt', 'Address 4', 219, 4, NULL, '2025-03-03 12:26:49', 'SYNCED', 'Active', 88),
(293, 'ETH', '0x4b852ec317a7d0e5f6408be66ed14232290b3397', 'my eth', 219, 5, NULL, '2025-03-03 12:30:13', 'SYNCED', 'Active', 88),
(294, 'ETH', '0x43c50dc76a75379e2322213ab9818afff407eb8d', 'abhishek', 219, 6, NULL, '2025-03-03 14:19:58', 'SYNCED', 'Active', 88),
(295, 'ETH', '0x8a6d50b0cc8ac94e236e516c57b5439466cf7440', 'Address 1', 220, 1, NULL, '2025-03-04 10:03:23', 'NOT-SYNCED', 'Active', 11),
(296, 'BNB', '0x559ae36ec44e92522451fd751d59bc098b13d1ef', 'Address 2', 220, 2, NULL, '2025-03-04 10:03:24', 'NOT-SYNCED', 'Active', 11),
(297, 'SOL', '6MoTH3kYCgebS5Y6La7RfMyzRYcCjixTG5Nno2isTTfC', 'Address 3', 220, 3, NULL, '2025-03-04 10:03:25', 'NOT-SYNCED', 'Active', 11),
(298, 'BTC', 'mzQud2k5BFpeMUnkg3DKLPdQKL7jku84nY', 'Address 4', 220, 4, NULL, '2025-03-04 10:03:26', 'NOT-SYNCED', 'Active', 11),
(299, 'ETH', '0x613c1514c175c1e7fd2222bf577c8ae221db6753', 'Address 1', 226, 1, NULL, '2025-03-05 09:59:35', 'SYNCED', 'Active', 4),
(300, 'BNB', '0x6137f0060c9880486661dee4650c73b3109c4228', 'Address 2', 226, 2, NULL, '2025-03-05 09:59:35', 'SYNCED', 'Active', 4),
(301, 'SOL', 'HtDZmFj1x58jkgnjeqkLY9f3viPBydWYSHEP2qTDqgYE', 'Address 3', 226, 3, NULL, '2025-03-05 09:59:35', 'SYNCED', 'Active', 4),
(302, 'BTC', 'mher3uGn2nNdruwJgEVkBemgHKfVtBwsLg', 'Address 4', 226, 4, NULL, '2025-03-05 09:59:35', 'SYNCED', 'Active', 4),
(303, 'ETH', '0xaa316808c41ea8b16edbd4bab00b0b9ddbcfd2a7', 'Address 1', 228, 1, NULL, '2025-03-06 07:25:01', 'SYNCED', 'Active', 7),
(304, 'BNB', '0x77a585eec196aa2db89c66dedddcb44f24cd2a4f', 'Address 2', 228, 2, NULL, '2025-03-06 07:25:01', 'SYNCED', 'Active', 7),
(305, 'SOL', '7k2j5vgRJr6rpGE6kXjAoErWSN3UZqt1uhb6xLm1JPTo', 'Address 3', 228, 3, NULL, '2025-03-06 07:25:01', 'SYNCED', 'Active', 7),
(306, 'BTC', 'mfdHtPncknAbBQyNzKYqRHUmtePgQ6eTAx', 'Address 4', 228, 4, NULL, '2025-03-06 07:25:01', 'SYNCED', 'Active', 7),
(307, 'ETH', '0xbab9e1fd62a12de97f537727977f4331ee135bf8', 'Address 1', 227, 1, NULL, '2025-03-06 07:32:17', 'SYNCED', 'Active', 8),
(308, 'BNB', '0xd9bdf1abf395a7686440c8af607b25900f50e3de', 'Address 2', 227, 2, NULL, '2025-03-06 07:32:17', 'SYNCED', 'Active', 8),
(309, 'SOL', '56vnZzbf7RdcZXXRBBHNJ4sUvRTteCrunQXFsTBUVq2V', 'Address 3', 227, 3, NULL, '2025-03-06 07:32:17', 'SYNCED', 'Active', 8),
(310, 'BTC', 'n4ivvLFNMHTTzvk6vGpRp6etRQhtb1XwrU', 'Address 4', 227, 4, NULL, '2025-03-06 07:32:17', 'SYNCED', 'Active', 8),
(311, 'ETH', '0x3fcc25807f2ba285c01eb49292570bb90ecc5d3c', 'Address 1', 229, 1, NULL, '2025-03-06 14:08:08', 'SYNCED', 'Active', 9),
(312, 'BNB', '0x9fb768bce7702d587440d46ba23cf758d7ad5c41', 'Address 2', 229, 2, NULL, '2025-03-06 14:08:08', 'SYNCED', 'Active', 9),
(313, 'SOL', '3P7525FBDqqzp9dZQH6N6exDgXcYRTnqXsr5SaD4QMSd', 'Address 3', 229, 3, NULL, '2025-03-06 14:08:08', 'SYNCED', 'Active', 9),
(314, 'BTC', 'mnV8bc4thnvwAR1m31reY7aAHTCmFcwf4o', 'Address 4', 229, 4, NULL, '2025-03-06 14:08:08', 'SYNCED', 'Active', 9),
(315, 'ETH', '0xb73ce174e430796d8fc21880d5add5b1f38101a3', 'Address 1', 230, 1, NULL, '2025-03-07 07:05:45', 'SYNCED', 'Active', 10),
(316, 'BNB', '0x947618646b5167899bd2d0e2c7d1c34b5379b440', 'Address 2', 230, 2, NULL, '2025-03-07 07:05:45', 'SYNCED', 'Active', 10),
(317, 'SOL', '37BGwmXH6bkYHwkvtCEVq91ebo87Dgba2JajSUmDTn2p', 'Address 3', 230, 3, NULL, '2025-03-07 07:05:45', 'SYNCED', 'Active', 10),
(318, 'BTC', 'mrknjD8Rk8d8HPg8v8NEYrMCtXhPCKFcEa', 'Address 4', 230, 4, NULL, '2025-03-07 07:05:45', 'SYNCED', 'Active', 10),
(319, 'ETH', '0x6833c027f67ba2693f74cc5c89d899d96410c8fb', 'Address 1', 231, 1, NULL, '2025-03-07 07:54:03', 'SYNCED', 'Active', 11),
(320, 'BNB', '0x811df40ce4029aca926aa93415a9ed11d60c5a67', 'Address 2', 231, 2, NULL, '2025-03-07 07:54:03', 'SYNCED', 'Active', 11),
(321, 'SOL', '6vp6JghMs9zQVdDDwWfHxCZZis9Jjw2anQ33yPdjszQ4', 'Address 3', 231, 3, NULL, '2025-03-07 07:54:03', 'SYNCED', 'Active', 11),
(322, 'BTC', 'minDLvPeLFn8GiqM4h9V6n2LadM2LpmEme', 'Address 4', 231, 4, NULL, '2025-03-07 07:54:03', 'SYNCED', 'Active', 11),
(323, 'ETH', '0xbea6743f0357104b4fd7c7cc3435dfa659eab736', 'Address 1', 230, 0, NULL, '2025-03-07 09:50:46', 'SYNCED', 'Inactive', 12),
(324, 'BNB', '0xbea6743f0357104b4fd7c7cc3435dfa659eab736', 'Address 2', 230, 0, NULL, '2025-03-07 09:50:46', 'SYNCED', 'Inactive', 12),
(325, 'SOL', 'wXKk7WS6T5SmX8oQjvwySX5SGadFTYxwaq5XvCJG8J7', 'Address 2', 230, 0, NULL, '2025-03-07 09:50:46', 'SYNCED', 'Inactive', 12),
(326, 'BTC', 'n2TnqrwjsURLtQAPjWMfzRjAcEomLQ9do3', 'Address 3', 230, 0, NULL, '2025-03-07 09:50:46', 'SYNCED', 'Inactive', 12),
(327, 'ETH', '0xb6452e556de9e5d541579dddfbd0790d3db10833', 'Address 1', 235, 1, NULL, '2025-03-07 12:34:00', 'SYNCED', 'Active', 16),
(328, 'BNB', '0xe283965a8c40cf699031918cf7597b1bb1bb53c5', 'Address 2', 235, 2, NULL, '2025-03-07 12:34:00', 'SYNCED', 'Active', 16),
(329, 'SOL', '3Uz28vsU85fkd9dnvDKmk57xCUXUaTpScSmnRE3mBFib', 'Address 3', 235, 3, NULL, '2025-03-07 12:34:00', 'SYNCED', 'Active', 16),
(330, 'BTC', 'mkUQHc8JfjmyXfwQJZiAqqq28NAXtxAbTY', 'Address 4', 235, 4, NULL, '2025-03-07 12:34:00', 'SYNCED', 'Active', 16),
(331, 'ETH', '0xa3302c783e9a7acccb1579b246f87e2dadc55b2c', 'Address 1', 235, 1, NULL, '2025-03-07 12:36:14', 'SYNCED', 'Inactive', 17),
(332, 'BNB', '0x7c69c11d60cb756938a38cedc85d7046b4a33adf', 'Address 2', 235, 2, NULL, '2025-03-07 12:36:14', 'SYNCED', 'Inactive', 17),
(333, 'SOL', '5iU7hzDyBuHbhDLdV9VNH6npB9GDX9mraH2EHYNvjjj7', 'Address 3', 235, 3, NULL, '2025-03-07 12:36:14', 'SYNCED', 'Inactive', 17),
(334, 'BTC', 'mm9oPFm9TkzBURazXAHj7cG9xdcz3QzVKc', 'Address 4', 235, 4, NULL, '2025-03-07 12:36:14', 'SYNCED', 'Inactive', 17),
(335, 'ETH', '0xeac1aa38aa429f5e66a93e83b7412783c558f93b', 'my address', 235, 5, NULL, '2025-03-07 12:57:12', 'SYNCED', 'Active', 16),
(336, 'ETH', '0xebb7ade9bd9b305e684654c82f387d96d27958e0', 'my1', 235, 6, NULL, '2025-03-07 13:09:58', 'SYNCED', 'Active', 16),
(337, 'BTC', 'mr7w6J3W1cobp3wBmSPQoXx1t9YAuuF83M', 'mybtc add', 235, 7, NULL, '2025-03-11 07:36:35', 'SYNCED', 'Active', 16),
(338, 'ETH', '0xa3302c783e9a7acccb1579b246f87e2dadc55b2c', 'Address 1', 240, 1, NULL, '2025-03-11 11:13:34', 'NOT-SYNCED', 'Inactive', 17),
(339, 'BNB', '0x7c69c11d60cb756938a38cedc85d7046b4a33adf', 'Address 2', 240, 2, NULL, '2025-03-11 11:13:35', 'NOT-SYNCED', 'Inactive', 17),
(340, 'SOL', '5iU7hzDyBuHbhDLdV9VNH6npB9GDX9mraH2EHYNvjjj7', 'Address 3', 240, 3, NULL, '2025-03-11 11:13:36', 'NOT-SYNCED', 'Inactive', 17),
(341, 'BTC', 'mm9oPFm9TkzBURazXAHj7cG9xdcz3QzVKc', 'Address 4', 240, 4, NULL, '2025-03-11 11:13:37', 'NOT-SYNCED', 'Inactive', 17),
(342, 'ETH', '0xab20cc001a63f18346befb0b272230e429c64497', 'Address 1', 240, 1, NULL, '2025-03-11 13:51:48', 'SYNCED', 'Active', 18),
(343, 'BNB', '0xe03a3d64e59c1d2cdad667f4723669a59d7e3226', 'Address 2', 240, 2, NULL, '2025-03-11 13:51:48', 'SYNCED', 'Active', 18),
(344, 'SOL', 'bquZX23GJKDATjPh9hdFwXFpVDVk3vy8xB7qJTqVNUU', 'Address 3', 240, 3, NULL, '2025-03-11 13:51:48', 'SYNCED', 'Active', 18),
(345, 'BTC', 'n1ondGkXKv1N1CezcFSqndHJKWKQwaFgFe', 'Address 4', 240, 4, NULL, '2025-03-11 13:51:48', 'SYNCED', 'Active', 18),
(346, 'ETH', '0x86eb904ce3fb808bf827315830fec9e78be9e94e', 'Address 1', 240, 1, NULL, '2025-03-11 14:03:54', 'SYNCED', 'Active', 19),
(347, 'BNB', '0x15a65f764b98c9363156eb050af709439084970d', 'Address 2', 240, 2, NULL, '2025-03-11 14:03:54', 'SYNCED', 'Active', 19),
(348, 'SOL', '8jFyZSr548no5NJGyjPb9dGrpv93HTU3bQxsXN7RRwdq', 'Address 3', 240, 3, NULL, '2025-03-11 14:03:54', 'SYNCED', 'Active', 19),
(349, 'BTC', 'n4SFTXefWVL7UxhSSr3XCGNfz2KP3c2g93', 'Address 4', 240, 4, NULL, '2025-03-11 14:03:54', 'SYNCED', 'Active', 19),
(350, 'ETH', '0x986ff49fb6a3893d5dfef6b1a7605e6e3ee479e9', 'Address 1', 241, 1, NULL, '2025-03-12 07:24:13', 'SYNCED', 'Inactive', 20),
(351, 'BNB', '0xbef12d6adc569bc29728adeae7d4762f61fdd368', 'Address 2', 241, 2, NULL, '2025-03-12 07:24:13', 'SYNCED', 'Inactive', 20),
(352, 'SOL', '8TvHSSn7gsWRbxsyEfd3DDDktB1uB65kgADEHiJwQZY3', 'Address 3', 241, 3, NULL, '2025-03-12 07:24:13', 'SYNCED', 'Inactive', 20),
(353, 'BTC', 'mq7FCRpkmVZ71uTJd1GXwtMUSTcLjs13VG', 'Address 4', 241, 4, NULL, '2025-03-12 07:24:13', 'SYNCED', 'Inactive', 20),
(354, 'ETH', '0xbbc3f9d3e11581e8931012edcafe20d88d6f9291', 'Address 1', 241, 1, NULL, '2025-03-12 09:55:05', 'SYNCED', 'Active', 21),
(355, 'BNB', '0x00426af939f4e79c09bc210d78f0347cdeaad523', 'Address 2', 241, 2, NULL, '2025-03-12 09:55:05', 'SYNCED', 'Active', 21),
(356, 'SOL', 'uWUnkXSFMjWa532zbKM6G4PsiWoUnKPNxLwv3z2FK6Y', 'Address 3', 241, 3, NULL, '2025-03-12 09:55:05', 'SYNCED', 'Active', 21),
(357, 'BTC', 'mzrvQs3kDTHmcEVocPzUhxmWo53gQDFVmN', 'Address 4', 241, 4, NULL, '2025-03-12 09:55:05', 'SYNCED', 'Active', 21),
(358, 'ETH', '0x70d76d0dc92e8f7e1cd6eac546000ffb75b2e18c', 'Address 1', 243, 1, NULL, '2025-03-12 11:35:08', 'SYNCED', 'Active', 22),
(359, 'BNB', '0x59d96ae4d7bb008d44ff88b93cbd3ca3bc325c13', 'Address 2', 243, 2, NULL, '2025-03-12 11:35:08', 'SYNCED', 'Active', 22),
(360, 'SOL', '7AAFFBrHocRjortFMA327fVULKSERrUwVYr1DgC1NJih', 'Address 3', 243, 3, NULL, '2025-03-12 11:35:08', 'SYNCED', 'Active', 22),
(361, 'BTC', 'mqXPm6WM7FRiqTctzLVuEGRcvaYJmw4NeA', 'Address 4', 243, 4, NULL, '2025-03-12 11:35:08', 'SYNCED', 'Active', 22),
(362, 'ETH', '0xf40da1fe06957c1a8a180e2fab09d735c9ea7cb1', 'Address 1', 221, 1, NULL, '2025-03-12 12:34:23', 'SYNCED', 'Active', 23),
(363, 'BNB', '0x7be96ccf4838b3497817a6db3800b24f24c6089d', 'Address 2', 221, 2, NULL, '2025-03-12 12:34:23', 'SYNCED', 'Active', 23),
(364, 'SOL', 'BHerk8RCW22PjWK4YDcxmZE6ZynnLMYBUjLMtoHC3Y9U', 'Address 3', 221, 3, NULL, '2025-03-12 12:34:23', 'SYNCED', 'Active', 23),
(365, 'BTC', 'mvuD47bDNNFr8C8XT6qahBqnuLKqJVpJNG', 'Address 4', 221, 4, NULL, '2025-03-12 12:34:23', 'SYNCED', 'Active', 23),
(366, 'ETH', '0x9c463c3b90da1bd54f011b919f20526f31e36c28', 'Address 1', 244, 1, NULL, '2025-03-13 07:24:57', 'SYNCED', 'Active', 24),
(367, 'BNB', '0x460903eee7e65e2f54ebabc9ded49c151cadfcf7', 'Address 2', 244, 2, NULL, '2025-03-13 07:24:57', 'SYNCED', 'Active', 24),
(368, 'SOL', 'qH1h3F5u4rJzYaMxbhFaFdcvc5KzREuxycp7uKPVcw4', 'Address 3', 244, 3, NULL, '2025-03-13 07:24:57', 'SYNCED', 'Active', 24),
(369, 'BTC', 'mjgX4mw57PBJGv3jqEobEfEQQWFn4rcX5Y', 'Address 4', 244, 4, NULL, '2025-03-13 07:24:57', 'SYNCED', 'Active', 24),
(370, 'ETH', '0xa5ff4f26493f85108112c3a64b01335d6a0011a7', 'Address 1', 246, 1, NULL, '2025-03-13 09:31:34', 'SYNCED', 'Active', 25),
(371, 'BNB', '0xd82c6429372ddf098cadbfb7c4263e2376905d50', 'Address 2', 246, 2, NULL, '2025-03-13 09:31:34', 'SYNCED', 'Active', 25),
(372, 'SOL', 'HX7YarhgHDitFT9H3CfMBzzFscSB7VMuq64AsUrEerqR', 'Address 3', 246, 3, NULL, '2025-03-13 09:31:34', 'SYNCED', 'Active', 25),
(373, 'BTC', 'mxavzQ2oRrPdyJdEjPJPk5DXvErkSAHECc', 'Address 4', 246, 4, NULL, '2025-03-13 09:31:34', 'SYNCED', 'Active', 25),
(374, 'ETH', '0xa5ff4f26493f85108112c3a64b01335d6a0011a7', 'Address 1', 247, 1, NULL, '2025-03-13 11:29:55', 'NOT-SYNCED', 'Active', 25),
(375, 'BNB', '0xd82c6429372ddf098cadbfb7c4263e2376905d50', 'Address 2', 247, 2, NULL, '2025-03-13 11:29:56', 'NOT-SYNCED', 'Active', 25),
(376, 'SOL', 'HX7YarhgHDitFT9H3CfMBzzFscSB7VMuq64AsUrEerqR', 'Address 3', 247, 3, NULL, '2025-03-13 11:29:57', 'NOT-SYNCED', 'Active', 25),
(377, 'BTC', 'mxavzQ2oRrPdyJdEjPJPk5DXvErkSAHECc', 'Address 4', 247, 4, NULL, '2025-03-13 11:29:58', 'NOT-SYNCED', 'Active', 25),
(378, 'ETH', '0xc690b15befe69a4357327e92492a187db01f2c28', 'Address 1', 248, 1, NULL, '2025-03-17 07:04:46', 'SYNCED', 'Active', 26),
(379, 'BNB', '0x6e5ae801433a49d456d6eac25189d646b4f67b98', 'Address 2', 248, 2, NULL, '2025-03-17 07:04:46', 'SYNCED', 'Active', 26),
(380, 'SOL', '4xGnmbiRSg6y1L1KMF3XMLyxfguwpHy8kskGnLToadzT', 'Address 3', 248, 3, NULL, '2025-03-17 07:04:46', 'SYNCED', 'Active', 26),
(381, 'BTC', 'mfsWF5YbHciQYnydsttakortmdtiRvM1VD', 'Address 4', 248, 4, NULL, '2025-03-17 07:04:46', 'SYNCED', 'Active', 26),
(382, 'ETH', '0x5bcc10cae39fe414628fc5e2bb4f154d5527be79', '', 248, 5, NULL, '2025-03-17 07:18:00', 'SYNCED', 'Active', 26),
(383, 'ETH', '0xc841463968cbed2ae100c32e0a9e44bd994f608d', '', 248, 6, NULL, '2025-03-17 11:03:57', 'SYNCED', 'Active', 26),
(384, 'ETH', '0xb6a842a80ef71618ecdd72fa52dca58129b3a204', 'Address 1', 249, 1, NULL, '2025-03-17 13:19:04', 'SYNCED', 'Active', 27),
(385, 'BNB', '0x1ea642be1b12672ec4667f4437ec9c16707c43e9', 'Address 2', 249, 2, NULL, '2025-03-17 13:19:04', 'SYNCED', 'Active', 27),
(386, 'SOL', 'H2pRgfvtbNtDPdgU6ziRSCqXDxPVioSje8uGEftabCRS', 'Address 3', 249, 3, NULL, '2025-03-17 13:19:04', 'SYNCED', 'Active', 27),
(387, 'BTC', 'mn9WkpooY5sYV55bhc39FKW9sAq9kz41o5', 'Address 4', 249, 4, NULL, '2025-03-17 13:19:04', 'SYNCED', 'Active', 27),
(388, 'ETH', '0xf812ada6ece8e3b6899631f0adbd58978f77ec67', 'Address 1', 250, 1, NULL, '2025-03-18 06:34:20', 'SYNCED', 'Active', 28),
(389, 'BNB', '0x592e8277194681806fa9d7b735fd3f81b9669c71', 'Address 2', 250, 2, NULL, '2025-03-18 06:34:20', 'SYNCED', 'Active', 28),
(390, 'SOL', 'X1eYnceXiv5PyiJHngh8CtDmZJnEoqXESmKMbcf4zXJ', 'Address 3', 250, 3, NULL, '2025-03-18 06:34:20', 'SYNCED', 'Active', 28),
(391, 'BTC', 'mhdpPBKEJ1CrH56LwHcUu2c6if8pYwTwFK', 'Address 4', 250, 4, NULL, '2025-03-18 06:34:20', 'SYNCED', 'Active', 28),
(392, 'ETH', '0x51ca86f3004dc237e17cb72ad2fa7b9c31343df5', 'Address 1', 251, 1, NULL, '2025-03-18 12:02:15', 'SYNCED', 'Active', 29),
(393, 'BNB', '0x1c265d94a79fa6fc5f1f3d5164f3861738ecc6c9', 'Address 2', 251, 2, NULL, '2025-03-18 12:02:15', 'SYNCED', 'Active', 29),
(394, 'SOL', 'E1PJfp4FUA9jv6tkXyk8E5cYoLvDuCHHgJwi11XsKpvx', 'Address 3', 251, 3, NULL, '2025-03-18 12:02:15', 'SYNCED', 'Active', 29),
(395, 'BTC', 'n3KkyuPRu48Gg8QxxH2VbYnRSjmzGgNKnP', 'Address 4', 251, 4, NULL, '2025-03-18 12:02:15', 'SYNCED', 'Active', 29),
(396, 'ETH', '0x4a1dabc9886205ed94aa37e0a114817835c97f56', 'Address 1', 252, 1, NULL, '2025-03-20 06:30:49', 'SYNCED', 'Active', 30),
(397, 'BNB', '0x78ed4d8dc69cdd77716b06ef3f6b4654bbeabbcd', 'Address 2', 252, 2, NULL, '2025-03-20 06:30:49', 'SYNCED', 'Active', 30),
(398, 'SOL', '3bFiD6AzYzQXCPyDpAs7cgMb9HdUCVqKX23tdqsPXWM1', 'Address 3', 252, 3, NULL, '2025-03-20 06:30:49', 'SYNCED', 'Active', 30),
(399, 'BTC', 'mzqkrTVc9mqhjxJ7GYVuu2KMLpBpKPpm6B', 'Address 4', 252, 4, NULL, '2025-03-20 06:30:49', 'SYNCED', 'Active', 30),
(400, 'ETH', '0xa5ff4f26493f85108112c3a64b01335d6a0011a7', 'Address 1', 253, 1, NULL, '2025-03-20 11:12:40', 'NOT-SYNCED', 'Active', 25),
(401, 'BNB', '0xd82c6429372ddf098cadbfb7c4263e2376905d50', 'Address 2', 253, 2, NULL, '2025-03-20 11:12:40', 'NOT-SYNCED', 'Active', 25),
(402, 'SOL', 'HX7YarhgHDitFT9H3CfMBzzFscSB7VMuq64AsUrEerqR', 'Address 3', 253, 3, NULL, '2025-03-20 11:12:41', 'NOT-SYNCED', 'Active', 25),
(403, 'BTC', 'mxavzQ2oRrPdyJdEjPJPk5DXvErkSAHECc', 'Address 4', 253, 4, NULL, '2025-03-20 11:12:41', 'NOT-SYNCED', 'Active', 25),
(404, 'ETH', '0xe20bfc41163744a13b772f664ea7cdbb2feff187', 'Address 1', 254, 1, NULL, '2025-03-20 11:59:48', 'SYNCED', 'Active', 31),
(405, 'BNB', '0x08edd9157159a9d67e014062dc5b1ea22e650bdd', 'Address 2', 254, 2, NULL, '2025-03-20 11:59:48', 'SYNCED', 'Active', 31),
(406, 'SOL', '68UUf2h53em3bspz3XiMuG6ir9aaLQX6UjYyzkT9niG2', 'Address 3', 254, 3, NULL, '2025-03-20 11:59:48', 'SYNCED', 'Active', 31),
(407, 'BTC', 'mtkLFbaW8cKF4eP23LpUfDDseAfggkTMmv', 'Address 4', 254, 4, NULL, '2025-03-20 11:59:48', 'SYNCED', 'Active', 31),
(408, 'ETH', '0x7d864ba640bc434580b53d849eaf86b0a0ec6ead', 'Address 1', 255, 1, NULL, '2025-03-21 06:04:59', 'SYNCED', 'Active', 32),
(409, 'BNB', '0xbe99f40c3edfdc7b8f926e013ac7af34a532ca38', 'Address 2', 255, 2, NULL, '2025-03-21 06:04:59', 'SYNCED', 'Active', 32),
(410, 'SOL', 'HnD5uZQVSz1Fc1Ljf9nZzLrWA6gHNapnap4292TtaLsi', 'Address 3', 255, 3, NULL, '2025-03-21 06:04:59', 'SYNCED', 'Active', 32),
(411, 'BTC', 'n1ELQiqAqXB7M1s3miEBcCCBc6Y5HLJyL8', 'Address 4', 255, 4, NULL, '2025-03-21 06:04:59', 'SYNCED', 'Active', 32),
(412, 'ETH', '0x680fdedeb658498ca50ac3eef8c3a5ea85f57243', 'Address 1', 256, 1, NULL, '2025-03-21 10:05:16', 'SYNCED', 'Active', 33),
(413, 'BNB', '0xc32e8c9b18ecc16bcc42fac2db5ee3465d4eed49', 'Address 2', 256, 2, NULL, '2025-03-21 10:05:16', 'SYNCED', 'Active', 33),
(414, 'SOL', '7BLo8xtjieUnsigaJp3FHDMojwxN4DtGpAttYTtn4awY', 'Address 3', 256, 3, NULL, '2025-03-21 10:05:16', 'SYNCED', 'Active', 33),
(415, 'BTC', 'mtXuhpmA1PCfx1qfq6FHq1zbcDnzNbjQxK', 'Address 4', 256, 4, NULL, '2025-03-21 10:05:16', 'SYNCED', 'Active', 33),
(416, 'ETH', '0x0c19a4d4538f453a476e7bfb3a6f3c76fd4e6262', 'Address 1', 259, 1, NULL, '2025-03-24 06:16:13', 'SYNCED', 'Active', 34),
(417, 'BNB', '0x826b01d78666bf8e24acc837b0934d38dcb00fca', 'Address 2', 259, 2, NULL, '2025-03-24 06:16:13', 'SYNCED', 'Active', 34),
(418, 'SOL', 'GyQjWr2qDBN3JdeupbDdvrQCz7fsqYPrz8GMJmDwpXzJ', 'Address 3', 259, 3, NULL, '2025-03-24 06:16:13', 'SYNCED', 'Active', 34),
(419, 'BTC', 'mqVa7bBXaPyeAyWprCZ9QVgBGpHVWaQxGt', 'Address 4', 259, 4, NULL, '2025-03-24 06:16:13', 'SYNCED', 'Active', 34),
(420, 'ETH', '0xf6198d5bc311960384ca0abe7908bacede817ac5', 'Address 1', 260, 1, NULL, '2025-03-24 06:50:17', 'SYNCED', 'Active', 35),
(421, 'BNB', '0x6db053d154f4b4059555ccd6bf352ef0a8732aee', 'Address 2', 260, 2, NULL, '2025-03-24 06:50:17', 'SYNCED', 'Active', 35),
(422, 'SOL', 'GHMdKo5jJkoJfnWqEb8rveY95jr6BTif93TbGH7QSSjM', 'Address 3', 260, 3, NULL, '2025-03-24 06:50:17', 'SYNCED', 'Active', 35),
(423, 'BTC', 'mm2Hh8nFiaXNN9KzY446upYtatoLfh7aa8', 'Address 4', 260, 4, NULL, '2025-03-24 06:50:17', 'SYNCED', 'Active', 35),
(424, 'BNB', 'D45602HqyYmkjD77HH3DdBp9TWtYVoVox6ZmFtyt0', 'addressName', 16, 4, NULL, '2025-03-24 09:40:44', 'NOT-SYNCED', 'Active', 7),
(425, 'ETH', '0x83e3ee1d7951f9b17feff4314c95f65a3c7e2639', 'Address 1', 261, 1, NULL, '2025-03-24 09:52:11', 'SYNCED', 'Active', 36),
(426, 'BNB', '0xf6bd0a5dfac8160b4febfce7d280fc5dd1a1d2d1', 'Address 2', 261, 2, NULL, '2025-03-24 09:52:11', 'SYNCED', 'Active', 36),
(427, 'SOL', 'Br4yZydsxVZA9orr4NT43evFzJ8nhfpLFmvmfvrv8GtW', 'Address 3', 261, 3, NULL, '2025-03-24 09:52:11', 'SYNCED', 'Active', 36),
(428, 'BTC', 'myusE7aBernmAaJuALBPQPLtWyc9Fbfnq9', 'Address 4', 261, 4, NULL, '2025-03-24 09:52:11', 'SYNCED', 'Active', 36),
(429, 'ETH', '0xa040daa32f017bb826d19c96d1393c490935b502', 'Address 1', 262, 1, NULL, '2025-03-25 06:01:19', 'SYNCED', 'Active', 37),
(430, 'BNB', '0x6c1467cba36ea7d74a3e1eb298c14e550a90a04a', 'Address 2', 262, 2, NULL, '2025-03-25 06:01:19', 'SYNCED', 'Active', 37),
(431, 'SOL', '7WpbXVodouvHv6RWwdFvi8BboeuEah3kvc16MjxWTe2T', 'Address 3', 262, 3, NULL, '2025-03-25 06:01:19', 'SYNCED', 'Active', 37),
(432, 'BTC', 'mpa3yX5YwaLcXeKtyC4QgFbfUuQ9aCck7Q', 'Address 4', 262, 4, NULL, '2025-03-25 06:01:19', 'SYNCED', 'Active', 37),
(433, 'ETH', '0xdd84b0ee6b949fe5951ef9a115c79a66e340df2b', 'Address 1', 263, 1, NULL, '2025-03-25 11:19:56', 'SYNCED', 'Active', 38),
(434, 'BNB', '0x51a517fb1db2f215ecbb427e001de5e3e95285ee', 'Address 2', 263, 2, NULL, '2025-03-25 11:19:57', 'SYNCED', 'Active', 38),
(435, 'SOL', '3Bp1YX76bn1n1mr465KgZeE3GfyW6U3zmK1iGkwvM2jG', 'Address 3', 263, 3, NULL, '2025-03-25 11:19:58', 'SYNCED', 'Active', 38),
(436, 'BTC', 'mp3tcDqoQ9rEtvUCy2uphANWikTYUXBXVu', 'Address 4', 263, 4, NULL, '2025-03-25 11:19:59', 'SYNCED', 'Active', 38),
(437, 'ETH', '0x2754168fc5fd982f6de457d1d9505e783a566230', 'Address 1', 263, 1, NULL, '2025-03-25 11:23:14', 'SYNCED', 'Inactive', 39),
(438, 'BNB', '0x60c647a722d7aca818f07c829a91cbcf39a33b44', 'Address 2', 263, 2, NULL, '2025-03-25 11:23:14', 'SYNCED', 'Inactive', 39),
(439, 'SOL', '4H6gdx37iJdFZ2Z6PqSJxi8vFDzjnNVAhr5eNRQhNbPA', 'Address 3', 263, 3, NULL, '2025-03-25 11:23:14', 'SYNCED', 'Inactive', 39),
(440, 'BTC', 'n3AZibZzeJZNUxBi8QRE7A8T2FSgnjs74E', 'Address 4', 263, 4, NULL, '2025-03-25 11:23:14', 'SYNCED', 'Inactive', 39),
(441, 'ETH', '0xe19f79722e264b9673ac5630940d894edfc192e0', 'Address 1', 264, 1, NULL, '2025-03-26 14:39:07', 'SYNCED', 'Active', 40),
(442, 'BNB', '0x3c3ccf6c4ac1e32407dfeb8c63ed90a8bbb10ee9', 'Address 2', 264, 2, NULL, '2025-03-26 14:39:07', 'SYNCED', 'Active', 40),
(443, 'SOL', '5Ep7uR79qf5HSYMUuM2FPBXHzDuhyZ2f2wS94Z8aEvFv', 'Address 3', 264, 3, NULL, '2025-03-26 14:39:08', 'SYNCED', 'Active', 40),
(444, 'BTC', 'mh7Y2FjSF4Xqqr2qEagu9dDbnq6LdjfU4C', 'Address 4', 264, 4, NULL, '2025-03-26 14:39:08', 'SYNCED', 'Active', 40),
(445, 'ETH', '0xcda522c4e678d7edb6c923a1c330b91733dd8896', 'my address 1', 264, 5, NULL, '2025-03-28 08:37:09', 'SYNCED', 'Active', 40),
(446, 'ETH', '0x681143edaf2645a472fd0100883bbdb3df9b3555', '', 264, 6, NULL, '2025-03-28 08:39:43', 'SYNCED', 'Active', 40),
(447, 'ETH', '0xdbf0163a87ab00c59195521530e44533397d9d20', 'new add', 264, 7, NULL, '2025-03-28 08:42:39', 'SYNCED', 'Active', 40),
(448, 'ETH', '0xdf034773a253af8b445f44c600f2eaddb13cf72a', 'hfhffhf', 264, 8, NULL, '2025-03-28 08:43:34', 'SYNCED', 'Active', 40),
(449, 'ETH', '0x8416c5779be12cd634c18f7955d3142a61e60891', 'my2', 264, 9, NULL, '2025-03-28 08:50:27', 'SYNCED', 'Active', 40),
(450, 'ETH', '0x100f84beb14446de2944bf0b5ed9ffbaf01b4188', 'jdjdnnsns', 264, 10, NULL, '2025-03-28 08:51:05', 'SYNCED', 'Active', 40);

-- --------------------------------------------------------

--
-- Table structure for table `blocchi`
--

CREATE TABLE `blocchi` (
  `bitcoin` int NOT NULL,
  `ethereum` int NOT NULL,
  `binance` int NOT NULL,
  `solana` int NOT NULL,
  `monero` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `blocchi`
--

INSERT INTO `blocchi` (`bitcoin`, `ethereum`, `binance`, `solana`, `monero`) VALUES
(2472804, 9527386, 32497548, 215792637, 0);

-- --------------------------------------------------------

--
-- Table structure for table `device`
--

CREATE TABLE `device` (
  `id` int NOT NULL,
  `identifier` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `passkey` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `date_insert` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `device_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `onboarding_status` tinyint NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `device`
--

INSERT INTO `device` (`id`, `identifier`, `passkey`, `date_insert`, `device_token`, `is_active`, `onboarding_status`) VALUES
(40, 'QKQ1.19200.002', '0di1WXKbReprt6IkpXVCJ9', '2024-08-05 15:05:40', NULL, 1, 0),
(41, 'SDQ1.15200.002', 'nhio1WXKbReprt6IkpXVCJ9', '2024-08-06 11:41:43', NULL, 1, 0),
(42, 'S5Q1.15200.002', 'io1WXKbReprt6IkpXVCJ9', '2024-08-06 11:46:43', NULL, 1, 0),
(43, 'S5Q2.15200.002', 'io1KbReprt6IkpXVCJ9', '2024-08-06 11:49:11', NULL, 1, 0),
(44, 'Q122.10200.002', '1kd6grKbReprt6IkpXVCJ9', '2024-08-06 11:54:36', NULL, 1, 0),
(57, 'QKQ1.14500.002', '0di1WXKbReprt6IkpXV', '2024-08-06 12:58:31', NULL, 1, 0),
(83, 'TP1A.220224.015', 'DFqcuGhh8ENCPJln', '2024-08-22 15:44:49', NULL, 1, 0),
(86, 'TP1A.220224.5', 'cuGhh8ENCPJln', '2024-08-22 17:03:52', NULL, 1, 0),
(87, 'TP1A.224.5', 'chh8ENCPJln', '2024-08-22 17:06:26', NULL, 1, 0),
(95, 'TP1A.0624.14', 'Gl9lhzYEmK0XC', '2024-08-29 19:51:24', NULL, 1, 0),
(96, 'TP1A.220624.014', '2gCYZEsyRbBz5dt', '2024-08-30 12:16:18', NULL, 1, 0),
(97, 'TP1A.0624.789', '9lhzYEmK0XC', '2024-08-30 13:46:26', NULL, 1, 0),
(99, 'UQ1A.240205.002', 'fVHWrgJKumzqH1Q', '2024-09-04 11:55:23', NULL, 1, 0),
(131, 'RKQ1.211119.001', '7Xn6Bw2qAcPlD1Kv4u', '2024-09-13 19:00:19', 'cb-cDwTkTPSvciOTIqXGtx:APA91bEY_D_WPbSgA4doZdNv5m9Eil8VM0_6ec2bc0DIaydllF7TWHX5o4O08o9X-TZTCmKTdHNAs5WtryWWwH4Q6BWbuh9ousIo7H_2d_dgFitEglUkmFI', 1, 0),
(136, 'AP41.240823.009', '7Xn6Bw2qAcPlD1Kv4u', '2024-10-23 13:12:09', 'cBPyUiv_RgShxO2TtUuYEq:APA91bEU9Jtoh8R1frId4iUQ2MceNv6NHS5wmLNXpUJuesbQxhhTwIAIE9Ua0kcPWYW02XoGot-MZRKWJFaZbu4-I-oKgK4BGFqX7iH-KW-bxse72-KmgAI', 1, 0),
(137, 'QP1A.190711.020', '7Xn6Bw2qAcPlD1Kv4u', '2024-10-23 13:21:50', 'dv__aesxR7iwM1P6HB1VyT:APA91bH4texG7upnb8TtbPkN6Zktm1rZYP0nmiUooEZAN_fWz8kjnGMexQiNOPUX3eMVs4e9RmfNQnhd-tdA520X6Vt5yByvbhlD71QrALkWCWOZ-MhM02Q', 1, 0),
(138, 'UE1A.230829.036.A1', '7Xn6Bw2qAcPlD1Kv4u', '2024-10-28 18:21:00', 'c0qUDzaoSYGJTeUcy9szPD:APA91bEhOHoBtswPI1YkoKS8IpZNAnXduG9Zvly1OwytBsNxbyKO4Iob6KjDWd5KG5VJt83piQVMmKRWzSFollV_dQ9ZWw2qILFqOmJ28Fmsyi30ia0vUh8', 1, 0),
(140, '265F387A-944A-4AA8-9FE7-3EC4C16EA03C', '7Xn6Bw2qAcPlD1Kv4u', '2024-10-31 16:03:29', 'fNh2GaM1FEqtpR900m3GTL:APA91bEtqZpZZWxIT_ZaBArGldK-9jZTaKbYac_k13mCdQa197uepQzs4R5LjYoJmOntPu6WsmykbBtX-wqNxyt3hOexVFNjW9mkAnz6yXHQ1jwuwiDadsg', 1, 0),
(149, 'OSM1.180201.031', '7Xn6Bw2qAcPlD1Kv4u', '2024-12-03 23:41:31', 'crP_lZHrSU2eRZqNlTPP43:APA91bE6PQyhsxVBv8qz9r-5R6hUE3csdTE9MrvRw0uoyOh02Gkcr8Tx7FsisdscNMDqAzxprYCrvFQFkdgDd5p4T4LmHJERgYjxdxIeGifXUml4CwOpYJQ', 1, 0),
(150, 'OPP28.85-19-4-2', '7Xn6Bw2qAcPlD1Kv4u', '2024-12-04 07:40:37', 'eofdAUztRpCgoMjz2kV_bK:APA91bFJwi6ntSoxdC1RH51H0YkyO1_I3Z9kFfbNLK8oeURGuZd_0I6ujqSt3ZqJcEO_EwzcaTxPGQxyGyz2T-En46jdwT4TupJwutLs86RPUrflcgnuj98', 1, 0),
(155, 'TP1A.220624.015', '2gCYZEsyRbBz5du', '2025-01-03 18:59:29', NULL, 1, 0),
(156, 'BP11.241121.010', '7Xn6Bw2qAcPlD1Kv4u', '2025-01-07 19:47:31', 'dpGbG6tbT964XCUVz9HTfq:APA91bHjLr3XNn4kXl-M8mVR-vZd60enxkkoBsqxRioqGne7XBVYfpBYErXTKdRDOjRqqjz6Df_7H84U6vlbuFIK5IGfYlRWl_6nTmvrMIlIEXNi47wHC-g', 1, 0),
(162, 'QKQ1.190910.002', '7Xn6Bw2qAcPlD1Kv4u', '2025-01-30 16:15:23', 'dX6zzVDlRgSrHMp7AvpvQL:APA91bE7Sb1NlbPwspiiP7akCsJdXRFLdZQEr_GaIOPVSPnkfcwJJZ3bUn1Gjv8QkaqotFwk69bwaB-2D6F8IWKeXrG7OH2KxP3oTcwSf-pWCO_y62tfAt0', 1, 0),
(187, 'TP1A.220905.001', '7Xn6Bw2qAcPlD1Kv4u', '2025-02-12 19:26:16', 'cO0egNviTI6KlnIEMUn6j7:APA91bGbv73cpAskU3Jql_jbWHtG0LDUf5A0cjb_4ntueF-eJrVrK6_O5SXPbOiMTEhtbq_tR8hKIdnSixxlAK2K4sfuQvbZhmUVN1gOANQ3Oti-zDUIO48', 1, 0),
(191, 'UP1A.231005.007', '7Xn6Bw2qAcPlD1Kv4u', '2025-02-20 12:14:54', 'cpjFz_CXSdayYqwUQz16xM:APA91bGiYuGq7P8Rse75aFhFNmiCa3WABUp4XR9Bpy56U_pEeBqTAi7RU8kJR3AGsUqNJ0DUF3P9ZXNnyZPz4eP8JRbdCNtOKizB12BxS83xT9SG6vCIglU', 1, 0),
(193, 'eb96cca86611124d', '4gC8LYBwHq4K4rPY', '2025-02-25 18:26:24', 'cRZfKwOZS12irBkh6AXIQe:APA91bFyyTA0qGMISvR9_5jV3ib_7UeL8BpQf2mNoHtAKJM5-vslTj1te6xYXAmTeSuLbs3k9ASbKdlDkYwMeWnaQ4VZnS8xlGs9Y2YbTBcEbM9J-K03t64', 0, 0),
(198, 'f5d624034b8272b9', 'Hd1t2RquqB3fCKpX', '2025-02-26 11:46:27', 'dqsqTtPIRNWpWFmCcaIj3f:APA91bG_xvAAGqPVKimTwXyuE0PXWoa5XFSnOXC3G5AKj_HA_hckUvdLGzvMJ3mjQwkCaFFjHW4OtkroH9xHJBz2hvGjFZ7sZ90ZsIthNnsqDjEDCxdVmrk', 0, 0),
(212, '51afcbc91440895c', 'abtBiRoqmKcJbzkv', '2025-02-28 16:39:47', 'eIzSz7DUQf2Jek3M4y86lE:APA91bGaUjPp1BFGkDDXffs2oMlpkz1wpJ47nRCkPRbKhVaEv4QUrHz6aEthH3HG7KRpCopYPP2YkDgPwvmQuSSyqXm1sXEO_pNTnpp5549HaPU2Jz9XJy0', 0, 0),
(213, 'eb96cca86611124d', 'nWjpGveNad1pjAm', '2025-02-28 16:41:39', 'f0wou--dSpif_cWigU2h8J:APA91bF9I2bp7kWQqxx9FdjzGqwFMqugu-6IU0ANvjxGdeus4ry6XHn4kARFnpJxh7VdjMrFBSK53IjDMMV-D1ivn5lbQJOwqaBqLIYOLuyyTJTCGx1oKis', 1, 0),
(214, '51afcbc91440895c', 'e1n64H12HEIU0rfW', '2025-02-28 19:13:09', 'fT9dCtCcStiXZyUTIaF2mF:APA91bHMlRvlLj3bysP7MgG6HmJ3jpvRG2pXX0hLF2NS7PdtuRUAT2cTHQ-vcuv6xLHFtRVBFQz1NiD_pSyWzjT_lpuzOiaStgvQ1BfJekfJY0kc84yQoy4', 0, 0),
(215, '51afcbc91440895c', 'TjHpRWQHkEXhOjjI', '2025-03-01 15:46:52', 'cPG4lkIIS_KrLBZ-qT2PiG:APA91bE_mOtDKokJdWicQYC0Xc8m01NfbyRmgVUHJJrUKRkQeHlKJdfokxF7lD_e92KXFV25g0F-jvDV3v1MjWwmwTEm8bPPCKaseQ_2yzexMDUYVuM2qkI', 0, 0),
(216, 'abcdfc', 'abtBiRoqnbhjs', '2025-03-01 15:48:24', 'eIzSz7DUQf2Jek3M4y86lE:APA91bGaUjPp1BFGkDDXffs2oMlpkz1wpJ47nRCkPRbKhVaEv4QUrHz6aEthH3HG7KRpCopYPP2YkDgPwvmQuSSyqXm1sXEO_pNTnpp5549HaPU2Jz9XJy0', 1, 0),
(217, '96b7ada2bded2c72', '8aholcRJcFkAjdW0', '2025-03-01 16:25:19', 'e0p8tGxsQr2NUCdR2wHeH8:APA91bHx7sk2UAvrSy5pF8ZxxL7yiQdIQIKR0pQBhDXIXGl1pbUO4UlAMKqTcaEaG9Pe-dDiLS_mkkJPfWMYtLSuVpH8YWRl_3a8jAxrYJIJxhO2qoWx-Ak', 0, 0),
(218, '51afcbc91440895c', '0KKsmek5zv0oRVqY', '2025-03-03 12:13:04', 'cS0W-3XET4Shb8hGj1kpEX:APA91bF5Gi0NdI4xuWKDiIjqvmwryffc61qsy1Wti2Q3YsHyICpUsZyjuevZsUX7h7hnFGwHqVLXrSJ-zVv4jA2crQKQ7_exz5HrEgq4Y5zbXLa__M7-YV8', 0, 0),
(219, '51afcbc91440895c', 'tEO1rjpZuZiZFIYl', '2025-03-03 12:13:42', 'cS0W-3XET4Shb8hGj1kpEX:APA91bF5Gi0NdI4xuWKDiIjqvmwryffc61qsy1Wti2Q3YsHyICpUsZyjuevZsUX7h7hnFGwHqVLXrSJ-zVv4jA2crQKQ7_exz5HrEgq4Y5zbXLa__M7-YV8', 0, 0),
(220, '96b7ada2bded2c72', '70DKhwq3NK0p34P1', '2025-03-04 15:32:51', 'cev3ahNBQ-a62ktG1YI845:APA91bEftt29Ms3Enx8tNHAm5fRTbZMxAiH5IBKpfP6ySZyBefdXZh6NfLzWZVlbYQbgr4-GW4mNhKkAaPPg7M_QzljGBvicQepDt2ayjaJanGIx2Xd0dh0', 0, 0),
(221, 'f5d624034b8272b9', 'ThpRkFd16pXxJqJg', '2025-03-04 16:26:04', 'cTFXVEomRoK391TJNrKtTc:APA91bGONC7SHZIQHBx8kBcqA-cMxlnTdkAShAsdD-ziSogP1gU4iSioyLr4kJEOqYVJsRoeXrINey9FRXNTJqRmB3Bg4yF44O4okY-vn3bpqnOnhDgXWGM', 1, 0),
(224, '96b7ada2bded2c72', 'nlJ6pGSrmscvqz8o', '2025-03-04 19:12:02', 'c7GtYlePTkmXlxKuUBawXW:APA91bGURXnJD8cbjaF3IFZfrp7G8SuXoS87_Ei4HKvp-tU9mOpSnLtN1yuKVCNk3vyhLRprxP5ByMYHdVsElfkNg0BgFhy4jd7TKq6H8zpoUTYcQcI4CRM', 0, 0),
(225, '96b7ada2bded2c72', '5i1wu0B3lEeUpJl', '2025-03-04 19:13:53', 'c7GtYlePTkmXlxKuUBawXW:APA91bGURXnJD8cbjaF3IFZfrp7G8SuXoS87_Ei4HKvp-tU9mOpSnLtN1yuKVCNk3vyhLRprxP5ByMYHdVsElfkNg0BgFhy4jd7TKq6H8zpoUTYcQcI4CRM', 0, 0),
(226, '96b7ada2bded2c72', '5DEaJjLItNGW6kCa', '2025-03-05 13:31:25', 'dBTm74ddTfSKgEmu3bUGsn:APA91bFJ0lKAUJPYQlpqmjrLr299-Tl1Q1ly7oOMT42EDQ1CoChEkQdaumgxQKUFCjn7v5IfIArnN70a0hYfW-l71M0k1qls05Fn-A8BRV8MFXIrZGjPhc0', 0, 0),
(227, '51afcbc91440895c', 'enbwbuRnTdq9tf0w', '2025-03-06 12:48:40', 'dKCO6dzoSEKzbOXoBbxq1S:APA91bE2w0BlgW063WgXsm-14B0laVMSuWHUqg_QMuEpkAOMFI5bTxgrdLBg3NiEPqTdkOrxNMrFKB-q658Q55ZGAMHD3sJHvdiC3pD3ja-GNYtSa4E4IV4', 1, 1),
(228, '38c69b0f6d0c4084', 'clqi81CRl2MbRReg', '2025-03-06 12:50:05', 'c2x_dvX7ToWwdKqPgKXfSJ:APA91bFrgJTEFez623qO1ApfMGgjNq1FAqPs-PvkFmbpv_NOlnK0zAV4IsyhN_UiESTQQS1P0zThfSVuNJBNMSsYkPdfhwTuy6-I7IlLbAjqayUb14F7XMc', 1, 0),
(229, 'e2851a2da07e645e', 'PBlDfGhry9hoXcdK', '2025-03-06 19:37:00', 'dB3bK2elRLeRLjSDb2-E3A:APA91bFege284wD14iavRESEqOBlhjoZLawA4aoxVF5AxJ_GX-NHb5EhpnBRb54AEaBngEADwuxvDlpd-vebCbyDNuebinohRmet2HFTwS_aI6jWnIwItBY', 0, 0),
(230, '96b7ada2bded2c72', '3vPfDSFc3qFAIeU', '2025-03-07 12:33:26', 'dbldLZoxSXam8weJvufdYU:APA91bEcHQ2KsLQI1O8qAvPo28Pn4Knx0-338F_efD5dIN9eAgp3PdAS5mr3rRWbEK1fB_5YeJvQWt1a3Wg0nRPDVEp-OYJiyW25_3-V15wDYjtp9DV7dfY', 0, 0),
(231, 'd5abc35bf85c100e', '2XxT28i7RpepVtzC', '2025-03-07 13:23:24', 'fs3ye5sUQjmDFKgpUeZk4M:APA91bGETLgrPqgkjia_uMVzT1meaGJoNpO3cYKTC_D-ueV4fONEmzFUuS8MNjA_0VInRwi4C-xQSOqFRYzzlTGpj833iQtmhOljTK_s94Okjfl4Sp8GDpY', 1, 0),
(232, '96b7ada2bded2c72', 'MdhwGbyBENeYZY7q', '2025-03-07 16:38:10', 'd7H_JrI_R7W3P5-QJukZir:APA91bHxYIUsxYEx3fXkW7J5iCDo76pXfZDeR-WesFG5cjuqIY2SHcfdFlHZV82CWB41LD7T7MedYF0KqZHLNd3M9HIXTjq4am8cD9ekwtbq4iv0GzymHRE', 0, 0),
(234, '96b7ada2bded2c72', '3vPfDSFc3qFAIeU', '2025-03-07 17:59:25', 'dbldLZoxSXam8weJvufdYU:APA91bEcHQ2KsLQI1O8qAvPo28Pn4Knx0-338F_efD5dIN9eAgp3PdAS5mr3rRWbEK1fB_5YeJvQWt1a3Wg0nRPDVEp-OYJiyW25_3-V15wDYjtp9DV7dfY', 0, 0),
(235, '96b7ada2bded2c72', 'Zz6GzaNmcvi1742q', '2025-03-07 18:03:08', 'ejxKC8cDSGy0Ff4UC0zdcB:APA91bFRktdAxkMr4fR4ha9H7KKSHceGcq5KZ2TsF_9nBy65sryYPE_wK_SrffAStA8HL5ya8h3_FPw1eOkytsHKVVMzzal0AH8yjXJFyUIYkFopj3Vx--I', 0, 0),
(236, '96b7ada2bded2c72', 'udbNtwsrfxqYZHZEY', '2025-03-11 14:33:52', 'cX4emMOgTLKEToTKq4cmtG:APA91bEHQb2mgl5pQw1pe3ZTPySY0TDHm2tUIJM_NO9c4JfCUDRF6PkBA5gUZEOuyvZyXZGoTdQb-E_K7Xg0E3vt11VG0jOnzsvjVlIXQWXLJGQH3IkxmRU', 0, 0),
(237, '96b7ada2bded2c72', 'Zz6GzaNmcvi1742q', '2025-03-11 16:23:09', 'ejxKC8cDSGy0Ff4UC0zdcB:APA91bFRktdAxkMr4fR4ha9H7KKSHceGcq5KZ2TsF_9nBy65sryYPE_wK_SrffAStA8HL5ya8h3_FPw1eOkytsHKVVMzzal0AH8yjXJFyUIYkFopj3Vx--I', 0, 0),
(238, '96b7ada2bded2c72', 'Zz6GzaNmcvi1742q', '2025-03-11 16:24:57', 'ejxKC8cDSGy0Ff4UC0zdcB:APA91bFRktdAxkMr4fR4ha9H7KKSHceGcq5KZ2TsF_9nBy65sryYPE_wK_SrffAStA8HL5ya8h3_FPw1eOkytsHKVVMzzal0AH8yjXJFyUIYkFopj3Vx--I', 0, 0),
(239, '96b7ada2bded2c72', 'udbNtwsrfxqYZHZEY', '2025-03-11 16:28:02', 'cX4emMOgTLKEToTKq4cmtG:APA91bEHQb2mgl5pQw1pe3ZTPySY0TDHm2tUIJM_NO9c4JfCUDRF6PkBA5gUZEOuyvZyXZGoTdQb-E_K7Xg0E3vt11VG0jOnzsvjVlIXQWXLJGQH3IkxmRU', 0, 0),
(240, '96b7ada2bded2c72', 'Zz6GzaNmcvi1742q', '2025-03-11 16:42:30', 'ejxKC8cDSGy0Ff4UC0zdcB:APA91bFRktdAxkMr4fR4ha9H7KKSHceGcq5KZ2TsF_9nBy65sryYPE_wK_SrffAStA8HL5ya8h3_FPw1eOkytsHKVVMzzal0AH8yjXJFyUIYkFopj3Vx--I', 0, 0),
(241, 'e2851a2da07e645e', 'oAGXs0ksbsT7m3B', '2025-03-12 12:53:25', 'dTKVKWUtRl-f7JCrYhFA_z:APA91bGnA2NkLuxy7cnihGv1daWPD4cZ7TQqVbcAOtiYVBNgANBL_l_48jaZIcnysnrR6c83cbXjhSK6GbMcXu2dDrFw7yBoccrry7l2xHhhZVlHivIgFdY', 0, 0),
(242, 'e2851a2da07e645e', 'tLNbPbAOZxPbnLO0', '2025-03-12 15:36:19', 'fD5pviMCQe21USaArIJsyQ:APA91bFyYmoDfIduSb-7EvX0wjx60En6CEczqU8CrmjULwFf0HGdsrXJfuVHK7QNxi5moxN3x10LsGMgYDuT1e3IfvKIV1h3jD3xcLBwTyk62xAIQCEGWGU', 1, 0),
(243, '96b7ada2bded2c72', 'BBShwnPxTZ3XQDhA', '2025-03-12 17:04:27', 'ceSv8M6uSJOa1ZvK47Y-Jd:APA91bGn7gCpyuJdU9iFwit33OqkafxIxwioYRwfjf2RPrQAeTSYQMBz-EQemWsSoSHrmjZoOLF-kr45LZWiWHRHv_YXllIkvJc7mof253Wdu8P_ZyydzxY', 0, 0),
(244, '96b7ada2bded2c72', 'BHXQiNy139w1X3N', '2025-03-13 12:53:09', 'cOzS7dOcSUySDYsm_6sG-T:APA91bH4zgbx_1olKNmbnzgArIqCTb0mISRuZIIjee2vuZ5BS9-GtAfHymvX6rkohpZl_yXzwAnzDMwEw3hdc7G9oxMkR5gRMPGR1_FtDWpozL3M0j03_zE', 0, 0),
(245, '96b7ada2bded2c72', 'aGY0SRa5PtqSQX', '2025-03-13 13:09:20', 'ff4NvddzQXa_Eq7pHkIG74:APA91bEPyHIvFYfKKSAvareeNaAFrOhpnBmFJLUGQ9Q7grjenchelcGp0bw87Hh8HRdC1PqRICJSP26NSgiY8fAIVZBZ3gSjmbDAuEhGL754HeCPQynTjXQ', 0, 0),
(246, '96b7ada2bded2c72', '8FwNBqUZo0FOuHrb', '2025-03-13 15:00:31', 'fxzaVLyvQHOl1PFxRXN9h-:APA91bF-qxfI5-SHyAMiOLN7OEgnQvKubTPoG4ou0iRXPUKgIwg4C_NP5-TiTgtAqw4dnvEepL6_WLIWu3rpJH07ZDKq4saW0hd2S1RYxKl_HFkQb2tc56o', 0, 0),
(247, '96b7ada2bded2c72', '8FwNBqUZo0FOuHrb', '2025-03-13 16:59:46', 'fxzaVLyvQHOl1PFxRXN9h-:APA91bF-qxfI5-SHyAMiOLN7OEgnQvKubTPoG4ou0iRXPUKgIwg4C_NP5-TiTgtAqw4dnvEepL6_WLIWu3rpJH07ZDKq4saW0hd2S1RYxKl_HFkQb2tc56o', 0, 0),
(248, '6eba948042dec281', 'HVvEHMnqgj8lHALl', '2025-03-17 12:33:28', 'fByILRn0QOuhmq_qP_hJAb:APA91bHq4F65UvSLvNR2CoH0YIRLFMWuedMCNF0a1FUc-E_GAeeMA47XMe45Pp1d4sxCjTeENNvq4ZIRjGqYoouwvZFQjI9ov-rqvFF8zAcdndCQUIrc4y4', 0, 0),
(249, '6eba948042dec281', 'CqxtBvoNOeyGfyUg', '2025-03-17 18:48:10', 'fLE2DSIGS-aMLiLpts_F3l:APA91bGynopTIs5uEF1Ac2aOqn3XW8KwjpUq3TT2nFCd-DWFUeby6nuyGuuQCrEHHJVqPdbf5GTQ5GYpyHrjtoFkZbL5O8VBQTd1Bwpj1avOxZlzD5uuvPU', 0, 0),
(250, '6eba948042dec281', 'NzJsPvG2en3n0mt', '2025-03-18 11:59:31', 'c_2kINCOTsqwzlRCOZK94m:APA91bGJP5LEkmORkerpBENwvN2C0Y0rBg3X_csHpz9AM1HmdRZDOXb0jKrdQqzyIbuv1qfhO3F2RHSQOZE7VSumvWHoiirxQs00lQc_80l0EGLYMHz7E6E', 0, 0),
(251, '6eba948042dec281', 'CSq4PDHpHA2iE9Ws', '2025-03-18 17:31:33', 'e1Yd4UezRx-Lo5GPZ_57rB:APA91bEVqA9gnjTRGHlpFYjeCvdCnLsG9YqXkFm4ctRn56z_jYbiE9053-_SP0wulSlSTcSYj2HiblT2lDRwpI6_8GTkihC_DkFUjmS1cpT9TB7g1Ok0Dhs', 0, 0),
(252, '6eba948042dec281', 'HuMaZ2E7lq0psLYX', '2025-03-20 11:48:04', 'eoi9Lo-0QECFi__RSMPA2-:APA91bHpGKK3Qd1hvNAzRYbKRo4JqfalbroENkl75C8IKg1y04d_Jvu6NR_9z1oBLug0L_EMkifbDR5cSgsZz5kxroluDNWQpphBBrbSZnicO3zc9Vt1YMY', 0, 0),
(253, '96b7ada2bded2c72', '8FwNBqUZo0FOuHrb', '2025-03-20 16:42:39', 'fxzaVLyvQHOl1PFxRXN9h-:APA91bF-qxfI5-SHyAMiOLN7OEgnQvKubTPoG4ou0iRXPUKgIwg4C_NP5-TiTgtAqw4dnvEepL6_WLIWu3rpJH07ZDKq4saW0hd2S1RYxKl_HFkQb2tc56o', 0, 0),
(254, '8e7f32b2afdb4522', 'tpnmsvdppY3VZg2J', '2025-03-20 17:29:17', 'e8cGVYruTH6CsO8pe0uIcL:APA91bHfz6SWY3H7NjY33vN6ETsh0bXoU7rHyy5QHtRcNIm2mj4Ss_UiDh2ft5IKB1m4aQBgotcFS9EHsWeeieSLW4YUwylkxuQXzIaDWZxE_SsScHcf4OE', 1, 0),
(255, '6eba948042dec281', 'lG6btJupXg1jfA0z', '2025-03-21 11:33:17', 'eTOBPEcGSyqKckNK7ztzes:APA91bE5xwWNkQEy4gz7AyM6lYMu24Vy04eScU1Ub5L-JvgY8_lGYVG5z6hawPhON3OjXLwjZdHZBfzIpNVQ6HyzHe1Td7boSVsOJjXRpJx_XTuxtGvtLlU', 0, 0),
(256, '56b624f6b61fcc51', 'lbxGEhasRtEBvBpo', '2025-03-21 15:25:12', 'fu85WqpsR-mEGyno8-vFcD:APA91bGR_maaM13HVnu8K6vhUDppOBx6xgHLmZKZkZObNZFJCEr0XdS7QupXW5CdPLcDg1yzyN-X4Dab10TbC4VbN7MTHIyRsiMN-F5-5eUqxPB8O3XeHjY', 1, 0),
(257, 'string', 'string', '2025-03-21 16:16:08', 'string', 1, 0),
(258, '96b7ada2bded2c72', 'udbNtwsrfxqYZHZEY', '2025-03-21 17:23:29', 'cX4emMOgTLKEToTKq4cmtG:APA91bEHQb2mgl5pQw1pe3ZTPySY0TDHm2tUIJM_NO9c4JfCUDRF6PkBA5gUZEOuyvZyXZGoTdQb-E_K7Xg0E3vt11VG0jOnzsvjVlIXQWXLJGQH3IkxmRU', 0, 0),
(259, '6eba948042dec281', 'mNMJUKawBgjiCe4p', '2025-03-24 11:45:17', 'd8EF6wpZRAiy2SNMKOkCzL:APA91bGyDJEuaOr6IFXVsvjZUnZWufNUr26LMsu1JXeylHE5MK2MkMcLd2W9VdeMQcUgP8xgFwQ0WM2tAwR1h2QXYPnVBuY0evvwwalrkQKW8a2wmg2D-wQ', 0, 0),
(260, '6eba948042dec281', 'KbhV5Cymz7ZjUX6', '2025-03-24 11:55:04', 'c05OQ1PGSoqEHnGYVnP3pp:APA91bHAS88PK36tmKUvveDGDsHf7lkb9jDn5B-msMH7571DoDePCCxJKYo5tzOb792lXnraGrztedfjoRN5KGSkt1kpRfgCWRijUc63LfMtSgZuTARYNds', 0, 0),
(261, '6eba948042dec281', 'uy18LUEaJNcVfcc', '2025-03-24 15:21:35', 'cIE2D8grTrWbvsL58srk63:APA91bFYickK1P-QrsCoxfki9-x_t0B7jgpM_HjBDneuXbhj3ceXPYjAZYOGt8MQaZQeD1aYDoMc1M-EtA_4znCPY-wH4PKdFgv2nHg64889b_rhw0LM45g', 0, 0),
(262, '6eba948042dec281', 'VEXIAcJbppFbMJ', '2025-03-25 11:30:35', 'dr22_q7FS1OCS6pR78QlB-:APA91bGNqGYPl91evDd7tX5_VBi3RkwEEiCFpn3kt19TJaf95oU0hrPxkaDOSkrc_VOeda2DEpErwVeqBjUT_XN1tsJE9M1E2p3E4W6Ayattyt6lUzGhhfc', 0, 0),
(263, '6eba948042dec281', 'iM9f4dKhE0n2FeOf', '2025-03-25 16:48:43', 'chcGnsShQOKsJYzc2T_xDb:APA91bEyftVqT0IWY7ni10eHIevT8XxoKlz0gja1UzUc0Rj_XkGaEILcykrzAwpLo39MMOl1GTDI3eBqm2p_vbsf17q47jtO6rYQ90k3gOOnzIMNwd4CWpI', 1, 0),
(264, '96b7ada2bded2c72', 's6iUd0ykhcLnqo', '2025-03-26 12:01:07', 'eaPei2btSbOgixdn-AZce2:APA91bG_GIvCT8425SwZib0L9rW9VLeyTO46tnXP5FCyloRUVRRfpz2Kf8xMDAfMwfJYFMTM-l5ayGv4vsj-kSpe-36VfXX4ngXWLYe_ef2bs8emo1hC4WI', 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `rango_blockchains`
--

CREATE TABLE `rango_blockchains` (
  `id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `default_decimals` int NOT NULL,
  `type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `chain_id` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `logo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `display_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `short_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `info` json NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `rango_blockchains`
--

INSERT INTO `rango_blockchains` (`id`, `name`, `default_decimals`, `type`, `chain_id`, `logo`, `display_name`, `short_name`, `info`) VALUES
(1, 'ETH', 18, 'EVM', '0x1', 'https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/ETH/icon.svg', 'Ethereum', 'ETH', '{\"rpcUrls\": [\"https://rpc.ankr.com/eth\"], \"infoType\": \"EvmMetaInfo\", \"chainName\": \"Ethereum Mainnet\", \"addressUrl\": \"https://etherscan.io/address/{wallet}\", \"enableGasV2\": true, \"nativeCurrency\": {\"name\": \"ETH\", \"symbol\": \"ETH\", \"decimals\": 18}, \"transactionUrl\": \"https://etherscan.io/tx/{txHash}\", \"blockExplorerUrls\": [\"https://etherscan.io\"]}'),
(2, 'BSC', 18, 'EVM', '0x38', 'https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/BSC/icon.svg', 'BNB Smart Chain', 'BSC', '{\"rpcUrls\": [\"https://bsc-dataseed1.ninicoin.io\"], \"infoType\": \"EvmMetaInfo\", \"chainName\": \"Binance Smart Chain Mainnet\", \"addressUrl\": \"https://bscscan.com/address/{wallet}\", \"enableGasV2\": false, \"nativeCurrency\": {\"name\": \"BNB\", \"symbol\": \"BNB\", \"decimals\": 18}, \"transactionUrl\": \"https://bscscan.com/tx/{txHash}\", \"blockExplorerUrls\": [\"https://bscscan.com\"]}'),
(3, 'ETH', 18, 'EVM', '0x1', 'https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/ETH/icon.svg', 'Ethereum', 'ETH', '{\"rpcUrls\": [\"https://rpc.ankr.com/eth\"], \"infoType\": \"EvmMetaInfo\", \"chainName\": \"Ethereum Mainnet\", \"addressUrl\": \"https://etherscan.io/address/{wallet}\", \"enableGasV2\": true, \"nativeCurrency\": {\"name\": \"ETH\", \"symbol\": \"ETH\", \"decimals\": 18}, \"transactionUrl\": \"https://etherscan.io/tx/{txHash}\", \"blockExplorerUrls\": [\"https://etherscan.io\"]}'),
(4, 'BSC', 18, 'EVM', '0x38', 'https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/BSC/icon.svg', 'BNB Smart Chain', 'BSC', '{\"rpcUrls\": [\"https://bsc-dataseed1.ninicoin.io\"], \"infoType\": \"EvmMetaInfo\", \"chainName\": \"Binance Smart Chain Mainnet\", \"addressUrl\": \"https://bscscan.com/address/{wallet}\", \"enableGasV2\": false, \"nativeCurrency\": {\"name\": \"BNB\", \"symbol\": \"BNB\", \"decimals\": 18}, \"transactionUrl\": \"https://bscscan.com/tx/{txHash}\", \"blockExplorerUrls\": [\"https://bscscan.com\"]}'),
(5, 'ETH', 18, 'EVM', '0x1', 'https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/ETH/icon.svg', 'Ethereum', 'ETH', '{\"rpcUrls\": [\"https://rpc.ankr.com/eth\"], \"infoType\": \"EvmMetaInfo\", \"chainName\": \"Ethereum Mainnet\", \"addressUrl\": \"https://etherscan.io/address/{wallet}\", \"enableGasV2\": true, \"nativeCurrency\": {\"name\": \"ETH\", \"symbol\": \"ETH\", \"decimals\": 18}, \"transactionUrl\": \"https://etherscan.io/tx/{txHash}\", \"blockExplorerUrls\": [\"https://etherscan.io\"]}'),
(6, 'BSC', 18, 'EVM', '0x38', 'https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/BSC/icon.svg', 'BNB Smart Chain', 'BSC', '{\"rpcUrls\": [\"https://bsc-dataseed1.ninicoin.io\"], \"infoType\": \"EvmMetaInfo\", \"chainName\": \"Binance Smart Chain Mainnet\", \"addressUrl\": \"https://bscscan.com/address/{wallet}\", \"enableGasV2\": false, \"nativeCurrency\": {\"name\": \"BNB\", \"symbol\": \"BNB\", \"decimals\": 18}, \"transactionUrl\": \"https://bscscan.com/tx/{txHash}\", \"blockExplorerUrls\": [\"https://bscscan.com\"]}'),
(7, 'BTC', 8, 'TRANSFER', NULL, 'https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/BTC/icon.svg', 'Bitcoin', 'BTC', '{\"infoType\": \"TransferMetaInfo\", \"addressUrl\": \"https://www.blockchain.com/btc/address/{wallet}\", \"transactionUrl\": \"https://www.blockchain.com/btc/tx/{txHash}\", \"blockExplorerUrls\": [\"https://www.blockchain.com/btc/\"]}'),
(8, 'SOLANA', 9, 'SOLANA', 'mainnet-beta', 'https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/SOLANA/icon.svg', 'Solana', 'Solana', '{\"infoType\": \"SolanaMetaInfo\", \"addressUrl\": \"https://solscan.io/account/{wallet}\", \"transactionUrl\": \"https://solscan.io/tx/{txHash}\", \"blockExplorerUrls\": [\"https://solscan.io/\"]}'),
(9, 'BNB', 8, 'COSMOS', NULL, 'https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/BNB/icon.svg', 'Binance Chain', 'BNB', 'null');

-- --------------------------------------------------------

--
-- Table structure for table `token`
--

CREATE TABLE `token` (
  `id` int NOT NULL,
  `id_address` int NOT NULL,
  `tokenname` varchar(45) NOT NULL,
  `decimals` varchar(45) NOT NULL,
  `tokenAccount` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int NOT NULL,
  `type` varchar(15) NOT NULL,
  `chain` varchar(5) NOT NULL,
  `token` varchar(5) NOT NULL,
  `address_id` int DEFAULT NULL,
  `from_address` varchar(512) NOT NULL,
  `destination_address` varchar(512) NOT NULL,
  `amount` varchar(512) NOT NULL,
  `tx` varchar(1024) NOT NULL,
  `data_insert` datetime NOT NULL,
  `block_number` int DEFAULT NULL,
  `id_utente` int NOT NULL,
  `network_type` varchar(255) NOT NULL,
  `wallet_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `type`, `chain`, `token`, `address_id`, `from_address`, `destination_address`, `amount`, `tx`, `data_insert`, `block_number`, `id_utente`, `network_type`, `wallet_id`) VALUES
(1, 'COIN', 'BTC', 'BTC', 189, 'mmFPovZLg82M7aGofEkm1ujtN3fFTAgtQh', '8hjy7a44m6gc0hpffa6pslgwwf3jdgtz46tursul', '0', 'tb1qk35a44m6gc0hpffa6pslgwwf3jdgtz46tur6ty', '2024-08-30 21:10:44', 12304, 191, 'MAINNET', 63),
(2, 'COIN', 'BNB', 'BNB', 189, 'mmFPovZLg82M7aGofEkm1ujtN3fFTAgtQh', '0x6b08ca1b43ff3c817679b31169fae85ec4857eac', '0.00001', '0xb19082d251be03ae2a0eff8a8ab084e3562eddd8fa1ff1d5ea05b57342aea866', '2025-02-12 13:31:53', NULL, 191, 'TESTNET', 70),
(13, 'COIN', 'SOL', 'SOL', 188, 'CgoNT8Cq2od7PDstDE7sqTrvnv41UrPsEpMz7N83tWtg', '0x6b08ca1b43ff3c817679b31169fae85ec4857eac', '0.0001', '3DSd41KQPbH3nQMBAuWrjMxN1beKE1N2RYb7Ry319ADaymSYYW9E3JmzJMMMg8nRaBqCxQ9BLDV4t4yejXJmwNfi', '2025-01-12 19:15:00', NULL, 191, 'TESTNET', 70),
(14, 'COIN', 'ETH', 'ETH', 188, 'CgoNT8Cq2od7PDstDE7sqTrvnv41UrPsEpMz7N83tWtg', '0x0d076b0d109574d06b9cd8419c5710e827e03809', '0.00001', '0x26ef4a4cef13311e3bc23fdbf85ba7ab0fa41ba7c42325eca14fc4fcfe501d85', '2025-01-09 19:05:46', NULL, 191, 'TESTNET', 63),
(15, 'COIN', 'ETH', 'ETH', 187, '0x6b08ca1b43ff3c817679b31169fae85ec4857eac', 'mmFPovZLg82M7aGofEkm1ujtN3fFTAgtQh', '0.00001', '0x58bb576a264231a98aac18dad98043b8911ac6496e80952f1a8ae89762b27989', '2024-09-03 19:07:49', NULL, 191, 'TESTNET', 63),
(16, 'COIN', 'ETH', 'ETH', 187, '0x6b08ca1b43ff3c817679b31169fae85ec4857eac', '0x0d076b0d109574d06b9cd8419c5710e827e03809', '0.00001', '0xfd404d818eb246ba7d7790acc3440498f3f7fefe2bcb01bdb65e168ab60e842c', '2024-09-03 19:10:38', NULL, 191, 'TESTNET', 70),
(17, 'COIN', 'ETH', 'ETH', 187, '0x6b08ca1b43ff3c817679b31169fae85ec4857eac', 'mt86rNfisPu9qFdhqpRo7w8dQa3ups7TRB', '0.0001', '0x525626858685c381250e3394b713a9a30b87588f5082c40db005e672e9c139f6', '2024-09-03 19:13:39', NULL, 191, 'TESTNET', 70),
(18, 'COIN', 'BNB', 'BNB', 186, '0xf430fc5b609cc6461a15191d9d94166b1105a2ba', 'mt86rNfisPu9qFdhqpRo7w8dQa3ups7TRB', '0.000001', '0x4ef5ad2a795a2ea1630ec8760326fe00f40b4c2923f24c80fdd0d55a8b1fb27e', '2024-09-03 19:25:56', NULL, 191, 'TESTNET', 70),
(19, 'COIN', 'ETH', 'ETH', 186, '0xf430fc5b609cc6461a15191d9d94166b1105a2ba', 'mt86rNfisPu9qFdhqpRo7w8dQa3ups7TRB', '0.001', '0x062d236ccc044f68194a04008e98c3823271dc26160a4db9ae9303f9ecfc7bf6', '2024-09-20 20:35:59', 2913059, 191, 'TESTNET', 70),
(20, 'COIN', 'ETH', 'ETH', 186, '0xf430fc5b609cc6461a15191d9d94166b1105a2ba', 'mt86rNfisPu9qFdhqpRo7w8dQa3ups7TRB', '0.05', '0xb64f0bdd393f73038bf8a06432ecac96f6307c94f84156a3eec10ef3a1b794c7', '2024-09-23 12:21:29', 6743697, 191, 'TESTNET', 70),
(26, 'COIN', 'ETH', 'ETH', 186, '0xf430fc5b609cc6461a15191d9d94166b1105a2ba', '0xe560ca09958bdb05b776676351114811ad101e47', '0.05', '0xffae22b6fddbdd4e1034c42d6f1f70c69c6096e0f6b4ab0d74b09c08148376f2', '2024-09-24 19:32:04', 6751452, 96, 'TESTNET', 70),
(45, 'COIN', 'ETH', 'ETH', 363, '0x6b350584508b83eba17c42b8c1631356955ccc', '0x0d076b0d109574d06b9cd8419c5710e82', '0.001', '0x062d236ccc044f68194a04008e98c3823271dc26160a4db9ae9303f9ecf', '2024-09-26 12:53:08', 2913059, 96, 'TESTNET', 63),
(55, 'COIN', 'ETH', 'ETH', 416, '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0x055ed104f913e754575d9e6412e213e3a7cbfd38', '0.0001', '0x53b0bd003145e6321b874baa52421d94e68c7563912ab2a87c5f02e7b90543df', '2024-10-15 12:21:01', NULL, 96, 'TESTNET', 63),
(57, 'COIN', 'ETH', 'ETH', 363, '0x6b350584508b83eba17c42b8c1631356955ccc22', '0x0d076b0d109574d06b9cd8419c5710e827e03809', '0.001', '0x062d236ccc044f68194a04008e98c3823271dc26160a4db9ae9303f9ecfc76', '2024-10-17 20:36:10', 2913059, 96, 'TESTNET', 63),
(59, 'COIN', 'ETH', 'ETH', 454, '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0.0001', '0x304a5fb507f6372f5da3d5ac0181587b83a0d0639d926be4571cc27d8b0b7154', '2024-10-25 13:06:42', NULL, 137, 'TESTNET', 63),
(60, 'COIN', 'ETH', 'ETH', 454, '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0.0001', '0x6dc18ece9e6036fae6d46f016cd547edd0d8cb775028ced378217490c69ce9ef', '2024-10-25 13:28:34', NULL, 137, 'TESTNET', 63),
(67, 'COIN', 'ETH', 'ETH', 454, '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0.0001', '0x2a2914ec6297c93ddf841358a2f18118b362a1489ee9610194ceb2287212e828', '2024-10-25 13:39:29', NULL, 137, 'TESTNET', 63),
(74, 'COIN', 'ETH', 'ETH', 454, '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0.0001', '0xe0636867393cf694ba53191986f83bbf53a6104cc340d061ec0521a97bcf67c6', '2024-10-25 13:42:34', NULL, 137, 'TESTNET', 70),
(79, 'COIN', 'ETH', 'ETH', 454, '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0.0001', '0x26c0c00e620b46f729849c2732a44981c9266f0a9cd2833cb4132210f937ec07', '2024-10-25 13:44:54', 6941458, 137, 'TESTNET', 70),
(85, 'COIN', 'ETH', 'ETH', 454, '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0.0001', '0x9f351c0e77e9b694c14ac1146ec7d19ec231958d60427f42bee1d50360ef284f', '2024-10-25 15:36:21', 6941986, 137, 'TESTNET', 63),
(89, 'COIN', 'ETH', 'ETH', 454, '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0.0001', '0xe480173e6a8415a3ab2283dbc5d861fcc36731740ade95a01a432eac5406e7fa', '2024-10-25 15:55:55', 6942080, 137, 'TESTNET', 63),
(93, 'COIN', 'ETH', 'ETH', 459, '0xcc8d0e019e9cb3ca769fd561d2daf77a9fe75d1d', '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0.0001', '0xb35543f3d695804f417d47a5532a1b8294f6bb3b44c77b56a381b7d859e963bc', '2024-10-25 16:36:24', 6942268, 136, 'TESTNET', 70),
(97, 'COIN', 'ETH', 'ETH', 467, '0x0deae8fe2f2c6c46ae61b72a11d5a9650e8dc5e9', '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0.001', '0x263d438104c3a77751267cbbfe94e5dec34a65eead165a2061ed38ba1a465a92', '2024-10-25 18:06:10', 6942686, 136, 'TESTNET', 70),
(100, 'COIN', 'ETH', 'ETH', 293, '0x4b852ec317a7d0e5f6408be66ed14232290b3397', '0x66e365114f255dccf66186a28976eb98208a2fc2', '0.0001', '0xb3e174badc58d78dcdaabc48c68e7d835fcb9cf3c958155da89eaf2f012a6f42', '2025-03-03 18:53:13', NULL, 219, 'TESTNET', 88),
(101, 'COIN', 'BTC', 'BTC', 240, 'n1FiqwarjGPW9mpGHS3uSXcUHdRj6HYkYd', '8hjy7a44m6gc0hpffa6pslgwwf3jdgtz46tursul', '0', '0x307b577620fcd1d657ee3f05c6c58a4ac699e739fbe693ecb82c50a34f724d9c', '2025-03-24 15:50:50', 12304, 193, 'TESTNET', 77);

-- --------------------------------------------------------

--
-- Table structure for table `utenti`
--

CREATE TABLE `utenti` (
  `id` int NOT NULL,
  `nome` varchar(45) NOT NULL,
  `cognome` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `masternode` text NOT NULL,
  `privacy` tinyint NOT NULL DEFAULT '1',
  `termini` tinyint NOT NULL DEFAULT '1',
  `stato` int NOT NULL DEFAULT '1',
  `data_insert` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_update` datetime DEFAULT NULL,
  `data_delete` datetime DEFAULT NULL,
  `token_verifica` varchar(512) DEFAULT NULL,
  `twofa` tinyint NOT NULL DEFAULT '0',
  `totp` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `utenti`
--

INSERT INTO `utenti` (`id`, `nome`, `cognome`, `email`, `password`, `masternode`, `privacy`, `termini`, `stato`, `data_insert`, `data_update`, `data_delete`, `token_verifica`, `twofa`, `totp`) VALUES
(16, 'Marco', 'Casaburi', 'marcs842@gmail.com', '432316cfe7efa2c49fe82d3f45d79b52c11deec5', 'U2FsdGVkX1/gUQMKuuqjkDOHXHMsS+8zmkU4HEodGVR2tShYNKMsxoEF8ZoreOuK8gyHSqvaOKHllzDLootkcJ6Ni6Y+RfAu71LZ6gZCbLm3GzWA9vl4NjNkOKcwgbg43dA1Kk01+XZCQ1awMjPzPwMoDswhZxyvmvwVStBAojo=', 1, 1, 1, '2023-08-14 16:20:29', NULL, NULL, 'c5b52b7974983a5fd1137211f71488a3bffa6f3a', 0, NULL),
(17, 'Marco', 'Casaburi', 'marcs841@gmail.com', '432316cfe7efa2c49fe82d3f45d79b52c11deec5', 'U2FsdGVkX1/aTckZTfCpPkBOW+CaH68jmOgdPIgXCvYKRqW/l7MbW0CoZxOJfeEIsihVAzoLfgZ8yTR2zHQ+5wWls9Q8qXHghY39+SdR7OUROiHUpun1E/SWkY4GbJ1yHClj3iSANfMgPAxJ7XJi5oGbwuHDGiWibmA5hHSRlOQ=', 1, 1, 0, '2023-08-16 14:30:01', NULL, NULL, 'e7129698e804d7ca5540fb40281d0093226ddd2c', 0, NULL),
(22, 'Marco', 'Casaburi', 'marcs843@gmail.com', '432316cfe7efa2c49fe82d3f45d79b52c11deec5', 'U2FsdGVkX19vnMuSx318yZvbeUXkLwhSk1emkYq06wi0hKPaSj/RVJksRaVdP7wbv3zpSrxJ5Vk/Hz0qr0IKv/VAlf2JkiWCWR7tOXAJ32LTmklZnIXFe6PT8ech7Z2mWwJQ17QfGqr9ObxM+8sGkhmIGPuwdmun/Gb3muZ0cls=', 1, 1, 0, '2024-01-05 16:13:22', NULL, NULL, '372d3def29bc012e52c0831580b7a26c9ac288f3', 0, NULL),
(23, 'Marco', 'Casaburi', 'marcs844@gmail.com', '432316cfe7efa2c49fe82d3f45d79b52c11deec5', 'U2FsdGVkX18SQPyoWiltCiceQgEBrtmUaAywbnQwMjUigWK0O8UAqaGh9eNdYGqk7Q2gue2LNvcmHDX/VMnWc/rTi/2fzUov1vezhTnZzbpq3BxscKpjijJvvklJL+wCWJ//DsMvcb+pt25qnvO4LkfaKZjD3GUwxRRMlM6z5dY=', 1, 1, 1, '2024-01-05 16:21:29', NULL, NULL, 'fbeab15f4cc9c8037398c7dc05f2547856576663', 0, NULL),
(24, 'Marco', 'Casaburi', 'marcs845@gmail.com', '432316cfe7efa2c49fe82d3f45d79b52c11deec5', 'U2FsdGVkX18JFTxMVVjL0ibe/wB81kzAx09Rt6c+q6Ga100i1K8BN67bjLA3smEfo2ny5enjHyhhMCBvtpfCNRzSTWo9IcFUPNgtktPdgtaQAZgT4+H1+G13hWiH6w7Zd4g+fVT8Re+xuTQbTsd4d5XCOokyO6juCkfwbncGlk0=', 1, 1, 0, '2024-01-05 16:31:42', NULL, NULL, 'efefb9b091884f300aba5577d647e83858b5bcd2', 0, NULL),
(25, 'Atif', 'Siddiqui', 'marcs846@gmail.com', '7c4a8d09ca3762af61e59520943dc26494f8941b', 'U2FsdGVkX1++FqXgp+GZ+/QDh36IUFBjEgdxnjvHw2TLDh9CqlKYpVF+Gwk+VPtiHIrl+se2bO5HJljF4xEP4XZbdzDodGXyijGT3INjNnhHQUB5dr+sNPv9AtuaqlKVDL7Oy/SKDkhAmNf3+pX6ATbfQF0tVo44yKOKfD7P3aY=', 1, 1, 0, '2024-01-05 16:43:54', NULL, NULL, 'f86987d1a52e66a64bc66cca2fe391d653bfada9', 0, NULL),
(26, 'Atif', 'Siddiqui', 'marcs847@gmail.com', '7c4a8d09ca3762af61e59520943dc26494f8941b', 'U2FsdGVkX18VnhFmd8xaolt016Ugzssr6a0o+ikRrAWNX7ckVyplhJ5x982FpAQZFBu9CZar0yAyZdSMLsqUbX27H++MiBJT97b6JphsDwCxEpA2svYX6BOmD24KMjVYjeNJw6UAFr6N7b/gdllZBZGu6jKW73d46xCIO5Foxnw=', 1, 1, 0, '2024-01-05 17:35:43', NULL, NULL, '8eef16156b78d2442980c740b4511c65b27d1a85', 0, NULL),
(27, 'Atif', 'Siddiqui', 'marcs848@gmail.com', '4c8cf67498a447e2740c4fd5b29becc9a10cc4b9', 'U2FsdGVkX1+srWOtIuMA0QXm5XyHlTm2cTFr2rZnbp1qJ96rVEFmBIRc6aqbLWdrMV/O5DhIjL8t4E1b8BTdWxWu60USa4smyAVpxeOz4//YD+MorTyU5nHWpzBFwQaj21LFFyGvRC/9qGLEg0uccjbEIUA/cj0IVSnNdNHc7AI=', 1, 1, 1, '2024-01-05 17:37:25', NULL, NULL, 'c21841dd8eecb6d114a3812491e05cb69d3eb686', 0, NULL),
(28, 'Atif', 'Siddiqui', 'marcs849@gmail.com', '7c4a8d09ca3762af61e59520943dc26494f8941b', 'U2FsdGVkX19SSCTx0SC8E3d/JmvN2jm7RxmiSb0pLQnq5y+fKg0llqxDZRxWeB7LBLqpobKoqPOBV4AzcBM39QqDue0t2OlDIbP1/twNyPXKiuVV1lGrlE2Eaws51kA50gGEv+u7XVP2AKOTtUaHy+VZVJ+nWAc5BfSjjDCNqOw=', 1, 1, 0, '2024-01-05 18:23:02', NULL, NULL, 'b96011bd14d89ed31fe8598f3ae1edc0772df373', 0, NULL),
(29, 'Marco', 'Casaburi', 'marcs8410@gmail.com', '4c8cf67498a447e2740c4fd5b29becc9a10cc4b9', 'U2FsdGVkX18Qlx7rnJrTjiNKSHBD1nOTOLTgnrq5eYgyMkORaXdgbmPWdNCrCeD+9n4d1i7HrC00ZyOS6EbpU5KB/OmfUiKzCVp6jlpxbLvTX/JN/SZuf6yChk5hHQi6WzkxYE3Yx/pOg0GV2nGL1rzJQF9ueLaEyKSw8MjBUHU=', 1, 1, 1, '2024-01-05 18:30:28', NULL, NULL, 'fab9cefb2585d15eac1162b9939edb8f866cc70a', 0, NULL),
(30, 'Marco', 'Casaburi', 'marcs84@gmail.com', '4c8cf67498a447e2740c4fd5b29becc9a10cc4b9', 'U2FsdGVkX1+BLBAmTJC69iyqpTHsRZMOq9xbtUsIvxOX8x7TZGNKpVzxTY9w5DyTFdCXHdgiLZcw33wrgaalV77FlcRqlJb4dMYm7OPlachb+i9xCpBpbWLA7zHwnFyr2Tr2BkapY9q+zzUkJAvLv6Phnh8lWWjZyh2ysfArE3A=', 1, 1, 1, '2024-01-05 18:34:20', NULL, NULL, 'f9d692d301c8d924c792bef3579ba0aeb07e01e7', 0, NULL),
(43, 'Hemant', 'Kumar', 'hemant.5exceptions@gmail.com', '8cd7cca58330940d5af49139f256bd3c69fd5b90', 'U2FsdGVkX18Ev+93tP5tTdys97yy9cSDhpf8Gb/M2Ficsnu67iRJWQODeLLdAapCj5wwZBQz5OzW0iOY3fWi9JDRTvWWPSuL3j9bF3JObKPx4U+AbDzoyObKWhkTGNKOPLwJigvmbGQ3WTQweNz+3K1xUOIfD5GxYf9mNE5aTVA=', 1, 1, 1, '2024-07-25 17:18:50', NULL, NULL, '4437148cd29bbfe4f34d6f8323b1b904dd90394b', 0, NULL),
(44, 'Urvashi', 'D', 'urvashi.5exceptions@gmail.com', '8cd7cca58330940d5af49139f256bd3c69fd5b90', 'U2FsdGVkX1/dBZOebwzxEdB37/GvJjNygl1jhB0WiCZh6Far1II1aDqnD5o/N0MVz3D/qEUVIiFPm9j2kmeeWT8ULEbDbvO4GDttyc8IkUtPDi6jTW/qAMC+YcWzn7rAhZwMGccSabfaWZvQGYIzy5Kc3CIemC8kLVqjeW0YLyI=', 1, 1, 0, '2024-07-26 13:25:38', NULL, NULL, '8478372cb51d76dd678ad557eec5011c9cbe9cf0', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `wallet`
--

CREATE TABLE `wallet` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `wallet_type` enum('phone','hardware') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `device_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `wallet`
--

INSERT INTO `wallet` (`id`, `name`, `wallet_type`, `is_active`, `device_id`, `user_id`, `created_at`, `updated_at`) VALUES
(4, 'Wallet 1', 'phone', 1, 226, 226, '2025-03-05 09:59:31', '2025-03-05 09:59:31'),
(6, 'Wallet 5', 'phone', 0, 228, 228, '2025-03-06 07:20:41', '2025-03-06 07:20:41'),
(7, 'Wallet 6', 'phone', 1, 228, 228, '2025-03-06 07:24:53', '2025-03-06 07:24:53'),
(8, 'Wallet 1', 'phone', 1, 227, 227, '2025-03-06 07:32:08', '2025-03-06 07:32:08'),
(9, 'Wallet 1', 'phone', 1, 229, 229, '2025-03-06 14:08:01', '2025-03-06 14:08:01'),
(10, 'Wallet uuu', 'phone', 0, 230, 230, '2025-03-07 07:05:41', '2025-03-07 07:05:41'),
(11, 'Wallet 1', 'phone', 1, 231, 231, '2025-03-07 07:53:55', '2025-03-07 07:53:55'),
(12, 'my my', 'phone', 0, 230, 230, '2025-03-07 09:50:43', '2025-03-07 09:50:43'),
(13, 'Wallet 3', 'phone', 1, 230, 230, '2025-03-07 10:52:03', '2025-03-07 10:52:03'),
(16, 'Wallet 121', 'phone', 0, 235, 235, '2025-03-07 12:33:56', '2025-03-07 12:33:56'),
(17, 'Wallet 2', 'phone', 1, 235, 235, '2025-03-07 12:36:08', '2025-03-07 12:36:08'),
(18, 'Wallet 3', 'phone', 1, 240, 240, '2025-03-11 13:51:44', '2025-03-11 13:51:44'),
(19, 'Wallet 4', 'phone', 0, 240, 240, '2025-03-11 14:03:48', '2025-03-11 14:03:48'),
(20, 'Wallet 1', 'phone', 0, 241, 241, '2025-03-12 07:24:09', '2025-03-12 07:24:09'),
(21, 'Wallet 2', 'phone', 1, 241, 241, '2025-03-12 09:54:59', '2025-03-12 09:54:59'),
(22, 'Wallet 1', 'phone', 1, 243, 243, '2025-03-12 11:35:04', '2025-03-12 11:35:04'),
(23, 'Wallet 1', 'phone', 1, 221, 221, '2025-03-12 12:34:13', '2025-03-12 12:34:13'),
(24, 'Wallet 1', 'phone', 1, 244, 244, '2025-03-13 07:24:53', '2025-03-13 07:24:53'),
(25, 'Wallet 1', 'phone', 1, 246, 246, '2025-03-13 09:31:26', '2025-03-13 09:31:26'),
(26, 'Wallet 1', 'phone', 1, 248, 248, '2025-03-17 07:04:37', '2025-03-17 07:04:37'),
(27, 'Wallet 1', 'phone', 1, 249, 249, '2025-03-17 13:18:54', '2025-03-17 13:18:54'),
(28, 'Wallet 1', 'phone', 1, 250, 250, '2025-03-18 06:34:10', '2025-03-18 06:34:10'),
(29, 'Wallet 1', 'phone', 1, 251, 251, '2025-03-18 12:02:03', '2025-03-18 12:02:03'),
(30, 'Wallet 1', 'phone', 1, 252, 252, '2025-03-20 06:30:43', '2025-03-20 06:30:43'),
(31, 'Wallet 1', 'phone', 1, 254, 254, '2025-03-20 11:59:41', '2025-03-20 11:59:41'),
(32, 'Wallet 1', 'phone', 1, 255, 255, '2025-03-21 06:04:51', '2025-03-21 06:04:51'),
(33, 'Wallet 1', 'phone', 1, 256, 256, '2025-03-21 10:05:06', '2025-03-21 10:05:06'),
(34, 'Wallet 1', 'phone', 1, 259, 259, '2025-03-24 06:16:07', '2025-03-24 06:16:07'),
(35, 'Wallet 1', 'phone', 1, 260, 260, '2025-03-24 06:50:13', '2025-03-24 06:50:13'),
(36, 'Wallet 1', 'phone', 1, 261, 261, '2025-03-24 09:52:03', '2025-03-24 09:52:03'),
(37, 'Wallet 1', 'phone', 1, 262, 262, '2025-03-25 06:01:10', '2025-03-25 06:01:10'),
(38, 'Wallet 1', 'phone', 1, 263, 263, '2025-03-25 11:19:16', '2025-03-25 11:19:16'),
(39, 'Wallet 2', 'phone', 0, 263, 263, '2025-03-25 11:23:04', '2025-03-25 11:23:04'),
(40, 'Wallet u', 'phone', 1, 264, 264, '2025-03-26 14:39:01', '2025-03-26 14:39:01');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `device`
--
ALTER TABLE `device`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `rango_blockchains`
--
ALTER TABLE `rango_blockchains`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `utenti`
--
ALTER TABLE `utenti`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `wallet`
--
ALTER TABLE `wallet`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=451;

--
-- AUTO_INCREMENT for table `device`
--
ALTER TABLE `device`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=265;

--
-- AUTO_INCREMENT for table `rango_blockchains`
--
ALTER TABLE `rango_blockchains`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- AUTO_INCREMENT for table `utenti`
--
ALTER TABLE `utenti`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `wallet`
--
ALTER TABLE `wallet`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
