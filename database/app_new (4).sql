-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 03, 2025 at 06:44 PM
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
(294, 'ETH', '0x43c50dc76a75379e2322213ab9818afff407eb8d', 'abhishek', 219, 6, NULL, '2025-03-03 14:19:58', 'SYNCED', 'Active', 88);

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
  `is_active` tinyint NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `device`
--

INSERT INTO `device` (`id`, `identifier`, `passkey`, `date_insert`, `device_token`, `is_active`) VALUES
(40, 'QKQ1.19200.002', '0di1WXKbReprt6IkpXVCJ9', '2024-08-05 15:05:40', NULL, 1),
(41, 'SDQ1.15200.002', 'nhio1WXKbReprt6IkpXVCJ9', '2024-08-06 11:41:43', NULL, 1),
(42, 'S5Q1.15200.002', 'io1WXKbReprt6IkpXVCJ9', '2024-08-06 11:46:43', NULL, 1),
(43, 'S5Q2.15200.002', 'io1KbReprt6IkpXVCJ9', '2024-08-06 11:49:11', NULL, 1),
(44, 'Q122.10200.002', '1kd6grKbReprt6IkpXVCJ9', '2024-08-06 11:54:36', NULL, 1),
(57, 'QKQ1.14500.002', '0di1WXKbReprt6IkpXV', '2024-08-06 12:58:31', NULL, 1),
(83, 'TP1A.220224.015', 'DFqcuGhh8ENCPJln', '2024-08-22 15:44:49', NULL, 1),
(86, 'TP1A.220224.5', 'cuGhh8ENCPJln', '2024-08-22 17:03:52', NULL, 1),
(87, 'TP1A.224.5', 'chh8ENCPJln', '2024-08-22 17:06:26', NULL, 1),
(95, 'TP1A.0624.14', 'Gl9lhzYEmK0XC', '2024-08-29 19:51:24', NULL, 1),
(96, 'TP1A.220624.014', '2gCYZEsyRbBz5dt', '2024-08-30 12:16:18', NULL, 1),
(97, 'TP1A.0624.789', '9lhzYEmK0XC', '2024-08-30 13:46:26', NULL, 1),
(99, 'UQ1A.240205.002', 'fVHWrgJKumzqH1Q', '2024-09-04 11:55:23', NULL, 1),
(131, 'RKQ1.211119.001', '7Xn6Bw2qAcPlD1Kv4u', '2024-09-13 19:00:19', 'cb-cDwTkTPSvciOTIqXGtx:APA91bEY_D_WPbSgA4doZdNv5m9Eil8VM0_6ec2bc0DIaydllF7TWHX5o4O08o9X-TZTCmKTdHNAs5WtryWWwH4Q6BWbuh9ousIo7H_2d_dgFitEglUkmFI', 1),
(136, 'AP41.240823.009', '7Xn6Bw2qAcPlD1Kv4u', '2024-10-23 13:12:09', 'cBPyUiv_RgShxO2TtUuYEq:APA91bEU9Jtoh8R1frId4iUQ2MceNv6NHS5wmLNXpUJuesbQxhhTwIAIE9Ua0kcPWYW02XoGot-MZRKWJFaZbu4-I-oKgK4BGFqX7iH-KW-bxse72-KmgAI', 1),
(137, 'QP1A.190711.020', '7Xn6Bw2qAcPlD1Kv4u', '2024-10-23 13:21:50', 'dv__aesxR7iwM1P6HB1VyT:APA91bH4texG7upnb8TtbPkN6Zktm1rZYP0nmiUooEZAN_fWz8kjnGMexQiNOPUX3eMVs4e9RmfNQnhd-tdA520X6Vt5yByvbhlD71QrALkWCWOZ-MhM02Q', 1),
(138, 'UE1A.230829.036.A1', '7Xn6Bw2qAcPlD1Kv4u', '2024-10-28 18:21:00', 'c0qUDzaoSYGJTeUcy9szPD:APA91bEhOHoBtswPI1YkoKS8IpZNAnXduG9Zvly1OwytBsNxbyKO4Iob6KjDWd5KG5VJt83piQVMmKRWzSFollV_dQ9ZWw2qILFqOmJ28Fmsyi30ia0vUh8', 1),
(140, '265F387A-944A-4AA8-9FE7-3EC4C16EA03C', '7Xn6Bw2qAcPlD1Kv4u', '2024-10-31 16:03:29', 'fNh2GaM1FEqtpR900m3GTL:APA91bEtqZpZZWxIT_ZaBArGldK-9jZTaKbYac_k13mCdQa197uepQzs4R5LjYoJmOntPu6WsmykbBtX-wqNxyt3hOexVFNjW9mkAnz6yXHQ1jwuwiDadsg', 1),
(149, 'OSM1.180201.031', '7Xn6Bw2qAcPlD1Kv4u', '2024-12-03 23:41:31', 'crP_lZHrSU2eRZqNlTPP43:APA91bE6PQyhsxVBv8qz9r-5R6hUE3csdTE9MrvRw0uoyOh02Gkcr8Tx7FsisdscNMDqAzxprYCrvFQFkdgDd5p4T4LmHJERgYjxdxIeGifXUml4CwOpYJQ', 1),
(150, 'OPP28.85-19-4-2', '7Xn6Bw2qAcPlD1Kv4u', '2024-12-04 07:40:37', 'eofdAUztRpCgoMjz2kV_bK:APA91bFJwi6ntSoxdC1RH51H0YkyO1_I3Z9kFfbNLK8oeURGuZd_0I6ujqSt3ZqJcEO_EwzcaTxPGQxyGyz2T-En46jdwT4TupJwutLs86RPUrflcgnuj98', 1),
(155, 'TP1A.220624.015', '2gCYZEsyRbBz5du', '2025-01-03 18:59:29', NULL, 1),
(156, 'BP11.241121.010', '7Xn6Bw2qAcPlD1Kv4u', '2025-01-07 19:47:31', 'dpGbG6tbT964XCUVz9HTfq:APA91bHjLr3XNn4kXl-M8mVR-vZd60enxkkoBsqxRioqGne7XBVYfpBYErXTKdRDOjRqqjz6Df_7H84U6vlbuFIK5IGfYlRWl_6nTmvrMIlIEXNi47wHC-g', 1),
(162, 'QKQ1.190910.002', '7Xn6Bw2qAcPlD1Kv4u', '2025-01-30 16:15:23', 'dX6zzVDlRgSrHMp7AvpvQL:APA91bE7Sb1NlbPwspiiP7akCsJdXRFLdZQEr_GaIOPVSPnkfcwJJZ3bUn1Gjv8QkaqotFwk69bwaB-2D6F8IWKeXrG7OH2KxP3oTcwSf-pWCO_y62tfAt0', 1),
(187, 'TP1A.220905.001', '7Xn6Bw2qAcPlD1Kv4u', '2025-02-12 19:26:16', 'cO0egNviTI6KlnIEMUn6j7:APA91bGbv73cpAskU3Jql_jbWHtG0LDUf5A0cjb_4ntueF-eJrVrK6_O5SXPbOiMTEhtbq_tR8hKIdnSixxlAK2K4sfuQvbZhmUVN1gOANQ3Oti-zDUIO48', 1),
(191, 'UP1A.231005.007', '7Xn6Bw2qAcPlD1Kv4u', '2025-02-20 12:14:54', 'cpjFz_CXSdayYqwUQz16xM:APA91bGiYuGq7P8Rse75aFhFNmiCa3WABUp4XR9Bpy56U_pEeBqTAi7RU8kJR3AGsUqNJ0DUF3P9ZXNnyZPz4eP8JRbdCNtOKizB12BxS83xT9SG6vCIglU', 1),
(193, 'eb96cca86611124d', '4gC8LYBwHq4K4rPY', '2025-02-25 18:26:24', 'cRZfKwOZS12irBkh6AXIQe:APA91bFyyTA0qGMISvR9_5jV3ib_7UeL8BpQf2mNoHtAKJM5-vslTj1te6xYXAmTeSuLbs3k9ASbKdlDkYwMeWnaQ4VZnS8xlGs9Y2YbTBcEbM9J-K03t64', 0),
(198, 'f5d624034b8272b9', 'Hd1t2RquqB3fCKpX', '2025-02-26 11:46:27', 'dqsqTtPIRNWpWFmCcaIj3f:APA91bG_xvAAGqPVKimTwXyuE0PXWoa5XFSnOXC3G5AKj_HA_hckUvdLGzvMJ3mjQwkCaFFjHW4OtkroH9xHJBz2hvGjFZ7sZ90ZsIthNnsqDjEDCxdVmrk', 1),
(212, '51afcbc91440895c', 'abtBiRoqmKcJbzkv', '2025-02-28 16:39:47', 'eIzSz7DUQf2Jek3M4y86lE:APA91bGaUjPp1BFGkDDXffs2oMlpkz1wpJ47nRCkPRbKhVaEv4QUrHz6aEthH3HG7KRpCopYPP2YkDgPwvmQuSSyqXm1sXEO_pNTnpp5549HaPU2Jz9XJy0', 0),
(213, 'eb96cca86611124d', 'nWjpGveNad1pjAm', '2025-02-28 16:41:39', 'f0wou--dSpif_cWigU2h8J:APA91bF9I2bp7kWQqxx9FdjzGqwFMqugu-6IU0ANvjxGdeus4ry6XHn4kARFnpJxh7VdjMrFBSK53IjDMMV-D1ivn5lbQJOwqaBqLIYOLuyyTJTCGx1oKis', 1),
(214, '51afcbc91440895c', 'e1n64H12HEIU0rfW', '2025-02-28 19:13:09', 'fT9dCtCcStiXZyUTIaF2mF:APA91bHMlRvlLj3bysP7MgG6HmJ3jpvRG2pXX0hLF2NS7PdtuRUAT2cTHQ-vcuv6xLHFtRVBFQz1NiD_pSyWzjT_lpuzOiaStgvQ1BfJekfJY0kc84yQoy4', 0),
(215, '51afcbc91440895c', 'TjHpRWQHkEXhOjjI', '2025-03-01 15:46:52', 'cPG4lkIIS_KrLBZ-qT2PiG:APA91bE_mOtDKokJdWicQYC0Xc8m01NfbyRmgVUHJJrUKRkQeHlKJdfokxF7lD_e92KXFV25g0F-jvDV3v1MjWwmwTEm8bPPCKaseQ_2yzexMDUYVuM2qkI', 0),
(216, 'abcdfc', 'abtBiRoqnbhjs', '2025-03-01 15:48:24', 'eIzSz7DUQf2Jek3M4y86lE:APA91bGaUjPp1BFGkDDXffs2oMlpkz1wpJ47nRCkPRbKhVaEv4QUrHz6aEthH3HG7KRpCopYPP2YkDgPwvmQuSSyqXm1sXEO_pNTnpp5549HaPU2Jz9XJy0', 1),
(217, '96b7ada2bded2c72', '8aholcRJcFkAjdW0', '2025-03-01 16:25:19', 'e0p8tGxsQr2NUCdR2wHeH8:APA91bHx7sk2UAvrSy5pF8ZxxL7yiQdIQIKR0pQBhDXIXGl1pbUO4UlAMKqTcaEaG9Pe-dDiLS_mkkJPfWMYtLSuVpH8YWRl_3a8jAxrYJIJxhO2qoWx-Ak', 1),
(218, '51afcbc91440895c', '0KKsmek5zv0oRVqY', '2025-03-03 12:13:04', 'cS0W-3XET4Shb8hGj1kpEX:APA91bF5Gi0NdI4xuWKDiIjqvmwryffc61qsy1Wti2Q3YsHyICpUsZyjuevZsUX7h7hnFGwHqVLXrSJ-zVv4jA2crQKQ7_exz5HrEgq4Y5zbXLa__M7-YV8', 0),
(219, '51afcbc91440895c', 'tEO1rjpZuZiZFIYl', '2025-03-03 12:13:42', 'cS0W-3XET4Shb8hGj1kpEX:APA91bF5Gi0NdI4xuWKDiIjqvmwryffc61qsy1Wti2Q3YsHyICpUsZyjuevZsUX7h7hnFGwHqVLXrSJ-zVv4jA2crQKQ7_exz5HrEgq4Y5zbXLa__M7-YV8', 1);

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
(100, 'COIN', 'ETH', 'ETH', 293, '0x4b852ec317a7d0e5f6408be66ed14232290b3397', '0x66e365114f255dccf66186a28976eb98208a2fc2', '0.0001', '0xb3e174badc58d78dcdaabc48c68e7d835fcb9cf3c958155da89eaf2f012a6f42', '2025-03-03 18:53:13', NULL, 219, 'TESTNET', 88);

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
  `name` varchar(255) NOT NULL,
  `wallet_type` enum('phone','hardware') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `device_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `wallet`
--

INSERT INTO `wallet` (`id`, `name`, `wallet_type`, `is_active`, `device_id`, `user_id`, `created_at`, `updated_at`) VALUES
(9, 'Main Wallet', 'phone', 1, 156, 156, '2025-01-08 13:27:36', '2025-01-08 13:27:36'),
(14, 'Wallet 1', 'phone', 1, 154, 154, '2025-01-10 11:16:57', '2025-01-10 11:16:57'),
(15, 'Wallet 1', 'phone', 1, 156, 156, '2025-01-13 06:31:06', '2025-01-13 06:31:06'),
(16, 'Wallet 1', 'phone', 1, 157, 157, '2025-01-30 07:30:34', '2025-01-30 07:30:34'),
(17, 'Wallet 1', 'phone', 1, 160, 160, '2025-01-30 09:59:54', '2025-01-30 09:59:54'),
(18, 'Wallet 1', 'phone', 1, 161, 161, '2025-01-30 10:22:25', '2025-01-30 10:22:25'),
(19, 'Wallet 1', 'phone', 1, 162, 162, '2025-01-30 10:50:26', '2025-01-30 10:50:26'),
(20, 'Wallet 1', 'phone', 0, 164, 164, '2025-01-30 11:55:04', '2025-01-30 11:55:04'),
(21, 'Wallet 1', 'phone', 1, 125, 125, '2025-01-31 06:52:41', '2025-01-31 06:52:41'),
(63, 'Solana Wallet', 'phone', 1, 187, 187, '2025-02-12 13:58:21', '2025-02-12 13:58:21'),
(70, 'Wallet 1', 'phone', 1, 191, 191, '2025-02-20 06:45:30', '2025-02-20 06:45:30'),
(71, 'Wallet 1', 'phone', 0, 193, 193, '2025-02-25 12:56:54', '2025-02-25 12:56:54'),
(72, 'Wallet 1', 'phone', 0, 197, 197, '2025-02-25 14:08:24', '2025-02-25 14:08:24'),
(73, 'Wallet 1', 'phone', 1, 198, 198, '2025-02-26 06:16:58', '2025-02-26 06:16:58'),
(81, 'Wallet 1', 'phone', 0, 213, 213, '2025-02-28 11:12:28', '2025-02-28 11:12:28'),
(82, 'Wallet 2', 'phone', 1, 213, 213, '2025-02-28 11:13:38', '2025-02-28 11:13:38'),
(83, 'test update nam', 'phone', 0, 212, 212, '2025-02-28 11:22:10', '2025-02-28 11:22:10'),
(84, 'Wallet 2', 'phone', 0, 212, 212, '2025-02-28 12:56:07', '2025-02-28 12:56:07'),
(85, 'Wallet 3', 'phone', 1, 212, 212, '2025-02-28 13:06:41', '2025-02-28 13:06:41'),
(86, 'Wallet 1', 'phone', 1, 214, 214, '2025-02-28 13:44:37', '2025-02-28 13:44:37'),
(87, 'Wallet 1', 'phone', 0, 219, 219, '2025-03-03 06:44:30', '2025-03-03 06:44:30'),
(88, 'Wallet 2', 'phone', 0, 219, 219, '2025-03-03 12:26:42', '2025-03-03 12:26:42'),
(89, 'Wallet 3', 'phone', 0, 219, 219, '2025-03-03 14:41:36', '2025-03-03 14:41:36'),
(90, 'Wallet 4', 'phone', 1, 219, 219, '2025-03-03 14:48:46', '2025-03-03 14:48:46');

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=295;

--
-- AUTO_INCREMENT for table `device`
--
ALTER TABLE `device`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=220;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT for table `utenti`
--
ALTER TABLE `utenti`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `wallet`
--
ALTER TABLE `wallet`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
