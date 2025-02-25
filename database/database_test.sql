-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 08, 2024 at 06:02 PM
-- Server version: 10.6.18-MariaDB-0ubuntu0.22.04.1
-- PHP Version: 8.1.29

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
  `id` int(11) NOT NULL,
  `cointype` varchar(3) NOT NULL,
  `path` varchar(50) NOT NULL,
  `address` text NOT NULL,
  `id_utente` int(11) NOT NULL,
  `index` int(11) NOT NULL,
  `start_block` int(11) NOT NULL,
  `created_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `tatumStatus` enum('NOT-SYNCED','SYNCED') NOT NULL,
  `addressStatus` varchar(20) NOT NULL DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `cointype`, `path`, `address`, `id_utente`, `index`, `start_block`, `created_time`, `tatumStatus`, `addressStatus`) VALUES
(352, 'SOL', 'm/44\'/501\'/0\'/0/0', '3yAh5UrLYSi5STLLgzBm6MvPg64p7RCNyBTEuDd6Tm87', 96, 0, 251463446, '2024-09-24 13:17:43', 'SYNCED', 'Inactive'),
(354, 'SOL', 'm/44\'/501\'/0\'/0/1', '9EFYr34WHyminDqwWGhbPwqMiHpMfVFJWnMc7HuYMkKc', 96, 0, 251467886, '2024-09-24 13:17:43', 'SYNCED', 'Inactive'),
(355, 'BTC', 'm/44\'/0\'/0\'/0/0', 'tb1qlc6zn8rjr82huarxpmy9s9t78p8quqpgmwhp92', 96, 0, 2901629, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Inactive'),
(356, 'BTC', 'm/44\'/0\'/0\'/0/1', 'tb1qfqmznut46f3evreeg8f5f9ktckxnv2g58n8j0v', 96, 0, 2901630, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Inactive'),
(358, 'BNB', 'm/44\'/714\'/0\'/0/0', '0xc929ccc4b67ab9853c4f2fe0437122152f7a743c', 96, 0, 43432101, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Inactive'),
(359, 'ETH', 'm/44\'/60\'/0\'/0/0', '0x7f98355064bb1f8aa893d0629b3f1c592919e1f1', 96, 0, 6599839, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Inactive'),
(360, 'ETH', 'm/44\'/60\'/0\'/0/1', '0x0d076b0d109574d06b9cd8419c5710e827e03809', 96, 0, 6599910, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Inactive'),
(361, 'BNB', 'm/44\'/714\'/0\'/0/1', '0x3a1bb60f1ca47536d0e019034464bdae60078650', 96, 0, 43514045, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Inactive'),
(362, 'SOL', 'm/44\'/501\'/0\'/0/2', '3PgqoZjiTLxqvrTBQMXXepx17NPDvArEkNd8RqPWnYb7', 96, 0, 252109810, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Inactive'),
(363, 'BNB', 'm/44\'/714\'/0\'/0/2', '0x6b350584508b83eba17c42b8c1631356955ccc22', 96, 0, 43549891, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Inactive'),
(364, 'BTC', 'm/44\'/0\'/0\'/0/2', 'tb1qw4fmw8sk2c3pw4tpvcm89c46ep5qt0mw3pqtxv', 96, 0, 2902706, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Inactive'),
(365, 'BTC', 'm/44\'/0\'/0\'/0/3', 'tb1q725mv9a6052tll6qghqt7de7869leu5mygtlwh', 96, 0, 2902715, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Inactive'),
(367, 'BTC', 'm/44\'/0\'/0\'/0/0', 'tb1qggqtalene3j8gkkmrv6huqtr5ptqk0f526njrk', 99, 0, 2902947, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Active'),
(368, 'BTC', 'm/44\'/0\'/0\'/0/1', 'tb1q7rzx33c7ust3n0urk57dsn9lzt90m6dhstpa0x', 99, 0, 2902947, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Active'),
(370, 'ETH', 'm/44\'/60\'/0\'/0/0', '0xeb937a8812ad91270c154a768707abd3ec4ea08b', 99, 0, 6629890, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Active'),
(371, 'ETH', 'm/44\'/60\'/0\'/0/1', '0xcb58cb5b0d5125ad435e9bc0e5d04b5f8983d710', 99, 1, 6629891, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Active'),
(372, 'ETH', 'm/44\'/60\'/0\'/0/2', '0xc75bd7ce37cf4c72b820e0ca4e1958206876c3ed', 99, 2, 6629894, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Active'),
(373, 'SOL', 'm/44\'/501\'/0\'/0/0', 'EbPV1TiJ6wMMHq1PQSE7AFy3zhxFHKBMGZKgrz5cEvnZ', 99, 0, 252221192, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Active'),
(374, 'SOL', 'm/44\'/501\'/0\'/0/1', 'CXCV55LWzecoFBELDXp36mM411nEkuoKC2uvH2fDNCw6', 99, 1, 252221233, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Active'),
(377, 'ETH', 'm/44\'/60\'/0\'/0/2', '0x643610e06634db8565a1bba79e74372531126348', 96, 2, 6665392, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Inactive'),
(378, 'SOL', 'm/44\'/501\'/0\'/0/3', 'Er8vXcazTZAgdLmpA3voQmuK8SLrrWN4jmMPtDC73rSK', 96, 3, 253109264, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Inactive'),
(386, 'BTC', 'm/44\'/0\'/0\'/0/0', 'tb1qjkfr2ag0kew7jdv8vqtwmwdnm5lqyz86smmg4t', 125, 0, 2904282, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Active'),
(387, 'ETH', 'm/44\'/60\'/0\'/0/0', '0xfa175f0dcd05b8fbb03e01461539caebed723869', 125, 0, 6667062, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Active'),
(388, 'BNB', 'm/44\'/714\'/0\'/0/0', '0x39d25ed01a510c9222806e1219cdb3a90842ec12', 125, 0, 43752575, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Active'),
(389, 'SOL', 'm/44\'/501\'/0\'/0/0', 'EuKshfgZ9yY97qZWUA3wb8CukN8wXWQhWsfHd2tJxe88', 125, 0, 253152753, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Active'),
(390, 'ETH', 'm/44\'/60\'/0\'/0/1', '0xf8839ee230e86788cd906db7e7ddbb0c66b352b3', 125, 1, 6667065, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Active'),
(391, 'BTC', 'm/44\'/0\'/0\'/0/4', 'tb1qxyfn0t3s8ek8uph2s7848h356x9fwnux9en4xj', 96, 4, 2904577, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Inactive'),
(392, 'ETH', 'm/44\'/60\'/0\'/0/0', '0x263145dcbfb6a076e50f4efdd40411c1c7fdb34b', 131, 0, 6684133, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Inactive'),
(393, 'SOL', 'm/44\'/501\'/0\'/0/0', '9qh94r7opM2MEsTpysgeYGBsFFXq6raVDZB9usAp4c2a', 131, 0, 253594272, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Inactive'),
(394, 'BTC', 'm/44\'/0\'/0\'/0/5', 'tb1qe3fe8hfjx0gwh9uk2akgxupdza75fmvpw3uzpu', 96, 5, 2924548, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Inactive'),
(396, 'BTC', 'm/44\'/0\'/0\'/0/0', 'tb1qegzrtlr6a84quzeexk3c6wnxnqn04pfwzguc8c', 125, 0, 2954834, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Active'),
(397, 'BTC', 'm/44\'/0\'/0\'/0/6', 'tb1qer7qvek8kneypjxz3nplek43yzke765jjx9mvc', 96, 6, 2965106, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Inactive'),
(398, 'BTC', 'm/44\'/0\'/0\'/0/7', 'tb1qzjwn3yyex06q02fv3hrv985qc9hsc2qcf82q0r', 96, 7, 2965146, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Inactive'),
(409, 'SOL', 'm/44\'/501\'/0\'/0/4', 'r5r5yHqyY8ZJijjD77HH3DdBp9TWtYVoVox6ZmFtyto', 96, 4, 255096768, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Inactive'),
(410, 'SOL', 'm/44\'/501\'/0\'/0/4', 'Dr5r5yHqyY8ZJijjD77HH3DdBp9TWtYVoVox6ZmFtyto', 96, 4, 255096768, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Inactive'),
(411, 'BNB', 'm/44\'/714\'/0\'/0/3', '0x4deb860f30bc213c2d2eda086f6d1a2c50974134', 96, 3, 44150901, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Inactive'),
(414, 'BTC', 'm/44\'/0\'/0\'/0/8', 'mwvzyPN8HdnbWWNfUE6Ckfc3HFvMwCFCAi', 96, 8, 2999171, '2024-09-24 13:17:43', 'NOT-SYNCED', 'Inactive'),
(415, 'ETH', 'm/44\'/60\'/0\'/0/3', '0x055ed104f913e754575d9e6412e213e3a7cbfd38', 96, 3, 6751310, '2024-09-24 13:25:09', 'NOT-SYNCED', 'Inactive'),
(416, 'ETH', 'm/44\'/60\'/0\'/0/4', '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', 96, 4, 6751386, '2024-09-24 13:43:53', 'SYNCED', 'Inactive'),
(438, 'BTC', 'm/44\'/0\'/0\'/0/0', 'n1XZCoqQFVM69vph1XmEQrwnSySZxQsgtv', 131, 0, 3080699, '2024-10-07 12:34:03', 'NOT-SYNCED', 'Inactive'),
(439, 'BTC', 'm/44\'/0\'/0\'/0/1', 'myt1MExigLPSZfWUeozXKLHEgKs85cikCA', 131, 1, 3080702, '2024-10-07 12:35:31', 'NOT-SYNCED', 'Inactive'),
(441, 'ETH', 'm/44\'/60\'/0\'/0/0', '0x7d0eabb52ac0f794e91bd8adb49c8eaaf91969eb', 136, 0, 6927831, '2024-10-23 07:46:55', 'NOT-SYNCED', 'Active'),
(442, 'BTC', 'm/44\'/0\'/0\'/0/0', 'n4i7rA2NGxFghB18EkpxQD5AqtCivPp2jx', 137, 0, 3194562, '2024-10-23 07:58:21', 'NOT-SYNCED', 'Active'),
(443, 'ETH', 'm/44\'/60\'/0\'/0/0', '0x5807204030a50be0a97f0ba4b5758030b39004fe', 137, 0, 6927885, '2024-10-23 07:59:37', 'NOT-SYNCED', 'Active'),
(444, 'BNB', 'm/44\'/714\'/0\'/0/0', '0x2a4274d3e716c98256a119ce5ccadecede9691a5', 137, 0, 44983233, '2024-10-23 08:00:28', 'NOT-SYNCED', 'Active'),
(445, 'BNB', 'm/44\'/60\'/0\'/0/0', '0x58e892b487e9d6d3cccb3f5a56390ae595e22655', 137, 0, 44983325, '2024-10-23 08:05:06', 'NOT-SYNCED', 'Active'),
(446, 'SOL', 'm/44\'/501\'/0\'/0\'', 'CBuNHodFxR2yryyN1EKJ8NpAEcoAiiEV9oUnaysXzQc2', 137, 0, 258172689, '2024-10-23 08:07:28', 'NOT-SYNCED', 'Active'),
(447, 'SOL', 'm/44\'/501\'/0\'/0/1', '81nDh7EcArx8aZWzoJoDYnwBiF6zesyrAzzbKUja1BSJ', 137, 1, 258483429, '2024-10-25 07:04:14', 'SYNCED', 'Active'),
(448, 'SOL', 'm/44\'/501\'/0\'/0/2', '6Fm9FxRgicFzTswzh3fHt9AMDg16YFRkgVqdoNLppeR9', 137, 2, 258483602, '2024-10-25 07:05:32', 'SYNCED', 'Active'),
(449, 'SOL', 'm/44\'/501\'/0\'/0/3', 'FSfrnUoQrsugPCwrDsJXFBdpwTXknBHU6SkRRuG8Vm1z', 137, 3, 258483813, '2024-10-25 07:07:40', 'SYNCED', 'Active'),
(450, 'SOL', 'm/44\'/501\'/0\'/0/4', '55n19RYKv3jD6qxmojvnc1LCtvWS4LtoVh8LfKCVZFV', 137, 4, 258483882, '2024-10-25 07:08:15', 'SYNCED', 'Active'),
(451, 'BNB', 'm/44\'/714\'/0\'/0/1', '0xef33732da0b380c38be23f49b53d78b38713b1d7', 137, 1, 45039968, '2024-10-25 07:17:13', 'NOT-SYNCED', 'Active'),
(452, 'BNB', 'm/44\'/714\'/0\'/0/2', '0xf9e63c76f5335de27c5ae2a8f37b05c29a20ceff', 137, 2, 45039998, '2024-10-25 07:18:42', 'NOT-SYNCED', 'Active'),
(453, 'BNB', 'm/44\'/714\'/0\'/0/3', '0x86e2151597ef20a12bc910c77c42f50dcd70aa8c', 137, 3, 45040074, '2024-10-25 07:22:31', 'NOT-SYNCED', 'Active'),
(454, 'ETH', 'm/44\'/60\'/0\'/0/1', '0x2e68ba762524b03599d5cc00a4c6791966520a59', 137, 1, 6941241, '2024-10-25 07:30:13', 'SYNCED', 'Active'),
(455, 'BNB', 'm/44\'/714\'/0\'/0/4', '0xc3e35d8ba058fd5bc9585cbbcf002cd7921e3481', 137, 4, 45043758, '2024-10-25 10:26:40', 'NOT-SYNCED', 'Active'),
(456, 'BTC', 'm/44\'/0\'/0\'/0/0', 'mrG7uHcXmPydLQuDSXYgAyFYmrJG73HLHv', 136, 0, 3195422, '2024-10-25 10:52:56', 'SYNCED', 'Active'),
(457, 'BNB', 'm/44\'/714\'/0\'/0/0', '0x3dd766ecd7098d07a6c1c359f4d688dd0b1977e2', 136, 0, 45044291, '2024-10-25 10:53:24', 'NOT-SYNCED', 'Active'),
(458, 'SOL', 'm/44\'/501\'/0\'/0/0', '6Bj4bVJvUCLaJCoWv5QBPjZJdQBqTCLx1ocD8RKwCBXM', 136, 0, 258509055, '2024-10-25 10:53:48', 'SYNCED', 'Active'),
(459, 'ETH', 'm/44\'/60\'/0\'/0/0', '0xcc8d0e019e9cb3ca769fd561d2daf77a9fe75d1d', 136, 0, 6942223, '2024-10-25 10:56:48', 'NOT-SYNCED', 'Active'),
(460, 'BTC', 'm/44\'/0\'/0\'/0/1', 'mwGdwLJxaVCfZyWB9iXVJd3eC8etVJhYGo', 137, 1, 3195423, '2024-10-25 11:11:27', 'NOT-SYNCED', 'Active'),
(461, 'SOL', 'm/44\'/501\'/0\'/0/1', '4LXe6mxnDrCEcf6BrjH2jJd7or1EvvtboTUwmhwY4rqU', 136, 1, 258512436, '2024-10-25 11:24:12', 'NOT-SYNCED', 'Active'),
(463, 'SOL', 'm/44\'/501\'/0\'/0/5', '5bU1AVN2u1sXdBVccAky7M5jd2BKLXXktCbY3nszLdoU', 137, 5, 258514089, '2024-10-25 11:39:06', 'NOT-SYNCED', 'Active'),
(464, 'BTC', 'm/44\'/0\'/0\'/0/1', 'mqVdeH51faezxwRrFvgk9GpHZ4Mt7xzXbX', 136, 0, 3195426, '2024-10-25 11:54:09', 'NOT-SYNCED', 'Active'),
(465, 'SOL', 'm/44\'/501\'/0\'/0\'', 'C2SpdcrkiyT5UjBdmxxdmuLc6gM1RE3auVZhFB1H6Wsv', 136, 0, 258515906, '2024-10-25 11:55:34', 'NOT-SYNCED', 'Active'),
(466, 'BNB', 'm/44\'/714\'/0\'/0/1', '0x7820cdc543bac2da20bec0ce57c186a1e3e3b3b7', 136, 0, 45045642, '2024-10-25 12:00:54', 'NOT-SYNCED', 'Active'),
(467, 'ETH', 'm/44\'/60\'/0\'/0/0', '0x0deae8fe2f2c6c46ae61b72a11d5a9650e8dc5e9', 136, 0, 6942586, '2024-10-25 12:14:55', 'NOT-SYNCED', 'Active'),
(468, 'BTC', 'm/44\'/0\'/0\'/0/0', 'mpS7VUwNRWjtimRGJQwRkRegGzmCF9gTTU', 138, 0, 3195866, '2024-10-28 18:21:20', 'SYNCED', 'Active'),
(469, 'ETH', 'm/44\'/60\'/0\'/0/0', '0x85e95066ff25414461c5648a9704a5e65f6f94fb', 138, 0, 6964694, '2024-10-28 18:21:32', 'SYNCED', 'Active'),
(470, 'BTC', 'm/44\'/0\'/0\'/0/2', 'tb1qfzwkj0ejx3dpn7zjh0z0sq4ftg289wgghwreq6', 2, 2, 3195875, '2024-10-28 21:25:41', 'SYNCED', 'Active'),
(471, 'ETH', 'm/44\'/60\'/0\'/0/0', '0x0aac7622daf615a07d196b73013e2074307f3b28', 138, 0, 6982981, '2024-10-31 11:09:22', 'SYNCED', 'Active'),
(472, 'ETH', 'm/44\'/60\'/0\'/0/0', '0x541ae2e966c1f19ccaf3e80ce74769112c7243fe', 131, 0, 7029994, '2024-11-07 12:08:41', 'SYNCED', 'Active'),
(473, 'ETH', 'm/44\'/60\'/0\'/0/1', '0x71297c3098c88b7c5564d1e7bb93265fe520085e', 131, 1, 7035907, '2024-11-08 10:33:36', 'SYNCED', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `blocchi`
--

CREATE TABLE `blocchi` (
  `bitcoin` int(11) NOT NULL,
  `ethereum` int(11) NOT NULL,
  `binance` int(11) NOT NULL,
  `solana` int(11) NOT NULL,
  `monero` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

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
  `id` int(11) NOT NULL,
  `identifier` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `passkey` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `date_insert` datetime NOT NULL DEFAULT current_timestamp(),
  `device_token` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `device`
--

INSERT INTO `device` (`id`, `identifier`, `passkey`, `date_insert`, `device_token`) VALUES
(40, 'QKQ1.19200.002', '0di1WXKbReprt6IkpXVCJ9', '2024-08-05 15:05:40', NULL),
(41, 'SDQ1.15200.002', 'nhio1WXKbReprt6IkpXVCJ9', '2024-08-06 11:41:43', NULL),
(42, 'S5Q1.15200.002', 'io1WXKbReprt6IkpXVCJ9', '2024-08-06 11:46:43', NULL),
(43, 'S5Q2.15200.002', 'io1KbReprt6IkpXVCJ9', '2024-08-06 11:49:11', NULL),
(44, 'Q122.10200.002', '1kd6grKbReprt6IkpXVCJ9', '2024-08-06 11:54:36', NULL),
(57, 'QKQ1.14500.002', '0di1WXKbReprt6IkpXV', '2024-08-06 12:58:31', NULL),
(83, 'TP1A.220224.015', 'DFqcuGhh8ENCPJln', '2024-08-22 15:44:49', NULL),
(86, 'TP1A.220224.5', 'cuGhh8ENCPJln', '2024-08-22 17:03:52', NULL),
(87, 'TP1A.224.5', 'chh8ENCPJln', '2024-08-22 17:06:26', NULL),
(95, 'TP1A.0624.14', 'Gl9lhzYEmK0XC', '2024-08-29 19:51:24', NULL),
(96, 'TP1A.220624.014', '2gCYZEsyRbBz5dt', '2024-08-30 12:16:18', NULL),
(97, 'TP1A.0624.789', '9lhzYEmK0XC', '2024-08-30 13:46:26', NULL),
(99, 'UQ1A.240205.002', 'fVHWrgJKumzqH1Q', '2024-09-04 11:55:23', NULL),
(125, 'UP1A.231005.007', '7Xn6Bw2qAcPlD1Kv4u', '2024-09-10 19:54:42', NULL),
(131, 'RKQ1.211119.001', '7Xn6Bw2qAcPlD1Kv4u', '2024-09-13 19:00:19', 'cb-cDwTkTPSvciOTIqXGtx:APA91bEY_D_WPbSgA4doZdNv5m9Eil8VM0_6ec2bc0DIaydllF7TWHX5o4O08o9X-TZTCmKTdHNAs5WtryWWwH4Q6BWbuh9ousIo7H_2d_dgFitEglUkmFI'),
(133, 'QKQ1.190910.002', '7Xn6Bw2qAcPlD1Kv4u', '2024-09-13 20:04:59', NULL),
(136, 'AP41.240823.009', '7Xn6Bw2qAcPlD1Kv4u', '2024-10-23 13:12:09', 'cBPyUiv_RgShxO2TtUuYEq:APA91bEU9Jtoh8R1frId4iUQ2MceNv6NHS5wmLNXpUJuesbQxhhTwIAIE9Ua0kcPWYW02XoGot-MZRKWJFaZbu4-I-oKgK4BGFqX7iH-KW-bxse72-KmgAI'),
(137, 'QP1A.190711.020', '7Xn6Bw2qAcPlD1Kv4u', '2024-10-23 13:21:50', 'fk1lHGKUT9iii1rNbc-HuD:APA91bHEEftBBWXNQ7fNpsySs-BV4Ggn8-_d5qKrwWs54WObuvuKYUfL0iEf6dMM-5LpdOSiMoN8kYwkp2IRquXZNjpYYSC3kKJnXVhtLdlPa_SEsWPwaMf_dgouH5JipmI6KD7biOfs'),
(138, 'UE1A.230829.036.A1', '7Xn6Bw2qAcPlD1Kv4u', '2024-10-28 18:21:00', 'cd0VaoErTqydE1VMdQJyKe:APA91bGlXmqeoN5_GlCaIz3DhwHePM6VbETE8OAERLLiARV5WQ4dQpLFvojZvbWY_Q52BCAoYcKEzcb7kE8KJ8YhFOgpUCOw4nd7BjU65Tl0VK3sXEuR_1o'),
(140, '265F387A-944A-4AA8-9FE7-3EC4C16EA03C', '7Xn6Bw2qAcPlD1Kv4u', '2024-10-31 16:03:29', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `token`
--

CREATE TABLE `token` (
  `id` int(45) NOT NULL,
  `id_address` int(11) NOT NULL,
  `tokenname` varchar(45) NOT NULL,
  `decimals` varchar(45) NOT NULL,
  `tokenAccount` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `type` varchar(15) NOT NULL,
  `chain` varchar(5) NOT NULL,
  `token` varchar(5) NOT NULL,
  `address_id` int(11) DEFAULT NULL,
  `from_address` varchar(512) NOT NULL,
  `destination_address` varchar(512) NOT NULL,
  `amount` varchar(512) NOT NULL,
  `tx` varchar(1024) NOT NULL,
  `data_insert` datetime NOT NULL,
  `block_number` int(11) DEFAULT NULL,
  `id_utente` int(11) NOT NULL,
  `network_type` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `type`, `chain`, `token`, `address_id`, `from_address`, `destination_address`, `amount`, `tx`, `data_insert`, `block_number`, `id_utente`, `network_type`) VALUES
(1, 'COIN', 'BTC', 'BTC', 352, '3yAh5UrLYSi5STLLgzBm6MvPg64p7RCNyBTEuDd6Tm87', '8hjy7a44m6gc0hpffa6pslgwwf3jdgtz46tursul', '0', 'tb1qk35a44m6gc0hpffa6pslgwwf3jdgtz46tur6ty', '2024-08-30 21:10:44', 12304, 96, 'MAINNET'),
(2, 'COIN', 'BNB', 'BNB', 358, '0xc929ccc4b67ab9853c4f2fe0437122152f7a743c', '0x3a1bb60f1ca47536d0e019034464bdae60078650', '0.00001', '0xb19082d251be03ae2a0eff8a8ab084e3562eddd8fa1ff1d5ea05b57342aea866', '2024-09-02 13:31:53', NULL, 96, 'TESTNET'),
(13, 'COIN', 'SOL', 'SOL', 354, '9EFYr34WHyminDqwWGhbPwqMiHpMfVFJWnMc7HuYMkKc', '3yAh5UrLYSi5STLLgzBm6MvPg64p7RCNyBTEuDd6Tm87', '0.0001', '3DSd41KQPbH3nQMBAuWrjMxN1beKE1N2RYb7Ry319ADaymSYYW9E3JmzJMMMg8nRaBqCxQ9BLDV4t4yejXJmwNfi', '2024-09-02 19:15:00', NULL, 96, 'TESTNET'),
(14, 'COIN', 'ETH', 'ETH', 359, '0x7f98355064bb1f8aa893d0629b3f1c592919e1f1', '0x0d076b0d109574d06b9cd8419c5710e827e03809', '0.00001', '0x26ef4a4cef13311e3bc23fdbf85ba7ab0fa41ba7c42325eca14fc4fcfe501d85', '2024-09-03 19:05:46', NULL, 96, 'TESTNET'),
(15, 'COIN', 'ETH', 'ETH', 359, '0x7f98355064bb1f8aa893d0629b3f1c592919e1f1', '0x0d076b0d109574d06b9cd8419c5710e827e03809', '0.00001', '0x58bb576a264231a98aac18dad98043b8911ac6496e80952f1a8ae89762b27989', '2024-09-03 19:07:49', NULL, 96, 'TESTNET'),
(16, 'COIN', 'ETH', 'ETH', 359, '0x7f98355064bb1f8aa893d0629b3f1c592919e1f1', '0x0d076b0d109574d06b9cd8419c5710e827e03809', '0.00001', '0xfd404d818eb246ba7d7790acc3440498f3f7fefe2bcb01bdb65e168ab60e842c', '2024-09-03 19:10:38', NULL, 96, 'TESTNET'),
(17, 'COIN', 'ETH', 'ETH', 359, '0x7f98355064bb1f8aa893d0629b3f1c592919e1f1', '0x0d076b0d109574d06b9cd8419c5710e827e03809', '0.0001', '0x525626858685c381250e3394b713a9a30b87588f5082c40db005e672e9c139f6', '2024-09-03 19:13:39', NULL, 96, 'TESTNET'),
(18, 'COIN', 'BNB', 'BNB', 358, '0xc929ccc4b67ab9853c4f2fe0437122152f7a743c', '0x6b350584508b83eba17c42b8c1631356955ccc22', '0.000001', '0x4ef5ad2a795a2ea1630ec8760326fe00f40b4c2923f24c80fdd0d55a8b1fb27e', '2024-09-03 19:25:56', NULL, 96, 'TESTNET'),
(19, 'COIN', 'ETH', 'ETH', 358, '0xc929ccc4b67ab9853c4f2fe0437122152f7a743c', '0x6b350584508b83eba17c42b8c1631356955ccc22', '0.001', '0x062d236ccc044f68194a04008e98c3823271dc26160a4db9ae9303f9ecfc7bf6', '2024-09-20 20:35:59', 2913059, 96, 'TESTNET'),
(20, 'COIN', 'ETH', 'ETH', 360, '0x0d076b0d109574d06b9cd8419c5710e827e03809', '0xc0f3833b7e7216eecd9f6bc2c7927a7aa36ab58b', '0.05', '0xb64f0bdd393f73038bf8a06432ecac96f6307c94f84156a3eec10ef3a1b794c7', '2024-09-23 12:21:29', 6743697, 96, 'TESTNET'),
(26, 'COIN', 'ETH', 'ETH', 416, '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0xe560ca09958bdb05b776676351114811ad101e47', '0.05', '0xffae22b6fddbdd4e1034c42d6f1f70c69c6096e0f6b4ab0d74b09c08148376f2', '2024-09-24 19:32:04', 6751452, 96, 'TESTNET'),
(45, 'COIN', 'ETH', 'ETH', 363, '0x6b350584508b83eba17c42b8c1631356955ccc', '0x0d076b0d109574d06b9cd8419c5710e82', '0.001', '0x062d236ccc044f68194a04008e98c3823271dc26160a4db9ae9303f9ecf', '2024-09-26 12:53:08', 2913059, 96, 'TESTNET'),
(55, 'COIN', 'ETH', 'ETH', 416, '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0x055ed104f913e754575d9e6412e213e3a7cbfd38', '0.0001', '0x53b0bd003145e6321b874baa52421d94e68c7563912ab2a87c5f02e7b90543df', '2024-10-15 12:21:01', NULL, 96, 'TESTNET'),
(57, 'COIN', 'ETH', 'ETH', 363, '0x6b350584508b83eba17c42b8c1631356955ccc22', '0x0d076b0d109574d06b9cd8419c5710e827e03809', '0.001', '0x062d236ccc044f68194a04008e98c3823271dc26160a4db9ae9303f9ecfc76', '2024-10-17 20:36:10', 2913059, 96, 'TESTNET'),
(59, 'COIN', 'ETH', 'ETH', 454, '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0.0001', '0x304a5fb507f6372f5da3d5ac0181587b83a0d0639d926be4571cc27d8b0b7154', '2024-10-25 13:06:42', NULL, 137, 'TESTNET'),
(60, 'COIN', 'ETH', 'ETH', 454, '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0.0001', '0x6dc18ece9e6036fae6d46f016cd547edd0d8cb775028ced378217490c69ce9ef', '2024-10-25 13:28:34', NULL, 137, 'TESTNET'),
(67, 'COIN', 'ETH', 'ETH', 454, '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0.0001', '0x2a2914ec6297c93ddf841358a2f18118b362a1489ee9610194ceb2287212e828', '2024-10-25 13:39:29', NULL, 137, 'TESTNET'),
(74, 'COIN', 'ETH', 'ETH', 454, '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0.0001', '0xe0636867393cf694ba53191986f83bbf53a6104cc340d061ec0521a97bcf67c6', '2024-10-25 13:42:34', NULL, 137, 'TESTNET'),
(79, 'COIN', 'ETH', 'ETH', 454, '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0.0001', '0x26c0c00e620b46f729849c2732a44981c9266f0a9cd2833cb4132210f937ec07', '2024-10-25 13:44:54', 6941458, 137, 'TESTNET'),
(85, 'COIN', 'ETH', 'ETH', 454, '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0.0001', '0x9f351c0e77e9b694c14ac1146ec7d19ec231958d60427f42bee1d50360ef284f', '2024-10-25 15:36:21', 6941986, 137, 'TESTNET'),
(89, 'COIN', 'ETH', 'ETH', 454, '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0.0001', '0xe480173e6a8415a3ab2283dbc5d861fcc36731740ade95a01a432eac5406e7fa', '2024-10-25 15:55:55', 6942080, 137, 'TESTNET'),
(93, 'COIN', 'ETH', 'ETH', 459, '0xcc8d0e019e9cb3ca769fd561d2daf77a9fe75d1d', '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0.0001', '0xb35543f3d695804f417d47a5532a1b8294f6bb3b44c77b56a381b7d859e963bc', '2024-10-25 16:36:24', 6942268, 136, 'TESTNET'),
(97, 'COIN', 'ETH', 'ETH', 467, '0x0deae8fe2f2c6c46ae61b72a11d5a9650e8dc5e9', '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0.001', '0x263d438104c3a77751267cbbfe94e5dec34a65eead165a2061ed38ba1a465a92', '2024-10-25 18:06:10', 6942686, 136, 'TESTNET'),
(98, 'COIN', 'ETH', 'ETH', NULL, '0x...', '0x...', '0.000231500000137', '0x...', '2024-11-07 14:09:54', 1058153, 0, 'TESTNET');

-- --------------------------------------------------------

--
-- Table structure for table `utenti`
--

CREATE TABLE `utenti` (
  `id` int(11) NOT NULL,
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
  `token_verifica` varchar(512) DEFAULT NULL,
  `twofa` tinyint(4) NOT NULL DEFAULT 0,
  `totp` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

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

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Address_UNIQUE` (`address`) USING HASH;

--
-- Indexes for table `device`
--
ALTER TABLE `device`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_identifier` (`identifier`);

--
-- Indexes for table `token`
--
ALTER TABLE `token`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tokenname` (`tokenname`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tx` (`tx`),
  ADD KEY `address_id` (`address_id`) USING BTREE;

--
-- Indexes for table `utenti`
--
ALTER TABLE `utenti`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Email_UNIQUE` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=474;

--
-- AUTO_INCREMENT for table `device`
--
ALTER TABLE `device`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=141;

--
-- AUTO_INCREMENT for table `token`
--
ALTER TABLE `token`
  MODIFY `id` int(45) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

--
-- AUTO_INCREMENT for table `utenti`
--
ALTER TABLE `utenti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
