-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jun 30, 2025 at 05:13 PM
-- Server version: 8.0.42-0ubuntu0.20.04.1
-- PHP Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
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
(828, 'ETH', '0xb25b4b45f95c445727abfabe8c6673bf03651744', 'Address 1', 350, 1, NULL, '2025-04-30 06:34:55', 'SYNCED', 'Active', 135),
(829, 'BNB', '0x4cad628b5ef925729f87b9da92ba4f5c1e66918c', 'Address 2', 350, 2, NULL, '2025-04-30 06:34:55', 'SYNCED', 'Active', 135),
(830, 'SOL', 'EDmQc3Qydb72qaUZyL9tbcnmFYHW4Hges4L8GuUqnU53', 'Address 3', 350, 3, NULL, '2025-04-30 06:34:55', 'SYNCED', 'Active', 135),
(831, 'BTC', 'n3LpDz3nSir5Knm6mfj9thsWUHWrVcXZG4', 'Address 4', 350, 4, NULL, '2025-04-30 06:34:55', 'SYNCED', 'Active', 135),
(836, 'ETH', '0x5605f0a868794622e5b8222f8001b791cde955f6', 'M-ETHEREUM', 352, 1, NULL, '2025-04-30 06:53:36', 'SYNCED', 'Active', 137),
(837, 'BNB', '0x32af682441cf5d1e3146a4bff496c11e310b1ae7', 'M-BINANCE', 352, 2, NULL, '2025-04-30 06:53:36', 'SYNCED', 'Active', 137),
(838, 'SOL', 'zYtGcnLBk5Vssi4cVv7zASVkosy3uwaRZp2UfRRqT9Af', 'M-SOLANA', 352, 3, NULL, '2025-04-30 06:53:36', 'SYNCED', 'Active', 137),
(839, 'BTC', 'mjRD2iqefyYTsA51XN9GBbLCtLsbENx7ze', 'M-BITCOIN', 352, 4, NULL, '2025-04-30 06:53:36', 'SYNCED', 'Active', 137),
(840, 'ETH', '0xab0e99f9877f5b4d82cb4bbe45ab8c2d169501c8', 'M-ETHEREUM', 353, 1, NULL, '2025-05-02 12:27:58', 'SYNCED', 'Active', 138),
(841, 'BNB', '0xaac6ccab87ce54b154bc86deab5a8dfffeca9a67', 'M-BINANCE', 353, 2, NULL, '2025-05-02 12:27:58', 'SYNCED', 'Active', 138),
(842, 'SOL', '5f4KeRzNgEHG4BuPkSqjeiJEkYn1PQRJjV5YXcPkB4jU', 'M-SOLANA', 353, 3, NULL, '2025-05-02 12:27:58', 'SYNCED', 'Active', 138),
(843, 'BTC', 'mz9TFNNVx7uEFiSVPZH1HKiYaqbR9ZbC19', 'M-BITCOIN', 353, 4, NULL, '2025-05-02 12:27:58', 'SYNCED', 'Active', 138),
(844, 'ETH', '0x1f9f295dfb68526877439387b419a90bcab05ae3', 'Address 1', 353, 1, NULL, '2025-05-02 14:08:47', 'SYNCED', 'Active', 139),
(845, 'BNB', '0x2639aecd1e8dd9ee1cdfc1d86c95075ebd2c42ec', 'Address 2', 353, 2, NULL, '2025-05-02 14:08:47', 'SYNCED', 'Active', 139),
(846, 'SOL', '7YqCQRyCt4ePc8QgJhDqAvEmoKEk12um1iDyqW62KQMY', 'Address 3', 353, 3, NULL, '2025-05-02 14:08:47', 'SYNCED', 'Active', 139),
(847, 'BTC', 'mxdp7Hau6JQePTuXAV7R8HdxdBtLqdH4Tu', 'Address 4', 353, 4, NULL, '2025-05-02 14:08:47', 'SYNCED', 'Active', 139),
(848, 'ETH', '0xbed919e95acac77c046bf6c4ccd9f3c3e7ef0638', 'Address 1', 309, 1, NULL, '2025-05-02 18:38:29', 'SYNCED', 'Active', 140),
(849, 'BNB', '0x7d5d64830227b4634f21b735bf0c4461aeaf4bd9', 'Address 2', 309, 2, NULL, '2025-05-02 18:38:29', 'SYNCED', 'Active', 140),
(850, 'SOL', '55QMPcSQCLgy4rCGdgMgV7J1eXpho94yY9XoXpTtBUZx', 'Address 3', 309, 3, NULL, '2025-05-02 18:38:29', 'SYNCED', 'Active', 140),
(851, 'BTC', 'mjgcyAgsd5obv1Mq66QSSAJByHSz3pVwCx', 'Address 4', 309, 4, NULL, '2025-05-02 18:38:29', 'SYNCED', 'Active', 140),
(852, 'BNB', '0x2a21226747c760df1583cbc5883bef15a029767a', 'myaddeth', 309, 5, NULL, '2025-05-02 18:40:58', 'SYNCED', 'Active', 140),
(853, 'ETH', '0x3cf7979614d6c87c4c344fed5a41b776135529b3', 'Address 1', 354, 1, NULL, '2025-05-02 18:48:52', 'SYNCED', 'Inactive', 141),
(854, 'BNB', '0xb7b9b4cdd246aaf2345e7cba94e23fd0bfc1655f', 'Address 2', 354, 2, NULL, '2025-05-02 18:48:52', 'SYNCED', 'Inactive', 141),
(855, 'SOL', '4UF5KgNVrbo6ZFGtfqc16LBwVAzBrYeNHdTGkqKDJd6v', 'Address 3', 354, 3, NULL, '2025-05-02 18:48:52', 'SYNCED', 'Inactive', 141),
(856, 'BTC', 'mxPcDfXxU8pybpKNbVkeTpbb5pGaNmHDVJ', 'Address 4', 354, 4, NULL, '2025-05-02 18:48:52', 'SYNCED', 'Inactive', 141),
(857, 'ETH', '0x1280642a7132198c76abc046a5cfb53ef4b9b177', 'Address 1', 354, 1, NULL, '2025-05-05 09:52:11', 'SYNCED', 'Active', 142),
(858, 'BNB', '0x8e9e65cccc5f27072dd06d41cee54a1c545210e4', 'Address 2', 354, 2, NULL, '2025-05-05 09:52:11', 'SYNCED', 'Active', 142),
(859, 'SOL', 'Ct5UVQivytK6YmZwo7tvW7VW25tkuvEuR73tuBWd4gM4', 'Address 3', 354, 3, NULL, '2025-05-05 09:52:11', 'SYNCED', 'Active', 142),
(860, 'BTC', 'mjgc84guhjdF5YXfYuhPnygJCk8uoZkpEh', 'Address 4', 354, 4, NULL, '2025-05-05 09:52:12', 'SYNCED', 'Active', 142),
(861, 'ETH', '0xc0b2d3a189eede7ecd2fabadbfeb501e7113f15f', 'Address 1', 355, 1, NULL, '2025-05-06 09:59:31', 'SYNCED', 'Active', 143),
(862, 'BNB', '0x992824762e0c22da1dec41be04f83ac45e373d40', 'Address 2', 355, 2, NULL, '2025-05-06 09:59:31', 'SYNCED', 'Active', 143),
(863, 'SOL', '9FQw7NBATK2qXfEDMenCyWnHJeUKsaSSmNXPrkxCnWkw', 'Address 3', 355, 3, NULL, '2025-05-06 09:59:31', 'SYNCED', 'Active', 143),
(864, 'BTC', 'msaqnQ4H8skx28zx8oDMWJoxexpwpU1RpL', 'Address 4', 355, 4, NULL, '2025-05-06 09:59:31', 'SYNCED', 'Active', 143),
(865, 'ETH', '0x6beb4940ff6bf2830bfebde45dc32489dbe4ab98', 'Address 1', 356, 1, NULL, '2025-05-06 11:04:17', 'SYNCED', 'Active', 144),
(866, 'BNB', '0x5826c4fbbb9b4a4380fb0b8ae537421c33dbd185', 'Address 2', 356, 2, NULL, '2025-05-06 11:04:17', 'SYNCED', 'Active', 144),
(867, 'SOL', 'HBMAKEQZ9Kh31xZif2pYaX2PQYxftXX43D6P89VFdcNx', 'Address 3', 356, 3, NULL, '2025-05-06 11:04:17', 'SYNCED', 'Active', 144),
(868, 'BTC', 'mvWCwYcsyTb83tXdWHa4oVK9suoTm38uim', 'Address 4', 356, 4, NULL, '2025-05-06 11:04:17', 'SYNCED', 'Active', 144),
(869, 'ETH', '0x0ae7af8f42568f0209923c2c957715a131fb2be3', 'Address 1', 357, 1, NULL, '2025-05-06 11:31:53', 'SYNCED', 'Active', 145),
(870, 'BNB', '0xacadebfcb8cbf1a8de5df8438b0c438d001be9a5', 'Address 2', 357, 2, NULL, '2025-05-06 11:31:53', 'SYNCED', 'Active', 145),
(871, 'SOL', '2mLbHU59HWyhGg3VoXa4qdWTHw1XTZXx7PnhsLTKqxND', 'Address 3', 357, 3, NULL, '2025-05-06 11:31:53', 'SYNCED', 'Active', 145),
(872, 'BTC', 'mz2L59pCzZdyjGvXiXsf5iGDMU6ZBPZTtb', 'Address 4', 357, 4, NULL, '2025-05-06 11:31:53', 'SYNCED', 'Active', 145),
(873, 'ETH', '0x5908609de43bcd1ee9a487a870e64aad0efa0e8e', 'Address 1', 358, 1, NULL, '2025-05-06 12:44:40', 'SYNCED', 'Active', 146),
(874, 'BNB', '0x247858630df6447ec9f55514bc5a08cb6db44eab', 'Address 2', 358, 2, NULL, '2025-05-06 12:44:40', 'SYNCED', 'Active', 146),
(875, 'SOL', '7HJAvbVeDND6r6mLNmxgPtS9HgyZJT85WfJbyZtdbJnT', 'Address 3', 358, 3, NULL, '2025-05-06 12:44:40', 'SYNCED', 'Active', 146),
(876, 'BTC', 'mxwfKDv6Q3RXHjsmEDHxdHapK6qcdoJVVt', 'Address 4', 358, 4, NULL, '2025-05-06 12:44:40', 'SYNCED', 'Active', 146),
(877, 'ETH', '0xffd06ba83f10880be47acb1e3c5d6f50be81f399', 'Address 1', 359, 1, NULL, '2025-05-07 09:00:18', 'SYNCED', 'Active', 147),
(878, 'BNB', '0x053a8c94f526080b696ebf4ab9624ec9a4aef21d', 'Address 2', 359, 2, NULL, '2025-05-07 09:00:18', 'SYNCED', 'Active', 147),
(879, 'SOL', '4KEVPd7qV7M5hv7Q2iXaGngMkQCchkEDQYryjeMjpymJ', 'Address 3', 359, 3, NULL, '2025-05-07 09:00:18', 'SYNCED', 'Active', 147),
(880, 'BTC', 'mkdRd6TeukLjXMVefCR1MSgHt8vJ7bM5CF', 'Address 4', 359, 4, NULL, '2025-05-07 09:00:19', 'SYNCED', 'Active', 147),
(881, 'ETH', '0xf92108266c8f5ba82674021ce2249e0ac2024c15', 'Address 1', 360, 1, NULL, '2025-05-07 09:08:08', 'SYNCED', 'Active', 148),
(882, 'BNB', '0x4c2bbea0be4bfa5836cf60a90b79784fea4919b0', 'Address 2', 360, 2, NULL, '2025-05-07 09:08:08', 'SYNCED', 'Active', 148),
(883, 'SOL', 'B2mQwKXEZh9C2HiDefBMnshVGWwoZVt7BPEZtQR5366y', 'Address 3', 360, 3, NULL, '2025-05-07 09:08:08', 'SYNCED', 'Active', 148),
(884, 'BTC', 'n294oaWibuqD9n2VH5P2xrN8FGfrUmcqRC', 'Address 4', 360, 4, NULL, '2025-05-07 09:08:08', 'SYNCED', 'Active', 148),
(885, 'ETH', '0xa50fccf0bf9a2c8ba81f232970bcaad7b759180a', 'Address 1', 361, 1, NULL, '2025-05-07 10:14:30', 'SYNCED', 'Active', 149),
(886, 'BNB', '0x6a267208edf0dc11e58e4fbec7f782d9c8d7985a', 'Address 2', 361, 2, NULL, '2025-05-07 10:14:30', 'SYNCED', 'Active', 149),
(887, 'SOL', 'BZHZd58T1RiBBAAgzQaQivXfNzunvXsjXyXWoWVF4EMY', 'Address 3', 361, 3, NULL, '2025-05-07 10:14:30', 'SYNCED', 'Active', 149),
(888, 'BTC', 'mwesYiF3h2QzFRCfoF73t5MsEfFxoEykj3', 'Address 4', 361, 4, NULL, '2025-05-07 10:14:31', 'SYNCED', 'Active', 149),
(889, 'ETH', '0x9745d78e540936540265b0ab9918905a95c5ecf8', 'Address 1', 362, 1, NULL, '2025-05-07 12:14:44', 'SYNCED', 'Active', 150),
(890, 'BNB', '0x54dc650d0cfe1d91965faa2eed599565b299feb6', 'Address 2', 362, 2, NULL, '2025-05-07 12:14:44', 'SYNCED', 'Active', 150),
(891, 'SOL', '28GL6MgFg9Q9k9Esvo7Tupr466HcDnMAKJ85HQpwhHFn', 'Address 3', 362, 3, NULL, '2025-05-07 12:14:44', 'SYNCED', 'Active', 150),
(892, 'BTC', 'mj2skt4saKmhKVHGvnHgxqetMoFnzk5s22', 'Address 4', 362, 4, NULL, '2025-05-07 12:14:44', 'SYNCED', 'Active', 150),
(893, 'ETH', '0x408b4926e1dfe0758f27ee9f8b7f3b0275f2170f', 'Address 1', 363, 1, NULL, '2025-05-07 12:18:50', 'SYNCED', 'Active', 151),
(894, 'BNB', '0x29210aeba90399bd873180062847a0a24073de8a', 'Address 2', 363, 2, NULL, '2025-05-07 12:18:50', 'SYNCED', 'Active', 151),
(895, 'SOL', 'EWzkAEiYjr6QNqFk246HB35MrsqvP6eesyUMNkETUmet', 'Address 3', 363, 3, NULL, '2025-05-07 12:18:50', 'SYNCED', 'Active', 151),
(896, 'BTC', 'msps4juRAxr4iSh2sKNbRMbpfV2BpcEHE9', 'Address 4', 363, 4, NULL, '2025-05-07 12:18:50', 'SYNCED', 'Active', 151),
(897, 'ETH', '0xba93649b6198edb67f4d49dec06db140ad37fd95', 'test', 363, 5, NULL, '2025-05-07 12:54:09', 'SYNCED', 'Active', 151),
(898, 'ETH', '0x829c4d1653a4e088db4b6a217f096651d5536f88', 'Address 1', 364, 1, NULL, '2025-05-07 14:38:54', 'SYNCED', 'Active', 152),
(899, 'BNB', '0x2da7a199c28153d0132c0666e7197d3bec03d208', 'Address 2', 364, 2, NULL, '2025-05-07 14:38:54', 'SYNCED', 'Active', 152),
(900, 'SOL', 'De1WBFtHJXx64zku3FDe5FxuPjDdLnMkn2SxPu1JcsLr', 'Address 3', 364, 3, NULL, '2025-05-07 14:38:54', 'SYNCED', 'Active', 152),
(901, 'BTC', 'mrc999evCkHu17ToCnBJ1xT6CPDJsM9Jzn', 'Address 4', 364, 4, NULL, '2025-05-07 14:38:54', 'SYNCED', 'Active', 152),
(902, 'ETH', '0xa8d6d518692770abc29800c88e51ddeb655e08ee', 'Address 1', 365, 0, NULL, '2025-05-07 14:59:00', 'SYNCED', 'Active', 153),
(903, 'BNB', '0xb888ae4a47bc5aea5e041b91b9dcf67a73216877', 'Address 2', 365, 0, NULL, '2025-05-07 14:59:00', 'SYNCED', 'Active', 153),
(904, 'SOL', 'DHdSDeSkubs7hoiaUckirWW7GCwVNL38RSQvFFTLKEoV', 'Address 3', 365, 0, NULL, '2025-05-07 14:59:00', 'SYNCED', 'Active', 153),
(905, 'BTC', 'mtYm4QbCMcjfLY5avXb7tiweWF1xAHs8HT', 'Address 4', 365, 0, NULL, '2025-05-07 14:59:00', 'SYNCED', 'Active', 153),
(906, 'ETH', '0xd1731a32f639cf9786d2690d3d2899033fa4207f', 'test', 365, 5, NULL, '2025-05-07 15:04:34', 'SYNCED', 'Active', 153),
(907, 'ETH', '0xa09b658e9d574d7b3d62b50d1f2cc33a4c9afa89', 'test', 364, 5, NULL, '2025-05-08 06:02:34', 'SYNCED', 'Active', 152),
(908, 'ETH', '0x62b39cf902c7e3e540062adb91070e1d0accd0d3', 'Address 1', 366, 1, NULL, '2025-05-08 14:33:26', 'SYNCED', 'Active', 154),
(909, 'BNB', '0x265ea4c4d033d772c10523d470ab11c91bdc7c99', 'Address 2', 366, 2, NULL, '2025-05-08 14:33:26', 'SYNCED', 'Active', 154),
(910, 'SOL', 'HGipZ86cEtQ5nTYv1WhetQKKkr5safUiK6Jniwi19ASs', 'Address 3', 366, 3, NULL, '2025-05-08 14:33:26', 'SYNCED', 'Active', 154),
(911, 'BTC', 'n24su84qwi72JBTB9fEBXWG2SnKyXEXqXS', 'Address 4', 366, 4, NULL, '2025-05-08 14:33:27', 'SYNCED', 'Active', 154),
(912, 'ETH', '0x7a93901f6a63f16f656d47b84cf9a1d0fb9087e4', 'text ', 366, 5, NULL, '2025-05-08 14:35:13', 'SYNCED', 'Active', 154),
(913, 'ETH', '0x88f49d4d1af6899916f62d19133c78c92369f923', 'Address 1', 368, 1, NULL, '2025-05-13 10:41:04', 'SYNCED', 'Active', 155),
(914, 'BNB', '0xa60f38b6d9cbc90d277bf2e83e31ecdae1296270', 'Address 2', 368, 2, NULL, '2025-05-13 10:41:04', 'SYNCED', 'Active', 155),
(915, 'SOL', 'EK98tifbNJevwNCMfFNTuUg4DcGmUdZH7nkMzv9mL1yg', 'Address 3', 368, 3, NULL, '2025-05-13 10:41:04', 'SYNCED', 'Active', 155),
(916, 'BTC', 'mrCkrpou73zCgGxod91dgi3y6RST5qb9xb', 'Address 4', 368, 4, NULL, '2025-05-13 10:41:04', 'SYNCED', 'Active', 155),
(917, 'SOL', 'BHVTfPTzFfRsMnZSq4cU2kdaU3TTqCzPq7npr7XBSNXM', 'jdsf', 308, 9, NULL, '2025-05-13 10:44:26', 'SYNCED', 'Active', 72),
(918, 'BTC', 'n1DaGDeKEUFm8JdbspCEe6Ee4iUWhjaLYm', 'test', 308, 10, NULL, '2025-05-13 12:32:29', 'SYNCED', 'Active', 72),
(919, 'ETH', '0xad573ddbe72e5a8e55153bedc3a81165ef4424ac', 'Address 1', 308, 1, NULL, '2025-05-13 12:40:49', 'SYNCED', 'Inactive', 156),
(920, 'BNB', '0x629ddd7482ba3f87e2472bbf7b36407287e6a5cf', 'Address 2', 308, 2, NULL, '2025-05-13 12:40:49', 'SYNCED', 'Inactive', 156),
(921, 'SOL', '7hCex2hJsBT89si34v54nCpfrr8umjdtj9HwgA1omeHx', 'Address 3', 308, 3, NULL, '2025-05-13 12:40:49', 'SYNCED', 'Inactive', 156),
(922, 'BTC', 'mtNVXFgJ2vi7Y7etNFbXNZn1x5mz6XR2FW', 'Address 4', 308, 4, NULL, '2025-05-13 12:40:49', 'SYNCED', 'Inactive', 156),
(923, 'ETH', '0xa73c3c1399444956117d74b5f0bcc05569e3698b', 'Address 1', 369, 1, NULL, '2025-05-14 06:45:04', 'SYNCED', 'Active', 157),
(924, 'BNB', '0x912668c4015baa53ce5bf1743f196901c5bfabce', 'Address 2', 369, 2, NULL, '2025-05-14 06:45:05', 'SYNCED', 'Active', 157),
(925, 'SOL', '5aECZGSsb3nnbhYK9gFJ59WpfxBHQs7cEWmrjawtJ1oQ', 'Address 3', 369, 3, NULL, '2025-05-14 06:45:05', 'SYNCED', 'Active', 157),
(926, 'BTC', 'n1odraPtwC2w7znR3bvQZBFXrKyyqh1BCT', 'Address 4', 369, 4, NULL, '2025-05-14 06:45:05', 'SYNCED', 'Active', 157),
(927, 'SOL', 'ELC47PrXiMuXqp9gkkXyrY6rPWZJ2rMA7ho53ffGL6Bo', 'test', 369, 5, NULL, '2025-05-14 06:52:52', 'SYNCED', 'Active', 157),
(928, 'ETH', '0x16c1392ab45ffd4fef0efb235ab9353fb0915992', 'Address 1', 370, 1, NULL, '2025-05-14 09:11:28', 'SYNCED', 'Active', 158),
(929, 'BNB', '0xb6be01584369dbcb6f9d41cd44f3f801ce03ab87', 'Address 2', 370, 2, NULL, '2025-05-14 09:11:28', 'SYNCED', 'Active', 158),
(930, 'SOL', '28bsZgJTHU9FcgVcrzMnanByeP1CKdELoMhpYXAXAGfz', 'Address 3', 370, 3, NULL, '2025-05-14 09:11:28', 'SYNCED', 'Active', 158),
(931, 'BTC', 'mvRm7dkMVcRrw25p1DQeV6Yh37vT5ZTo8Z', 'Address 4', 370, 4, NULL, '2025-05-14 09:11:28', 'SYNCED', 'Active', 158),
(932, 'ETH', '0xa2e0f0fb522156e511a3a4f2f62060e9794c1c58', 'Address 1', 371, 1, NULL, '2025-05-14 09:28:57', 'SYNCED', 'Inactive', 159),
(933, 'BNB', '0x762fc3889e0d0d0e2e59efc4b5bd571dcdb26248', 'Address 2', 371, 2, NULL, '2025-05-14 09:28:57', 'SYNCED', 'Inactive', 159),
(934, 'SOL', 'GRreebph9sLamioqkPdNa3qxBk2zYjpsN8DthU4gUhis', 'Address 3', 371, 3, NULL, '2025-05-14 09:28:57', 'SYNCED', 'Inactive', 159),
(935, 'BTC', 'mtqJMkSvrFH3qrc9YKkvpvjKrV236mM9AH', 'Address 4', 371, 4, NULL, '2025-05-14 09:28:58', 'SYNCED', 'Inactive', 159),
(936, 'ETH', '0x0e18f05dd91d5b9755db7666b7c2e0b161664b3f', 'address eth', 371, 5, NULL, '2025-05-14 09:33:55', 'SYNCED', 'Inactive', 159),
(937, 'BTC', 'n4pjo32ACwdrfvbdsN5xW8tYw5jPn5af1G', 'address btc', 371, 6, NULL, '2025-05-14 09:34:46', 'SYNCED', 'Inactive', 159),
(938, 'SOL', '6uFx5GaYBrTwZWtiTeGPz8jfBMXBgPUCFM5Nc5iZxdYr', 'address sol', 371, 7, NULL, '2025-05-14 09:35:15', 'SYNCED', 'Inactive', 159),
(939, 'BNB', '0x08587b6844bae5a27e583f0a3192624bd8862ada', 'address bnb', 371, 8, NULL, '2025-05-14 09:35:49', 'SYNCED', 'Inactive', 159),
(940, 'SOL', 'ESG87bTaJdhLRTDQDa5w8pxHE23You381PFUuiwufnp4', 'yyy', 371, 9, NULL, '2025-05-14 10:55:07', 'SYNCED', 'Inactive', 159),
(941, 'ETH', '0xbc27c0ab1e8e05d6179d625b219aae26aa38e3a9', 'Address 1', 371, 0, NULL, '2025-05-14 14:30:00', 'SYNCED', 'Active', 160),
(942, 'BNB', '0xced1652fcdd398dc320b2f3937c9e492b6cc2fc1', 'Address 2', 371, 0, NULL, '2025-05-14 14:30:00', 'SYNCED', 'Active', 160),
(943, 'SOL', 'Fiqo93X5w6ZPkWG1JfUvVv6Z1yB13tKovB1p7sJQv9Tz', 'Address 3', 371, 0, NULL, '2025-05-14 14:30:00', 'SYNCED', 'Active', 160),
(944, 'BTC', 'mjDNmjZkTDUvNPBc2LzXBR6i4QDq3ovSs7', 'Address 4', 371, 0, NULL, '2025-05-14 14:30:00', 'SYNCED', 'Active', 160),
(945, 'ETH', '0x370922d36135fb53a078240a1acf7d868bc581b3', 'sjjsjjs', 371, 5, NULL, '2025-05-14 14:31:03', 'SYNCED', 'Active', 160),
(946, 'ETH', '0x6312f4ee0701bc8119a054d92af11380ec9d8bde', 'Address 1', 308, 0, NULL, '2025-05-15 07:03:53', 'SYNCED', 'Inactive', 161),
(947, 'BNB', '0xe6dd8dc57f5f63431aa2db7abeccb8c840bb218c', 'Address 2', 308, 0, NULL, '2025-05-15 07:03:53', 'SYNCED', 'Inactive', 161),
(948, 'SOL', '9axZEsoX5cic7X2LxHYatFDniNULGjSqQCQXfa1TzDiV', 'Address 3', 308, 0, NULL, '2025-05-15 07:03:53', 'SYNCED', 'Inactive', 161),
(949, 'BTC', 'mo9g9kDtFMZyuwMZN4m4qhJ8AQsWthAWLX', 'Address 4', 308, 0, NULL, '2025-05-15 07:03:53', 'SYNCED', 'Inactive', 161),
(950, 'ETH', '0x3cef39696daf1b5f56ad51be1dfa8d932417501e', 'j', 308, 5, NULL, '2025-05-15 07:11:09', 'SYNCED', 'Inactive', 161),
(951, 'ETH', '0x744aa4cbeca69c2fcbae4deb2a03e8a1cc472483', 'Address 1', 308, 1, NULL, '2025-05-15 07:20:41', 'SYNCED', 'Inactive', 162),
(952, 'BNB', '0x7cf3b6abb686ff6dc605bdfcc149236448056c69', 'Address 2', 308, 2, NULL, '2025-05-15 07:20:41', 'SYNCED', 'Inactive', 162),
(953, 'SOL', '7b1tm8e757xY9nZVdkmx3csdzdGVAQxK1CVAyq77NWnQ', 'Address 3', 308, 3, NULL, '2025-05-15 07:20:41', 'SYNCED', 'Inactive', 162),
(954, 'BTC', 'mqYxRgTt8DyXYRYk9pR4uzrQHe881dLEun', 'Address 4', 308, 4, NULL, '2025-05-15 07:20:42', 'SYNCED', 'Inactive', 162),
(955, 'ETH', '0x1ad0e44b9ff81c28557e72a18f2bf6870263b2ff', 'Address 1', 372, 1, NULL, '2025-05-15 09:20:58', 'SYNCED', 'Inactive', 163),
(956, 'BNB', '0x5151640e6fe0210d7fb0258c88960da7bc996939', 'Address 2', 372, 2, NULL, '2025-05-15 09:20:58', 'SYNCED', 'Inactive', 163),
(957, 'SOL', '5pTbNMHWV5cmsS8ux2wp12vVdAGKepAPWAUHmzCCkEir', 'Address 3', 372, 3, NULL, '2025-05-15 09:20:59', 'SYNCED', 'Inactive', 163),
(958, 'BTC', 'mgkUSopsLJoK8VPkc3zUQkBEBZr7j2THfs', 'Address 4', 372, 4, NULL, '2025-05-15 09:20:59', 'SYNCED', 'Inactive', 163),
(959, 'ETH', '0x5766af44f667f3824515a19c0ed1201d68b1c7a2', 'Address 1', 372, 0, NULL, '2025-05-15 09:24:30', 'SYNCED', 'Inactive', 164),
(960, 'BNB', '0x1f458948ac0763f8de06453ce25872d77f741516', 'Address 2', 372, 0, NULL, '2025-05-15 09:24:30', 'SYNCED', 'Inactive', 164),
(961, 'SOL', '8rgZ4rE1PaSVpMCobrjeJhp5L2d2KRtpT9ZDJ2Qdy67z', 'Address 3', 372, 0, NULL, '2025-05-15 09:24:30', 'SYNCED', 'Inactive', 164),
(962, 'BTC', 'mjbdtaCsGnPE1ECWNi7Two4zoBkZrvP4rN', 'Address 4', 372, 0, NULL, '2025-05-15 09:24:30', 'SYNCED', 'Inactive', 164),
(963, 'ETH', '0xa0ebeb7756a09b71752a04c741d5836ba719d81f', 'Address 1', 372, 1, NULL, '2025-05-15 10:02:15', 'SYNCED', 'Inactive', 165),
(964, 'BNB', '0x9fd2fc37d70e4b583da51c88120438c5d1bf1cdf', 'Address 2', 372, 2, NULL, '2025-05-15 10:02:15', 'SYNCED', 'Inactive', 165),
(965, 'SOL', '7bd6yykoXHnh3LGjFzFrfXMawUgeDaAYwSaabTjiSBUt', 'Address 3', 372, 3, NULL, '2025-05-15 10:02:15', 'SYNCED', 'Inactive', 165),
(966, 'BTC', 'mhnU6czWb5JG2DG5aXP1r7kjPT3sqFtNFx', 'Address 4', 372, 4, NULL, '2025-05-15 10:02:16', 'SYNCED', 'Inactive', 165),
(967, 'ETH', '0xa95ed69856233b0d781ae67ff427f5b754200f60', 'Address 1', 372, 0, NULL, '2025-05-15 11:14:07', 'SYNCED', 'Active', 166),
(968, 'BNB', '0xd6d98f6444462c19c81508bc9b19ffcfaf359bf3', 'Address 1', 372, 0, NULL, '2025-05-15 11:14:07', 'SYNCED', 'Active', 166),
(969, 'SOL', '9k2WUm8D4BHfgPdcJrqnhM8UWfkUNzQYodFTAErH7eEz', 'Address 1', 372, 0, NULL, '2025-05-15 11:14:07', 'SYNCED', 'Active', 166),
(970, 'BTC', 'mfstvjMizR4L1jgDqxmfi6XuB9bKAJQSiu', 'Address 1', 372, 0, NULL, '2025-05-15 11:14:07', 'SYNCED', 'Active', 166),
(971, 'ETH', '0xa95ed69856233b0d781ae67ff427f5b754200f60', 'Address 1', 373, 0, NULL, '2025-05-15 11:35:10', 'SYNCED', 'Active', 168),
(972, 'BNB', '0xd6d98f6444462c19c81508bc9b19ffcfaf359bf3', 'Address 2', 373, 0, NULL, '2025-05-15 11:35:10', 'SYNCED', 'Active', 168),
(973, 'SOL', '9k2WUm8D4BHfgPdcJrqnhM8UWfkUNzQYodFTAErH7eEz', 'Address 3', 373, 0, NULL, '2025-05-15 11:35:10', 'SYNCED', 'Active', 168),
(974, 'BTC', 'mfstvjMizR4L1jgDqxmfi6XuB9bKAJQSiu', 'Address 4', 373, 0, NULL, '2025-05-15 11:35:10', 'SYNCED', 'Active', 168),
(975, 'ETH', '0x96660fc083067b3153f9d8ebc77577f023720b08', 'u', 373, 1, NULL, '2025-05-15 11:43:28', 'SYNCED', 'Active', 168),
(976, 'ETH', '0xa95ed69856233b0d781ae67ff427f5b754200f60', 'Address 1', 374, 0, NULL, '2025-05-15 11:48:59', 'SYNCED', 'Active', 169),
(977, 'BNB', '0xd6d98f6444462c19c81508bc9b19ffcfaf359bf3', 'Address 2', 374, 0, NULL, '2025-05-15 11:48:59', 'SYNCED', 'Active', 169),
(978, 'SOL', '9k2WUm8D4BHfgPdcJrqnhM8UWfkUNzQYodFTAErH7eEz', 'Address 3', 374, 0, NULL, '2025-05-15 11:48:59', 'SYNCED', 'Active', 169),
(979, 'BTC', 'mfstvjMizR4L1jgDqxmfi6XuB9bKAJQSiu', 'Address 4', 374, 0, NULL, '2025-05-15 11:49:00', 'SYNCED', 'Active', 169),
(980, 'ETH', '0x96660fc083067b3153f9d8ebc77577f023720b08', 'u', 374, 1, NULL, '2025-05-15 11:49:23', 'SYNCED', 'Active', 169),
(981, 'ETH', '0x969cd57d69dedad844d8bd17424e34b8fb66b3c6', 'i', 374, 2, NULL, '2025-05-15 12:25:43', 'SYNCED', 'Active', 169),
(982, 'ETH', '0xa95ed69856233b0d781ae67ff427f5b754200f60', 'Address 1', 375, 0, NULL, '2025-05-15 12:28:20', 'SYNCED', 'Active', 170),
(983, 'BNB', '0xd6d98f6444462c19c81508bc9b19ffcfaf359bf3', 'Address 2', 375, 0, NULL, '2025-05-15 12:28:21', 'SYNCED', 'Active', 170),
(984, 'SOL', '9k2WUm8D4BHfgPdcJrqnhM8UWfkUNzQYodFTAErH7eEz', 'Address 3', 375, 0, NULL, '2025-05-15 12:28:21', 'SYNCED', 'Active', 170),
(985, 'BTC', 'mfstvjMizR4L1jgDqxmfi6XuB9bKAJQSiu', 'Address 4', 375, 0, NULL, '2025-05-15 12:28:21', 'SYNCED', 'Active', 170),
(986, 'ETH', '0x96660fc083067b3153f9d8ebc77577f023720b08', 'y', 375, 1, NULL, '2025-05-15 12:28:40', 'SYNCED', 'Active', 170),
(987, 'ETH', '0x969cd57d69dedad844d8bd17424e34b8fb66b3c6', 'y', 375, 2, NULL, '2025-05-15 12:28:51', 'SYNCED', 'Active', 170),
(988, 'ETH', '0x8d4f9bbecb775a9b44968bc3ed26143c5ca3404b', 'Address 1', 376, 0, NULL, '2025-05-16 05:52:44', 'SYNCED', 'Active', 171),
(989, 'BNB', '0x5843b28666d34c3e6661fd6d35b1895b7228797c', 'Address 1', 376, 0, NULL, '2025-05-16 05:52:44', 'SYNCED', 'Active', 171),
(990, 'SOL', 'BvL33RUzfMPB6FAAqyemdzf9ZkcJMXLBKCbFsoVVmFtY', 'Address 1', 376, 0, NULL, '2025-05-16 05:52:44', 'SYNCED', 'Active', 171),
(991, 'BTC', 'msKujMGv6kdcQ5XaNRhXXBZGrr4Kx2f9Fi', 'Address 1', 376, 0, NULL, '2025-05-16 05:52:44', 'SYNCED', 'Active', 171),
(992, 'ETH', '0x25b6a29104fad423e117b253c404c09af3de4ee9', 'Address 1', 377, 0, NULL, '2025-05-16 06:02:16', 'SYNCED', 'Active', 172),
(993, 'BNB', '0x5a037ed635d77adfd271d8a3765b539fb93675fe', 'Address 1', 377, 0, NULL, '2025-05-16 06:02:16', 'SYNCED', 'Active', 172),
(994, 'SOL', 'EDZo5tfmRkXwU8S8a6zBCY7H9YR2ephmhsCRvwXA7e38', 'Address 1', 377, 0, NULL, '2025-05-16 06:02:16', 'SYNCED', 'Active', 172),
(995, 'BTC', 'n3BBS9VnvVaPjJ9ex9UGZnvHMUc2SopCnW', 'Address 1', 377, 0, NULL, '2025-05-16 06:02:16', 'SYNCED', 'Active', 172),
(996, 'ETH', '0x870e6125bd073adbc826652c8f903c958fb0586d', 'y', 377, 1, NULL, '2025-05-16 06:32:42', 'SYNCED', 'Active', 172),
(997, 'ETH', '0xbea6743f0357104b4fd7c7cc3435dfa659eab736', 'Address 1', 377, 0, NULL, '2025-05-16 06:34:23', 'SYNCED', 'Active', 173),
(998, 'BNB', '0x9233824d267a7c6544ff924003d01b6f6358ac66', 'Address 2', 377, 0, NULL, '2025-05-16 06:34:23', 'SYNCED', 'Active', 173),
(999, 'SOL', 'QR11TgoDj9a7Lqeow9dh52ZK85ZqqYZSzCBnZ8wxU4s', 'Address 3', 377, 0, NULL, '2025-05-16 06:34:23', 'SYNCED', 'Active', 173),
(1000, 'BTC', 'mrvUBRQS1T4mPPmuJv2UWqbQdvQcBoAxXH', 'Address 4', 377, 0, NULL, '2025-05-16 06:34:23', 'SYNCED', 'Active', 173),
(1001, 'ETH', '0xb3e8e4e74a43855e85ef8e3691f2680de5fef6db', 'i', 377, 1, NULL, '2025-05-16 06:35:47', 'SYNCED', 'Active', 173),
(1002, 'ETH', '0xe080e0ab093341703d030ea58a0a1919cfe901dc', 'y', 377, 2, NULL, '2025-05-16 06:35:55', 'SYNCED', 'Active', 173),
(1003, 'ETH', '0x25b6a29104fad423e117b253c404c09af3de4ee9', 'Address 1', 378, 0, NULL, '2025-05-16 06:43:21', 'SYNCED', 'Active', 174),
(1004, 'BNB', '0x5a037ed635d77adfd271d8a3765b539fb93675fe', 'Address 2', 378, 0, NULL, '2025-05-16 06:43:21', 'SYNCED', 'Active', 174),
(1005, 'SOL', 'EDZo5tfmRkXwU8S8a6zBCY7H9YR2ephmhsCRvwXA7e38', 'Address 3', 378, 0, NULL, '2025-05-16 06:43:21', 'SYNCED', 'Active', 174),
(1006, 'BTC', 'n3BBS9VnvVaPjJ9ex9UGZnvHMUc2SopCnW', 'Address 4', 378, 0, NULL, '2025-05-16 06:43:21', 'SYNCED', 'Active', 174),
(1007, 'ETH', '0xbea6743f0357104b4fd7c7cc3435dfa659eab736', 'Address 1', 378, 0, NULL, '2025-05-16 09:30:55', 'SYNCED', 'Inactive', 175),
(1008, 'BNB', '0x9233824d267a7c6544ff924003d01b6f6358ac66', 'Address 2', 378, 0, NULL, '2025-05-16 09:30:55', 'SYNCED', 'Inactive', 175),
(1009, 'SOL', 'QR11TgoDj9a7Lqeow9dh52ZK85ZqqYZSzCBnZ8wxU4s', 'Address 3', 378, 0, NULL, '2025-05-16 09:30:55', 'SYNCED', 'Inactive', 175),
(1010, 'BTC', 'mrvUBRQS1T4mPPmuJv2UWqbQdvQcBoAxXH', 'Address 4', 378, 0, NULL, '2025-05-16 09:30:55', 'SYNCED', 'Inactive', 175),
(1011, 'ETH', '0xb3e8e4e74a43855e85ef8e3691f2680de5fef6db', 'y', 378, 1, NULL, '2025-05-16 09:31:08', 'SYNCED', 'Inactive', 175),
(1012, 'ETH', '0xe080e0ab093341703d030ea58a0a1919cfe901dc', 'ggg', 378, 2, NULL, '2025-05-16 09:31:19', 'SYNCED', 'Inactive', 175),
(1013, 'ETH', '0x870e6125bd073adbc826652c8f903c958fb0586d', 'hhh', 378, 1, NULL, '2025-05-16 10:20:57', 'SYNCED', 'Active', 174),
(1014, 'ETH', '0x630cf5afb4b7c4c0006b5b1b406980078f494e10', 'gyy', 378, 2, NULL, '2025-05-16 10:29:44', 'SYNCED', 'Active', 174),
(1015, 'ETH', '0x896f565af20d024cc5c7587c3ed02eeb460d65cc', 'ggg', 378, 3, NULL, '2025-05-16 10:29:49', 'SYNCED', 'Active', 174),
(1016, 'ETH', '0x58b5735aac9933161d1c0480d9f440c5188fc296', 'fff', 378, 4, NULL, '2025-05-16 10:29:54', 'SYNCED', 'Active', 174),
(1017, 'SOL', '9d2EJ8FZ9Qe5hqr7UiJcJsSnwRRch2jkwYv87mVkvhnM', 'gvc', 378, 1, NULL, '2025-05-16 10:32:23', 'SYNCED', 'Active', 174),
(1018, 'SOL', '7g2oheApuhJGdJgERdJTYmRfH8Po9sgAeH2yhywKKi4n', 'zzz', 378, 2, NULL, '2025-05-16 10:32:30', 'SYNCED', 'Active', 174),
(1019, 'SOL', 'BCd77mC9QbWu3sVsho599M3FMoYHT6L2Nqpti3gbfw1F', 'kkk', 378, 3, NULL, '2025-05-16 10:32:37', 'SYNCED', 'Active', 174),
(1020, 'SOL', 'APaKrNUQK8bfg6CawCPLCgGz4BP3Z4V5mt23GkcfbZCD', 'fcc', 378, 4, NULL, '2025-05-16 10:32:45', 'SYNCED', 'Active', 174),
(1021, 'ETH', '0x3f5423b34898ccfe5c970245463c8602cd79f2b4', 'Address 1', 379, 0, NULL, '2025-05-16 12:02:20', 'SYNCED', 'Active', 176),
(1022, 'BNB', '0xa41d75fb07c4d601019ba67f6fbb725e41dabbea', 'Address 1', 379, 0, NULL, '2025-05-16 12:02:20', 'SYNCED', 'Active', 176),
(1023, 'SOL', 'Eib8JSKg9NwDBebWYdEgTeHQPia39BbEV6MtKjDzW8BS', 'Address 1', 379, 0, NULL, '2025-05-16 12:02:20', 'SYNCED', 'Active', 176),
(1024, 'BTC', 'mjcTbpNMafThCwXwNMHS1GTT74Vb3Dk6ff', 'Address 1', 379, 0, NULL, '2025-05-16 12:02:21', 'SYNCED', 'Active', 176),
(1025, 'ETH', '0xf33470a19a96c1053441446e928ac6854d087822', 'Address 1', 380, 0, NULL, '2025-05-16 14:11:45', 'SYNCED', 'Active', 177),
(1026, 'BNB', '0x28e28eeafbbb948fa236d1c958569b3ee0a95378', 'Address 1', 380, 0, NULL, '2025-05-16 14:11:45', 'SYNCED', 'Active', 177),
(1027, 'SOL', 'HQpkYav6tcy8UDqioLrKep9fFjuLpQA6xHNH49kMu5dA', 'Address 1', 380, 0, NULL, '2025-05-16 14:11:45', 'SYNCED', 'Active', 177),
(1028, 'BTC', 'mmCYMixwjoYMYXxFYcXxyCyq8mq4L2vg1F', 'Address 1', 380, 0, NULL, '2025-05-16 14:11:45', 'SYNCED', 'Active', 177),
(1029, 'ETH', '0x6588d4f75b422f2161715cbccaddbb275a08a101', 'ytt', 380, 1, NULL, '2025-05-16 14:20:07', 'SYNCED', 'Active', 177),
(1030, 'ETH', '0x8b2a372685f1827720ff2b1709c9c6f2f8b9098e', 'Address 1', 381, 0, NULL, '2025-05-16 14:20:28', 'SYNCED', 'Active', 178),
(1031, 'BNB', '0x7de807911bf358e48465ee2108d79ba41e349ef2', 'Address 1', 381, 0, NULL, '2025-05-16 14:20:28', 'SYNCED', 'Active', 178),
(1032, 'SOL', '3Tgnx5CprCYgxgAWLFsEXpsXB8PRZHywxSRoMqkNv7RH', 'Address 1', 381, 0, NULL, '2025-05-16 14:20:28', 'SYNCED', 'Active', 178),
(1033, 'BTC', 'mjXNFuZjuU63e6WoTbKbq9q8QFC7iJehxp', 'Address 1', 381, 0, NULL, '2025-05-16 14:20:28', 'SYNCED', 'Active', 178),
(1034, 'ETH', '0x7a7eefebec291298321c54b36a0eb6dc062243f1', 'ggg', 380, 2, NULL, '2025-05-16 14:21:11', 'SYNCED', 'Active', 177),
(1035, 'ETH', '0x8dffbe6e2a5fc30ffd26518d0e40376a8d8a7787', 'fff', 380, 3, NULL, '2025-05-16 14:21:15', 'SYNCED', 'Active', 177),
(1036, 'ETH', '0xfb112606e653dd8af8c585e97d7251c29b81ead9', 'fxd', 380, 4, NULL, '2025-05-16 14:21:19', 'SYNCED', 'Active', 177),
(1037, 'ETH', '0x52a54260469dfb79daa8f81f66eacf85917fca36', 'Address 1', 382, 0, NULL, '2025-05-17 07:36:27', 'SYNCED', 'Active', 179),
(1038, 'BNB', '0x5cbd3b81cf91f04c92631462624845fc8bb47c8f', 'Address 1', 382, 0, NULL, '2025-05-17 07:36:27', 'SYNCED', 'Active', 179),
(1039, 'SOL', 'G6MnTcDVx32466qNcCq5Kvr3muKLXJzKyquVzWW9DoWg', 'Address 1', 382, 0, NULL, '2025-05-17 07:36:27', 'SYNCED', 'Active', 179),
(1040, 'BTC', 'myvJeAfJWmCZ2o4CUL5ZiLLzyVEj21baHR', 'Address 1', 382, 0, NULL, '2025-05-17 07:36:27', 'SYNCED', 'Active', 179),
(1041, 'ETH', '0x834c14507a2f8c00f899a3fc984b14fc5935824d', 'hhg', 382, 1, NULL, '2025-05-17 07:37:11', 'SYNCED', 'Active', 179),
(1042, 'ETH', '0xcd1e93df6d558743be92cdb0756c8b56389fa38c', 'Address 1', 383, 0, NULL, '2025-05-17 08:50:08', 'SYNCED', 'Active', 180),
(1043, 'BNB', '0xa6ea2e267a71ebe99cf0144ff11da9852601db14', 'Address 1', 383, 0, NULL, '2025-05-17 08:50:08', 'SYNCED', 'Active', 180),
(1044, 'SOL', '6ZRMGr3WfTSkQB7mD5wBRbsQx4K62x7SrWY6aUsWkaN4', 'Address 1', 383, 0, NULL, '2025-05-17 08:50:08', 'SYNCED', 'Active', 180),
(1045, 'BTC', 'muu3us93MYTzDUG5NQ2ZAY3fsoLUaC2AxH', 'Address 1', 383, 0, NULL, '2025-05-17 08:50:09', 'SYNCED', 'Active', 180),
(1046, 'ETH', '0xf87e6762d9658da94cf5d4568111ebfe51974961', 'Address 1', 384, 0, NULL, '2025-05-19 06:39:54', 'SYNCED', 'Active', 181),
(1047, 'BNB', '0x1ac5a78649bd511d7860ff80e4dc0d6304f24724', 'Address 1', 384, 0, NULL, '2025-05-19 06:39:54', 'SYNCED', 'Active', 181),
(1048, 'SOL', 'RiKw5udUDJsa1QWet656R5LGhdeU5E1irn6JPSS6ZqG', 'Address 1', 384, 0, NULL, '2025-05-19 06:39:54', 'SYNCED', 'Active', 181),
(1049, 'BTC', 'n4kdeMfLQHQ9D3BDMV6KwjipWXHodKefDh', 'Address 1', 384, 0, NULL, '2025-05-19 06:39:54', 'SYNCED', 'Active', 181),
(1050, 'ETH', '0xdfa729299d49f781dc865a773f6b673d1399db7a', 'Address 1', 385, 0, NULL, '2025-05-19 07:47:36', 'SYNCED', 'Active', 182),
(1051, 'BNB', '0x5619b72fcfc9ab54591fae19d4fdfaa01a17b5a5', 'Address 1', 385, 0, NULL, '2025-05-19 07:47:36', 'SYNCED', 'Active', 182),
(1052, 'SOL', 'CJfbqPyjLZLPVAx5wVJ8BsARmBopx9DFqLqpZsm3LWif', 'Address 1', 385, 0, NULL, '2025-05-19 07:47:36', 'SYNCED', 'Active', 182),
(1053, 'BTC', 'mk5R8cALzgMjdprrYzewMyxUNTYxzFtinD', 'Address 1', 385, 0, NULL, '2025-05-19 07:47:36', 'SYNCED', 'Active', 182),
(1054, 'ETH', '0xb0b154f008f43ab074e729ffc6c2a6a319089dee', 'address new', 385, 1, NULL, '2025-05-19 07:48:14', 'SYNCED', 'Active', 182),
(1055, 'ETH', '0x1b7c8596bf31ffda6fb65fbcfc6ebe8cefd76099', 'Address 1', 386, 0, NULL, '2025-05-19 09:14:30', 'SYNCED', 'Active', 183),
(1056, 'BNB', '0x001a6ab09240d8415cf09542c27200d4b0f0e2db', 'Address 1', 386, 0, NULL, '2025-05-19 09:14:30', 'SYNCED', 'Active', 183),
(1057, 'SOL', 'CvXtCYcmn38EbRQmstmc89fHXG47DnKg8hF3DymZBE2y', 'Address 1', 386, 0, NULL, '2025-05-19 09:14:30', 'SYNCED', 'Active', 183),
(1058, 'BTC', 'mrqAY3tBQ7EuwFdPFUXjZkXPdAxEREu6jL', 'Address 1', 386, 0, NULL, '2025-05-19 09:14:31', 'SYNCED', 'Active', 183),
(1059, 'ETH', '0xf1afc1ce5109b9e1664e85c8655c218212dc0b50', 'new address ', 386, 1, NULL, '2025-05-19 09:14:52', 'SYNCED', 'Active', 183),
(1060, 'ETH', '0x4c5b17d7c9cfee4a9f4bfa8fd3d2e2145f83d345', 'Address 1', 386, 0, NULL, '2025-05-19 09:33:11', 'SYNCED', 'Inactive', 184),
(1061, 'BNB', '0x9542d3f96639ee61d2116a690844ebd2a6f02ccf', 'Address 2', 386, 0, NULL, '2025-05-19 09:33:11', 'SYNCED', 'Inactive', 184),
(1062, 'SOL', '4d6o3LsAwzoiiKrRR1dtpdJxEbYtCHpc6v1E8dQqWvaS', 'Address 3', 386, 0, NULL, '2025-05-19 09:33:11', 'SYNCED', 'Inactive', 184),
(1063, 'BTC', 'mrj1WBQZCFqnvmRHAVxwpnJYKTPL9GhBwe', 'Address 4', 386, 0, NULL, '2025-05-19 09:33:11', 'SYNCED', 'Inactive', 184),
(1064, 'ETH', '0x195e765c8296bf038e91064e984fd3dcd2421e2d', 'Address 1', 387, 0, NULL, '2025-05-19 10:13:24', 'SYNCED', 'Active', 185),
(1065, 'BNB', '0xec7b2d0aab3c2c3bae58c54c02e6c1df8d3dc7a4', 'Address 1', 387, 0, NULL, '2025-05-19 10:13:25', 'SYNCED', 'Active', 185),
(1066, 'SOL', 'EWBudGav1CmvFHxLG5sSixjZgBaW2h2pSgYQ3mwiSAc6', 'Address 1', 387, 0, NULL, '2025-05-19 10:13:25', 'SYNCED', 'Active', 185),
(1067, 'BTC', 'mijTVGZ8ufjct2UR9UjimjieSkQmb5Q6dD', 'Address 1', 387, 0, NULL, '2025-05-19 10:13:25', 'SYNCED', 'Active', 185),
(1068, 'ETH', '0xab093736530dee9765dbc71f764bec8cb4d9bdb8', 'Address 1', 388, 0, NULL, '2025-05-21 07:04:54', 'SYNCED', 'Active', 186),
(1069, 'BNB', '0x2bc9400cd55bca38326354fc2d0d28caf4c5201a', 'Address 1', 388, 0, NULL, '2025-05-21 07:04:54', 'SYNCED', 'Active', 186),
(1070, 'SOL', 'ByifrV4CNZ5N19rnWFA7qUM97i4R43NezvBMeTeN4jz1', 'Address 1', 388, 0, NULL, '2025-05-21 07:04:54', 'SYNCED', 'Active', 186),
(1071, 'BTC', 'mm5MsyeE72Tk8dyLCjmyGXzFwkfyLD5Lx7', 'Address 1', 388, 0, NULL, '2025-05-21 07:04:54', 'SYNCED', 'Active', 186),
(1072, 'ETH', '0xf5d75d13178d3b698d2457e4cb8a31bf5b5649fa', 'new', 371, 6, NULL, '2025-05-28 11:51:59', 'SYNCED', 'Active', 160),
(1075, 'ETH', '0x1b156532198eef7c1cca12c1e622a5956619f0d3', 'neww', 371, 8, NULL, '2025-05-28 12:16:34', 'SYNCED', 'Active', 160),
(1077, 'ETH', '0x27182443fb7d8a2cf1d5bb9c3143e349c48ab069', 'newe', 371, 7, NULL, '2025-05-28 12:25:33', 'SYNCED', 'Active', 160),
(1078, 'ETH', '0xb9285061cb9d39a845c96b4ee52192db6a74df02', 'newww', 371, 9, NULL, '2025-05-28 12:25:34', 'SYNCED', 'Active', 160),
(1079, 'ETH', '0x09f09b901d1f94bf02913833402f3fe83ae6b62b', 'kkkkk', 371, 10, NULL, '2025-05-28 12:26:02', 'SYNCED', 'Active', 160),
(1080, 'ETH', '0x27830095968149393580502aa5077e3319908634', 'gvv', 371, 11, NULL, '2025-05-28 12:29:08', 'SYNCED', 'Active', 160),
(1081, 'ETH', '0xfac7ffce683f61a4a63d0b6b088bc716e469f6c5', 'vcv', 371, 12, NULL, '2025-05-28 12:36:06', 'SYNCED', 'Active', 160),
(1082, 'ETH', '0x7743171cfa8dbfc5763f17aaf34cc53675f96f53', 'Address 1', 389, 0, NULL, '2025-05-30 10:16:21', 'SYNCED', 'Active', 187),
(1083, 'BNB', '0x216d2d1364c1b664e08ef54a911711b005805494', 'Address 1', 389, 0, NULL, '2025-05-30 10:16:21', 'SYNCED', 'Active', 187),
(1084, 'SOL', '6Ngagjcyr4yzPs1CHnw3kASBzY55UfQa9nAUt15tL6wx', 'Address 1', 389, 0, NULL, '2025-05-30 10:16:21', 'SYNCED', 'Active', 187),
(1085, 'BTC', 'mkSnnwUHAixqEFjWXkBrMxA6h3GPPwC7ho', 'Address 1', 389, 0, NULL, '2025-05-30 10:16:21', 'SYNCED', 'Active', 187),
(1090, 'ETH', '0xf2673368f5508bb8623a9ba9c4c2116110df222f', 'Address 1', 391, 0, NULL, '2025-06-05 13:35:10', 'SYNCED', 'Active', 190),
(1091, 'BNB', '0x3af7a8f415c8d37ee5366ed4c34413f850554d2a', 'Address 2', 391, 0, NULL, '2025-06-05 13:35:10', 'SYNCED', 'Active', 190),
(1092, 'SOL', 'Awmo57SreshZWJRqPjwmKeKaUZYEVGrdCJGieCmX9LwV', 'Address 3', 391, 0, NULL, '2025-06-05 13:35:11', 'SYNCED', 'Active', 190),
(1093, 'BTC', 'mvTvpz1yVLAmFGTAKURCW9DnfcC2DF2c6t', 'Address 4', 391, 0, NULL, '2025-06-05 13:35:11', 'SYNCED', 'Active', 190),
(1094, 'SOL', '3QiB9rDrkqPidSYx9gmELt3Ak5KKwJUaVMnPpTyvyydH', 'tedt', 388, 1, NULL, '2025-06-06 13:10:04', 'SYNCED', 'Active', 186),
(1095, 'ETH', '0x05ce2deebb98ff7259969de62288c26108895550', 'new', 388, 1, NULL, '2025-06-10 11:57:59', 'SYNCED', 'Active', 186),
(1096, 'ETH', '0x1e5f0ffc511a057dd28724522ea4914f69e9114c', 'Address 1', 392, 0, NULL, '2025-06-10 11:59:14', 'SYNCED', 'Active', 191),
(1097, 'BNB', '0x1a807ff6706a0937cb7515d1e6502672afebbbc6', 'Address 1', 392, 0, NULL, '2025-06-10 11:59:14', 'SYNCED', 'Active', 191),
(1098, 'SOL', 'FxHBCZe5kBKJEJWdakDVUFNCLGZCmZREWGPq9gQ9Pgsv', 'Address 1', 392, 0, NULL, '2025-06-10 11:59:14', 'SYNCED', 'Active', 191),
(1099, 'BTC', 'mrWyeBqMaPc1eKg9ufqWM1eWnJGaAi2tGS', 'Address 1', 392, 0, NULL, '2025-06-10 11:59:14', 'SYNCED', 'Active', 191),
(1100, 'ETH', '0x0c59b96662a53c6b70de1fda139157a7adda86ea', 'new', 392, 1, NULL, '2025-06-10 11:59:34', 'SYNCED', 'Active', 191),
(1101, 'ETH', '0x898b6241b6895f7a9ffed3297ab1ea3abd892a05', 'yuu', 392, 2, NULL, '2025-06-10 12:13:53', 'SYNCED', 'Active', 191),
(1102, 'BTC', 'mmH5eqWTMPbu6buSrx7FRfNjMDZe9YnbT8', 'hhh', 392, 1, NULL, '2025-06-10 12:14:02', 'SYNCED', 'Active', 191),
(1103, 'SOL', '8wWw6fK9EWgUeHtkdLYDMTwhKLAa6kiG9jVNX2EwSEKq', 'nbn', 392, 1, NULL, '2025-06-10 12:14:10', 'SYNCED', 'Active', 191),
(1104, 'BNB', '0x0dd87ac9c0e4bdeda1fcb12028e709f53569436f', 'hhh', 392, 1, NULL, '2025-06-10 12:14:22', 'SYNCED', 'Active', 191),
(1105, 'ETH', '0x206277e822f58fc7d415abda8b2ebbe283e9aa16', 'Address 1', 393, 0, NULL, '2025-06-10 12:15:06', 'SYNCED', 'Active', 192),
(1106, 'BNB', '0x548a074b04baa5f4d5c16c37ab15458ed23bf0ce', 'Address 1', 393, 0, NULL, '2025-06-10 12:15:06', 'SYNCED', 'Active', 192),
(1107, 'SOL', '7gGaYQsbQ8vumfWXixtuamhkSmoCZR2dyTgX87cT8sra', 'Address 1', 393, 0, NULL, '2025-06-10 12:15:06', 'SYNCED', 'Active', 192),
(1108, 'BTC', 'mtJU7xhq5A8s4JSjJfKDcCHSohn7hWuLwF', 'Address 1', 393, 0, NULL, '2025-06-10 12:15:06', 'SYNCED', 'Active', 192),
(1109, 'ETH', '0xb49acf606680fade083229a441b6fd08a479de25', 'hhh', 393, 1, NULL, '2025-06-10 12:15:19', 'SYNCED', 'Active', 192),
(1110, 'BTC', 'mmNvTxcjCTQCr4c6yoLCMnp9tMaVe62brE', 'kll', 393, 1, NULL, '2025-06-10 12:15:26', 'SYNCED', 'Active', 192),
(1111, 'SOL', 'HjJCkxPYTr9HSwPPvZtdRzzN7SuqVUp9gckrEbZrppYG', 'lll', 393, 1, NULL, '2025-06-10 12:15:37', 'SYNCED', 'Active', 192),
(1112, 'BNB', '0x8b8ab425ead9e8507f9adfb92f386dca57da0b2b', 'ccc', 393, 1, NULL, '2025-06-10 12:15:46', 'SYNCED', 'Active', 192),
(1113, 'ETH', '0x3fdac7271a5561a9d4a60f9f0b11a92ce9e9ee76', 'Address 1', 394, 0, NULL, '2025-06-10 12:16:32', 'SYNCED', 'Active', 193),
(1114, 'BNB', '0x89e442df20b7e45f0127dc91f45610af571aa8c4', 'Address 1', 394, 0, NULL, '2025-06-10 12:16:32', 'SYNCED', 'Active', 193),
(1115, 'SOL', '5V5b9dRS2UHcj2zkjDko1sPbgu8FTxM3jkjHSwhr381j', 'Address 1', 394, 0, NULL, '2025-06-10 12:16:32', 'SYNCED', 'Active', 193),
(1116, 'BTC', 'n3c9SFhu8GWKcgRiWQPojUxmbjRRRxRT8g', 'Address 1', 394, 0, NULL, '2025-06-10 12:16:32', 'SYNCED', 'Active', 193),
(1117, 'ETH', '0xaa3702d2c4e19f9982ac8cf8e92ef5d3d487f4c7', 'nnn', 394, 1, NULL, '2025-06-10 12:16:45', 'SYNCED', 'Active', 193),
(1118, 'BTC', 'moPfSbAL4itobfNDSpszx4rpFvdVjLtKqm', 'jjn', 394, 1, NULL, '2025-06-10 12:16:53', 'SYNCED', 'Active', 193),
(1119, 'SOL', '5Pr5eJCm6Zx2UokWCBPD8P6cTvS4gtDydEsgyhhaGBrX', 'vvv', 394, 1, NULL, '2025-06-10 12:17:00', 'SYNCED', 'Active', 193),
(1120, 'BNB', '0x40ec12cb2b558bf7dabcdd5c7d47037bf56ec87c', 'kkk', 394, 1, NULL, '2025-06-10 12:17:07', 'SYNCED', 'Active', 193),
(1121, 'ETH', '0xf4bc58f1682e1218a7f2d5d7d031248f8e7ef771', 'Address 1', 308, 1, NULL, '2025-06-11 10:24:45', 'SYNCED', 'Active', 72),
(1122, 'BNB', '0x3eeaa05bd01d36f39a10de85d33e9e654d93ace4', 'Address 2', 308, 2, NULL, '2025-06-11 10:24:46', 'SYNCED', 'Active', 72),
(1123, 'SOL', '52mJt5oiJy8HwaYFkD5vqGJMDU64Vw4C68PqkNAkeazJ', 'Address 3', 308, 3, NULL, '2025-06-11 10:24:46', 'SYNCED', 'Active', 72),
(1124, 'BTC', 'mwz2gb4jwRyBECpnRKgGXaNsXQv81WZTUa', 'Address 4', 308, 4, NULL, '2025-06-11 10:24:46', 'SYNCED', 'Active', 72),
(1125, 'ETH', '0x611a90dfcb9866480cb713e34b0febb333502d2d', 'test eth', 308, 5, NULL, '2025-06-11 10:24:47', 'SYNCED', 'Active', 72),
(1126, 'ETH', '0x5f6a8a58d1f692b6e23c83678aeae520e83bfdfe', 'ad', 308, 6, NULL, '2025-06-11 10:24:47', 'SYNCED', 'Active', 72),
(1127, 'ETH', '0xfebc12d8c4e0629316dfe7b9aae5fc5c658977b6', '', 308, 7, NULL, '2025-06-11 10:24:47', 'SYNCED', 'Active', 72),
(1128, 'ETH', '0xe814b4fa3efd8958c717ea72f677fde44636ec7f', 'sdljlfkjffsld;aflsdfjsajdf;sajfdlkajsfld;asdjfljsd jfklsdjfa;jsdf;kljasdl fjaskldfj ', 308, 8, NULL, '2025-06-11 10:24:48', 'SYNCED', 'Active', 72),
(1129, 'ETH', '0xf03cdc12198940af29c50bbc022110679ddee5de', 'Address 1', 395, 0, NULL, '2025-06-12 08:05:14', 'SYNCED', 'Active', 194),
(1130, 'BNB', '0xf83abc7744c5cf025c20419e9ec0779cf84ad10b', 'Address 1', 395, 0, NULL, '2025-06-12 08:05:14', 'SYNCED', 'Active', 194),
(1131, 'SOL', 'HQGDSuCRerUiYfGGgtNoLzXdf9zX7jRLT1tWLEHmXPfo', 'Address 1', 395, 0, NULL, '2025-06-12 08:05:15', 'SYNCED', 'Active', 194),
(1132, 'BTC', 'mzmv5N94q1TSwHepcP5tEE8WBCXghcqzvh', 'Address 1', 395, 0, NULL, '2025-06-12 08:05:15', 'SYNCED', 'Active', 194),
(1133, 'SOL', 'BE3fdEMWLUBZEyCU9hspSDZ9hDn9TTykmhccx3Tze8GC', 'new', 395, 1, NULL, '2025-06-12 08:09:49', 'SYNCED', 'Active', 194),
(1134, 'ETH', '0xd8e74ea50c9c3f252d8798ff9b18c8e5d04f2c51', 'Address 1', 396, 0, NULL, '2025-06-12 10:04:08', 'SYNCED', 'Active', 195),
(1135, 'BNB', '0x60fdfa2b9e740581114a153832a6b8653a3f0508', 'Address 1', 396, 0, NULL, '2025-06-12 10:04:08', 'SYNCED', 'Active', 195),
(1136, 'SOL', 'Gdo6qgTCjZjaavC2by7UYrKA2321iHZ6Qdt5MZnzUHqN', 'Address 1', 396, 0, NULL, '2025-06-12 10:04:08', 'SYNCED', 'Active', 195),
(1137, 'BTC', 'mwx5B1wCX9fcbiFGkHeCb9wahVccjFtF7u', 'Address 1', 396, 0, NULL, '2025-06-12 10:04:08', 'SYNCED', 'Active', 195),
(1138, 'ETH', '0x6bc0c91e65cab8c13d24a590ba38430c3310463c', 'Address 1', 395, 0, NULL, '2025-06-12 11:09:01', 'SYNCED', 'Inactive', 196),
(1139, 'BNB', '0x83668be3a14da23f0bee5c2ca38657b97c2605e5', 'Address 2', 395, 0, NULL, '2025-06-12 11:09:01', 'SYNCED', 'Inactive', 196),
(1140, 'SOL', 'HtTVuneE7hBWvZizK6CCXxmNmChZejcWDHxUk5NAD5QN', 'Address 3', 395, 0, NULL, '2025-06-12 11:12:39', 'SYNCED', 'Inactive', 197),
(1141, 'BTC', 'mkFVSsAJ4t3gfFfyeKWqKBRscXJaEyWTQ7', 'Address 4', 395, 0, NULL, '2025-06-12 11:12:39', 'SYNCED', 'Inactive', 197),
(1142, 'ETH', '0x00ed8e745508ce66b7d0abb259a6c5e522e655d1', 'Address 1', 397, 0, NULL, '2025-06-13 10:18:19', 'SYNCED', 'Active', 198),
(1143, 'BNB', '0x53769ae31ca1d33f77550d764226e216e5eaa900', 'Address 1', 397, 0, NULL, '2025-06-13 10:18:19', 'SYNCED', 'Active', 198),
(1144, 'SOL', 'HYJjLjvr6QVQRaFevV8deF715TwYq3BEq3JWJPjJccCf', 'Address 1', 397, 0, NULL, '2025-06-13 10:18:19', 'SYNCED', 'Active', 198),
(1145, 'BTC', 'mxpuQfb77CRDcGVKDUtLFKQhBdfdxzWNTU', 'Address 1', 397, 0, NULL, '2025-06-13 10:18:19', 'SYNCED', 'Active', 198),
(1146, 'ETH', '0x23a8e1bd614eb4543b5e3e5c896bd123f089a138', 'Address 1', 398, 0, NULL, '2025-06-13 10:19:53', 'SYNCED', 'Active', 199),
(1147, 'BNB', '0xfcebc1e8e7667cafc19ee0cf8bef6b8d6b36e808', 'Address 1', 398, 0, NULL, '2025-06-13 10:19:53', 'SYNCED', 'Active', 199),
(1148, 'SOL', '44kzi2P9NktpFhB9eEDv1S65YtcrRznkpqz9cTGfHbue', 'Address 1', 398, 0, NULL, '2025-06-13 10:19:53', 'SYNCED', 'Active', 199),
(1149, 'BTC', 'mtnaFvNKVJdQ1njcP18C1qKBpqq28xWydb', 'Address 1', 398, 0, NULL, '2025-06-13 10:19:53', 'SYNCED', 'Active', 199),
(1150, 'ETH', '0xd822000aeb72be4b67e86682a5bdfa8dc05b0f5e', 'Address 1', 399, 0, NULL, '2025-06-13 10:23:12', 'SYNCED', 'Active', 200),
(1151, 'BNB', '0xe69a3edde18a16b0c6021001869e6b1bbbf562c6', 'Address 1', 399, 0, NULL, '2025-06-13 10:23:12', 'SYNCED', 'Active', 200),
(1152, 'SOL', '9HYFgS2p7H5KtHoq6AGRYYNygxjP16tBvL77Y88mvADE', 'Address 1', 399, 0, NULL, '2025-06-13 10:23:12', 'SYNCED', 'Active', 200),
(1153, 'BTC', 'myQocRb8jrNdgETtgYvsUM2P7Pno3tFc9d', 'Address 1', 399, 0, NULL, '2025-06-13 10:23:12', 'SYNCED', 'Active', 200),
(1154, 'ETH', '0xcfd8548e81a7f851237272816b8629bd6d808fda', 'Address 1', 400, 0, NULL, '2025-06-13 10:31:40', 'SYNCED', 'Active', 201),
(1155, 'BNB', '0xf429079f05b06f501707b3cc61ac872900388d6c', 'Address 1', 400, 0, NULL, '2025-06-13 10:31:40', 'SYNCED', 'Active', 201),
(1156, 'SOL', '6oxyQLykJURqkbLF5iQ98TL77t9i1vM14LX7JQCQy2pQ', 'Address 1', 400, 0, NULL, '2025-06-13 10:31:40', 'SYNCED', 'Active', 201),
(1157, 'BTC', 'mpYQzGXUKdVQrmRMi21ta5VApY97EUnoJu', 'Address 1', 400, 0, NULL, '2025-06-13 10:31:40', 'SYNCED', 'Active', 201),
(1162, 'ETH', '0x856f63959e3af7821aaf2bf9ebbadec525708cf6', 'Address 1', 402, 0, NULL, '2025-06-15 11:55:46', 'SYNCED', 'Active', 202),
(1163, 'BNB', '0x31db16d1b8d307454c64814aac9f99e95c539f9d', 'Address 1', 402, 0, NULL, '2025-06-15 11:55:46', 'SYNCED', 'Active', 202),
(1164, 'SOL', '9T6s3XTbnFKppwChmUkNR5dfXcBNvJuzNxioL6PE1PN4', 'Address 1', 402, 0, NULL, '2025-06-15 11:55:47', 'SYNCED', 'Active', 202),
(1165, 'BTC', 'mmoWQn3ezYmZGrBtULEk5g9eqeM3fwWDx4', 'Address 1', 402, 0, NULL, '2025-06-15 11:55:47', 'SYNCED', 'Active', 202),
(1166, 'ETH', '0xc49c1797f110c2a41472049458e41a9debb3fa60', 'Address 1', 403, 0, NULL, '2025-06-17 12:13:56', 'SYNCED', 'Active', 203),
(1167, 'BNB', '0xe38635399efc1d280bab4933b9e4eba99eaef304', 'Address 1', 403, 0, NULL, '2025-06-17 12:13:56', 'SYNCED', 'Active', 203),
(1168, 'SOL', 'JCgBt27zH2CSP4r5uBWqggf9EKYzYwvWp79u2ijhKvuC', 'Address 1', 403, 0, NULL, '2025-06-17 12:13:56', 'SYNCED', 'Active', 203),
(1169, 'BTC', 'mmF7NZuTfDKcqrNHccafftsvFV7t8mSJgE', 'Address 1', 403, 0, NULL, '2025-06-17 12:13:56', 'SYNCED', 'Active', 203),
(1170, 'ETH', '0xfb34fae483c2ac4726233b74e0a7de9ff258277d', 'Address 1', 404, 0, NULL, '2025-06-17 12:42:11', 'SYNCED', 'Active', 204),
(1171, 'BNB', '0x90825dc28a5c1d642999eeca600d9037b74930f9', 'Address 1', 404, 0, NULL, '2025-06-17 12:42:11', 'SYNCED', 'Active', 204),
(1172, 'SOL', 'CL8kmQg68GvrW4fwRfazxn1VxF2tVELtYjjxUEcSxff4', 'Address 1', 404, 0, NULL, '2025-06-17 12:42:11', 'SYNCED', 'Active', 204),
(1173, 'BTC', 'n12AZAGcf2xgzUNqemBNjaK1pN1fZGobH3', 'Address 1', 404, 0, NULL, '2025-06-17 12:42:11', 'SYNCED', 'Active', 204),
(1174, 'ETH', '0x819cb1a49e82ab557ea832f048587703644fabd1', 'M-ETHEREUM', 404, 1, NULL, '2025-06-17 12:44:41', 'SYNCED', 'Active', 205),
(1175, 'BNB', '0x8cd57207b653226bfa72a7c5cf40ac9c204ae15e', 'M-BINANCE', 404, 2, NULL, '2025-06-17 12:44:41', 'SYNCED', 'Active', 205),
(1176, 'SOL', 'DtWiosAKRXAcn5Au8ME7xABJhyzP13AswHW6r3HeX7Ja', 'M-SOLANA', 404, 3, NULL, '2025-06-17 12:44:41', 'SYNCED', 'Active', 205),
(1177, 'BTC', 'mnYUksGTuhaHG7qanL8jWMonEiwKqdv9Hr', 'M-BITCOIN', 404, 4, NULL, '2025-06-17 12:44:42', 'SYNCED', 'Active', 205),
(1178, 'ETH', '0x79e9de2844f7f0bc1e803907701e883fa3cc28d0', 'Address 1', 405, 0, NULL, '2025-06-19 09:29:52', 'SYNCED', 'Active', 206),
(1179, 'BNB', '0xb5880b65595c263861accdaa54318c5d93b9dd7c', 'Address 1', 405, 0, NULL, '2025-06-19 09:29:52', 'SYNCED', 'Active', 206),
(1180, 'SOL', '32U7rYuuraW3n2LxzNy4YvdTJw6Nnwo4JiNL48UvF6W4', 'Address 1', 405, 0, NULL, '2025-06-19 09:29:53', 'SYNCED', 'Active', 206),
(1181, 'BTC', 'msHa4JJAuRpkHkskTfEQsX6eGdkF6UJx6N', 'Address 1', 405, 0, NULL, '2025-06-19 09:29:53', 'SYNCED', 'Active', 206),
(1182, 'ETH', '0x8be2547c34696c89f363c77caf75e370e063f0f9', 'Address 1', 406, 0, NULL, '2025-06-20 06:55:53', 'SYNCED', 'Active', 207),
(1183, 'BNB', '0xab93fe895acb9991ab4a9344fbe41cab32750c78', 'Address 1', 406, 0, NULL, '2025-06-20 06:55:53', 'SYNCED', 'Active', 207),
(1184, 'SOL', '5jHKQHCDpFmh55RWqRj5nsE9B4qmtzntz8NeTmCMWGR7', 'Address 1', 406, 0, NULL, '2025-06-20 06:55:54', 'SYNCED', 'Active', 207),
(1185, 'BTC', 'mwhZMtoDnZJFpmbj6LL5UvVNrESNvtL41b', 'Address 1', 406, 0, NULL, '2025-06-20 06:55:54', 'SYNCED', 'Active', 207),
(1186, 'BNB', '0x06c29e8feb6d1e189525962dcd79a7f472ab87b5', 'jvjvjgjgjg', 406, 1, NULL, '2025-06-22 20:10:22', 'SYNCED', 'Active', 207),
(1187, 'ETH', '0x5b0dea01a3a4ce3cc6d2545bdc5ee20512e7ad91', 'Address 1', 407, 0, NULL, '2025-06-24 13:08:07', 'SYNCED', 'Active', 208),
(1188, 'BNB', '0x4b1c0df46198d67878c1a6c40daa3982f7caca22', 'Address 1', 407, 0, NULL, '2025-06-24 13:08:07', 'SYNCED', 'Active', 208),
(1189, 'SOL', 'BzDkg4WfzpG2HvSu9ywX64e5AH5oAp1b9meTQT1JvjXY', 'Address 1', 407, 0, NULL, '2025-06-24 13:08:07', 'SYNCED', 'Active', 208),
(1190, 'BTC', 'mj9pPjU8vbaAFYUghvo4bwzQqSYYxJA3Jr', 'Address 1', 407, 0, NULL, '2025-06-24 13:08:08', 'SYNCED', 'Active', 208),
(1191, 'ETH', '0x7a2546809597f6daddb0202107d792a42069d9cb', 'Address 1', 409, 0, NULL, '2025-06-26 06:44:59', 'SYNCED', 'Active', 209),
(1192, 'BNB', '0x9c661a9a49d533eb7539788e3d57dbdfcc98ec07', 'Address 1', 409, 0, NULL, '2025-06-26 06:44:59', 'SYNCED', 'Active', 209),
(1193, 'SOL', '8prYSX9YBYVAfeMFZHBd1MY7yPxfLuT39VXj6ZEvfEmq', 'Address 1', 409, 0, NULL, '2025-06-26 06:44:59', 'SYNCED', 'Active', 209),
(1194, 'BTC', 'mncyRxPyDzuY7w5d5ha5KuUZEhpUiEuybL', 'Address 1', 409, 0, NULL, '2025-06-26 06:44:59', 'SYNCED', 'Active', 209),
(1195, 'ETH', '0xd57ec10d6be63154c875454472ca222908bff1c1', 'Address 1', 410, 0, NULL, '2025-06-26 09:37:37', 'SYNCED', 'Active', 210),
(1196, 'BNB', '0xffb3f9daeec8a6689d69ec699ff750e80b38c163', 'Address 1', 410, 0, NULL, '2025-06-26 09:37:37', 'SYNCED', 'Active', 210),
(1197, 'SOL', 'AjiSAtiCtXDXfCBB5QEcaEQBGFxsFieRwNHAeevBgbcg', 'Address 1', 410, 0, NULL, '2025-06-26 09:37:37', 'SYNCED', 'Active', 210),
(1198, 'BTC', 'mokMnk2DnVTzay4d7i6qa1kP1NoCD177q8', 'Address 1', 410, 0, NULL, '2025-06-26 09:37:37', 'SYNCED', 'Active', 210),
(1199, 'ETH', '0xf465393a0e6916e3db3ab820b829c5a0194d8d0d', 'Address 1', 415, 0, NULL, '2025-06-26 10:55:26', 'SYNCED', 'Active', 211),
(1200, 'BNB', '0x3a7665accf07851e4cbbe20961f5db8ce7cf917c', 'Address 1', 415, 0, NULL, '2025-06-26 10:55:26', 'SYNCED', 'Active', 211),
(1201, 'SOL', 'er4PuszKtqksGJreTV5hWY7Cpj517p6nDwQhm3oyPEH', 'Address 1', 415, 0, NULL, '2025-06-26 10:55:26', 'SYNCED', 'Active', 211),
(1202, 'BTC', 'mjdZmfpaQ89XxZkRLcRyxozNt57ZPjSBV8', 'Address 1', 415, 0, NULL, '2025-06-26 10:55:26', 'SYNCED', 'Active', 211);

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
-- Table structure for table `bookmarked_tokens`
--

CREATE TABLE `bookmarked_tokens` (
  `id` int NOT NULL,
  `token_id` varchar(30) NOT NULL,
  `user_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `symbol` varchar(20) NOT NULL,
  `rank` int NOT NULL,
  `type` varchar(20) NOT NULL,
  `rev` int NOT NULL,
  `chain` varchar(20) NOT NULL,
  `address` varchar(255) NOT NULL,
  `asset_type` varchar(20) NOT NULL,
  `wallet_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at.` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `logo` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `bookmarked_tokens`
--

INSERT INTO `bookmarked_tokens` (`id`, `token_id`, `user_id`, `name`, `symbol`, `rank`, `type`, `rev`, `chain`, `address`, `asset_type`, `wallet_id`, `created_at`, `logo`) VALUES
(26, 'tronpad-tronpad', 296, 'TRONPAD', 'TRONPAD', 1635, 'token', 10653071, 'BNB', '0x1bf7aedec439d6bfe38f8f9b20cf3dc99e3571c4', 'BEP20', 61, '2025-04-14 11:50:56', 'https://static.coinpaprika.com/coin/tronpad-tronpad/logo.png'),
(27, 'lite-liteusd', 296, 'LiteUSD', 'LITE', 2455, 'token', 10980821, 'BNB', '0x3ef3f6cf9f867a33c4109208a6bd043a9ef0e091', 'BEP20', 61, '2025-04-14 12:06:42', 'https://static.coinpaprika.com/coin/lite-liteusd/logo.png'),
(28, 'link-chainlink', 303, 'Chainlink', 'LINK', 15, 'token', 11267579, 'ETH', '0x514910771af9ca656af840dff83e8264ecf986ca', 'ERC20', 66, '2025-04-15 09:30:51', 'https://static.coinpaprika.com/coin/link-chainlink/logo.png'),
(29, 'link-chainlink', 305, 'Chainlink', 'LINK', 15, 'token', 11267579, 'ETH', '0x514910771af9ca656af840dff83e8264ecf986ca', 'ERC20', 67, '2025-04-15 09:57:33', 'https://static.coinpaprika.com/coin/link-chainlink/logo.png'),
(30, 'trxc-tronclassic', 305, 'TRONCLASSIC', 'TRXC', 0, 'token', 6603349, 'ETH', '0xad5fe5b0b8ec8ff4565204990e4405b2da117d8e', 'ERC20', 67, '2025-04-15 19:00:39', 'https://static.coinpaprika.com/coin/trxc-tronclassic/logo.png'),
(31, 'usdt-tether', 318, 'Tether', 'USDT', 3, 'token', 11419943, 'ETH', '0xdac17f958d2ee523a2206206994597c13d831ec7', 'ERC20', 87, '2025-04-21 11:00:41', 'https://static.coinpaprika.com/coin/usdt-tether/logo.png'),
(32, 'usdt-tether', 358, 'Tether', 'USDT', 3, 'token', 11419943, 'ETH', '0xdac17f958d2ee523a2206206994597c13d831ec7', 'ERC20', 146, '2025-05-07 05:55:15', 'https://static.coinpaprika.com/coin/usdt-tether/logo.png'),
(33, 'usdt-tether', 358, 'Tether', 'USDT', 3, 'token', 11419943, 'SOL', 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', 'Other', 146, '2025-05-07 07:42:21', 'https://static.coinpaprika.com/coin/usdt-tether/logo.png'),
(34, 'usdt-tether', 359, 'Tether', 'USDT', 3, 'token', 11419943, 'SOL', 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', 'Other', 147, '2025-05-07 09:01:03', 'https://static.coinpaprika.com/coin/usdt-tether/logo.png'),
(35, 'usdt-tether', 360, 'Tether', 'USDT', 3, 'token', 11419943, 'ETH', '0xdac17f958d2ee523a2206206994597c13d831ec7', 'ERC20', 148, '2025-05-07 09:09:20', 'https://static.coinpaprika.com/coin/usdt-tether/logo.png'),
(36, 'usdtb-usdtb', 360, 'USDtb', 'USDTB', 3672, 'token', 11392109, 'ETH', '0xc139190f447e929f090edeb554d95abb8b18ac1c', 'ERC20', 148, '2025-05-07 09:09:54', 'https://static.coinpaprika.com/coin/usdtb-usdtb/logo.png'),
(37, 'usdt-tether', 360, 'Tether', 'USDT', 3, 'token', 11419943, 'ETH', '0xdac17f958d2ee523a2206206994597c13d831ec7', 'ERC20', 148, '2025-05-07 10:07:12', 'https://static.coinpaprika.com/coin/usdt-tether/logo.png'),
(39, 'usdt-tether', 361, 'Tether', 'USDT', 3, 'token', 11419943, 'ETH', '0xdac17f958d2ee523a2206206994597c13d831ec7', 'ERC20', 149, '2025-05-07 10:56:48', 'https://static.coinpaprika.com/coin/usdt-tether/logo.png'),
(40, 'usdt-tether', 363, 'Tether', 'USDT', 3, 'token', 11419943, 'ETH', '0xdac17f958d2ee523a2206206994597c13d831ec7', 'ERC20', 151, '2025-05-07 12:30:10', 'https://static.coinpaprika.com/coin/usdt-tether/logo.png'),
(43, 'usdt-tether', 364, 'Tether', 'USDT', 3, 'token', 11419943, 'ETH', '0xdac17f958d2ee523a2206206994597c13d831ec7', 'ERC20', 152, '2025-05-08 06:55:32', 'https://static.coinpaprika.com/coin/usdt-tether/logo.png'),
(44, 'axlusdc-axelar-wrapped-usdc', 364, 'Axelar Wrapped USDC', 'AXLUSDC', 6760, 'token', 11091401, 'BNB', '0x4268b8f0b87b6eae5d897996e6b845ddbd99adf3', 'BEP20', 152, '2025-05-08 07:00:51', 'https://static.coinpaprika.com/coin/axlusdc-axelar-wrapped-usdc/logo.png'),
(45, 'tetller-tetller-usdt', 364, 'Tetller USDT', 'TETLLER', 0, 'token', 11264741, 'BNB', '0x5f6f6861EB07381D02f8FBaaC4782553022F046b', 'BEP20', 152, '2025-05-08 11:28:26', 'https://static.coinpaprika.com/coin/tetller-tetller-usdt/logo.png'),
(46, 'usdt-tether', 366, 'Tether', 'USDT', 3, 'token', 11419943, 'ETH', '0xdac17f958d2ee523a2206206994597c13d831ec7', 'ERC20', 154, '2025-05-09 05:57:46', 'https://static.coinpaprika.com/coin/usdt-tether/logo.png'),
(47, 'seth-sepolia-eth', 366, 'SEPOLIA ETH', 'SETH', 0, 'token', 0, 'ETH', '0xd38e5c25935291ffd51c9d66c3b7384494bb099a', 'ERC20', 154, '2025-05-09 13:49:59', ''),
(48, 'link-chainlink', 366, 'Chainlink', 'LINK', 14, 'token', 11267579, 'ETH', '0x514910771af9ca656af840dff83e8264ecf986ca', 'ERC20', 154, '2025-05-09 14:00:18', 'https://static.coinpaprika.com/coin/link-chainlink/logo.png'),
(49, 'weth-weth', 366, 'WETH', 'WETH', 19, 'token', 117333, 'ETH', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 'ERC20', 154, '2025-05-12 06:34:36', 'https://static.coinpaprika.com/coin/weth-weth/logo.png'),
(50, 'bnbhare-bnbhare', 366, 'BNBHare', 'BNBHARE', 0, 'token', 0, 'BNB', '0x1ab8422cce396f0d36b2f321a476988651611c67', 'BEP20', 154, '2025-05-12 06:38:59', ''),
(53, 'solama-solama', 308, 'Solama', 'SOLAMA', 1223, 'token', 11124839, 'SOL', 'AVLhahDcDQ4m4vHM4ug63oh7xc8Jtk49Dm5hoe9Sazqr', 'Other', 72, '2025-05-13 10:42:56', 'https://static.coinpaprika.com/coin/solama-solama/logo.png'),
(54, 'solama-solama', 369, 'Solama', 'SOLAMA', 3034, 'token', 11124839, 'SOL', 'AVLhahDcDQ4m4vHM4ug63oh7xc8Jtk49Dm5hoe9Sazqr', 'Other', 157, '2025-05-14 06:51:08', 'https://static.coinpaprika.com/coin/solama-solama/logo.png'),
(55, 'solama-solama', 371, 'Solama', 'SOLAMA', 1215, 'token', 11124839, 'SOL', 'AVLhahDcDQ4m4vHM4ug63oh7xc8Jtk49Dm5hoe9Sazqr', 'Other', 159, '2025-05-14 10:04:35', 'https://static.coinpaprika.com/coin/solama-solama/logo.png'),
(56, 'solama-solama', 375, 'Solama', 'SOLAMA', 1226, 'token', 11124839, 'SOL', 'AVLhahDcDQ4m4vHM4ug63oh7xc8Jtk49Dm5hoe9Sazqr', 'Other', 170, '2025-05-15 12:30:08', 'https://static.coinpaprika.com/coin/solama-solama/logo.png'),
(57, 'usde-ethena-usde', 378, 'Ethena USDe', 'USDE', 33, 'token', 11120913, 'ETH', '0x4c9edd5852cd905f086c759e8383e09bff1e68b3', 'ERC20', 174, '2025-05-16 10:47:10', 'https://static.coinpaprika.com/coin/usde-ethena-usde/logo.png'),
(58, 'ssol-solayer-sol', 379, 'Solayer SOL', 'SSOL', 398, 'token', 11284093, 'SOL', 'sSo14endRuUbvQaJS3dq36Q829a3A6BEfoeeRGJywEh', 'Other', 176, '2025-05-16 14:13:01', 'https://static.coinpaprika.com/coin/ssol-solayer-sol/logo.png'),
(59, 'solama-solama', 387, 'Solama', 'SOLAMA', 1223, 'token', 11124839, 'SOL', 'AVLhahDcDQ4m4vHM4ug63oh7xc8Jtk49Dm5hoe9Sazqr', 'Other', 185, '2025-05-20 10:46:45', 'https://static.coinpaprika.com/coin/solama-solama/logo.png'),
(60, 'usde-ethena-usde', 308, 'Ethena USDe', 'USDE', 31, 'token', 11120913, 'ETH', '0x4c9edd5852cd905f086c759e8383e09bff1e68b3', 'ERC20', 72, '2025-05-20 12:00:43', 'https://static.coinpaprika.com/coin/usde-ethena-usde/logo.png'),
(61, 'ssol-solayer-sol', 388, 'Solayer SOL', 'SSOL', 402, 'token', 11284093, 'SOL', 'sSo14endRuUbvQaJS3dq36Q829a3A6BEfoeeRGJywEh', 'Other', 186, '2025-05-22 06:37:58', 'https://static.coinpaprika.com/coin/ssol-solayer-sol/logo.png'),
(63, 'usdc-usdc', 371, 'USDC', 'USDC', 7, 'token', 10562849, 'ETH', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 'ERC20', 160, '2025-05-29 08:16:35', 'https://static.coinpaprika.com/coin/usdc-usdc/logo.png'),
(64, 'babysol-baby-solana', 388, 'Baby Solana', 'BABYSOL', 1854, 'token', 11329441, 'SOL', '54meDtup2K7pqyhUK24AymoLzMPtrkhNTbEzQ6gSpump', 'Other', 186, '2025-05-29 10:08:36', 'https://static.coinpaprika.com/coin/babysol-baby-solana/logo.png'),
(65, 'ena-ethena', 388, 'Ethena', 'ENA', 53, 'token', 11161633, 'ETH', '0x57e114B691Db790C35207b2e685D4A43181e6061', 'ERC20', 186, '2025-05-29 10:09:46', 'https://static.coinpaprika.com/coin/ena-ethena/logo.png'),
(66, 'babysol-baby-solana', 395, 'Baby Solana', 'BABYSOL', 2082, 'token', 11329441, 'SOL', '54meDtup2K7pqyhUK24AymoLzMPtrkhNTbEzQ6gSpump', 'Other', 194, '2025-06-12 08:09:29', 'https://static.coinpaprika.com/coin/babysol-baby-solana/logo.png'),
(67, 'up-user-pay', 396, 'USER PAY', 'UP', 13117, 'token', 11017585, 'BNB', '0xcf15b63f1ea2596b297774f8753a5b6d4a7c385e', 'BEP20', 195, '2025-06-12 10:05:49', 'https://static.coinpaprika.com/coin/up-user-pay/logo.png'),
(68, 'usdc-usdc', 400, 'USDC', 'USDC', 7, 'token', 10562849, 'ETH', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 'ERC20', 201, '2025-06-13 10:33:14', 'https://static.coinpaprika.com/coin/usdc-usdc/logo.png'),
(69, 'usdtb-usdtb', 406, 'USDtb', 'USDTB', 4865, 'token', 11392109, 'ETH', '0xc139190f447e929f090edeb554d95abb8b18ac1c', 'ERC20', 207, '2025-06-22 18:31:21', 'https://static.coinpaprika.com/coin/usdtb-usdtb/logo.png');

-- --------------------------------------------------------

--
-- Table structure for table `custom_urls`
--

CREATE TABLE `custom_urls` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `wallet_id` int NOT NULL,
  `blockchain_name` varchar(30) NOT NULL,
  `node_url` text NOT NULL,
  `explorer_url` text NOT NULL,
  `crypto_currency_ticker` varchar(30) NOT NULL,
  `chain_id` varchar(30) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `custom_urls`
--

INSERT INTO `custom_urls` (`id`, `user_id`, `wallet_id`, `blockchain_name`, `node_url`, `explorer_url`, `crypto_currency_ticker`, `chain_id`, `created_at`) VALUES
(5, 300, 63, 'Ethereum Testnet', 'https://nodeurl', 'https://explirerurl', 'ETH', '11155111', '2025-04-15 07:11:47'),
(10, 300, 63, 'Bitcoin Testnet', 'https://1234teststylish-magical-water.btc-testnet.quiknode.pro/f1445c4cf5b9fe69206db7f8834b12ab0e75436c/', 'https://live.blockcypher.com/btc-testnet/', 'BTC', '', '2025-04-15 07:12:40'),
(11, 305, 69, 'Ethereum Testnet', 'https://ethereum-sepolia-rpc.publicnode.com', 'https://sepolia.etherscan.io/', 'ETH', '11155111', '2025-04-17 06:52:16');

-- --------------------------------------------------------

--
-- Table structure for table `dapps_list`
--

CREATE TABLE `dapps_list` (
  `id` int NOT NULL,
  `title` varchar(50) NOT NULL,
  `icon_url` text NOT NULL,
  `url` text NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `back_url` text NOT NULL,
  `tag_info` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `dapps_list`
--

INSERT INTO `dapps_list` (`id`, `title`, `icon_url`, `url`, `description`, `back_url`, `tag_info`) VALUES
(1, 'Transit Swap', 'https://hk.tpstatic.net/dapp/tokenpocket-1656660841569.png', 'https://swap.transit.finance/?locale=en', 'Cross-chain polymerization flash platform', 'https://hk.tpstatic.net/dapp/tokenpocket-1656660841569.png', '{\"title\":\"Recommend\",\"bd_color\":\"0xed401a\",\"bg_color\":\"\",\"font_color\":\"0xed401a\"}'),
(2, 'Uniswap', 'https://hk.tpstatic.net/dapp/tokenpocket-1590043752655.png', 'https://app.uniswap.org/', 'A protocol for an automated token exchange on Blockchain', 'https://hk.tpstatic.net/dapp/tokenpocket-1590043752655.png', '{\"title\":\"HOT\",\"bd_color\":\"0x2980fe\",\"bg_color\":\"\",\"font_color\":\"0x2980fe\"}'),
(3, 'PancakeSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1667471469423.jpg', 'https://pancakeswap.finance/swap', 'Trade, earn and win cryptocurrencies on the most popular decentralized platform', 'https://hk.tpstatic.net/dapp/tokenpocket-1667471469423.jpg', '{\"title\":\"HOT\",\"bd_color\":\"0x2980fe\",\"bg_color\":\"\",\"font_color\":\"0x2980fe\"}'),
(4, 'Jupiter', 'https://hk.tpstatic.net/dapp/tokenpocket-1702954974433.jpg', 'https://jup.ag/', 'Building the best exchange in crypto.', 'https://hk.tpstatic.net/dapp/tokenpocket-1702954974433.jpg', '{\"title\":\"HOT\",\"bd_color\":\"0x2980fe\",\"bg_color\":\"\",\"font_color\":\"0x2980fe\"}'),
(5, '1inch', 'https://hk.tpstatic.net/dapp/tokenpocket-1611630899566.png', 'https://app.1inch.io/', 'Decentralized Aggregated Exchange', 'https://hk.tpstatic.net/dapp/tokenpocket-1611630899566.png', NULL),
(6, 'iZiSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1661502532378.jpg', 'https://izumi.finance/trade/swap', 'The next-generation DEX on the BNB chain, maximizing capital efficiency through an innovative Discretized-Liquidity-AMM model.', 'https://hk.tpstatic.net/dapp/tokenpocket-1661502532378.jpg', NULL),
(7, 'Merkl', 'https://hk.tpstatic.net/dapp/tokenpocket-1744772039866.jpg', 'https://app.merkl.xyz/', 'Merkl boosts liquidity and growth for DeFi, crypto funds, and Web3 projects.', 'https://hk.tpstatic.net/dapp/tokenpocket-1744772039866.jpg', NULL),
(8, 'Butter Swap', 'https://hk.tpstatic.net/dapp/tokenpocket-1715057077440.jpg', 'https://www.butterswap.io/swap', 'ButterSwap is the first fully composable decentralized cross-chain asset bridge.', 'https://hk.tpstatic.net/dapp/tokenpocket-1715057077440.jpg', NULL),
(9, 'DeDust.io', 'https://hk.tpstatic.net/dapp/tokenpocket-1721121894030.jpg', 'https://dedust.io/', 'Decentralized Exchange on TON.', 'https://hk.tpstatic.net/dapp/tokenpocket-1721121894030.jpg', '{\"title\":\"HOT\",\"bd_color\":\"0x2980fe\",\"bg_color\":\"\",\"font_color\":\"0x2980fe\"}'),
(10, 'Hop Aggregator', 'https://hk.tpstatic.net/dapp/tokenpocket-1727266516281.jpg', 'https://hop.ag/swap/SUI-USDC', 'Swap on SuiNetwork for the best price with zero fees.', 'https://hk.tpstatic.net/dapp/tokenpocket-1727266516281.jpg', NULL),
(11, 'SyncSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1680147646677.jpeg', 'https://syncswap.xyz/', 'DEX on zkSync.', 'https://hk.tpstatic.net/dapp/tokenpocket-1680147646677.jpeg', NULL),
(12, 'Indie.fun', 'https://hk.tpstatic.net/dapp/tokenpocket-1737084001946.jpg', 'http://www.indie.fun/', 'Indie.fun is a platform focused on Web3 gaming', 'https://hk.tpstatic.net/dapp/tokenpocket-1737084001946.jpg', NULL),
(13, 'QuickSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1619789687310.jpeg', 'https://quickswap.exchange/#/swap', 'Next-generation Layer2 DEX, fast and affordable.', 'https://hk.tpstatic.net/dapp/tokenpocket-1619789687310.jpeg', '{\"title\":\"HOT\",\"bd_color\":\"0x2980fe\",\"bg_color\":\"\",\"font_color\":\"0x2980fe\"}'),
(14, 'Asterdex', 'https://hk.tpstatic.net/dapp/tokenpocket-1744790936327.jpg', 'https://www.asterdex.com/en', 'The Next-Gen Perp DEX for All Traders', 'https://hk.tpstatic.net/dapp/tokenpocket-1744790936327.jpg', NULL),
(15, 'MintSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1718882012554.jpg', 'https://www.mintswap.finance/swap', 'DEX & NFT marketplace on the Mint Blockchain', 'https://hk.tpstatic.net/dapp/tokenpocket-1718882012554.jpg', NULL),
(16, 'Thruster', 'https://hk.tpstatic.net/dapp/tokenpocket-1714881582734.jpg', 'https://app.thruster.finance/', 'A yield-first DEX on the Blast blockchain.', 'https://hk.tpstatic.net/dapp/tokenpocket-1714881582734.jpg', NULL),
(17, 'Glyph Exchange', 'https://hk.tpstatic.net/dapp/tokenpocket-1715056386497.png', 'https://glyph.exchange/', 'Glyph Exchange', 'https://hk.tpstatic.net/dapp/tokenpocket-1715056386497.png', NULL),
(18, 'Whales Market', 'https://hk.tpstatic.net/dapp/tokenpocket-1710329825425.jpg', 'https://app.whales.market/', 'Whales Market offers a decentralized OTC trading platform for users to directly exchange assets across multiple blockchains, with complete trustlessness and security guaranteed. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1710329825425.jpg', NULL),
(19, 'Point Market', 'https://hk.tpstatic.net/dapp/tokenpocket-1718764514762.png', 'https://www.point.market/home', 'Trade your favorite projects\' points.', 'https://hk.tpstatic.net/dapp/tokenpocket-1718764514762.png', NULL),
(20, 'Parcl', 'https://hk.tpstatic.net/dapp/tokenpocket-1722238801831.jpg', 'https://app.parcl.co/', 'Parcl is a real estate investment platform that allows you to invest in the price fluctuations of the global housing market.', 'https://hk.tpstatic.net/dapp/tokenpocket-1722238801831.jpg', NULL),
(21, 'Degen Express', 'https://hk.tpstatic.net/dapp/tokenpocket-1724310888497.jpg', 'https://degen.express/fantom/tokens', 'First SAFU multichainmemepadinu,jump on the Degen Express superSonic train and build your next coin.', 'https://hk.tpstatic.net/dapp/tokenpocket-1724310888497.jpg', NULL),
(22, 'TsunamiX', 'https://hk.tpstatic.net/dapp/tokenpocket-1727184212477.jpg', 'https://tsunami.finance/trade', 'TsunamiX is a leveraged trading protocol.', 'https://hk.tpstatic.net/dapp/tokenpocket-1727184212477.jpg', NULL),
(23, 'Alien Base', 'https://hk.tpstatic.net/dapp/tokenpocket-1733478463657.png', 'https://app.alienbase.xyz/', 'Alien Base is dedicated to enhancing the trading experience on DeFi by offering a CEX-like interface combined with the privacy benefits of decentralized finance. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1733478463657.png', NULL),
(24, 'Akka', 'https://hk.tpstatic.net/dapp/tokenpocket-1715400927168.png', 'https://app.akka.finance', 'Akka is a cutting-edge AI-powered DEX aggregator, offering near-zero slippage trades with the best possible rates and instant execution.', 'https://hk.tpstatic.net/dapp/tokenpocket-1715400927168.png', NULL),
(25, 'FluxBeam', 'https://hk.tpstatic.net/dapp/tokenpocket-1740041659105.jpg', 'https://fluxbeam.xyz/', 'FluxBeam is a Solana Telegram trading bot, allowing users to quickly and easily interact with the Solana blockchain.', 'https://hk.tpstatic.net/dapp/tokenpocket-1740041659105.jpg', NULL),
(26, 'Virtuals Protocol', 'https://hk.tpstatic.net/dapp/tokenpocket-1730005247585.jpg', 'https://app.virtuals.io/', 'Virtuals Protocol', 'https://hk.tpstatic.net/dapp/tokenpocket-1730005247585.jpg', NULL),
(27, 'Holoworld AI', 'https://hk.tpstatic.net/dapp/tokenpocket-1739183900616.png', 'https://app.holoworld.com/', 'Holoworld is a Web3 AI and 3D entertainment social network. Interact with and create user favorite virtual characters using AI, build the next popular VTuber, and start creating unforgettable moments across the web with any social, content or gaming platform with just a few clicks.', 'https://hk.tpstatic.net/dapp/tokenpocket-1739183900616.png', NULL),
(28, 'Solar Dex', 'https://hk.tpstatic.net/dapp/tokenpocket-1738830407749.jpg', 'https://eclipse.solarstudios.co/swap/?inputMint=sol&outputMint=AKEWE7Bgh87GPp171b4cJPSSZfmZwQ3KaqYqXoKLNAEE', 'Solar DEX is a decentralized exchange uniquely positioned on the Eclipse Network, integrating both v2 Standard Pools and v3 Concentrated Pools.', 'https://hk.tpstatic.net/dapp/tokenpocket-1738830407749.jpg', NULL),
(29, 'Shogun', 'https://hk.tpstatic.net/dapp/tokenpocket-1738827888893.jpg', 'https://www.gun.fun/', 'Shogun is a cross-chain DEX aggregator that uses intents across modular blockchains like Berachain, Solana and other EVM chains to turn MEV into TEV (trader extractable value).', 'https://hk.tpstatic.net/dapp/tokenpocket-1738827888893.jpg', NULL),
(30, 'Gummi', 'https://hk.tpstatic.net/dapp/tokenpocket-1738824970682.jpg', 'https://gummi.fi/demo', 'Gummi is Berachain\'s first modular money market, allowing you to borrow against any token, yield farm, or NFT at up to 99%+ LTVs. Gummi allows users to leverage trade any token or NFT at up to 100x leverage.', 'https://hk.tpstatic.net/dapp/tokenpocket-1738824970682.jpg', NULL),
(31, 'Mint Club', 'https://hk.tpstatic.net/dapp/tokenpocket-1725871313219.jpg', 'https://mint.club/', 'Create and trade BondingCurve tokens or NFTs with automated liquidity across more than 13 multi-chains.', 'https://hk.tpstatic.net/dapp/tokenpocket-1725871313219.jpg', NULL),
(32, 'DaoLama', 'https://hk.tpstatic.net/dapp/tokenpocket-1721201943348.jpg', 'https://app.daolama.co/', 'Get TON for your NFTs as collateral at DAOLama', 'https://hk.tpstatic.net/dapp/tokenpocket-1721201943348.jpg', NULL),
(33, 'Storm Trade', 'https://hk.tpstatic.net/dapp/tokenpocket-1721136821453.jpg', 'https://app.storm.tg/trade/TON_USDT', 'Storm Trade is the first decentralised derivatives trading platform on Telegram, built on the TON blockchain and allowing trading with leverage up to x50.', 'https://hk.tpstatic.net/dapp/tokenpocket-1721136821453.jpg', NULL),
(34, 'STON.fi', 'https://hk.tpstatic.net/dapp/tokenpocket-1721121467410.jpg', 'https://app.ston.fi/swap?chartVisible=false&chartInterval=1w&ft=TON&tt=STON', 'Cross-Chain DEX with its own security protocol on TON Blockchain. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1721121467410.jpg', '{\"title\":\"HOT\",\"bd_color\":\"0x2980fe\",\"bg_color\":\"\",\"font_color\":\"0x2980fe\"}'),
(35, 'Layerswap', 'https://hk.tpstatic.net/dapp/tokenpocket-1721119113107.jpg', 'https://layerswap.io/app', 'Fast and reliable crypto transfers across networks.', 'https://hk.tpstatic.net/dapp/tokenpocket-1721119113107.jpg', NULL),
(36, 'Getgems', 'https://hk.tpstatic.net/dapp/tokenpocket-1721124463182.jpg', 'https://getgems.io/', 'TON NFT Marketplace', 'https://hk.tpstatic.net/dapp/tokenpocket-1721124463182.jpg', NULL),
(37, 'NURI Exchange', 'https://hk.tpstatic.net/dapp/tokenpocket-1720705631458.jpg', 'https://www.nuri.exchange/swap', 'NURI pairs incentives with concentrated liquidity for next-level capital efficiency', 'https://hk.tpstatic.net/dapp/tokenpocket-1720705631458.jpg', NULL),
(38, 'MUX Protocol', 'https://hk.tpstatic.net/dapp/tokenpocket-1720775518812.png', 'https://app.mux.network/#/trade?chainId=42161&unit=USD&collateral=USDC&market=ETH', 'Leading Perps Aggregator.', 'https://hk.tpstatic.net/dapp/tokenpocket-1720775518812.png', NULL),
(39, 'Oku Trade', 'https://hk.tpstatic.net/dapp/tokenpocket-1720778129661.jpg', 'https://oku.trade/app/scroll/pool/0x813df550a32d4a9d42010d057386429ad2328ed9', 'Oku Trade is a non-custodial DEX trading platform and bridge aggregator offering the best rates and analytics across 16 EVM chains. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1720778129661.jpg', NULL),
(40, 'Synonym Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1720778680891.jpg', 'https://app.synonym.finance/?_gl=1*13ttdrb*_ga*NTU1NDcyODgwLjE3MjA3Nzg1ODE.*_ga_0TS5JM1YTY*MTcyMDc3ODU4MC4xLjAuMTcyMDc3ODU4MC4wLjAuMA..', 'Synonym is a universal multi-chain money market. Lend, borrow and earn from anywhere.', 'https://hk.tpstatic.net/dapp/tokenpocket-1720778680891.jpg', NULL),
(41, 'Router Protocol', 'https://hk.tpstatic.net/dapp/tokenpocket-1720786689664.jpg', 'https://app.routernitro.com/swap', 'A Secure, Scalable, Modular, Composable Framework for Cross-chain Interoperability! ', 'https://hk.tpstatic.net/dapp/tokenpocket-1720786689664.jpg', NULL),
(42, 'TonRaffles', 'https://hk.tpstatic.net/dapp/tokenpocket-1721211858606.jpg', 'https://tonraffles.app/swap', 'Ton Raffles is the first and largest Grow Community ecosystem on the TON blockchain. It provides a suite of Web3 tools designed to empower users to launch and grow their own projects or contribute to the development of other innovative products.', 'https://hk.tpstatic.net/dapp/tokenpocket-1721211858606.jpg', NULL),
(43, 'Chainge', 'https://hk.tpstatic.net/dapp/tokenpocket-1722241173969.jpg', 'https://dapp.chainge.finance/?fromChain=ETH&toChain=ETH&fromToken=USDT&toToken=XCHNG', 'Your own DeFi universe in one app. Powered by cross-chain magic.', 'https://hk.tpstatic.net/dapp/tokenpocket-1722241173969.jpg', NULL),
(44, 'CapybaraDEX', 'https://hk.tpstatic.net/dapp/tokenpocket-1725869065968.jpg', 'https://dex.capybara.exchange/en', 'The 1st Launchpad & Decentralized Exchange on kaia chain. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1725869065968.jpg', NULL),
(45, 'KaiaSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1725869645676.jpg', 'https://kaiaswap.org/trade/swap', 'The Leading CLAMM DEX & Omni-IDO Platform powered by the Kaia Foundation', 'https://hk.tpstatic.net/dapp/tokenpocket-1725869645676.jpg', NULL),
(46, 'Epumpfun', 'https://hk.tpstatic.net/dapp/tokenpocket-1727680764497.jpg', 'https://epump.fun', 'Best Fair Launch Platform for MEME Coins on Ethereum.', 'https://hk.tpstatic.net/dapp/tokenpocket-1727680764497.jpg', NULL),
(47, 'GRAFUN', 'https://hk.tpstatic.net/dapp/tokenpocket-1728530998559.jpeg', 'https://gra.fun/', 'GraFun is a Launchpad platform for meme coins on the BNB Chain.', 'https://hk.tpstatic.net/dapp/tokenpocket-1728530998559.jpeg', NULL),
(48, 'Fibrous', 'https://hk.tpstatic.net/dapp/tokenpocket-1732543288515.jpg', 'https://app.fibrous.finance/en?network=scroll&mode=swap&source=0x0000000000000000000000000000000000000000&destination=0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4', 'First DEX Aggregator of Starknet, now live on Scroll!', 'https://hk.tpstatic.net/dapp/tokenpocket-1732543288515.jpg', NULL),
(49, 'Pangolin', 'https://hk.tpstatic.net/dapp/tokenpocket-1630051564613.png', 'https://app.pangolin.exchange/#/swap', 'DEX based on Avalanche Protocol', 'https://hk.tpstatic.net/dapp/tokenpocket-1630051564613.png', NULL),
(50, 'APENFT', 'https://hk.tpstatic.net/dapp/tokenpocket-1738897976769.jpg', 'https://nftpump.meme/', 'The First NFT collection Fair Launch Platform on Tron.', 'https://hk.tpstatic.net/dapp/tokenpocket-1738897976769.jpg', NULL),
(51, 'ParaSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1655739124266.jpg', 'https://app.paraswap.io/', 'DEX Aggregator.', 'https://hk.tpstatic.net/dapp/tokenpocket-1655739124266.jpg', NULL),
(52, 'IceCreamSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1716796252692.png', 'https://icecreamswap.com/', 'IceCreamSwap is a DEX aggregator and launchpad.', 'https://hk.tpstatic.net/dapp/tokenpocket-1716796252692.png', NULL),
(53, 'tokr.fun', 'https://hk.tpstatic.net/dapp/tokenpocket-1724311652624.jpg', 'https://tokr.fun/', 'First meme launcher on TON! ', 'https://hk.tpstatic.net/dapp/tokenpocket-1724311652624.jpg', NULL),
(54, 'Ape.Store', 'https://hk.tpstatic.net/dapp/tokenpocket-1724312673129.jpg', 'https://ape.store/', 'Revolutionary launchpad, create token for cents, trade it instantly, list it automatically without the need to add liquidity.', 'https://hk.tpstatic.net/dapp/tokenpocket-1724312673129.jpg', NULL),
(55, 'Burve Protocol', 'https://hk.tpstatic.net/dapp/tokenpocket-1724315800525.jpg', 'https://app.burve.io/?chainId=56', 'Consensus-driven Bonding Curve DeFi Protocol for innovative liquidity and fair token launch solutions.', 'https://hk.tpstatic.net/dapp/tokenpocket-1724315800525.jpg', NULL),
(56, 'nuts.fun', 'https://hk.tpstatic.net/dapp/tokenpocket-1725603615464.jpg', 'https://www.nuts.fun/', ' Instantly launch tokens and watch them go nuts，earn NUTS on everything you do.', 'https://hk.tpstatic.net/dapp/tokenpocket-1725603615464.jpg', NULL),
(57, 'Aevo', 'https://hk.tpstatic.net/dapp/tokenpocket-1727255496369.jpg', 'https://app.aevo.xyz/perpetual/eth', 'Aevo is a high-performance decentralized derivatives trading platform, focused on options and perpetual contracts.', 'https://hk.tpstatic.net/dapp/tokenpocket-1727255496369.jpg', NULL),
(58, 'Vanilla Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1727271171135.jpg', 'https://www.vanillafinance.xyz/en/trade', 'Vanilla Finance is a decentralized derivatives trading platform that offers leverage up to 10,000x without liquidations.', 'https://hk.tpstatic.net/dapp/tokenpocket-1727271171135.jpg', NULL),
(59, 'BNBPump', 'https://hk.tpstatic.net/dapp/tokenpocket-1733924215857.jpg', 'https://www.bnbpump.net/#/', 'BNBPump was born as a highly secure platform for fair transmission and Meme coin transactions on the BSC chain. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1733924215857.jpg', NULL),
(60, 'BTC.Fun', 'https://hk.tpstatic.net/dapp/tokenpocket-1737087697546.jpg', 'https://btc.fun/', 'BTC.Fun is a memecoin launchpad for BTC native assets, deployed on Merlin Chain.', 'https://hk.tpstatic.net/dapp/tokenpocket-1737087697546.jpg', NULL),
(61, 'flaunch', 'https://hk.tpstatic.net/dapp/tokenpocket-1738374965362.jpg', 'https://flaunch.gg/', 'flaunch is a platform to buy, sell and launch memes. 100% of trading fees go to creators and buybacks. Powered by Uniswap V4.', 'https://hk.tpstatic.net/dapp/tokenpocket-1738374965362.jpg', NULL),
(62, 'SpookySwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1630921827248.png', 'https://spookyswap.finance/', 'Community-driven DEX based on FTM', 'https://hk.tpstatic.net/dapp/tokenpocket-1630921827248.png', NULL),
(63, 'APX', 'https://tp-statics.cdn.bcebos.com/website/tokenpocket-1647586399362.png', 'https://www.apollox.finance', 'APX - a decentralized cryptocurrency derivatives exchange, offering a variety of contracts, deep liquidity, a stable system, and up to 100x leverage.', 'https://tp-statics.cdn.bcebos.com/website/tokenpocket-1647586399362.png', NULL),
(64, 'Router Nitro', 'https://hk.tpstatic.net/dapp/tokenpocket-1727093451374.jpg', 'https://app.routernitro.com/swap', 'Efficient, Secure, and Cost-effective Cross-Chain Bridging', 'https://hk.tpstatic.net/dapp/tokenpocket-1727093451374.jpg', NULL),
(65, 'Changelly', 'https://hk.tpstatic.net/dapp/tokenpocket-1573649515446.png', 'https://widget.changelly.com?currencies=atom,usdt20,usdt,tusd,trx,eosdt,eos,bnb,btc,eth&from=atom&to=usdt&amount=1&address=&fiat=true&fixedTo=false&theme=default&merchant_id=0odjzlvnguljbjuo&payment_id=', 'Instant token exchange service.', 'https://hk.tpstatic.net/dapp/tokenpocket-1573649515446.png', NULL),
(66, 'WOOFi Swap ', 'https://hk.tpstatic.net/dapp/tokenpocket-1636424851520.jpg', 'https://fi.woo.org/', 'A decentralized exchange that connects CeFi liquidity with DeFi', 'https://hk.tpstatic.net/dapp/tokenpocket-1636424851520.jpg', NULL),
(67, 'Megaton Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1721136403316.jpg', 'https://megaton.fi/', 'Megaton is an AMM-based DEX protocol to actively utilize the assets on the TON Network.', 'https://hk.tpstatic.net/dapp/tokenpocket-1721136403316.jpg', NULL),
(68, 'LN Exchange', 'https://hk.tpstatic.net/dapp/tokenpocket-1725345061994.jpg', 'https://app.ln.exchange/#/spot/btc-usdt?referrals=cnnnnwkb', 'The first Orderbook on Lightning Network, LN Exchange is a vertically integrated, decentralized trading powerhouse featuring peer-to-peer, spot, and perpetual orderbook trading for Bitcoins and Taproot Assets.', 'https://hk.tpstatic.net/dapp/tokenpocket-1725345061994.jpg', '{\"title\":\"HOT\",\"bd_color\":\"0x2980fe\",\"bg_color\":\"\",\"font_color\":\"0x2980fe\"}'),
(69, 'MagicSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1677056456459.jpg', 'https://magicswap.lol/', 'The gateway to the cross-game economy. Built for the @Treasure_DAO ecosystem. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1677056456459.jpg', NULL),
(70, 'Zapper', 'https://hk.tpstatic.net/dapp/tokenpocket-1680149196272.jpg', 'https://zapper.xyz/', 'Explore and discover opportunities across NFTs, DAOs and DeFi.', 'https://hk.tpstatic.net/dapp/tokenpocket-1680149196272.jpg', NULL),
(71, 'biswap', 'https://hk.tpstatic.net/dapp/tokenpocket-1626170579781.png', 'https://biswap.org?ref=25148f4f0677c449e538', 'Decentralized Exchange on Binance Smart Chain (BSC)', 'https://hk.tpstatic.net/dapp/tokenpocket-1626170579781.png', NULL),
(72, 'Bungee', 'https://hk.tpstatic.net/dapp/tokenpocket-1655714524915.png', 'https://www.bungee.exchange/', 'Multi-Chain Cross-Chain Exchange.', 'https://hk.tpstatic.net/dapp/tokenpocket-1655714524915.png', NULL),
(73, 'CowSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1707206797604.png', 'https://cowswap.exchange/#/swap', 'Anti-MEV (Miner Extractable Value) Swap', 'https://hk.tpstatic.net/dapp/tokenpocket-1707206797604.png', NULL),
(74, 'PinkSale', 'https://hk.tpstatic.net/dapp/tokenpocket-1678160649694.png', 'https://www.pinksale.finance/', 'The Launchpad Protocol for Everyone,pinkSale helps everyone to create their own tokens and token sales in few seconds.Tokens created on PinkSale will be verified and published on explorer websites', 'https://hk.tpstatic.net/dapp/tokenpocket-1678160649694.png', NULL),
(75, 'Reaper Farm', 'https://hk.tpstatic.net/dapp/tokenpocket-1679216786301.png', 'https://www.reaper.farm/', 'Simplified Yield Aggregator. Passive money multiplier. Reap. Compound. Repeat', 'https://hk.tpstatic.net/dapp/tokenpocket-1679216786301.png', NULL),
(76, 'BadgerDAO', 'https://hk.tpstatic.net/dapp/tokenpocket-1677658115249.jpg', 'https://app.badger.com/', 'Fostering Community Driven Growth for #bitcoin in DeFi', 'https://hk.tpstatic.net/dapp/tokenpocket-1677658115249.jpg', NULL),
(77, 'Ethervista', 'https://hk.tpstatic.net/dapp/tokenpocket-1725330692510.jpg', 'https://ethervista.app/', 'A new standard for Decentralized Exchanges,built for Ethereum and Layer 2s', 'https://hk.tpstatic.net/dapp/tokenpocket-1725330692510.jpg', NULL),
(78, 'Gains Network ', 'https://hk.tpstatic.net/dapp/tokenpocket-1675134286727.jpeg', 'https://gains.trade/', 'gTrade: Decentralized leveraged trading.', 'https://hk.tpstatic.net/dapp/tokenpocket-1675134286727.jpeg', NULL),
(79, 'Mellow Protocol', 'https://hk.tpstatic.net/dapp/tokenpocket-1677305377337.png', 'https://app.mellow.finance/products', 'Permissionless ecosystem for active liquidity management and building trustless automatic DeFi strategies.', 'https://hk.tpstatic.net/dapp/tokenpocket-1677305377337.png', NULL),
(80, 'ZyberSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1676704809701.jpg', 'https://app.zyberswap.io/referral?ref=68163463', 'Great DEX on Arbitrum', 'https://hk.tpstatic.net/dapp/tokenpocket-1676704809701.jpg', NULL),
(81, 'Rollie Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1720773012479.jpg', 'https://app.rollie.finance/', 'One-Swipe AI Trading Perpetual Exchange on scroll.', 'https://hk.tpstatic.net/dapp/tokenpocket-1720773012479.jpg', NULL),
(82, 'Mini Bridge', 'https://hk.tpstatic.net/dapp/tokenpocket-1720776768353.jpg', 'https://minibridge.chaineye.tools/', 'The Mini Bridge is designed to provide the cheapest and fastest solution for small-amount cross-chain transfers.', 'https://hk.tpstatic.net/dapp/tokenpocket-1720776768353.jpg', NULL),
(83, 'TON Diamonds', 'https://hk.tpstatic.net/dapp/tokenpocket-1721208017009.jpg', 'https://ton.diamonds/', 'Marketplace for digital artists and high-quality collections. The first NFT on TON with privileges for holders.', 'https://hk.tpstatic.net/dapp/tokenpocket-1721208017009.jpg', NULL),
(84, 'IVX', 'https://hk.tpstatic.net/dapp/tokenpocket-1722335281179.jpg', 'https://bartio.ivx.fi/', 'We have built on-chain options AMMs on Berachain to provide high leverage trading for retail users.', 'https://hk.tpstatic.net/dapp/tokenpocket-1722335281179.jpg', NULL),
(85, 'Kodiak', 'https://hk.tpstatic.net/dapp/tokenpocket-1722343121514.jpg', 'https://app.kodiak.finance/#/swap?chain=berachain_bartio', 'Kodiak, is the first vertically-integrated liquidity hub on Berachain', 'https://hk.tpstatic.net/dapp/tokenpocket-1722343121514.jpg', NULL),
(86, 'D2 Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1722344831016.jpg', 'https://d2.finance/strategies', 'D2 Finance is a Multi-Strategy Hedge Fund, 100% on-chain, 100% non-custodial.', 'https://hk.tpstatic.net/dapp/tokenpocket-1722344831016.jpg', NULL),
(87, 'Goldilocks', 'https://hk.tpstatic.net/dapp/tokenpocket-1722346363031.png', 'https://www.goldilocksdao.io/', 'Goldilocks is a DAO committed to developing custom defi infrastructure for Berachain. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1722346363031.png', NULL),
(88, 'REX Trade', 'https://hk.tpstatic.net/dapp/tokenpocket-1723085794555.jpg', 'https://daobox.vip/', 'One-stop REX trading platform, lossless yield EOS', 'https://hk.tpstatic.net/dapp/tokenpocket-1723085794555.jpg', NULL),
(89, 'Photon', 'https://hk.tpstatic.net/dapp/tokenpocket-1723202291408.jpg', 'https://photon-sol.tinyastro.io/', 'Snipe and sell tokens at lightning speed', 'https://hk.tpstatic.net/dapp/tokenpocket-1723202291408.jpg', NULL),
(90, 'SunPump', 'https://hk.tpstatic.net/dapp/tokenpocket-1723521287514.jpg', 'https://sunpump.meme/invite?ref=xv6vwu2M', 'SunPump is the first dedicated platform for the fair launch and trading of meme coins. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1723521287514.jpg', '{\"title\":\"HOT\",\"bd_color\":\"0x2980fe\",\"bg_color\":\"\",\"font_color\":\"0x2980fe\"}'),
(91, 'Ring Protocol', 'https://hk.tpstatic.net/dapp/tokenpocket-1723523025136.jpg', 'https://ring.exchange/#/swap', 'Ring Protocol is a full set of decentralized finance products to enable the next generation of decentralized finance.', 'https://hk.tpstatic.net/dapp/tokenpocket-1723523025136.jpg', NULL),
(92, 'Flap', 'https://hk.tpstatic.net/dapp/tokenpocket-1724223502919.jpg', 'https://flap.sh/board', 'Flap is a decentralized social application protocol on EVM, born from an ETHGlobal hackathon victory. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1724223502919.jpg', '{\"title\":\"HOT\",\"bd_color\":\"0x2980fe\",\"bg_color\":\"\",\"font_color\":\"0x2980fe\"}'),
(93, 'MuskSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1725679936544.jpg', 'https://muskswap.club/', 'MuskSwap is a decentralized swap that mainly serves on BNBchain, providing multiple functions, i.e., secure, fast, fun, smooth in transactions for our users.', 'https://hk.tpstatic.net/dapp/tokenpocket-1725679936544.jpg', NULL),
(94, 'Julswap', 'https://hk.tpstatic.net/dapp/tokenpocket-1617366674718.png', 'https://julswap.com/#/swap', 'Fair Liquidity is a 100% decentralized platform with a centralized user experience and comfort. It helps improve your trading experience on the Binance Smart Chain with faster transaction speeds and lower fees. Our products include a cross-chain bridge (eth-bsc), a DEX, BSC network limit orders, and DeFi farms, among others.', 'https://hk.tpstatic.net/dapp/tokenpocket-1617366674718.png', NULL),
(95, 'Radiant Capital', 'https://hk.tpstatic.net/dapp/tokenpocket-1675766046594.jpg', 'https://app.radiant.capital/#/markets', 'Radiant is building the first omnichain money market atop LayerZero.Deposit & borrow across multiple chains, seamlessly.', 'https://hk.tpstatic.net/dapp/tokenpocket-1675766046594.jpg', NULL),
(96, 'Camelot', 'https://hk.tpstatic.net/dapp/tokenpocket-1675756412819.jpg', 'https://app.camelot.exchange/', 'The Arbitrum native DEX. Custom-built liquidity infrastructure to support builders & generate real yield.', 'https://hk.tpstatic.net/dapp/tokenpocket-1675756412819.jpg', NULL),
(97, 'Blitz', 'https://hk.tpstatic.net/dapp/tokenpocket-1709280808373.png', 'https://app.blitz.exchange/portfolio/overview', 'A blazing fast orderbook DEX for spot and perpetuals trading deployed natively on-chain to the Blast L2 network.', 'https://hk.tpstatic.net/dapp/tokenpocket-1709280808373.png', NULL),
(98, 'Lyra', 'https://hk.tpstatic.net/dapp/tokenpocket-1674978618546.jpeg', 'https://app.lyra.finance/', 'Options trading platform', 'https://hk.tpstatic.net/dapp/tokenpocket-1674978618546.jpeg', NULL),
(99, 'Mangrove', 'https://hk.tpstatic.net/dapp/tokenpocket-1709262404990.jpg', 'https://app.mangrove.exchange/trade', 'Mangrove is an order book DEX that allows liquidity providers to post arbitrary smart contracts (hooks) as offers.', 'https://hk.tpstatic.net/dapp/tokenpocket-1709262404990.jpg', NULL),
(100, 'BladeSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1709260312745.jpg', 'https://app.bladeswap.xyz/swap', 'Blast L2 native Dex with real-time vote reward & native multi-call!', 'https://hk.tpstatic.net/dapp/tokenpocket-1709260312745.jpg', NULL),
(101, 'MerlinSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1708672139418.jpg', 'https://merlinswap.org/trade/swap', 'The first Liquidity Hub for trading on Merlin.', 'https://hk.tpstatic.net/dapp/tokenpocket-1708672139418.jpg', NULL),
(102, 'GhostMarket', 'https://hk.tpstatic.net/dapp/tokenpocket-1673330693377.jpg', 'https://ghostmarket.io/', 'Cross-chain NFT market', 'https://hk.tpstatic.net/dapp/tokenpocket-1673330693377.jpg', NULL),
(103, 'DragonSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1708497058147.png', 'https://dgswap.io/info/v3', 'DragonSwap, as the premier decentralized exchange (DEX), excels with its highly liquid offerings. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1708497058147.png', NULL),
(104, 'Zeta Markets ', 'https://hk.tpstatic.net/dapp/tokenpocket-1706760103010.jpg', 'https://dex.zeta.markets/trade/SOL-PERP', 'Zeta Markets is a decentralized derivatives exchange.', 'https://hk.tpstatic.net/dapp/tokenpocket-1706760103010.jpg', NULL),
(105, 'ZetaSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1706586793171.jpg', 'https://app.zetaswap.com/', 'ZetaSwap is the first omnichain DeFi aggregator on ZetaChain.', 'https://hk.tpstatic.net/dapp/tokenpocket-1706586793171.jpg', NULL),
(106, 'Beethoven X', 'https://hk.tpstatic.net/dapp/tokenpocket-1672886968444.jpeg', 'https://op.beets.fi/', '', 'https://hk.tpstatic.net/dapp/tokenpocket-1672886968444.jpeg', NULL),
(107, 'Manta DEX', 'https://hk.tpstatic.net/dapp/tokenpocket-1705579994693.jpg', 'https://mantadex.com/swap', 'The decentralized exchange for Manta ZK Ecosystem', 'https://hk.tpstatic.net/dapp/tokenpocket-1705579994693.jpg', NULL),
(108, 'PacificSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1705561947013.jpg', 'https://pacificswap.xyz/', 'PacificSwap holds the position as the premier decentralized exchange on Manta Pacific.', 'https://hk.tpstatic.net/dapp/tokenpocket-1705561947013.jpg', NULL),
(109, 'Drift Protocol', 'https://hk.tpstatic.net/dapp/tokenpocket-1705566133823.png', 'https://app.drift.trade/', 'Drift Protocol is an open-sourced, decentralised exchange built on the Solana blockchain, enabling transparent and non-custodial trading on cryptocurrencies.', 'https://hk.tpstatic.net/dapp/tokenpocket-1705566133823.png', NULL),
(110, 'Turbos Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1705492872087.jpg', 'https://app.turbos.finance/#/trade', 'Turbos is a non-custodial decentralized exchange (DEX) built around the Concentrated Liquidity Market Maker (CLMM) model on the Sui Network. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1705492872087.jpg', NULL),
(111, 'Pika', 'https://hk.tpstatic.net/dapp/tokenpocket-1672886202380.png', 'https://www.pikaprotocol.com/', 'Decentralized leveraged trading on OP.', 'https://hk.tpstatic.net/dapp/tokenpocket-1672886202380.png', NULL),
(112, 'MerlinStarter', 'https://hk.tpstatic.net/dapp/tokenpocket-1709621376892.jpg', 'https://merlinstarter.com/', 'The 1st native launchpad on MerlinLayer2.The accelerator for all BTCLayer2 projects.', 'https://hk.tpstatic.net/dapp/tokenpocket-1709621376892.jpg', NULL),
(113, 'Alchemy Pay', 'https://hk.tpstatic.net/dapp/tokenpocket-1720772490982.jpg', 'https://ramp.alchemypay.org/?appId=Yma1lKui5f2E276a#/index', 'Fiat-Crypto Payment Gateway.', 'https://hk.tpstatic.net/dapp/tokenpocket-1720772490982.jpg', NULL),
(114, 'KriyaDEX', 'https://hk.tpstatic.net/dapp/tokenpocket-1705398299467.jpg', 'https://www.app.kriya.finance/spot/swap/', 'KriyaDEX is a DeFi platform that offers a wide range of services, from lending to perpetual trading.', 'https://hk.tpstatic.net/dapp/tokenpocket-1705398299467.jpg', NULL),
(115, 'Quix', 'https://hk.tpstatic.net/dapp/tokenpocket-1672885974901.jpeg', 'https://qx.app/', 'NFT market on OP', 'https://hk.tpstatic.net/dapp/tokenpocket-1672885974901.jpeg', NULL),
(116, 'Rubicon ', 'https://hk.tpstatic.net/dapp/tokenpocket-1672885156896.jpeg', 'https://app.rubicon.finance/swap', 'An order book protocol built on the Ethereum L2 network.', 'https://hk.tpstatic.net/dapp/tokenpocket-1672885156896.jpeg', NULL),
(117, 'Stargate', 'https://hk.tpstatic.net/dapp/tokenpocket-1672884131309.jpeg', 'https://stargate.finance/', 'Stargate is a fully composable mobility transport protocol.', 'https://hk.tpstatic.net/dapp/tokenpocket-1672884131309.jpeg', NULL),
(118, 'SPACE ID', 'https://hk.tpstatic.net/dapp/tokenpocket-1672800228493.jpeg', 'https://space.id/voyage/season-2?inviter=tpwallet666.bnb', 'SPACE ID (SID)', 'https://hk.tpstatic.net/dapp/tokenpocket-1672800228493.jpeg', NULL),
(119, 'beefy.finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1608444095705.jpg', 'https://app.beefy.finance/#/?utm_source=TokenPocket', 'A yield aggregator based on Binance Smart Chain.', 'https://hk.tpstatic.net/dapp/tokenpocket-1608444095705.jpg', NULL),
(120, 'Shell Protocol', 'https://hk.tpstatic.net/dapp/tokenpocket-1667874991163.jpg', 'https://app.shellprotocol.io/', 'Shell Protocol is revolutionizing smart contract design, saving gas and reducing code complexity.', 'https://hk.tpstatic.net/dapp/tokenpocket-1667874991163.jpg', NULL),
(121, 'DerpDEX', 'https://hk.tpstatic.net/dapp/tokenpocket-1703153843683.jpg', 'https://derpdex.com/', 'Most meme-able DEX on zkSync, Base & opBNB, ever.', 'https://hk.tpstatic.net/dapp/tokenpocket-1703153843683.jpg', NULL),
(122, 'BSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1702980037378.png', 'https://bswap.bevm.io/#/swap', 'BSwap, a #BTC-#EVM DEX based on BEVM.', 'https://hk.tpstatic.net/dapp/tokenpocket-1702980037378.png', NULL),
(123, 'Mango', 'https://hk.tpstatic.net/dapp/tokenpocket-1702957360762.jpg', 'https://app.mango.markets/', 'Solana DEX with the best UX. Cross-Margin Trading/Multi-Collateral/Swap/Spot/Perps/Borrow/Lend ', 'https://hk.tpstatic.net/dapp/tokenpocket-1702957360762.jpg', NULL),
(124, 'Newdex', 'https://hk.tpstatic.net/dapp/tokenpocket-1628865334668.jpg', 'https://dapp.newdex.io/?channel=tokenpocket', 'One-stop aggregate trading platform', 'https://hk.tpstatic.net/dapp/tokenpocket-1628865334668.jpg', NULL),
(125, 'Origami Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1722349432133.jpg', 'https://origami.finance/collections', 'Origami is a first-in-class automated leverage protocol launching on Ethereum and berachain,Fully integrated with third-party lenders, Origami allows for folded Yield-Bearing Token (YBT) exposure with full automation, maximising capital efficiency whilst minimising risk of liquidation and bad debt. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1722349432133.jpg', NULL),
(126, 'We.Rich', 'https://hk.tpstatic.net/dapp/tokenpocket-1722492786440.jpg', 'https://we.rich/', 'The number one UGA platform. Anyone can become a founder. Anything can be traded.', 'https://hk.tpstatic.net/dapp/tokenpocket-1722492786440.jpg', NULL),
(127, 'SushiSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1709437279524.png', 'https://www.sushi.com/swap', 'SushiSwap is a community-driven decentralized exchange (DEX) for traders and liquidity providers.', 'https://hk.tpstatic.net/dapp/tokenpocket-1709437279524.png', NULL),
(128, 'HIPPO', 'https://hk.tpstatic.net/dapp/tokenpocket-1667184905710.jpeg', 'https://hippo.space/', 'Aggregator on Aptos.', 'https://hk.tpstatic.net/dapp/tokenpocket-1667184905710.jpeg', NULL),
(129, 'Merkle Trade', 'https://hk.tpstatic.net/dapp/tokenpocket-1709902489009.png', 'https://app.merkle.trade/trade/ETH_USD', 'Merkle Trade is a decentralized trading platform that offers crypto, forex and commodities trading with leverage up to 1,000x, along with access to advanced and user-centric trading features.', 'https://hk.tpstatic.net/dapp/tokenpocket-1709902489009.png', NULL),
(130, 'Wombat Exchange', 'https://hk.tpstatic.net/dapp/tokenpocket-1666931655971.jpg', 'https://app.wombat.exchange/', 'The hyper-efficient multichain #stableswapV2. #BNB and beyond. Best #stablecoin yields on BNBCHAIN', 'https://hk.tpstatic.net/dapp/tokenpocket-1666931655971.jpg', NULL),
(131, 'Blur', 'https://hk.tpstatic.net/dapp/tokenpocket-1666355380940.jpeg', 'https://blur.io/', 'NFT market for professional traders.', 'https://hk.tpstatic.net/dapp/tokenpocket-1666355380940.jpeg', NULL),
(132, 'Aries Markets', 'https://hk.tpstatic.net/dapp/tokenpocket-1709901941286.jpg', 'https://app.ariesmarkets.xyz/lending', 'Aries Markets is a decentralized exchange built on Move, it aims to aggregate and simplify the user experience across all of DeFi.', 'https://hk.tpstatic.net/dapp/tokenpocket-1709901941286.jpg', NULL),
(133, 'Purple Bridge', 'https://hk.tpstatic.net/dapp/tokenpocket-1715862437753.jpg', 'https://purplebridge.link/bridge/?from=77001&to=137&token=BORA', 'The Only Bridge Connecting Bora and Polygon, support miniDEX in order to expand user functionalities and opportunities.', 'https://hk.tpstatic.net/dapp/tokenpocket-1715862437753.jpg', NULL),
(134, 'Brid.gg', 'https://hk.tpstatic.net/dapp/tokenpocket-1720770485914.png', 'https://www.brid.gg/op-mainnet?amount=&originChainId=1&token=ETH', 'The preferred Superchain portal, making transactions between Ethereum Mainnet and any OP Chain within the Superchain effortless.', 'https://hk.tpstatic.net/dapp/tokenpocket-1720770485914.png', NULL),
(135, 'Hippo Swap', 'https://hk.tpstatic.net/dapp/tokenpocket-1721617393553.jpg', 'https://hipposwap.finance/', 'The first Native DEX Aggregator on Scroll.', 'https://hk.tpstatic.net/dapp/tokenpocket-1721617393553.jpg', NULL),
(136, 'NAV', 'https://hk.tpstatic.net/dapp/tokenpocket-1722398908233.jpg', 'https://app.nav.finance/', 'Regulated Crypto Quant Hedge Fund,High-Performance Structured Investment Products for the DeFi Space', 'https://hk.tpstatic.net/dapp/tokenpocket-1722398908233.jpg', NULL),
(137, 'Unifi Protocol', 'https://dashboard-assets.dappradar.com/document/4391/unifiprotocol-dapp-defi-tron-logo-166x166_3d1d93068ba06e24e6dfc6669bec1d50.png', 'https://binance.unifiprotocol.com/?utm_source=TokenPocket', 'Multi-chain automated market maker and trading platform', 'https://dashboard-assets.dappradar.com/document/4391/unifiprotocol-dapp-defi-tron-logo-166x166_3d1d93068ba06e24e6dfc6669bec1d50.png', NULL),
(138, 'Unisave', 'https://hk.tpstatic.net/dapp/tokenpocket-1611630983934.png', 'https://app.unisave.exchange/', 'Unisave is currently the most comprehensive decentralized swap project with a wide range of mathematical features in the market.', 'https://hk.tpstatic.net/dapp/tokenpocket-1611630983934.png', NULL),
(139, 'ZKSwap', 'https://tp-statics.cdn.bcebos.com/website/tokenpocket-1606205923941.jpg', 'https://zks.app/zh/wallet', 'A layer 2-based DEX using the ZK-Rollups technology with AMM model. ', 'https://tp-statics.cdn.bcebos.com/website/tokenpocket-1606205923941.jpg', NULL),
(140, 'DerivaDEX', 'https://hk.tpstatic.net/dapp/tokenpocket-1607153108436.jpg', 'https://insurance.derivadex.com/', 'Next-Generation Cryptocurrency Derivatives', 'https://hk.tpstatic.net/dapp/tokenpocket-1607153108436.jpg', NULL),
(141, 'volmex.finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1608087524444.jpg', 'https://www.volmex.finance/', 'Ethereum-based Volatility Index and Non-Custodial Trading Platform', 'https://hk.tpstatic.net/dapp/tokenpocket-1608087524444.jpg', NULL),
(142, 'Ellipsis', 'https://hk.tpstatic.net/dapp/tokenpocket-1616557790403.png', 'http://v2.ellipsis.finance/', 'Low slippage stablecoin exchange on BSC.', 'https://hk.tpstatic.net/dapp/tokenpocket-1616557790403.png', NULL),
(143, 'AnimeSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1666336111114.jpeg', 'https://app.animeswap.org/#/swap?chain=aptos', 'Decentralized exchange on #Aptos.', 'https://hk.tpstatic.net/dapp/tokenpocket-1666336111114.jpeg', NULL),
(144, 'Liquidswap', 'https://hk.tpstatic.net/dapp/tokenpocket-1666233612278.jpeg', 'https://liquidswap.com/#/', 'Liquidswap is the first AMM on Aptos, and it is the most secure and scalable L1 blockchain.', 'https://hk.tpstatic.net/dapp/tokenpocket-1666233612278.jpeg', NULL),
(145, 'Tsunami Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1665744942105.jpeg', 'https://tsunami.finance/', 'Trade spot & perpetuals with 0% slippage. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1665744942105.jpeg', NULL),
(146, 'Souffl3', 'https://hk.tpstatic.net/dapp/tokenpocket-1665741695352.png', 'https://souffl3.com/', 'NextGen Smart Trading NFT Market.', 'https://hk.tpstatic.net/dapp/tokenpocket-1665741695352.png', NULL),
(147, 'abelfinance', 'https://hk.tpstatic.net/dapp/tokenpocket-1665744609213.jpeg', 'https://abelfinance.xyz/#/markets', 'The First Cross-Chain Lending Platform. Build on @AptosLabs. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1665744609213.jpeg', NULL),
(148, 'Aptos Swap', 'https://hk.tpstatic.net/dapp/tokenpocket-1665743795302.jpeg', 'https://aptoswap.net/', '', 'https://hk.tpstatic.net/dapp/tokenpocket-1665743795302.jpeg', NULL),
(149, 'Enchanter Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1665743271220.jpeg', 'https://app.enchanter.fi/', 'Enchanter Finance: the premier community-based DEX on Aptos.', 'https://hk.tpstatic.net/dapp/tokenpocket-1665743271220.jpeg', NULL),
(150, 'SWFT', 'https://hk.tpstatic.net/dapp/tokenpocket-1665395454026.png', 'https://defi.swft.pro?sourceFlag=globalw', 'One Stop Cross-Chain swap, supporting 300+ tokens on 30+ chains', 'https://hk.tpstatic.net/dapp/tokenpocket-1665395454026.png', NULL),
(151, 'FinNexus', 'https://tp-statics.cdn.bcebos.com/website/tokenpocket-1617894425323.png', 'https://options.finnexus.io/', 'An open decentralized financial derivative protocol, implemented in decentralized options products, supporting cross-chain and point-to-pool trading models', 'https://tp-statics.cdn.bcebos.com/website/tokenpocket-1617894425323.png', NULL),
(152, 'DODO', 'https://hk.tpstatic.net/dapp/tokenpocket-1607400072826.jpg', 'https://app.dodoex.io', 'Decentralized Trading Protocol for Web3', 'https://hk.tpstatic.net/dapp/tokenpocket-1607400072826.jpg', NULL),
(153, 'BakerySwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1619669702632.png', 'https://www.bakeryswap.org/', 'Start farming BAKE tokens in', 'https://hk.tpstatic.net/dapp/tokenpocket-1619669702632.png', NULL),
(154, 'Bitcratic', 'https://hk.tpstatic.net/dapp/tokenpocket-1604908273764.jpg', 'https://www.bitcratic.com/', 'Decentralized Exchange', 'https://hk.tpstatic.net/dapp/tokenpocket-1604908273764.jpg', NULL),
(155, 'Smoothy', 'https://hk.tpstatic.net/dapp/tokenpocket-1615295748101.png', 'https://smoothy.finance/#/mint', 'Curve-like stablecoin exchange protocol.', 'https://hk.tpstatic.net/dapp/tokenpocket-1615295748101.png', NULL),
(156, 'CherrySwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1615454282212.jpg', 'https://www.cherryswap.net/', 'CherrySwap is a DeFi project built on OKExchain, utilizing the Automated Market Maker (AMM) mechanism. It aims to achieve self-driven liquidity creation through diverse features such as liquidity mining, NFTs, DAO, and provide maximum value rewards to participants.', 'https://hk.tpstatic.net/dapp/tokenpocket-1615454282212.jpg', NULL),
(157, 'Dexguru', 'https://hk.tpstatic.net/dapp/tokenpocket-1617453982649.jpg', 'https://dex.guru/', 'Providing and integrating real-time trading for Dex trading.', 'https://hk.tpstatic.net/dapp/tokenpocket-1617453982649.jpg', NULL),
(158, 'Hashflow', 'https://hk.tpstatic.net/dapp/tokenpocket-1664269231604.jpg', 'https://app.hashflow.com/', 'What you see is what you get. No slippage. No front-running. No BS', 'https://hk.tpstatic.net/dapp/tokenpocket-1664269231604.jpg', NULL),
(159, 'MetaPath', 'https://hk.tpstatic.net/dapp/tokenpocket-1662737220346.jpg', 'https://dapp.path.finance?source=globalm', 'Aggregator of The Metaverse. Cross-Metaverse, Cross-NFT Marketplaces, Cross-Chain, Cross- Platforms & more. Web 3.0', 'https://hk.tpstatic.net/dapp/tokenpocket-1662737220346.jpg', NULL),
(160, 'Synapse Protocol', 'https://hk.tpstatic.net/dapp/tokenpocket-1662083139790.jpg', 'https://synapseprotocol.com/', 'The most widely used cross-chain messaging system and bridge.', 'https://hk.tpstatic.net/dapp/tokenpocket-1662083139790.jpg', NULL),
(161, 'tofuNFT', 'https://hk.tpstatic.net/dapp/tokenpocket-1639553346025.png', 'https://tofunft.com/arbi-nova', 'NFT Marketplace', 'https://hk.tpstatic.net/dapp/tokenpocket-1639553346025.png', NULL),
(162, 'RCPswap', 'https://hk.tpstatic.net/dapp/tokenpocket-1661939572024.png', 'https://rcpswap.com/#/swap', 'swap support for Reddit community points redemption', 'https://hk.tpstatic.net/dapp/tokenpocket-1661939572024.png', NULL),
(163, 'Soy Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1660719756666.jpg', 'https://app.soy.finance/swap', 'Grow your capital in a safer #DeFi environment.', 'https://hk.tpstatic.net/dapp/tokenpocket-1660719756666.jpg', NULL),
(164, 'Hebeswap', 'https://hk.tpstatic.net/dapp/tokenpocket-1660718600722.jpg', 'https://app.hebeswap.com/', 'Hebeswap is a protocol for automated token swapping on Ethereum Classic. Hebeswap is a simple smart contract interface for exchanging ERC20 tokens.', 'https://hk.tpstatic.net/dapp/tokenpocket-1660718600722.jpg', NULL),
(165, 'MMF', 'https://hk.tpstatic.net/dapp/tokenpocket-1660292997203.jpg', 'https://polymm.finance/?ref=MHgwMTI1M0JFNDc3MjA3RDQ1NkUzMjBjRWUxMzQ1MzQ5ZkQ1MDk0MGMz', 'The most innovative dex on Polygon with the lowest trading fees', 'https://hk.tpstatic.net/dapp/tokenpocket-1660292997203.jpg', NULL),
(166, 'HEGIC', 'https://hk.tpstatic.net/dapp/tokenpocket-1605617698636.jpg', 'https://www.hegic.co', 'Decentralized options trading platform', 'https://hk.tpstatic.net/dapp/tokenpocket-1605617698636.jpg', NULL),
(167, 'uGAS Station', 'https://hk.tpstatic.net/dapp/tokenpocket-1607260374934.png', 'https://ugas-station.io/', 'Hedging Ethereum Gas Price Contract', 'https://hk.tpstatic.net/dapp/tokenpocket-1607260374934.png', NULL),
(168, 'Crust Network', 'https://hk.tpstatic.net/dapp/tokenpocket-1607483541719.png', 'https://csm.crust.network/#/cru/auto', 'CSM Liquidity Mining', 'https://hk.tpstatic.net/dapp/tokenpocket-1607483541719.png', NULL),
(169, 'Saddle', 'https://hk.tpstatic.net/dapp/tokenpocket-1660010743120.jpg', 'https://saddle.exchange/#/', 'saddle.finance is an AMM (Automated Market Maker) for swapping low-slippage pegged assets, such as tokenized #BTC and stablecoins.', 'https://hk.tpstatic.net/dapp/tokenpocket-1660010743120.jpg', NULL),
(170, 'sudoswap', 'https://hk.tpstatic.net/dapp/tokenpocket-1659952806625.jpg', 'https://sudoswap.xyz/#/', 'Decentralized NFT Marketplace', 'https://hk.tpstatic.net/dapp/tokenpocket-1659952806625.jpg', NULL),
(171, 'MoonLama', 'https://hk.tpstatic.net/dapp/tokenpocket-1659001089054.jpg', 'https://moonlama.com/', 'Cute creatures living on the moon on the ETC network', 'https://hk.tpstatic.net/dapp/tokenpocket-1659001089054.jpg', NULL),
(172, 'ETC Swap', 'https://hk.tpstatic.net/dapp/tokenpocket-1663559729096.png', 'https://swap.ethereumclassic.com/#/swap', 'ETC swap', 'https://hk.tpstatic.net/dapp/tokenpocket-1663559729096.png', NULL),
(173, 'Opyn Protection', 'https://hk.tpstatic.net/dapp/tokenpocket-1605843740490.png', 'https://opyn.co/#/', 'On-Chain Options Protocol', 'https://hk.tpstatic.net/dapp/tokenpocket-1605843740490.png', NULL),
(174, 'ORDEX', 'https://hk.tpstatic.net/dapp/tokenpocket-1699343324612.jpg', 'https://ordex.ai/', 'The Premier Ethscriptions Marketplace for Pros.', 'https://hk.tpstatic.net/dapp/tokenpocket-1699343324612.jpg', NULL),
(175, 'Pheasant Network', 'https://hk.tpstatic.net/dapp/tokenpocket-1698378686406.jpeg', 'https://pheasant.network/', 'Pheasant Network is an optimistic bridge specialized for Layer 2.', 'https://hk.tpstatic.net/dapp/tokenpocket-1698378686406.jpeg', NULL),
(176, 'Kinza Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1704973135478.jpg', 'https://app.kinza.finance/#/referral?referralCode=S9I5Q1', 'A security-first lending protocol on BNBCHAIN', 'https://hk.tpstatic.net/dapp/tokenpocket-1704973135478.jpg', NULL),
(177, 'Thala', 'https://hk.tpstatic.net/dapp/tokenpocket-1709903405868.jpg', 'https://app.thala.fi/overview', 'Thala is a decentralized finance (DeFi) protocol native to the Aptos blockchain. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1709903405868.jpg', NULL),
(178, 'Reflexer', 'https://hk.tpstatic.net/dapp/tokenpocket-1613887307364.jpg', 'https://app.reflexer.finance/', 'Unpegged, stable asset RAI backed only by ETH', 'https://hk.tpstatic.net/dapp/tokenpocket-1613887307364.jpg', NULL),
(179, 'Skydrome', 'https://hk.tpstatic.net/dapp/tokenpocket-1698376962868.jpeg', 'https://app.skydrome.finance/swap', 'The leading ve(3,3) exchange on Scroll.', 'https://hk.tpstatic.net/dapp/tokenpocket-1698376962868.jpeg', NULL),
(180, 'Papyrus Swap', 'https://hk.tpstatic.net/dapp/tokenpocket-1698376946485.jpeg', 'https://papyrusswap.com/#/', 'Papyrus is an automated liquidity protocol implemented in a system of non-upgradeable smart contracts on Scroll Mainnet.', 'https://hk.tpstatic.net/dapp/tokenpocket-1698376946485.jpeg', NULL),
(181, 'Jones DAO', 'https://hk.tpstatic.net/dapp/tokenpocket-1675133149900.jpeg', 'https://app.jonesdao.io/', 'Jones DAO is a yield, strategy and liquidity protocol.', 'https://hk.tpstatic.net/dapp/tokenpocket-1675133149900.jpeg', NULL),
(182, 'Scroll Bridge', 'https://hk.tpstatic.net/explorer/tokenpocket-1697524348894.png', 'https://scroll.io/bridge', 'Scroll Native Bridge', 'https://hk.tpstatic.net/explorer/tokenpocket-1697524348894.png', NULL),
(183, 'Mantle Bridge', 'https://hk.tpstatic.net/dapp/tokenpocket-1696930023261.jpeg', 'https://bridge.mantle.xyz/', 'Mantle跨梁桥。', 'https://hk.tpstatic.net/dapp/tokenpocket-1696930023261.jpeg', NULL);
INSERT INTO `dapps_list` (`id`, `title`, `icon_url`, `url`, `description`, `back_url`, `tag_info`) VALUES
(184, 'Bitlayer Bridge', 'https://hk.tpstatic.net/dapp/tokenpocket-1713472818418.jpeg', 'https://www.bitlayer.org/bridge', 'Bitlayer Official Bridge.', 'https://hk.tpstatic.net/dapp/tokenpocket-1713472818418.jpeg', NULL),
(185, 'velodrome', 'https://hk.tpstatic.net/dapp/tokenpocket-1713924732325.jpeg', 'https://velodrome.finance/', 'The central trading and liquidity marketplace on Optimism.', 'https://hk.tpstatic.net/dapp/tokenpocket-1713924732325.jpeg', NULL),
(186, 'Symbiosis', 'https://hk.tpstatic.net/dapp/tokenpocket-1650514177783.jpg', 'https://app.symbiosis.finance/swap', 'A liquidity agreement.', 'https://hk.tpstatic.net/dapp/tokenpocket-1650514177783.jpg', NULL),
(187, 'Honeypot Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1711434470922.png', 'https://app.honeypotfinance.xyz/swap', 'The all encompassing DeFi Hub on berachain.', 'https://hk.tpstatic.net/dapp/tokenpocket-1711434470922.png', NULL),
(188, 'BSC X314', 'https://hk.tpstatic.net/dapp/tokenpocket-1712732702659.jpg', 'https://x314.app/swap', 'X-314 established the 314 platform. Users can watch K-line, SWAP transactions, pledge, launch tokens and other functions through the platform provided by X314.', 'https://hk.tpstatic.net/dapp/tokenpocket-1712732702659.jpg', NULL),
(189, 'pump.fun', 'https://hk.tpstatic.net/dapp/tokenpocket-1733473235042.jpg', 'https://pump.fun/board', 'A one-click memecoin launchpad based on Solana network', 'https://hk.tpstatic.net/dapp/tokenpocket-1733473235042.jpg', '{\"title\":\"HOT\",\"bd_color\":\"0x2980fe\",\"bg_color\":\"\",\"font_color\":\"0x2980fe\"}'),
(190, 'baseswap', 'https://hk.tpstatic.net/dapp/tokenpocket-1719504229683.jpeg', 'https://baseswap.fi/', 'BaseSwap is a fully independent decentralized exchange (DEX) on Base that introduces groundbreaking concepts.', 'https://hk.tpstatic.net/dapp/tokenpocket-1719504229683.jpeg', NULL),
(191, 'Four.Meme', 'https://hk.tpstatic.net/dapp/tokenpocket-1721616886882.jpg', 'https://four.meme?code=ANGX96R5A3NL', 'The first BSC Meme Launchpad and your go-to hub for meme token launches on the BSC chain.', 'https://hk.tpstatic.net/dapp/tokenpocket-1721616886882.jpg', '{\"title\":\"HOT\",\"bd_color\":\"0x2980fe\",\"bg_color\":\"\",\"font_color\":\"0x2980fe\"}'),
(192, 'TrendX', 'https://hk.tpstatic.net/dapp/tokenpocket-1733291989268.png', 'https://app.trendx.tech/', 'The first large-scale integrated Web3 investment opportunity platform relies on industry-leading AI analysis technology and on-chain and off-chain trend tracking technology to analyze and capture investment opportunities in real-time from billions of dynamic data points. Upholding the concept of \'change is opportunity,\' it is committed to becoming the preferred Web3 investment platform for users.', 'https://hk.tpstatic.net/dapp/tokenpocket-1733291989268.png', NULL),
(193, 'BiHelix', 'https://hk.tpstatic.net/dapp/tokenpocket-1723965355591.png', 'https://ln-transfer.bihelix.io/en/homepage', 'A bitcoin native application ecosystem framework, built on the Lightning Network and RGB protocol.', 'https://hk.tpstatic.net/dapp/tokenpocket-1723965355591.png', NULL),
(194, 'ArcherSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1724670830848.jpg', 'https://archerswap.finance/', 'ArcherSwap is a crypto world for users to trade, earn, and game. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1724670830848.jpg', NULL),
(195, 'Blum', 'https://hk.tpstatic.net/dapp/tokenpocket-1726210833791.jpg', 'https://t.me/BlumCryptoBot', ' Easy, fun crypto trading app for buying and trading any coin on the market', 'https://hk.tpstatic.net/dapp/tokenpocket-1726210833791.jpg', '{\"title\":\"HOT\",\"bd_color\":\"0x2980fe\",\"bg_color\":\"\",\"font_color\":\"0x2980fe\"}'),
(196, 'BiHelix Marketplace', 'https://hk.tpstatic.net/dapp/tokenpocket-1726219547252.png', 'https://market.bihelix.io/', 'The first RGB asset marketplace, with swift transactions and minimal fees.', 'https://hk.tpstatic.net/dapp/tokenpocket-1726219547252.png', '{\"title\":\"HOT\",\"bd_color\":\"0x2980fe\",\"bg_color\":\"\",\"font_color\":\"0x2980fe\"}'),
(197, 'DYORSWAP', 'https://hk.tpstatic.net/dapp/tokenpocket-1729151384805.jpg', 'https://dyorswap.finance/', 'DYORSWAP is a multi-chain decentralized exchange (DEX).', 'https://hk.tpstatic.net/dapp/tokenpocket-1729151384805.jpg', NULL),
(198, 'RareShop', 'https://hk.tpstatic.net/dapp/tokenpocket-1729242202516.png', 'https://www.rare.shop/ ', 'RareShop is the world\'s first blockchain-based RWA NFT marketplace. Incubated by Mint Blockchain, It allows users to purchase limited edition products packaged as RWA NFTs using USDT or ETH, enjoying more benefits and freedom.', 'https://hk.tpstatic.net/dapp/tokenpocket-1729242202516.png', NULL),
(199, 'Ape Express', 'https://hk.tpstatic.net/dapp/tokenpocket-1729484061643.jpg', 'https://ape.express/', 'The pump fun of ApeChain powered by Apecoin.', 'https://hk.tpstatic.net/dapp/tokenpocket-1729484061643.jpg', '{\"title\":\"HOT\",\"bd_color\":\"0x2980fe\",\"bg_color\":\"\",\"font_color\":\"0x2980fe\"}'),
(200, 'Supe.com', 'https://hk.tpstatic.net/dapp/tokenpocket-1730422156796.jpg', 'https://supe.com/', 'THE WORLD\'S FIRST NFT LIQUIDITY PROTOCOL', 'https://hk.tpstatic.net/dapp/tokenpocket-1730422156796.jpg', NULL),
(201, 'kriya.finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1731034050330.jpg', 'https://www.app.kriya.finance/trade', 'kriya is swap, limit orders, and 1-click yield strategies on SUI.', 'https://hk.tpstatic.net/dapp/tokenpocket-1731034050330.jpg', NULL),
(202, '7K Aggregator', 'https://hk.tpstatic.net/dapp/tokenpocket-1731036563689.jpg', 'https://7k.ag/', 'The Leading Liquidity Hub for Smart Traders on SUI.', 'https://hk.tpstatic.net/dapp/tokenpocket-1731036563689.jpg', NULL),
(203, 'FlowX Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1731037508738.jpg', 'https://flowx.finance/trade/swap', 'One-Stop Service for Defi on Sui. DEX Aggregator / AMM / CLMM / Launchpad / Farming as a Service. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1731037508738.jpg', NULL),
(204, 'vvaifu.fun', 'https://hk.tpstatic.net/dapp/tokenpocket-1731985052973.jpg', 'https://vvaifu.fun/', 'Launch AI agents on Solana.', 'https://hk.tpstatic.net/dapp/tokenpocket-1731985052973.jpg', NULL),
(205, 'Clanker World', 'https://hk.tpstatic.net/dapp/tokenpocket-1732258558468.png', 'https://www.clanker.world/clanker', 'Clanker World is a token trading platform on Base network.', 'https://hk.tpstatic.net/dapp/tokenpocket-1732258558468.png', NULL),
(206, 'Swapscanner', 'https://hk.tpstatic.net/dapp/tokenpocket-1733212673365.jpg', 'https://swapscanner.io/', 'Kaia (Klaytn) is a leading DEX aggregator', 'https://hk.tpstatic.net/dapp/tokenpocket-1733212673365.jpg', NULL),
(207, 'SpringBoard', 'https://hk.tpstatic.net/dapp/tokenpocket-1667471469423.jpg', 'https://springboard.pancakeswap.finance/bsc', 'The all-in-one platform to create and launch your project’s token on BNBChain PancakeSwap.', 'https://hk.tpstatic.net/dapp/tokenpocket-1667471469423.jpg', '{\"title\":\"HOT\",\"bd_color\":\"0x2980fe\",\"bg_color\":\"\",\"font_color\":\"0x2980fe\"}'),
(208, 'daos.fun', 'https://hk.tpstatic.net/dapp/tokenpocket-1734337698524.jpg', 'daos.fun', 'Daos.fun is an intelligent wallet funded by creators, with special rules for making investments on behalf of DAO token holders.', 'https://hk.tpstatic.net/dapp/tokenpocket-1734337698524.jpg', NULL),
(209, 'PaintSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1735099524571.jpg', 'https://paintswap.io/', 'A decentralized NFT marketplace for all NFTs & NFT Launchpad on Sonic.', 'https://hk.tpstatic.net/dapp/tokenpocket-1735099524571.jpg', NULL),
(210, 'WAGMI', 'https://hk.tpstatic.net/dapp/tokenpocket-1735828688517.jpg', 'https://app.wagmi.com/trade/swap', 'The WAGMI protocol is a limited TVL decentralized exchange', 'https://hk.tpstatic.net/dapp/tokenpocket-1735828688517.jpg', NULL),
(211, 'AigentFi', 'https://hk.tpstatic.net/dapp/tokenpocket-1736994705568.jpg', 'https://aigentfi.com/', 'Create, tokenize, co-own, and collaborate with multi-AI agents on zkSync.', 'https://hk.tpstatic.net/dapp/tokenpocket-1736994705568.jpg', NULL),
(212, 'Eectra', 'https://hk.tpstatic.net/dapp/tokenpocket-1738053745442.jpg', 'https://beta.electra.trade/ref/hXLBNcan', 'Electra is a decentralized perpetual contract trading DEX. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1738053745442.jpg', NULL),
(213, 'Beeper', 'https://hk.tpstatic.net/dapp/tokenpocket-1739602208252.jpg', 'https://beeper.fun/', 'Create, Tip, Create Red Pocket via Beeper.', 'https://hk.tpstatic.net/dapp/tokenpocket-1739602208252.jpg', NULL),
(214, 'Eggs Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1740133563604.jpg', 'https://eggs.finance/', 'A DeFi protocol based on the Sonic.', 'https://hk.tpstatic.net/dapp/tokenpocket-1740133563604.jpg', NULL),
(215, 'TGE.FUN', 'https://hk.tpstatic.net/dapp/tokenpocket-1742494212144.jpg', 'https://tge.fun/', 'TGE.FUN is the ONLY launchpad offering INSTANT, NO-COST LIQUIDITY—launch your token effortlessly, with zero barriers.', 'https://hk.tpstatic.net/dapp/tokenpocket-1742494212144.jpg', NULL),
(216, 'CobaltX', 'https://hk.tpstatic.net/dapp/tokenpocket-1743153017727.jpeg', 'https://svmbnb.cobaltx.io/swap/', 'A Concentrated Liquidity AMM', 'https://hk.tpstatic.net/dapp/tokenpocket-1743153017727.jpeg', NULL),
(217, 'Synthetix', 'https://hk.tpstatic.net/dapp/tokenpocket-1619669453339.jpg', 'https://synthetix.exchange/', 'Synths are tokens that provide exposure to assets such as gold, Bitcoin, U.S. Dollars, TESLA, and AAPL within the Ethereum blockchain', 'https://hk.tpstatic.net/dapp/tokenpocket-1619669453339.jpg', NULL),
(218, 'Defibox', 'https://hk.tpstatic.net/dapp/tokenpocket-1626863010668.jpg', 'http://dapp.defibox.io', 'EOS All-in-One DeFi Application Platform', 'https://hk.tpstatic.net/dapp/tokenpocket-1626863010668.jpg', NULL),
(219, 'SUN', 'https://hk.tpstatic.net/dapp/tokenpocket-1605603581672.png', 'https://sun.io/#/home', 'A social experiment in building Tron DeFi, positioned as Tron\'s Bitcoin.', 'https://hk.tpstatic.net/dapp/tokenpocket-1605603581672.png', NULL),
(220, 'Raydium', 'https://hk.tpstatic.net/dapp/tokenpocket-1632883083072.jpeg', 'https://raydium.io/swap/', 'An on-chain order book AMM powering the evolution of DeFi', 'https://hk.tpstatic.net/dapp/tokenpocket-1632883083072.jpeg', NULL),
(221, 'FarmersOnlyFi', 'https://hk.tpstatic.net/dapp/tokenpocket-1644823518175.png', 'https://app.farmersonly.fi/', 'FarmersOnlyFi is the first automatic compound vault on Harmony! We have vaults for ViperSwap, SushiSwap, Fuzz.fi, PiggyBank, and many more coming soon!', 'https://hk.tpstatic.net/dapp/tokenpocket-1644823518175.png', NULL),
(222, 'KyberSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1651053943092.jpg', 'https://kyberswap.com/#/swap', 'Multi-chain DeFi liquidity hub.', 'https://hk.tpstatic.net/dapp/tokenpocket-1651053943092.jpg', NULL),
(223, 'SunSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1650381263284.png', 'https://sun.io/?lang=en-US#/sun_swap/v2?t0=T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb&type=swap&from=v3', 'The first decentralized token exchange protocol on TRON', 'https://hk.tpstatic.net/dapp/tokenpocket-1650381263284.png', NULL),
(224, 'Mooniswap', 'https://hk.tpstatic.net/dapp/tokenpocket-1597128676452.png', 'https://mooniswap.exchange/#/swap?r=0x2f8c4cb8ffacbf05b51b2edc7c53dc2f9b9eb6a1', 'Automated market maker (AMM)', 'https://hk.tpstatic.net/dapp/tokenpocket-1597128676452.png', NULL),
(225, 'Bounce', 'https://hk.tpstatic.net/dapp/tokenpocket-1600590937492.jpg', 'http://bsc.bounce.finance/', 'Binance Smart Chain (BSC) Swap', 'https://hk.tpstatic.net/dapp/tokenpocket-1600590937492.jpg', NULL),
(226, 'Orca', 'https://hk.tpstatic.net/dapp/tokenpocket-1632883428151.jpeg', 'https://www.orca.so/', 'User-Friendly Solana-Based DEX', 'https://hk.tpstatic.net/dapp/tokenpocket-1632883428151.jpeg', NULL),
(227, 'Bounce', 'https://hk.tpstatic.net/dapp/tokenpocket-1597649781502.jpg', 'https://bounce.finance/', 'BOT flash swap flashswap', 'https://hk.tpstatic.net/dapp/tokenpocket-1597649781502.jpg', NULL),
(228, 'Y2K Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1675132828712.png', 'https://www.y2k.finance/', 'Hedge or speculate on the risk of fixed assets on Arbitrum.', 'https://hk.tpstatic.net/dapp/tokenpocket-1675132828712.png', NULL),
(229, 'Cross-Chain Deposits and Withdrawals', 'https://tp-statics.cdn.bcebos.com/dapp/newdex-dapp.png', 'https://newdex.340wan.com/coinCharging?channel=tokenpocket&chain=eos', 'Cross-Chain Deposits and Withdrawals for BTC/USDT and ETH/USDT.', 'https://tp-statics.cdn.bcebos.com/dapp/newdex-dapp.png', NULL),
(230, 'ShibaSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1625561375841.png', 'https://shibaswap.com/#/', 'Shiba decentralized exchange (DEX)', 'https://hk.tpstatic.net/dapp/tokenpocket-1625561375841.png', NULL),
(231, 'RAMSES', 'https://hk.tpstatic.net/dapp/tokenpocket-1713929103166.jpg', 'https://app.ramses.exchange/swap', 'Ramses pairs incentives with concentrated liquidity for next-level capital efficiency.', 'https://hk.tpstatic.net/dapp/tokenpocket-1713929103166.jpg', NULL),
(232, 'Mute.io', 'https://hk.tpstatic.net/dapp/tokenpocket-1680147350851.jpeg', 'https://app.mute.io/', 'A DEX based on #zkRollup. Built on Ethereum and zkSync.', 'https://hk.tpstatic.net/dapp/tokenpocket-1680147350851.jpeg', NULL),
(233, 'Magpie Protocol', 'https://hk.tpstatic.net/dapp/tokenpocket-1687315466348.png', 'https://beta.magpiefi.xyz/swap', 'Magpie is a state-of-the-art protocol that offers fast, easy, & secure cross-chain and on-chain token swaps. The user experience and capability of Magpie Protocol makes it a valuable addition to the DeFi space.', 'https://hk.tpstatic.net/dapp/tokenpocket-1687315466348.png', NULL),
(234, 'LionDEX', 'https://hk.tpstatic.net/dapp/tokenpocket-1682396168251.jpg', 'https://app.liondex.com/', 'LionDEX provides perpetual futures services for multi-chain decentralized derivatives. The innovative PvP-AMM protocol that is based on peer-to-pool allows for quick response to trading instructions that completely eliminate trading spreads. The protocol charges extremely low transaction fees (a minimum of 0.008%), without any lending and holding fees.', 'https://hk.tpstatic.net/dapp/tokenpocket-1682396168251.jpg', NULL),
(235, 'Bifrost Dapp', 'https://hk.tpstatic.net/dapp/tokenpocket-1634809899762.jpg', 'https://bifrost.app/?=tokenpocket', 'Bifrost is a parachain designed for staking liquidity', 'https://hk.tpstatic.net/dapp/tokenpocket-1634809899762.jpg', NULL),
(236, 'Amulet Protocol', 'https://hk.tpstatic.net/dapp/tokenpocket-1714465454560.jpg', 'https://app.amulet.org', 'Amulet is the first yield protocol with built-in protection.', 'https://hk.tpstatic.net/dapp/tokenpocket-1714465454560.jpg', NULL),
(237, 'BurgerSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1604061663107.png', 'https://burgerswap.org/', 'AMM SWAP on Binance Smart Chain', 'https://hk.tpstatic.net/dapp/tokenpocket-1604061663107.png', NULL),
(238, 'OpenLeverage', 'https://hk.tpstatic.net/dapp/tokenpocket-1652352998117.jpg', 'https://openleverage.finance', 'OpenLeverage is a permissionless lending and margin trading protocol with aggregated DEX liquidity.', 'https://hk.tpstatic.net/dapp/tokenpocket-1652352998117.jpg', NULL),
(239, 'Onchain Trade', 'https://hk.tpstatic.net/dapp/tokenpocket-1680503266030.png', 'https://onchain.trade/', 'DEX on zkSync Era.', 'https://hk.tpstatic.net/dapp/tokenpocket-1680503266030.png', NULL),
(240, 'Oikos Exchange', 'https://hk.tpstatic.net/dapp/tokenpocket-1594189709311.png', 'https://oikos.exchange/', 'To Trade synths on Oikos Exchange', 'https://hk.tpstatic.net/dapp/tokenpocket-1594189709311.png', NULL),
(241, 'BabySwap', 'https://tp-statics.cdn.bcebos.com/website/tokenpocket-1628063879502.png', 'https://exchange.babyswap.finance/#/swap', 'The best choice for new projects on Binance Smart Chain: AMM + decentralized NFT exchange.', 'https://tp-statics.cdn.bcebos.com/website/tokenpocket-1628063879502.png', NULL),
(242, 'KLAYswap', 'https://hk.tpstatic.net/dapp/tokenpocket-1625713898031.png', 'https://klayswap.com/exchange/swap', 'Automated Exchange Protocol Based on Liquidity Pool', 'https://hk.tpstatic.net/dapp/tokenpocket-1625713898031.png', NULL),
(243, 'KACO Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1650086649627.jpg', 'https://www.kaco.finance/?utm_source=DappRadar&utm_medium=deeplink&utm_campaign=visit-website', 'Kaco Finance is the EVM version of #DEX.', 'https://hk.tpstatic.net/dapp/tokenpocket-1650086649627.jpg', NULL),
(244, 'IDXE', 'https://hk.tpstatic.net/dapp/1563805369342-IDEX.png', 'https://idex.market/eth/idex', 'A decentralized exchange for trading ERC-20 tokens', 'https://hk.tpstatic.net/dapp/1563805369342-IDEX.png', NULL),
(245, 'Macaron', 'https://hk.tpstatic.net/dapp/tokenpocket-1714563668824.png', 'https://www.macaron.xyz/#/swap?code=71454', 'The First & Native DEX on bitlayer, Yields & Liquidity for Users. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1714563668824.png', NULL),
(246, 'Lynex', 'https://hk.tpstatic.net/dapp/tokenpocket-1718766371812.png', 'https://app.lynex.fi/swap', 'Lynex is a user-friendly LST-focused liquidity marketplace on Linea', 'https://hk.tpstatic.net/dapp/tokenpocket-1718766371812.png', NULL),
(247, 'Koi Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1719038127989.jpg', 'https://dapp.koi.finance/swap', 'A lightning fast DEX, yield, and bond platform built on zksync.', 'https://hk.tpstatic.net/dapp/tokenpocket-1719038127989.jpg', NULL),
(248, 'Swerve', 'https://hk.tpstatic.net/dapp/tokenpocket-1599555978242.png', 'https://swerve.fi', 'Swerve is a stablecoin exchange protocol that forked from Curve Finance.', 'https://hk.tpstatic.net/dapp/tokenpocket-1599555978242.png', NULL),
(249, 'bitCow', 'https://hk.tpstatic.net/dapp/tokenpocket-1714563921632.jpeg', 'https://bitcow.xyz/swap', 'BTC-Native stable and concentrated liquidity AMM.', 'https://hk.tpstatic.net/dapp/tokenpocket-1714563921632.jpeg', NULL),
(250, 'SpaceFi', 'https://hk.tpstatic.net/dapp/tokenpocket-1680147939063.png', 'https://www.spacefi.io/', 'SpaceFi is a cross-chain Web3 platform that connects the Cosmos and Ethereum Layer2 ecosystems', 'https://hk.tpstatic.net/dapp/tokenpocket-1680147939063.png', NULL),
(251, 'Kamino Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1682317052301.jpg', 'https://app.kamino.finance/', 'Kamino is an automated liquidity solution that allows users to earn yield on their crypto assets by providing liquidity to concentrated liquidity market makers (CLMMs)', 'https://hk.tpstatic.net/dapp/tokenpocket-1682317052301.jpg', NULL),
(252, 'Airnfts', 'https://hk.tpstatic.net/dapp/tokenpocket-1626679656639.PNG', 'https://www.airnfts.com/', 'NFT market based on BSC', 'https://hk.tpstatic.net/dapp/tokenpocket-1626679656639.PNG', NULL),
(253, 'Trisolaris', 'https://hk.tpstatic.net/dapp/tokenpocket-1643179003965.jpeg', 'https://www.trisolaris.io/#/swap', 'EVM developed on Aurora.', 'https://hk.tpstatic.net/dapp/tokenpocket-1643179003965.jpeg', NULL),
(254, 'Sommelier Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1681799093913.png', 'https://app.sommelier.finance/', 'Sommelier is a DeFi platform that creates dynamic investment strategies based on current market conditions or predetermined metrics, using live data feeds and off-chain computation. It aims to provide profitable, flexible, and resilient strategies that can monitor and predict financial ratios. Sommelier also offers a secure validator set for mid-frequency strategy execution.', 'https://hk.tpstatic.net/dapp/tokenpocket-1681799093913.png', NULL),
(255, 'opBNB Bridge', 'https://hk.tpstatic.net/dapp/tokenpocket-1692282415149.png', 'https://opbnb-bridge.bnbchain.org/deposit', 'opBNB Bridge', 'https://hk.tpstatic.net/dapp/tokenpocket-1692282415149.png', NULL),
(256, 'Celer cBridge', 'https://hk.tpstatic.net/dapp/tokenpocket-1657870270002.jpg', 'https://cbridge.celer.network/#/transfer?ref=tokenpocket2022', 'Decentralized non-custodial cross-chain bridge, currently supporting over 30 chains and more than 130 tokens.', 'https://hk.tpstatic.net/dapp/tokenpocket-1657870270002.jpg', NULL),
(257, 'Etch Market', 'https://hk.tpstatic.net/dapp/tokenpocket-1691119905463.png', 'https://www.etch.market/', 'The First Community-driven #Ethscriptions Indexer, Marketplace and Launchpad.', 'https://hk.tpstatic.net/dapp/tokenpocket-1691119905463.png', NULL),
(258, 'wannaswap', 'https://hk.tpstatic.net/dapp/tokenpocket-1643179167834.jpeg', 'https://wannaswap.finance/', 'Trade, Invest, Earn.', 'https://hk.tpstatic.net/dapp/tokenpocket-1643179167834.jpeg', NULL),
(259, 'SuiSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1688357582663.jpeg', 'https://suiswap.app/app/', 'Swap on Sui.', 'https://hk.tpstatic.net/dapp/tokenpocket-1688357582663.jpeg', NULL),
(260, 'ICHI', 'https://hk.tpstatic.net/dapp/tokenpocket-1681808437460.jpg', 'https://app.ichi.org/', 'Decentralized market-making protocol powering sustainable on-chain returns and deep liquidity', 'https://hk.tpstatic.net/dapp/tokenpocket-1681808437460.jpg', NULL),
(261, 'Krafterspace', 'https://hk.tpstatic.net/dapp/tokenpocket-1625716154537.png', 'https://krafter.space/en/expl', 'Krafterspace is an NFT platform on the Klaytn network.', 'https://hk.tpstatic.net/dapp/tokenpocket-1625716154537.png', NULL),
(262, 'Themis Pro', 'https://hk.tpstatic.net/dapp/tokenpocket-1686209190477.png', 'https://dapp.themis.capital', 'Themis Pro - A decentralized spot and derivatives aggregation trading platform built on FVM based on the Ve(3,3) model, with a unique pool asset reconciliation mechanism, 0 slippage trading mechanism and high capital utilization.', 'https://hk.tpstatic.net/dapp/tokenpocket-1686209190477.png', NULL),
(263, 'Quarry', 'https://hk.tpstatic.net/dapp/tokenpocket-1655696523922.jpg', 'https://app.quarry.so', 'The easiest place to discover, launch, and cultivate DeFi liquidity farms on Solana.', 'https://hk.tpstatic.net/dapp/tokenpocket-1655696523922.jpg', NULL),
(264, 'EchoDEX', 'https://hk.tpstatic.net/dapp/tokenpocket-1690109360688.jpeg', 'https://www.echodex.io/swap', 'DEX on Linea.', 'https://hk.tpstatic.net/dapp/tokenpocket-1690109360688.jpeg', NULL),
(265, 'THENA', 'https://hk.tpstatic.net/dapp/tokenpocket-1681783792383.jpg', 'https://thena.fi/', 'THENA is THE native liquidity layer & AMM on BNB Chain', 'https://hk.tpstatic.net/dapp/tokenpocket-1681783792383.jpg', NULL),
(266, 'FILEDOGE', 'https://hk.tpstatic.net/dapp/tokenpocket-1681295591093.jpg', 'https://www.filedoge.io/swap/', 'Filedoge-The First 100% Decentralized MEME Token and DEX on Filecoin!', 'https://hk.tpstatic.net/dapp/tokenpocket-1681295591093.jpg', NULL),
(267, 'Trader Joe', 'https://hk.tpstatic.net/dapp/tokenpocket-1631381517482.jpg', 'https://www.traderjoexyz.com/#/home?utm_source=DappRadar&utm_medium=deeplink&utm_campaign=visit-website', 'Your One-Stop-Shop DeFi Platform', 'https://hk.tpstatic.net/dapp/tokenpocket-1631381517482.jpg', NULL),
(268, 'DefiEdge', 'https://hk.tpstatic.net/dapp/tokenpocket-1680676075451.jpg', 'https://app.defiedge.io/', 'Asset management protocol built on #Uniswap V3', 'https://hk.tpstatic.net/dapp/tokenpocket-1680676075451.jpg', NULL),
(269, 'Timeless Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1681790032219.jpg', 'https://timelessfi.com/swap', 'Creators of Timeless and Bunni - open source and non-custodial yield markets and liquidity engine protocols.', 'https://hk.tpstatic.net/dapp/tokenpocket-1681790032219.jpg', NULL),
(270, 'OpenSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1644825114162.png', 'https://app.openswap.one/', 'OpenSwap is a DeFi protocol on the Harmony network with a straightforward yield farming capability; it serves as a cross-chain tool connecting Harmony, Ethereum, and BSC networks.', 'https://hk.tpstatic.net/dapp/tokenpocket-1644825114162.png', NULL),
(271, 'ZigZag Exchange', 'https://hk.tpstatic.net/dapp/tokenpocket-1653459390215.jpg', 'https://trade.zigzag.exchange', 'Ethereum Layer 2 ZK Rollup Order Book DEX', 'https://hk.tpstatic.net/dapp/tokenpocket-1653459390215.jpg', NULL),
(272, 'Nuon', 'https://hk.tpstatic.net/dapp/tokenpocket-1679839393171.jpg', 'https://nuon.fi/', 'Inflation proof stable coin farm pegged with truflation.com inflation data. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1679839393171.jpg', NULL),
(273, 'OpenSea Pro', 'https://hk.tpstatic.net/dapp/tokenpocket-1680665401580.jpg', 'https://pro.opensea.io/', 'The most powerful NFT aggregator-- Save gas while buying across 170+ marketplaces. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1680665401580.jpg', NULL),
(274, 'OliveSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1631379503447.png', 'https://avax.olive.cash/', 'Avalanche Protocol-based swap', 'https://hk.tpstatic.net/dapp/tokenpocket-1631379503447.png', NULL),
(275, 'OpenGate', 'https://hk.tpstatic.net/dapp/tokenpocket-1680592098035.jpg', 'https://www.opengatenft.com/#/', 'OpenGate is the first NFT marketplace of Filecoin ecosystem,and is the only notary of Filecoin on Australia.', 'https://hk.tpstatic.net/dapp/tokenpocket-1680592098035.jpg', NULL),
(276, 'SwapBox', 'https://hk.tpstatic.net/dapp/tokenpocket-1653033690404.jpg', 'https://swap.nabox.io/', 'SwapBox - Smart cross-chain exchange aggregator for multi-chain assets', 'https://hk.tpstatic.net/dapp/tokenpocket-1653033690404.jpg', NULL),
(277, 'ArbMM', 'https://hk.tpstatic.net/dapp/tokenpocket-1680514173172.jpg', 'https://arbimm.finance/?ref=MHgyZjhjNENiOEZGQWNiRjA1YjUxYjJlREM3QzUzZGMyRjliOWViNkEx', 'Trade and earn crypto on mmfinance', 'https://hk.tpstatic.net/dapp/tokenpocket-1680514173172.jpg', NULL),
(278, 'Gamma', 'https://hk.tpstatic.net/dapp/tokenpocket-1702001982500.jpeg', 'https://gamma.io/', 'Gamma is a Bitcoin creator launchpad and NFT marketplace.', 'https://hk.tpstatic.net/dapp/tokenpocket-1702001982500.jpeg', NULL),
(279, 'KsfSwap Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1648637710921.png', 'https://ksfswap.finance/', 'KsfSwap Finance is a decentralized AMM & Yield Farming platform, offering Staking, KFO, NFT, and many features on the Kucoin Community Chain.', 'https://hk.tpstatic.net/dapp/tokenpocket-1648637710921.png', NULL),
(280, 'CremaFinance', 'https://hk.tpstatic.net/dapp/tokenpocket-1649669410899.jpg', 'https://app.crema.finance/?utm_source=DappRadar&utm_medium=deeplink&utm_campaign=visit-website#/', '1st Concentrated Liquidity Protocol on #Solana', 'https://hk.tpstatic.net/dapp/tokenpocket-1649669410899.jpg', NULL),
(281, 'Port Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1650268346209.jpg', 'https://mainnet.port.finance/', 'A Suite of Currency Market Products Built on Solana', 'https://hk.tpstatic.net/dapp/tokenpocket-1650268346209.jpg', NULL),
(282, 'Platypus', 'https://hk.tpstatic.net/dapp/tokenpocket-1650767238783.jpg', 'https://app.platypus.finance/swap', 'Redefine #Stableswap with novel one-sided liquidity provision. Low slippage, high scalability and great user experience.', 'https://hk.tpstatic.net/dapp/tokenpocket-1650767238783.jpg', NULL),
(283, 'ApeSwap', 'https://tp-statics.cdn.bcebos.com/website/tokenpocket-1617132879832.png', 'https://apeswap.finance/', 'Multi-chain AMM Swap', 'https://tp-statics.cdn.bcebos.com/website/tokenpocket-1617132879832.png', NULL),
(284, 'Sideswap', 'https://hk.tpstatic.net/dapp/tokenpocket-1704858829871.jpg', 'https://sideswap.finance/#/swap', 'SideSwap is a decentralized trading platform', 'https://hk.tpstatic.net/dapp/tokenpocket-1704858829871.jpg', NULL),
(285, 'Unifi Protocol', 'https://hk.tpstatic.net/dapp/tokenpocket-1653448814430.png', 'https://ubridge.unifiprotocol.com/', 'Simple and innovative solutions for Web3 applications.', 'https://hk.tpstatic.net/dapp/tokenpocket-1653448814430.png', NULL),
(286, 'Tulip Protocol', 'https://hk.tpstatic.net/dapp/tokenpocket-1655696223426.jpg', 'https://tulip.garden/leverage?src=Home', 'Yield Aggregator for Solana', 'https://hk.tpstatic.net/dapp/tokenpocket-1655696223426.jpg', NULL),
(287, 'Qi Dao', 'https://hk.tpstatic.net/dapp/tokenpocket-1679217995869.jpg', 'https://app.mai.finance/', 'QiDao is an overcollateralized stablecoin protocol that allows users to mint stablecoins (MAI) against the value of their decentralized token collaterals. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1679217995869.jpg', NULL),
(288, 'Aftermath Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1706175252130.jpg', 'https://aftermath.finance/', 'One-stop decentralized exchange platform', 'https://hk.tpstatic.net/dapp/tokenpocket-1706175252130.jpg', NULL),
(289, 'Baguette', 'https://hk.tpstatic.net/dapp/tokenpocket-1631368963456.png', 'https://app.baguette.exchange/#/swap', 'A community-governed DEX (Decentralized Exchange).', 'https://hk.tpstatic.net/dapp/tokenpocket-1631368963456.png', NULL),
(290, 'Canary Exchange', 'https://hk.tpstatic.net/dapp/tokenpocket-1631375184119.jpg', 'https://app.canary.exchange/#/swap', 'An open AMM (Automated Market Maker) DEX (Decentralized Exchange).', 'https://hk.tpstatic.net/dapp/tokenpocket-1631375184119.jpg', NULL),
(291, 'MeanFi', 'https://hk.tpstatic.net/dapp/tokenpocket-1649664694397.jpg', 'https://app.meanfi.com/exchange', 'Everyday DeFi banking workflows powered by Money Streams. Self-custody, permission less & trustless.', 'https://hk.tpstatic.net/dapp/tokenpocket-1649664694397.jpg', NULL),
(292, 'KoffeeSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1648639662510.jpeg', 'https://koffeeswap.exchange/', 'KoffeeSwap is the first decentralized exchange on the KuCoin Community Chain.', 'https://hk.tpstatic.net/dapp/tokenpocket-1648639662510.jpeg', NULL),
(293, 'Meshswap', 'https://hk.tpstatic.net/dapp/tokenpocket-1652508666224.jpg', 'https://meshswap.fi/', 'Meshswap is an AMM-based decentralized trading protocol designed to maximize asset utilization on Polygon.', 'https://hk.tpstatic.net/dapp/tokenpocket-1652508666224.jpg', NULL),
(294, 'Friktion', 'https://hk.tpstatic.net/dapp/tokenpocket-1655706795825.png', 'https://app.friktion.fi/', 'Aggregator on solana', 'https://hk.tpstatic.net/dapp/tokenpocket-1655706795825.png', NULL),
(295, 'MojitoSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1709869789201.jpg', 'https://www.mojitoswap.finance/', 'The first audited decentralized exchange with automated market maker and high APR.', 'https://hk.tpstatic.net/dapp/tokenpocket-1709869789201.jpg', NULL),
(296, 'Seekers', 'https://tp-statics.cdn.bcebos.com/website/tokenpocket-1631002079937.png', 'https://bsc.seekers.pro/', 'Decentralized Non-Custodial NFT Trading Platform', 'https://tp-statics.cdn.bcebos.com/website/tokenpocket-1631002079937.png', NULL),
(297, 'Saber', 'https://hk.tpstatic.net/dapp/tokenpocket-1655704915997.jpg', 'https://app.saber.so/', 'Sabre is the leading centralized liquidity AMM and DEX on Solana.', 'https://hk.tpstatic.net/dapp/tokenpocket-1655704915997.jpg', NULL),
(298, 'Sudo Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1731036890862.jpg', 'https://app.sudo.finance/trade', 'Sudo is a revolutionary on-chain real world asset and derivatives exchange protocol built on Sui chain', 'https://hk.tpstatic.net/dapp/tokenpocket-1731036890862.jpg', NULL),
(299, 'NerveSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1653033905556.jpg', 'https://nerve.network/', 'Decentralized digital asset service network', 'https://hk.tpstatic.net/dapp/tokenpocket-1653033905556.jpg', NULL),
(300, 'Lighter', 'https://hk.tpstatic.net/dapp/tokenpocket-1679217666057.jpg', 'https://lighter.xyz/trade', 'Smarter, Faster, Cheaper, LIGHTER.  Fully decentralized order book exchange for spot trading. ', 'https://hk.tpstatic.net/dapp/tokenpocket-1679217666057.jpg', NULL),
(301, 'AirDAO', 'https://hk.tpstatic.net/dapp/tokenpocket-1677672053218.png', 'https://airdao.io/firepot/swap', 'AirDAO is a community-managed blockchain and #web3 dApps ecosystem, powered by $AMB.', 'https://hk.tpstatic.net/dapp/tokenpocket-1677672053218.png', NULL),
(302, 'mTrader Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1679217123453.jpg', 'https://app.mtrader.finance/#/trade', 'My MetaTrader is the ultimate trading destination for the REAL traders. With a user-friendly interface and advanced features like full custody of your funds, median spot prices, high leverages, and transparent and decentralized execution. Let\'s experience the future of trading with My MetaTrader.', 'https://hk.tpstatic.net/dapp/tokenpocket-1679217123453.jpg', NULL),
(303, 'KuSwap', 'https://pbs.twimg.com/profile_images/1409198224527683586/9g9ykRCE_400x400.jpg', 'https://app.kuswap.finance/', 'KuSwap is the number one DEX/AMM on the Kucoin Community Chain.', 'https://pbs.twimg.com/profile_images/1409198224527683586/9g9ykRCE_400x400.jpg', NULL),
(304, 'Archly Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1679216320454.jpg', 'https://archly.fi/', 'Archly Finance, at its core, is a solution for protocols on Telos EVM to properly incentivize liquidity for their own use cases.', 'https://hk.tpstatic.net/dapp/tokenpocket-1679216320454.jpg', NULL),
(305, 'KillSwitch', 'https://hk.tpstatic.net/dapp/tokenpocket-1648637796562.png', 'https://killswitch.finance/', 'KillSwitch, an intelligent yield aggregator, offers users automated compounding services.', 'https://hk.tpstatic.net/dapp/tokenpocket-1648637796562.png', NULL),
(306, 'Swappi', 'https://hk.tpstatic.net/dapp/tokenpocket-1649842887016.jpg', 'https://swappi.io/', 'An open DeFi protocol aimed at fostering a more decentralized world. Currently building the top-ranked AMM-based DEX on Conflux eSpace.', 'https://hk.tpstatic.net/dapp/tokenpocket-1649842887016.jpg', NULL),
(307, 'Thales', 'https://hk.tpstatic.net/dapp/tokenpocket-1677478327612.png', 'https://thalesmarket.io/markets', 'A new frontier in simple on-chain derivatives.', 'https://hk.tpstatic.net/dapp/tokenpocket-1677478327612.png', NULL),
(308, 'Sonne Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1677478047282.jpg', 'https://sonne.finance/', 'Sonne Finance is a decentralized, non-custodial liquidity market protocol on Optimism Mainnet', 'https://hk.tpstatic.net/dapp/tokenpocket-1677478047282.jpg', NULL),
(309, 'Qzuki', 'https://hk.tpstatic.net/dapp/tokenpocket-1676342425552.jpg', 'https://qzuki.com/', 'We are creating a Q version of the NFT world to help people get into Web3 quickly. Qzuki is a multi- functional PASS. It will also be a platform of Q-version brands.', 'https://hk.tpstatic.net/dapp/tokenpocket-1676342425552.jpg', NULL),
(310, 'Vela Exchange', 'https://hk.tpstatic.net/dapp/tokenpocket-1676356519191.jpg', 'https://app.vela.exchange/', 'Empowering DeFi traders with fast execution, cheap transactions, advanced trading features and self-custody.', 'https://hk.tpstatic.net/dapp/tokenpocket-1676356519191.jpg', NULL),
(311, 'Silo Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1675936112028.png', 'https://app.silo.finance/', 'Silo is a non-custodial lending protocol to borrow any crypto asset with another.', 'https://hk.tpstatic.net/dapp/tokenpocket-1675936112028.png', NULL),
(312, 'Goledo Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1676963933561.jpeg', 'https://www.goledo.cash/', 'The first innovative lending protocol on Conflux eSpace.', 'https://hk.tpstatic.net/dapp/tokenpocket-1676963933561.jpeg', NULL),
(313, 'Arbswap', 'https://hk.tpstatic.net/dapp/tokenpocket-1676865619529.jpg', 'https://arbswap.io/swap', 'The #1 AMM and DEX powered by #Arbitrum ，Secure, Scalable, Simple.', 'https://hk.tpstatic.net/dapp/tokenpocket-1676865619529.jpg', NULL),
(314, 'Avault', 'https://hk.tpstatic.net/dapp/tokenpocket-1677057923914.jpg', 'https://www.avault.network/', 'Avault is a one-stop omnichain yield platform that aims to help users to use Web3 Dapps easily, powered by @LayerZero_Labs, Build on @Arbitrum, @Astarnetwork', 'https://hk.tpstatic.net/dapp/tokenpocket-1677057923914.jpg', NULL),
(315, 'INS3', 'https://tp-statics.cdn.bcebos.com/website/tokenpocket-1630478653110.png', 'https://bsc.ins3.finance', 'Fully Decentralized Insurance and Derivatives Product Issuance Platform', 'https://tp-statics.cdn.bcebos.com/website/tokenpocket-1630478653110.png', NULL),
(316, 'Atrix', 'https://hk.tpstatic.net/dapp/tokenpocket-1655695877176.jpg', 'https://app.atrix.finance/swap', 'Automated Order Book Liquidity Provision Strategy Protocol on Solana.', 'https://hk.tpstatic.net/dapp/tokenpocket-1655695877176.jpg', NULL),
(317, 'Lever.Network（ETH）', 'https://tp-statics.cdn.bcebos.com/website/tokenpocket-1621054082357.png', 'https://eth.lever.network/', 'Decentralized Margin Trading Platform', 'https://tp-statics.cdn.bcebos.com/website/tokenpocket-1621054082357.png', NULL),
(318, 'Hieswap', 'https://hk.tpstatic.net/dapp/tokenpocket-1677761845576.png', 'https://hieswap.com', 'Provides cross-chain aggregation services.', 'https://hk.tpstatic.net/dapp/tokenpocket-1677761845576.png', NULL),
(319, 'LEVEL Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1680145398121.jpg', 'https://app.level.finance/', 'LEVEL is a leading non-custodial, perpetual DEX ', 'https://hk.tpstatic.net/dapp/tokenpocket-1680145398121.jpg', NULL),
(320, 'Bunni', 'https://hk.tpstatic.net/dapp/tokenpocket-1681790544239.png', 'https://bunni.pro/stake', 'Bunni is a liquidity engine designed to incentivize liquidity for Uniswap v3.', 'https://hk.tpstatic.net/dapp/tokenpocket-1681790544239.png', NULL),
(321, 'SimpleSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1721116736936.jpg', 'https://simpleswap.io/', 'Non-custodial instant crypto exchange service with competitive rates and 24/7 support.', 'https://hk.tpstatic.net/dapp/tokenpocket-1721116736936.jpg', NULL),
(322, 'Arken Finance', 'https://hk.tpstatic.net/dapp/tokenpocket-1695883915160.jpg', 'https://swap.arken.finance/', 'Simplify the complexity of DeFi, allowing developers to easily create applications and help traders/users navigate between multiple chains more easily and efficiently.', 'https://hk.tpstatic.net/dapp/tokenpocket-1695883915160.jpg', NULL),
(323, 'Risedle', 'https://hk.tpstatic.net/dapp/tokenpocket-1694745200424.jpg', 'https://risedle.com/', 'The next-gen trading platform on Arbitrum.Discover the latest and best assets in DeFi.', 'https://hk.tpstatic.net/dapp/tokenpocket-1694745200424.jpg', NULL),
(324, 'Verse', 'https://hk.tpstatic.net/dapp/tokenpocket-1680074227927.png', 'https://verse.bitcoin.com/', 'Bitcoin.com\'s multi-chain Verse DEX is a decentralized exchange based on automated market makers.', 'https://hk.tpstatic.net/dapp/tokenpocket-1680074227927.png', NULL),
(325, 'HorizonDEX', 'https://hk.tpstatic.net/dapp/tokenpocket-1690094483347.jpeg', 'https://app.horizondex.io/swap', 'DEX on Linea.', 'https://hk.tpstatic.net/dapp/tokenpocket-1690094483347.jpeg', NULL),
(326, 'DackieSwap', 'https://hk.tpstatic.net/dapp/tokenpocket-1690464765998.jpeg', 'https://www.dackieswap.xyz/swap', 'Swap on Base.', 'https://hk.tpstatic.net/dapp/tokenpocket-1690464765998.jpeg', NULL),
(327, 'yayasea', 'https://hk.tpstatic.net/dapp/tokenpocket-1690957951320.png', 'https://ord.yayasea.com/', 'The Ordinals NFT marketplace.', 'https://hk.tpstatic.net/dapp/tokenpocket-1690957951320.png', NULL),
(328, 'Helix', 'https://hk.tpstatic.net/dapp/tokenpocket-1693969349753.jpg', 'https://helixapp.com/', 'The only truly decentralized derivatives exchange. Trade unlimited cross-chain spot and futures markets.', 'https://hk.tpstatic.net/dapp/tokenpocket-1693969349753.jpg', NULL),
(329, 'UniDex Exchange', 'https://hk.tpstatic.net/dapp/tokenpocket-1694744633643.jpg', 'https://leverage.unidex.exchange/', 'The meta-aggregator of everything in DeFi. Aggregating Perps & Swaps for the deepest liquidity on-chain', 'https://hk.tpstatic.net/dapp/tokenpocket-1694744633643.jpg', NULL),
(330, 'NFTMart', 'https://hk.tpstatic.net/dapp/tokenpocket-1621585118832.png', 'https://www.nftmart.io/en', 'Professional NFT Marketplace', 'https://hk.tpstatic.net/dapp/tokenpocket-1621585118832.png', NULL),
(331, 'Complus Network', 'https://hk.tpstatic.net/dapp/tokenpocket-1631375364169.png', 'https://avadex.complus.exchange/#/swap', 'Decentralized Exchange Protocol', 'https://hk.tpstatic.net/dapp/tokenpocket-1631375364169.png', NULL),
(332, 'Pureswap', 'https://tp-statics.cdn.bcebos.com/website/tokenpocket-1621238906539.jpeg', 'http://pureswap.finance/', 'Decentralized Exchange based on BSC', 'https://tp-statics.cdn.bcebos.com/website/tokenpocket-1621238906539.jpeg', NULL);

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
(140, '265F387A-944A-4AA8-9FE7-3EC4C16EA03C', '7Xn6Bw2qAcPlD1Kv4u', '2024-10-31 16:03:29', 'colVGJfDskO8saRhv6C1wz:APA91bF3PTC4WWIPBLr3Rejia-HYYBAq2kD7nQhV1L7WA7fWUN2uniQvxYI3cXdlE9G0jk5ZLKPLkTUQ4nwwYPookSO1yta-jFyZfTDgZb4dHQxbdgc7czU', 1, 0),
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
(227, '51afcbc91440895c', 'enbwbuRnTdq9tf0w', '2025-03-06 12:48:40', 'dKCO6dzoSEKzbOXoBbxq1S:APA91bE2w0BlgW063WgXsm-14B0laVMSuWHUqg_QMuEpkAOMFI5bTxgrdLBg3NiEPqTdkOrxNMrFKB-q658Q55ZGAMHD3sJHvdiC3pD3ja-GNYtSa4E4IV4', 0, 1),
(228, '38c69b0f6d0c4084', 'clqi81CRl2MbRReg', '2025-03-06 12:50:05', 'c2x_dvX7ToWwdKqPgKXfSJ:APA91bFrgJTEFez623qO1ApfMGgjNq1FAqPs-PvkFmbpv_NOlnK0zAV4IsyhN_UiESTQQS1P0zThfSVuNJBNMSsYkPdfhwTuy6-I7IlLbAjqayUb14F7XMc', 0, 0),
(229, 'e2851a2da07e645e', 'PBlDfGhry9hoXcdK', '2025-03-06 19:37:00', 'dB3bK2elRLeRLjSDb2-E3A:APA91bFege284wD14iavRESEqOBlhjoZLawA4aoxVF5AxJ_GX-NHb5EhpnBRb54AEaBngEADwuxvDlpd-vebCbyDNuebinohRmet2HFTwS_aI6jWnIwItBY', 0, 0),
(230, '96b7ada2bded2c72', '3vPfDSFc3qFAIeU', '2025-03-07 12:33:26', 'dbldLZoxSXam8weJvufdYU:APA91bEcHQ2KsLQI1O8qAvPo28Pn4Knx0-338F_efD5dIN9eAgp3PdAS5mr3rRWbEK1fB_5YeJvQWt1a3Wg0nRPDVEp-OYJiyW25_3-V15wDYjtp9DV7dfY', 0, 0),
(231, 'd5abc35bf85c100e', '2XxT28i7RpepVtzC', '2025-03-07 13:23:24', 'fs3ye5sUQjmDFKgpUeZk4M:APA91bGETLgrPqgkjia_uMVzT1meaGJoNpO3cYKTC_D-ueV4fONEmzFUuS8MNjA_0VInRwi4C-xQSOqFRYzzlTGpj833iQtmhOljTK_s94Okjfl4Sp8GDpY', 0, 0),
(232, '96b7ada2bded2c72', 'MdhwGbyBENeYZY7q', '2025-03-07 16:38:10', 'd7H_JrI_R7W3P5-QJukZir:APA91bHxYIUsxYEx3fXkW7J5iCDo76pXfZDeR-WesFG5cjuqIY2SHcfdFlHZV82CWB41LD7T7MedYF0KqZHLNd3M9HIXTjq4am8cD9ekwtbq4iv0GzymHRE', 0, 0),
(234, '96b7ada2bded2c72', '3vPfDSFc3qFAIeU', '2025-03-07 17:59:25', 'dbldLZoxSXam8weJvufdYU:APA91bEcHQ2KsLQI1O8qAvPo28Pn4Knx0-338F_efD5dIN9eAgp3PdAS5mr3rRWbEK1fB_5YeJvQWt1a3Wg0nRPDVEp-OYJiyW25_3-V15wDYjtp9DV7dfY', 0, 0),
(235, '96b7ada2bded2c72', 'Zz6GzaNmcvi1742q', '2025-03-07 18:03:08', 'ejxKC8cDSGy0Ff4UC0zdcB:APA91bFRktdAxkMr4fR4ha9H7KKSHceGcq5KZ2TsF_9nBy65sryYPE_wK_SrffAStA8HL5ya8h3_FPw1eOkytsHKVVMzzal0AH8yjXJFyUIYkFopj3Vx--I', 0, 0),
(236, '96b7ada2bded2c72', 'udbNtwsrfxqYZHZEY', '2025-03-11 14:33:52', 'cX4emMOgTLKEToTKq4cmtG:APA91bEHQb2mgl5pQw1pe3ZTPySY0TDHm2tUIJM_NO9c4JfCUDRF6PkBA5gUZEOuyvZyXZGoTdQb-E_K7Xg0E3vt11VG0jOnzsvjVlIXQWXLJGQH3IkxmRU', 0, 0),
(237, '96b7ada2bded2c72', 'Zz6GzaNmcvi1742q', '2025-03-11 16:23:09', 'ejxKC8cDSGy0Ff4UC0zdcB:APA91bFRktdAxkMr4fR4ha9H7KKSHceGcq5KZ2TsF_9nBy65sryYPE_wK_SrffAStA8HL5ya8h3_FPw1eOkytsHKVVMzzal0AH8yjXJFyUIYkFopj3Vx--I', 0, 0),
(238, '96b7ada2bded2c72', 'Zz6GzaNmcvi1742q', '2025-03-11 16:24:57', 'ejxKC8cDSGy0Ff4UC0zdcB:APA91bFRktdAxkMr4fR4ha9H7KKSHceGcq5KZ2TsF_9nBy65sryYPE_wK_SrffAStA8HL5ya8h3_FPw1eOkytsHKVVMzzal0AH8yjXJFyUIYkFopj3Vx--I', 0, 0),
(239, '96b7ada2bded2c72', 'udbNtwsrfxqYZHZEY', '2025-03-11 16:28:02', 'cX4emMOgTLKEToTKq4cmtG:APA91bEHQb2mgl5pQw1pe3ZTPySY0TDHm2tUIJM_NO9c4JfCUDRF6PkBA5gUZEOuyvZyXZGoTdQb-E_K7Xg0E3vt11VG0jOnzsvjVlIXQWXLJGQH3IkxmRU', 0, 0),
(240, '96b7ada2bded2c72', 'Zz6GzaNmcvi1742q', '2025-03-11 16:42:30', 'ejxKC8cDSGy0Ff4UC0zdcB:APA91bFRktdAxkMr4fR4ha9H7KKSHceGcq5KZ2TsF_9nBy65sryYPE_wK_SrffAStA8HL5ya8h3_FPw1eOkytsHKVVMzzal0AH8yjXJFyUIYkFopj3Vx--I', 0, 0),
(241, 'e2851a2da07e645e', 'oAGXs0ksbsT7m3B', '2025-03-12 12:53:25', 'dTKVKWUtRl-f7JCrYhFA_z:APA91bGnA2NkLuxy7cnihGv1daWPD4cZ7TQqVbcAOtiYVBNgANBL_l_48jaZIcnysnrR6c83cbXjhSK6GbMcXu2dDrFw7yBoccrry7l2xHhhZVlHivIgFdY', 0, 0),
(242, 'e2851a2da07e645e', 'tLNbPbAOZxPbnLO0', '2025-03-12 15:36:19', 'fD5pviMCQe21USaArIJsyQ:APA91bFyYmoDfIduSb-7EvX0wjx60En6CEczqU8CrmjULwFf0HGdsrXJfuVHK7QNxi5moxN3x10LsGMgYDuT1e3IfvKIV1h3jD3xcLBwTyk62xAIQCEGWGU', 0, 0),
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
(263, '6eba948042dec281', 'iM9f4dKhE0n2FeOf', '2025-03-25 16:48:43', 'chcGnsShQOKsJYzc2T_xDb:APA91bEyftVqT0IWY7ni10eHIevT8XxoKlz0gja1UzUc0Rj_XkGaEILcykrzAwpLo39MMOl1GTDI3eBqm2p_vbsf17q47jtO6rYQ90k3gOOnzIMNwd4CWpI', 0, 0),
(264, '96b7ada2bded2c72', 's6iUd0ykhcLnqo', '2025-03-26 12:01:07', 'eaPei2btSbOgixdn-AZce2:APA91bG_GIvCT8425SwZib0L9rW9VLeyTO46tnXP5FCyloRUVRRfpz2Kf8xMDAfMwfJYFMTM-l5ayGv4vsj-kSpe-36VfXX4ngXWLYe_ef2bs8emo1hC4WI', 0, 0),
(265, '672ca56b02b253a4', 'cihuLaBLvYcDypi', '2025-03-31 18:27:56', 'f2ggbuKES7OsmUatlsmLTH:APA91bH5OVCER57gGrvwZzps3r63_4lvUiLIQ18FWTnK3SrLw-nKjEllcLP34RiImNX1uNDYGWkm_0dqqKE-gpzr0W9koMMZwNltBxmKPhZnp-35tW_KWOg', 1, 0),
(266, '21ddd4f9fb1e56e3', 'l7lT7uaUO4855cyc', '2025-04-01 11:29:51', 'dEcr9jPxToWZQ3RWEPT9Mh:APA91bEkMVuqHcf9oLLNKvgUlAO1FilPl8RV97U8kv3-IO6SBlAhi5Z8Zue5n0d8fAUlNq16WHUoSwry35jk5K4J_y6X29X2PljcC42jwiVI4bjZMpkgFUs', 0, 0),
(267, '96b7ada2bded2c72', 'M2FXVlztZvTkDxu', '2025-04-01 11:58:16', 'e59qlIVoSHihW2ePuHsgYq:APA91bF4MyFbFzZ8h4dixstI5SgybE1UIHhZYpTOzT56M5TYSoD-1OrB7hw7bXfNs5RQCY619Ukaayhrq-J_ZNkBoL7m1iuMIdb0I20JrZ5ZI2ggJlTfyhc', 0, 0),
(268, '96b7ada2bded2c72', 'M2FXVlztZvTkDxu', '2025-04-01 12:08:47', 'e59qlIVoSHihW2ePuHsgYq:APA91bF4MyFbFzZ8h4dixstI5SgybE1UIHhZYpTOzT56M5TYSoD-1OrB7hw7bXfNs5RQCY619Ukaayhrq-J_ZNkBoL7m1iuMIdb0I20JrZ5ZI2ggJlTfyhc', 0, 0),
(269, '96b7ada2bded2c72', 'udbNtwsrfxqYZHZEY', '2025-04-01 12:10:39', 'cX4emMOgTLKEToTKq4cmtG:APA91bEHQb2mgl5pQw1pe3ZTPySY0TDHm2tUIJM_NO9c4JfCUDRF6PkBA5gUZEOuyvZyXZGoTdQb-E_K7Xg0E3vt11VG0jOnzsvjVlIXQWXLJGQH3IkxmRU', 0, 0),
(270, '96b7ada2bded2c73', 'udbNtwsrfxqYZHZEY', '2025-04-01 12:12:09', 'cX4emMOgTLKEToTKq4cmtG:APA91bEHQb2mgl5pQw1pe3ZTPySY0TDHm2tUIJM_NO9c4JfCUDRF6PkBA5gUZEOuyvZyXZGoTdQb-E_K7Xg0E3vt11VG0jOnzsvjVlIXQWXLJGQH3IkxmRU', 0, 0),
(271, 'ee', 'udbNtwsrfxqYZHZEY', '2025-04-01 12:12:15', 'cX4emMOgTLKEToTKq4cmtG:APA91bEHQb2mgl5pQw1pe3ZTPySY0TDHm2tUIJM_NO9c4JfCUDRF6PkBA5gUZEOuyvZyXZGoTdQb-E_K7Xg0E3vt11VG0jOnzsvjVlIXQWXLJGQH3IkxmRU', 1, 0),
(272, '96b7ada2bded2c72', 'M2FXVlztZvTkDxu', '2025-04-01 12:17:16', 'e59qlIVoSHihW2ePuHsgYq:APA91bF4MyFbFzZ8h4dixstI5SgybE1UIHhZYpTOzT56M5TYSoD-1OrB7hw7bXfNs5RQCY619Ukaayhrq-J_ZNkBoL7m1iuMIdb0I20JrZ5ZI2ggJlTfyhc', 0, 0),
(273, '96b7ada2bded2c73', 'udbNtwsrfxqYZHZEI', '2025-04-01 12:27:37', 'cX4emMOgTLKEToTKq4cmtG:APA91bEHQb2mgl5pQw1pe3ZTPySY0TDHm2tUIJM_NO9c4JfCUDRF6PkBA5gUZEOuyvZyXZGoTdQb-E_K7Xg0E3vt11VG0jOnzsvjVlIXQWXLJGQH3IkxmRU', 0, 0),
(274, '96b7ada2bded2c73', 'udbNtwsrfxqYZHZEU', '2025-04-01 12:27:45', 'cX4emMOgTLKEToTKq4cmtG:APA91bEHQb2mgl5pQw1pe3ZTPySY0TDHm2tUIJM_NO9c4JfCUDRF6PkBA5gUZEOuyvZyXZGoTdQb-E_K7Xg0E3vt11VG0jOnzsvjVlIXQWXLJGQH3IkxmRU', 0, 0),
(275, '96b7ada2bded2c73', 'udbNtwsrfxqYZHZEi', '2025-04-01 12:28:23', 'cX4emMOgTLKEToTKq4cmtG:APA91bEHQb2mgl5pQw1pe3ZTPySY0TDHm2tUIJM_NO9c4JfCUDRF6PkBA5gUZEOuyvZyXZGoTdQb-E_K7Xg0E3vt11VG0jOnzsvjVlIXQWXLJGQH3IkxmRU', 1, 0),
(276, '21ddd4f9fb1e56e3', 'iojgbBIDzCuZcfU', '2025-04-02 13:06:40', 'cZFm5DydSUqF1R6FoRyaxf:APA91bEkEX9HK7iJ_s5VwCIfoSkL00DCEaLBUtyJZMODVIojxsh2URDv0pwpSS62UaXCekJr7OPvph3YFaa7pLV-niSc6ntQKc54tgenwNy0IlV0tvz33-s', 0, 0),
(277, '38c69b0f6d0c4084', 'gAOK191oZbuQTWK9', '2025-04-02 17:20:21', 'dcDGKULjT9yP8MhNLW8Ml_:APA91bHpTLL2pzL5cV4GGuQnsOX_4ALeFqJpGjJ9XlawClv1BQE5sFnkGmuHVfpvUawC4AHsgi8DegoIUs1y8IpnEEqkZw74BpKEjWKXdOZhunMp_LBGItI', 0, 0),
(278, 'd5abc35bf85c100e', 'HVOCDnTvkeAfZl6', '2025-04-08 14:39:52', 'eiIXEeqtRmq7VtfqBCZwQT:APA91bG6L7UMrcFhxDtPdJTMZM1zS2KcbClt3lQprtg6YcUg2ZrxoGU5sykTE1Sf3uiNRns240g3nBALRhLeJN3Me0yLufdoxC0yB73ayPNeMkGNm5gG7Y4', 0, 0),
(279, '21ddd4f9fb1e56e3', 'Ii1R5KyzSs4snw8k', '2025-04-08 17:47:01', 'fQfPgk1aS5K9kT1VTZ52LH:APA91bGODPxV9DvUA_RLxOIKBgbr9wLwCRxVbWpRsdXP5wGrJ-YnM9ylWpU6a2kQarJwjDHNEK0noMCZbhcd_Yx4ReGgPrPpBFo9BtAQXFNGfEcDAQdT47I', 0, 0),
(280, '96b7ada2bded2c72', 'nCINEmf0nyI4mhaJ', '2025-04-09 16:28:52', 'eTxZcKvQQ0uNQmYccEhqVU:APA91bEphr1bco-V90DTgRE5bJo3dy6PDjXdW7Rw1J7tqkzG-YDE3OSeW5tkDpygn4Nt1SIT1gBTprFtFEso8vqgQpAlksJH279pLBsI0Jc1doR1txk87_c', 0, 0),
(282, '9c62b5de112453f0', '4X2HE312d1QHYu', '2025-04-09 19:39:48', 'ckaWS7kZTim0vhGnrTJUML:APA91bFfSHYP-vSEAc3IyaqXPBuyuoRoZDJm9UjZk2xlG-ygjsLu2hlgH-NHFafdNbVicy_KPzN-tj07rD4JLPbNs-eRHraY0nzuxs4wGLrUEeKiWoVRdu8', 0, 0),
(284, '9c62b5de112453f0', 'nXVqVSanOx2I7sLX', '2025-04-09 19:48:59', 'chYWcXl_T6axXQzj4SdNeS:APA91bG-fujvepN1wFX068ey6WMO_WfwRGa0Z6wVbiDMQTO99UZt6LSKyEuLFqYx9cogM9wITsagyRby_4SgPmI99nZR3I4ZiJz_yOwnGV7oyU1QSACvL4w', 0, 0),
(296, '96b7ada2bded2c72', 'iUYbcVetYtMeh0p9', '2025-04-14 15:36:55', 'eGDoCIvgTyCI0z_gxKNQxK:APA91bEtaxdL5xXdWYw6BFZ6j4NDWMfhvLuQEQtCY3vor61O55Kf8__pH8fvDLTrCz-MRgXvUDQmNeipB1Rjgji5vCo9QnPeI5scgBeYxRTbOYQVZ06p_fk', 0, 0),
(297, '96b7ada2bded2c72', 'ND00K2V0ZRvjPgiY', '2025-04-14 23:48:46', 'elyEj1U6QoiCSfNSovOWtm:APA91bE-qQ4XnaT56dwGiQqUOMX4qVgijdC-rQYqmDW-ozs09e8QnhzilGRFwka3diO-dt7atufHxkEiw3SXtAfngUuYu3kbFWDwUCvhqaRpRxZUkvTN6Vg', 0, 0),
(298, '96b7ada2bded2c72', 'VrNjLfCoyaO6lIoO', '2025-04-15 00:09:04', 'cC4DBo-iQOeQkdVYCyn4cw:APA91bGAz7zJcEps6nUisxeEWI-sgU6bAXaVMIrmxF6YpGMaJI0HAt0vr5whWm9fhfb6yTKKnIByLXvaMfD46j_X9XBh9s26BVIKxFfXBRS0r8HbohSQJjc', 0, 0),
(299, '96b7ada2bded2c72', 's0nb0rLAh10qDxNd', '2025-04-15 00:11:45', 'frtS2OrWRp6EYcKKsXJ3zC:APA91bFkZNINBZzh4hT4Oc-NyzrgyanIW7erHQFESkHbr9rMXjDHkEsI_NDsrUinc_WOnqG9fPng67-ICXJobbSo3-CptlO8x0F2IQmxFuhC8KmAt2kIt_4', 0, 0),
(300, '96b7ada2bded2c72', 'bqmawBzCnvf7hNc8', '2025-04-15 00:20:45', 'eY4rv4UnQK6Dy3NcrS5wP1:APA91bG4Qpnoby7grpaAYa0xv7T-BqihDcr3FNX7ajqPGTsRBMOERAF_lw2T460Jj4o9NRiN4m_rDO5y0ZdejgnHP2Xj7m1lgMiJnd0-njcINrC1fR1uDps', 0, 0),
(301, '21ddd4f9fb1e56e3', '1EQQB4TcXjt9E5nM', '2025-04-15 11:22:46', 'fE2hal89SreLXSA8vBjh43:APA91bHwXp1zco3xUs-BX5EAf7wY0GvDKuH4BvbYZ03wMvZiaNxyzam1g7oV0oaURXMgMveN6u_s_hq0RZ2JdYB6m6g6OrEqNui9tdt0B_xGy8HXJQTSKAg', 0, 0),
(302, '21ddd4f9fb1e56e3', 'OE22LTmCBcyX3CJo', '2025-04-15 12:15:42', 'dxWjK4aiTfi9AKuAkEA4_g:APA91bEfYCq0aS_n55ZDQiQ2ln-h4PCH6fXtLVrhk72Jm9A3mG80FNe7eAaNNOozN_WylnunBT9Z446XFqjcCGPabjsBHmboEgzWc263_6fH-U5qr8THvmk', 0, 0),
(303, '30d20ed6087f9df3', 'LLSKF0pE0VFI80Jf', '2025-04-15 14:57:28', 'cvNIHi8iTZSLRzdfFu_-Qk:APA91bE-TGtx52kc6IU6EXnrc0vMwWcLQDvc4NBFRD4dnUK6uVMbAOvhFMNby-ANsAx9UCIF1OeNh6_N-vI3xQsNrBLSlwt33rSbpuaNY3WOfk2mlpmeux8', 0, 0),
(304, '9c62b5de112453f0', 'a95PGnmBVHP2QiV4', '2025-04-15 14:57:55', 'erKQnmGWRLCTCdhj-PKpGl:APA91bGdWZ9URRY5c6I-moBkhPCzIsBuoSeC31tNZsxE_hltjrH9ni7V49x2fJB_W5VOywDLMcA3dBAiTZRVfl2gc0aZaUJiEpDWTc4QmjtS1vvriXctnXo', 0, 0),
(305, '96b7ada2bded2c72', 'QXWtCC5YMRwW6j', '2025-04-15 15:05:51', 'f3FC1Le9SdOJTTzUwQ_l36:APA91bFW4fAvKKKoih7DfFmfYxlyCGtHUV91j6N5WdEpnkWEZ2bkLDb6_IpDKoahBm5x1G2Z9Fe8NgeYi9QvCLjgLo6Vx4NyLwptATLhrYDTdjr2MYuuRAU', 0, 0),
(306, '1fa4792b9f16c2e9', 'TBddzRfDotSiy81z', '2025-04-15 15:12:47', 'cgC3moY1SOeBxgF-zlVcZL:APA91bE7tF-Ce1nclHy-0ljg25720Uqaok3OaB_H3RaOIDnI6WUs7PH4e9mWy2_czsxKY13h-kZSkE5k2qCEKwcu7ukiDQe4FD0MPg4z1g6oVwq9s-dFGqE', 1, 0),
(307, '21ddd4f9fb1e56e3', 'JXfVBsMGRlI7fHFJ', '2025-04-15 15:24:15', 'd092mAY7SnSnj_2e_cnKsk:APA91bHaZk5zmXVm04FI_C9-CEe4GGGYkJ0-jfFRf-wyoBSDmivxAM3zdtUz5fY0GqvrOQXyW4CcHRGDNo1QFpxczNxzrxn9ip06bt3WOevy-mu4KaxLNc4', 0, 0),
(308, '21ddd4f9fb1e56e3', 'pI3nICVDiv3c0Rq', '2025-04-15 17:57:11', 'ddU8ZKbASr2edhGJUy-iyI:APA91bEk7QL1Q2EEZLM8cGgKOVmi6bsJ79eHygYQgm31ucHz6mGqJtjFddhzpFVVvzlVSVVVM2qw_1W7tJRHSWH39Tu1_Ha-LC9O6g_D4hqzWbJn44g0ln0', 1, 0),
(310, '1fa4792b9f16c2e9', 'AXPF2iEFuzTWS4', '2025-04-16 12:05:10', 'ffzLT-A1SPO6yaA6QOtKZT:APA91bF_H_0sNAZc5ZEKFfKoQVftfOBeSP8Qo0EQWkE8FV5FnxNX4nWy-0lbtnkTF9F5kTollMmS6vtxb1VRR8QzQDvFxJWaeCYwozsIG9UUjcTxUd3VkNE', 0, 0),
(311, '51afcbc91440895c', 'mSQMlgJop6WFSXe', '2025-04-16 16:28:07', 'ck2wbqDYQDWelUfTgAlwjn:APA91bE6sSRymPxpTQthXyGxvE8uLf7jYsz-qGWc2B180-QmKHd5mDGIA-aq9EorKA_99JNS84zeK5ih-14mHZwG2quc_2vyLZJl8YiRrFtVcfK-aUxIKDg', 1, 0),
(312, '1fa4792b9f16c2e9', 'fNkMAd4bL8s71FmR', '2025-04-17 12:14:51', 'caGvnXlASHK10DW7fumami:APA91bE31FkmZmsB9c3PXywjuO7M_Uk4Xh4ewSXA9RnjdgmjuB5ZO04ecGy_WIihhf8t1nYPCxVgINwHBO0IcVdvtKBuISTm1mZQ7sQnzlhrK7LB5Gcpt5Q', 0, 0),
(313, '1fa4792b9f16c2e9', 'q6rnlVkK9rdN1B2', '2025-04-17 15:25:03', 'eKOpGaUmQTi_RbAx7el0Ng:APA91bE3dgf0ZIxOZgZcKpJ-8JDsKQ3Pz6BeN1InwGquNIQHjJKwh4EWzdrBoHiwaNvDtHLakV1FtCt2En3i9oltga62uOYMvsCrJLMsgo0R7aK8fellq2I', 0, 0),
(314, 'e2f16226b1717f44', 'fAatBeYH1HCP1mF', '2025-04-17 19:29:43', 'dE5Iu1WARaiW4miGwTlDFS:APA91bFTWa1c3eSeGeYRUUDq78G72pP_M95KL6r08jLG1HZALbEIne92kDEe8PbFRXMnmF2FoCWPGGSbHdeQ9gk7NXUjQjqPhDuJUVOCtMpy6Gh6K5VEw6Q', 1, 0),
(315, '96b7ada2bded2c72', '5dKo521ZZxg89NH', '2025-04-18 11:23:57', 'eNl9vj43R6WP_ZIbiw2jtP:APA91bEoH1PlLHTL_aTzac6JeXkvS03VPj5meG2e4d4ZWYzWDRu3_rR0Jvq2Q8qGWUr7qke7ph8QC88VaSiJ2Z9NlUe7l4r9_Dw2mLmZnh5L7dXl6arBvVc', 0, 0),
(316, '98074b38dbd3c25c', 'NuBNLCxBEPJNg4y9', '2025-04-18 12:00:12', 'cdufLQ1cQFK_4BnUKh2Sjv:APA91bEUuz04gUpm3wWr1sU-w-vk-PGomY120z2VHF5E-EZWQek1ww1rGGTEY334HpbqqDTlCFf9OVQzrmDBimNdCv3H9W7kR3yoDkJrwAmsIUOOv2ku2bw', 1, 0),
(317, '5b43843dcadf5992', 'pB1WrOsQeRrf5Dk', '2025-04-18 12:30:40', 'd1gEaCRmSFyCZDH2kq370t:APA91bF94q0zqUOh8sRSBbUcdGMPEv81K-_bm3x0DjJHm32yFcsla7tQdTzoKMRHolfa2D_XJtidQz-IZvGCpbdJiy1PtIgxXWXYpL8gulox7WN2OCkC4y4', 1, 0),
(318, '1fa4792b9f16c2e9', 'MHDp2aRHTTH0l6qA', '2025-04-18 12:31:30', 'fMhP-gzsQRegmPL10Dm-qJ:APA91bHqHg9ZiDd1TZDx4LINjWj9cOydQ4FtEbkgjjSi0FyndahpzUcGmRRYPGTvatwT1HG9e9hBdFLQygiOsHsFqQRfQYytuYRxkUl0C7rgr99xFh9q6QY', 0, 0),
(319, 'e2851a2da07e645e', 'wNaHvUV5VkOG22N', '2025-04-18 17:55:25', 'ecUOlFFVThmqOlFDtDocSZ:APA91bGBrTHo0tMciJzGQRneICjhvfDoQySBArafyrmZ6RQ2lSE2QvfuQnd5ZaTsKSHvwpz2fF4cmw5lxrFwL2uS6oT8pFJ4-peLTmzSIa4QZswzpRd-5e4', 0, 0),
(320, '96b7ada2bded2c72', 'j26RlmUtbDhJyKYD', '2025-04-18 18:27:50', 'c15mmrylTsuFdhIwYN0cOu:APA91bHyD9Ed5oE-16898cVijexx9ByC6M7gC9L8mMjwTUCjDe2DUo0UNcYOywOI9avZl4feLfgcQIbGhVQOjbNKsYH5FN1vqrQyqjuNm4wwZZyhNgRK45Y', 0, 0),
(321, '38c69b0f6d0c4084', 'pwr0kYTBY6T5S6V', '2025-04-18 19:52:24', 'dwDQTMLLSYaeP4qK_Kk2g3:APA91bH7kwl5AMistj6Dluj3E4D_HZC7lalu1VgWHgF1Dnsu_JsLF92e65rOdWTLwfoVmz3NMfVMwHcPpmd04DUjJpWtz6zQallbIkipJwhvdaVCIj9Giug', 0, 0),
(322, '663b62c638d85485', '5HyEnwsE1CoY5Pof', '2025-04-18 23:32:31', 'dbnfZqwAROqRPTZGml4ExA:APA91bHRzMaOTOCcBj0h1ICD_jQSHu_E652uAy3Ewr7pQxr4pYGSL3oDIJRtqY6mU6mHPY1b923aKtRmB6GkxmyeQ1YNZ2oH6szxJmy0Evfa7_s6JmaOEFM', 1, 0),
(323, 'd5abc35bf85c100e', 'YJkTnV45DH62z7q', '2025-04-21 11:33:26', 'dUrP_83dQICIstWq97hL0Z:APA91bE6Gq4MQu6pmmcw8rsYLZZwWG7pPZ94GwWd0x86F0t3rSvXt6roo_CBqH9BT5s8RygvHhiwBrgeAZvdzE14RCvT8fbdmHaiAGCBn-YJ76AgV9frw5w', 1, 0),
(324, '96b7ada2bded2c72', 'B2oOQbQrSjXUdI4', '2025-04-21 19:04:59', 'cZnBjf0TTR-xgRSYplFppm:APA91bHxBsYOXIcO06G_hFNBJ7fqSG4wKM0AesiZYs8hiERZXlS0ZKeQmQO2UoXNgzAJcKqjNjQg8MNUL_Djf0H5yC3gR1lFeJb-cXXYdPXpKCcQj7UCcpg', 0, 0),
(325, '96b7ada2bded2c72', 'HmtPjnFpjrQFrR', '2025-04-21 19:17:28', 'fZ1qGrfgRgqU2SLw0tAbim:APA91bGMEht3u-ltBJEg4hdmfW1Mq-Gg1qgXhaRnhOCi2X42OSQn3YrQ0pn37-aC9O3avCOhv6q174qzERP-iu6PzdeToMMpg81TNoZukeCu5PiRdK4x0mI', 0, 0),
(326, '96b7ada2bded2c72', '6pj9h1228R5aaW64', '2025-04-21 19:58:45', 'cGX2h2MVQwOuPJovByaf4X:APA91bER-R7c7IjzZ99TKNquAs9wXLsOvytMzxhYM-moVrYEAUDCpqGIHoDTGzehUXHkchWg4gf7g0e6yD2GCo_EJMBhAL5Bckj4v4C17JCJ8aO5yFilnBk', 0, 0),
(327, 'C258F2A4-5F93-459B-9253-40C3FC558A98', 'BPzx8INvQNcbXmtW', '2025-04-23 11:51:56', 'eRBwJTMIs0fpsLBv_9onoD:APA91bH9gbsRlc7jjIJC3CmC7jTgDWCTS1QSKbQ9T2qqsCWVRfT2VFExJMfNNuL_nsiJQEWL8p89SAJKiJuKq89pHIjWmo60QtFJ_XUZiuGUvGHEhy6ykVk', 1, 0),
(328, '96b7ada2bded2c72', 'DUnrqDy8a7R3885n', '2025-04-23 15:14:58', 'f_Th-RuVQoeVqX2OQBTSy5:APA91bEZuZKW5S7drozmNAgmxepeJbyEs-iz0ZO9EwpqW5kXgS9hkpMpHRaWHuZJxp3asZ5-RF7c-vyTO5p5qqfKtiFEQ7vgFOjvVX4kU_5f1K8GG4mPXUo', 0, 0),
(329, '96b7ada2bded2c72', 'NpJIuEh4IQOKJnbl', '2025-04-23 16:24:56', 'cK7oesDBSzGs0bbQQDqBIg:APA91bHO6ag65heW4bydjbyPD8fn1F9mGI2fKmheU4awdAl9d8T5BCJDkiGfciWFUctEs2-grFHhaHpPzH7onAjuZVgilTJF5Ogwjs36XOwTrE7VI-_xV5w', 0, 0),
(330, 'A66244E9-8693-4C8C-9A25-B6419B558D6F', 'FImyU559NJltzvcW', '2025-04-23 19:25:57', 'dJP8ru6WHUg7oAoHl6XuMi:APA91bHqe3xJ6co6WW5_w0GcxKfOvtO_OHT4_GkcbdhOYeosDnycNceJckPKEQvtSX1H3KMZXaJPjofNuezY3XV01dOS-TolfaGJ93jd1k6oOje5XDJuoDc', 1, 0),
(331, 'e2851a2da07e645e', 'yRWBZlrjiZNpGMft', '2025-04-28 15:46:22', 'e_VZ8GibT36w2D4nalJeDX:APA91bEeg4kXMcs8tpK-FSvg_ksEeX5mW6gw8V9FtZQOnMWUHM04HuCW_bVM8MHNiPbNxT7B-w3o73rhLte4Yq3bFXNcrM5K0jaHb4pw4T7uezMI2meMG48', 0, 0),
(332, 'e2851a2da07e645e', 'Bjf2yRZvtHIn7F5P', '2025-04-28 15:46:22', 'e_VZ8GibT36w2D4nalJeDX:APA91bEeg4kXMcs8tpK-FSvg_ksEeX5mW6gw8V9FtZQOnMWUHM04HuCW_bVM8MHNiPbNxT7B-w3o73rhLte4Yq3bFXNcrM5K0jaHb4pw4T7uezMI2meMG48', 0, 0),
(333, 'e2851a2da07e645e', 'Bjf2yRZvtHIn7F5P', '2025-04-28 15:47:12', 'e_VZ8GibT36w2D4nalJeDX:APA91bEeg4kXMcs8tpK-FSvg_ksEeX5mW6gw8V9FtZQOnMWUHM04HuCW_bVM8MHNiPbNxT7B-w3o73rhLte4Yq3bFXNcrM5K0jaHb4pw4T7uezMI2meMG48', 0, 0),
(335, 'BBCEB70D-535D-4253-980C-A9B7EF55BA8D', 'OEKZq1wr8cCwZ7v', '2025-04-28 16:47:06', 'dQgIGzBiakSyngPz3Y6YGA:APA91bH0lrCc2nMBIWftaG1acH_dmypfWza0ZQTNsImdl4nf0hzKziSvXkfqflnJRA7A9nEyT-_MkxIaECf1N3cvYrRevkYI3R3s5VRzW6tJBtUgzxtZS4o', 1, 0),
(336, '96b7ada2bded2c72', 'DRbP1pGxgkjxJHn', '2025-04-29 11:13:15', 'fpTtz73mRz6N1O5g2nc1cK:APA91bGCxsr7UsFqywMMy5D-XRSFKYA-DbZR63ipuplbUzcdoe5Cf8qBMkRkGBUvaXzj2urxIiCeIABRDj_GQskvmKWkIy6_xRLw9wBrBGfm_k8XYktLbQg', 0, 0),
(337, '96b7ada2bded2c72', '9K3L9rcrpntCj44', '2025-04-29 11:13:15', 'fpTtz73mRz6N1O5g2nc1cK:APA91bGCxsr7UsFqywMMy5D-XRSFKYA-DbZR63ipuplbUzcdoe5Cf8qBMkRkGBUvaXzj2urxIiCeIABRDj_GQskvmKWkIy6_xRLw9wBrBGfm_k8XYktLbQg', 0, 0),
(340, '96b7ada2bded2c72', 'JCyj81EdLPLZgaA', '2025-04-29 11:53:02', 'fxLJWUUtR-6zcUmok_xPgS:APA91bG9yiW2CuyVxHyEmaDhnxIZQ-B1hT9zPz3B4rGP7RracesckllQrZ4EjyRKH0oq8bGgN1OLOzTrRP8OgFXSSJj165D73A5XoCNf6rjDvoJjFHXiTlc', 0, 0),
(341, '96b7ada2bded2c72', 'KSvUhWGgVL6vtqvP', '2025-04-29 11:53:02', 'fxLJWUUtR-6zcUmok_xPgS:APA91bG9yiW2CuyVxHyEmaDhnxIZQ-B1hT9zPz3B4rGP7RracesckllQrZ4EjyRKH0oq8bGgN1OLOzTrRP8OgFXSSJj165D73A5XoCNf6rjDvoJjFHXiTlc', 0, 0),
(342, 'e2851a2da07e645e', 'sPHIQCjitbgGN8R6', '2025-04-29 14:15:03', 'cq-doCFDRgSiub0f1PIu4f:APA91bG72G6x7oDXemG1LdfwxaUEBknnHH1xTHUtImSaKxmZNjbnFebGT4AUOtsXWG624C8cAHcTbQj-G33zTk8HPZbhNlwf9sh1A0F-Ta19LyqHvta5538', 0, 0),
(343, 'e2851a2da07e645e', 'Epto3QX2WDP32LP', '2025-04-29 14:15:03', 'cq-doCFDRgSiub0f1PIu4f:APA91bG72G6x7oDXemG1LdfwxaUEBknnHH1xTHUtImSaKxmZNjbnFebGT4AUOtsXWG624C8cAHcTbQj-G33zTk8HPZbhNlwf9sh1A0F-Ta19LyqHvta5538', 0, 0),
(344, 'e2851a2da07e645e', 'sPHIQCjitbgGN8R6', '2025-04-29 14:25:05', 'cq-doCFDRgSiub0f1PIu4f:APA91bG72G6x7oDXemG1LdfwxaUEBknnHH1xTHUtImSaKxmZNjbnFebGT4AUOtsXWG624C8cAHcTbQj-G33zTk8HPZbhNlwf9sh1A0F-Ta19LyqHvta5538', 0, 0),
(345, 'e2851a2da07e645e', 'aWlYsTNArjdp2HFJ', '2025-04-29 14:32:28', 'f7H_7-mSSeiwWjNSeZiOK6:APA91bGYKMBKb-MEAs7OKWGCICBkQ7PmUyuHpcLANMuQG2k2jrQI9jMsX5XBdcCvupDu66Tpc4n9gLbpXJSB23VJERfW9N3CYThLI4Y2EJ5uooneokMJ_LM', 0, 0),
(346, 'e2851a2da07e645e', '3FFuggi7QcTWaY', '2025-04-29 14:32:29', 'f7H_7-mSSeiwWjNSeZiOK6:APA91bGYKMBKb-MEAs7OKWGCICBkQ7PmUyuHpcLANMuQG2k2jrQI9jMsX5XBdcCvupDu66Tpc4n9gLbpXJSB23VJERfW9N3CYThLI4Y2EJ5uooneokMJ_LM', 0, 0),
(347, 'e2851a2da07e645e', '2FJ6GJosMdVs3Qs', '2025-04-29 14:34:30', 'eB6e9IzUTle2-2D-WOGPTn:APA91bEQgAMaFXFrD4jwhkSpJY84wtRVH949biChL2JY-hV9R4rGqLS_UAp9LL7u9USBwYjRzM0vh9JEN1k9MetzI2RICeQFUhdVCbrC8GGKSTPzfQP3zz4', 0, 0),
(348, 'e2851a2da07e645e', 'Xf58pMlssJgOgNx', '2025-04-29 14:34:30', 'eB6e9IzUTle2-2D-WOGPTn:APA91bEQgAMaFXFrD4jwhkSpJY84wtRVH949biChL2JY-hV9R4rGqLS_UAp9LL7u9USBwYjRzM0vh9JEN1k9MetzI2RICeQFUhdVCbrC8GGKSTPzfQP3zz4', 0, 0),
(349, 'e2851a2da07e645e', 'nMqDVTXbwaaNOI6w', '2025-04-30 11:29:59', 'chmzgmjGRkWiW2Tlm9DLfu:APA91bHEgIi1zsfQe7MoJId3eJxgiQWO4Yq0jk5e4FlTzFkJSgtDG_BVvpf8QWOS8FJwtlKP64173tufSfVhvAQwefxpo21p2AIQzzUunb0hDR8ay4Ffd7E', 0, 0),
(350, 'e2851a2da07e645e', 'SYNA2fNu6EuYjHq', '2025-04-30 11:30:00', 'chmzgmjGRkWiW2Tlm9DLfu:APA91bHEgIi1zsfQe7MoJId3eJxgiQWO4Yq0jk5e4FlTzFkJSgtDG_BVvpf8QWOS8FJwtlKP64173tufSfVhvAQwefxpo21p2AIQzzUunb0hDR8ay4Ffd7E', 0, 0),
(351, '96b7ada2bded2c72', 've7WrFK8IVHwq58u', '2025-04-30 12:22:14', 'fFxR1Zn4T661byf2b32zzm:APA91bFAfWxL33dMe0II1V5CsDiQA3-f62za6GFokyDYN2zLXw0Sumty4_6Gw2Cjwy8LycvnvlIXrng3BnuFjsFYIBMmyekETFPWjVGwi3vBw-q_F8r8q18', 0, 0),
(352, '96b7ada2bded2c72', '0eFM51TLEVCLLLp', '2025-04-30 12:22:14', 'fFxR1Zn4T661byf2b32zzm:APA91bFAfWxL33dMe0II1V5CsDiQA3-f62za6GFokyDYN2zLXw0Sumty4_6Gw2Cjwy8LycvnvlIXrng3BnuFjsFYIBMmyekETFPWjVGwi3vBw-q_F8r8q18', 0, 0),
(353, 'e2851a2da07e645e', 'mp5uI2TTnSm10Sqy', '2025-05-02 17:56:57', 'dxphEXhTQLOiiAD2P768za:APA91bGyshCmIG7iqexcJYFVmF3CpAm0jZWndzZVq-T6mwSpfAv5uLensbc6nbMMNJwv1nEflB4khE6kWT0A-s7SXd5ZP11cjSHV5Unc8WO6fn65bVwnVTc', 0, 0),
(354, '96b7ada2bded2c72', 'mGWPwBYqcLfUx8SK', '2025-05-03 00:18:29', 'c1TUZv_4Tx2w0X2BqxZ0nX:APA91bEnHCwAB3nOX_GlNrltAo_8RxZvcFr9QCmLN1jG3NLpz_dJXwlq93CK3h-bnlYmWL3_h_AkT_DxWw0LilRNPvJyMkbuJuA1JC6joTdyrR3KIbFEm18', 0, 0),
(355, 'e2851a2da07e645e', 'r1wVS6JLuUljxYs', '2025-05-06 15:29:08', 'e77cCSLjThyFmF_fRtIDwH:APA91bHvbbnnGT-mzGHab5hU9Tq-rP9fhpUTS7G3esaj63ZvkO2o_9zlXiI8VIeQCIQ3wnK0qNzeDen42IOaMcal2xpdKHL0CxJPaVqsNLBuEr5Gulr4J0U', 0, 0),
(356, 'e2851a2da07e645e', 'XtwDK2sNF1vv0RyK', '2025-05-06 16:33:55', 'dtuhAwsfRfSkJRb_GRn0OJ:APA91bGl9TyDt-nRaZzVR8K2e6UOF4yVtDX7sZsSbexsAqoAIwOI3XP_ZLB9x9cUlEH8MMdxzhigk8gNRM2wSQCw0IerOhClmQbFoexYTBaCbIo896jd2-8', 0, 0),
(357, '9c62b5de112453f0', 'TkX6A3K7XsgKmksO', '2025-05-06 17:01:34', 'dMXw5m_cTa6oefREtJf_xC:APA91bFSQz_5mldu9Kve5W_aFH10Z7gvjeGx01HfjCUhDnpFA-b_MJ1XL8mqEVrJOT-l1gn8yNhYaODFfnxYHF7jGbGm9oEa0wi1qXfQpukyJD8ZE1BGhCw', 0, 0),
(358, 'e2851a2da07e645e', '2PipR03NDxoIPOEo', '2025-05-06 18:14:16', 'ed-xERcgSKiN8_biXi1vam:APA91bH74GVz1siJXZm4VNF3SbDMZH-3YJbkhw48PCPTsZ3czcq0gW9d3b32G28UOknECOuoa4O4a7QAbFGPkD4MVrhLzhV_TIooNAB3txYbU6b2_Jjo0VI', 0, 0),
(359, 'e2851a2da07e645e', 'ebONgfFcpdLNmFuF', '2025-05-07 14:29:48', 'dEQimmBCRJKftCBHkfHMXW:APA91bHitYgkdOvC8umbs3rCK37R6mP6pMRd-4w1iLlDSSpfjXKaxa0TbTwH0Wy-Rb1XDHfXS4hxbcvzObrrh_pxOxM8gPa2WyOyyNkHuo-Q-3I7LQt82g4', 0, 0),
(360, 'e2851a2da07e645e', 'xEKdsSwoIPfSMHT', '2025-05-07 14:37:49', 'erWQR9VPQP-sMA0rgVGjgQ:APA91bE4QqnLK6NSa94k8cenqsHnNxYOKaxqkA9JjR7ai6dFkgM1PSP3sGrEgQse-L1aKseXMRjsO-tALIpRXDoUxvwZkgY_gAwQJnGLI__uHaCOiPA_25k', 0, 0),
(361, 'e2851a2da07e645e', 'ooRIodivlT4421mY', '2025-05-07 15:44:01', 'eTryNGHwQNidb1b8WfB89d:APA91bHFB2-ccU25vSEWPhoB4A1U70YsrhpeV0S3bJD5ZiGxYRUCU2yWFVJso8juIP2NepWVuS8Fk6pXpvSn3HJWEe6dWmi76qtrKw7P0_yHi9Gi8OXbwaA', 0, 0),
(362, '9c62b5de112453f0', 'SDFMPDbz2AwItEQC', '2025-05-07 17:44:22', 'eIXA9E53ToG5LezE8Cw2WD:APA91bGUOIWR2PFiUCXkxNP0ydEpWHIge9HFNic9GY9XNsP0GqroiAJl8jPay0oSGbeWnjHNLMdiDuJlDUKCZVRtNFvSE55kSnY9RnI72jnFGp1683SsIWA', 0, 0),
(363, 'e2851a2da07e645e', 'YSjWMV2Jmqa58oW', '2025-05-07 17:48:31', 'fpdNzVrTRcu9jHGYfckBiu:APA91bHXJYdpfiGGulC-biIephEPJYEOgrccRYm3pZI0S87rQb6mPs65K1L876-7jLdEEIa3Gi0d0RA_6SzPB-D3dbBBELDa8TMYbKwjWRlhQ-F_V8MM69E', 0, 0),
(364, 'e2851a2da07e645e', 'gTCLo30vzfKD5GX', '2025-05-07 20:08:34', 'fMOLiAa-RoaQx8r1DNM5HI:APA91bEzVaco91mAJBkJDuNvx4qmAK0wJEh5_Yv7htGzPS1Vfxyo5WmMuz07cpgcpTCk9K7xUmkL92Y-7mKJvfsPSdnkYdTtsTLVfK5VrGRnAIC7o5_Bgos', 0, 0),
(365, '1fa4792b9f16c2e9', 'seE2H7UBFQUgMKQ', '2025-05-07 20:23:04', 'dklpuFmGTdqtSbyNDw6TsN:APA91bHZMK3UD5mTdMsoCmeAkmwQeyaD0-j3KPkm_HPU_L1al34qe2m33cnL9rFGNtZyotyk3m5xwp5lhMNB602U2wCThLJkg4ayXgXItPNNjY9RGCv8BJg', 0, 0),
(366, 'e2851a2da07e645e', 'VpKInIUd8te4pwS', '2025-05-08 20:02:15', 'curPVv_5TSyyCtZnrR6kdi:APA91bF-SGSEyuiOhFBNPHsL_jJ0bTfko1_s-3RdY7-DPkW8FHzVnmdQdb_SH2cduGv5ayVBcwyW39CyRCqDZVkXlWFmKrDIqee-SC2qz-Fj6QwjRFRKp1Y', 0, 0),
(368, '712e5206752b591f', '5DsQop2PQuzc3kv', '2025-05-13 16:05:23', 'dpZriod5RIehupiECPXR7B:APA91bEJ6q2ap7XTv_uiwPbOQQy7q1NgXGV5U6E1VQJ3CKmaWt39zBI1Y2LZh3keCV3xyeAqunybmODDEgxkdfKUXnSo513B2XDyXTsF6dvCTrOl7mFrbIA', 0, 0),
(369, '6eba948042dec281', '3edqWSxH2SzlENCl', '2025-05-14 12:14:27', 'c3LPWUUFRs2ACYuXAecYQ1:APA91bHpNPt3pCZE4YZP-MpM3KUKDIBwG2vRowzLqEWutNtfB5kP8078UgmiHhgO1Yl9Mp6rzahzxmx_seDBIieAS9_J2pgYAA7xyvrQcaboZH6tfl1zGNs', 1, 0),
(370, '38c69b0f6d0c4084', 'LkBmUENuQxjSPm6L', '2025-05-14 14:31:43', 'evxSEj2gTq69tqUAiPb_BJ:APA91bGGFTV-LACfeeK4medqBh1VUanX06BGefRfu6FNIvve-wyix54owf0p8lBfvcfAE58Bkeqonz7Z90ki0VxLPKPF8rKze0sligJtkU4s7YNB5VPsgiQ', 0, 0),
(371, '38c69b0f6d0c4084', '30SKW6yioy1bC2po', '2025-05-14 14:57:06', 'eEMtM8LRTKyP5vB0XMNIxh:APA91bFrZxKn4xsCgZS4ziwpALUr69KfLwsOtmpr3R6mHyFs1NFv749MVZqq0h_wSaaMODR0A1ivOeOgS015RyV4aiYrXUGFtj-Q_bhccKndfhF57gd5rTQ', 0, 0),
(372, 'e2851a2da07e645e', '2k7eBhEZ0zzBI0', '2025-05-15 14:49:56', 'dFUL-ua_SIOI9CUhz9X8Kp:APA91bGSw0bbLFdmNj5z2tIFejU1_iDny2uSF2SJxC2Cfy9kPQQcGElomijzne7XETzx24M4Y_fwNUe14fczkRoKorhvNj4rHo2PqmjqfFKmfdciEzPcDWI', 0, 0),
(373, 'e2851a2da07e645e', 'ORHjucqUBRwB2WMZ', '2025-05-15 17:02:07', 'eKPxYOwiRuG6WFJhxxjJKp:APA91bHhJ2YyXy5jUG0O329COb8y04T7sRWNwiPlf5uAibehuESwZ_Vf7BIT_wF39TJ1SaatsO3Zpbs1ulHur2XQZaILVVAzD61HBpFx11iln7wR4nCFsJc', 0, 0),
(374, 'e2851a2da07e645e', 'aXIJ5cma7bVWUzM', '2025-05-15 17:15:45', 'cJOD_jyiSKaP_pyO6Yd4CI:APA91bHYah29fEXAX8lh35w0wStmki3qsb3OVlH0i6EJXIq6rk1xAjKlFoJ3eSKs5bsk2LdLtmTtPXL0kkq1BUHQRNMnDm22gSTEOi71ElG5jApf0tVy29Y', 0, 0),
(375, 'e2851a2da07e645e', 'JdO57WGMk6eDT8CN', '2025-05-15 17:57:05', 'cLgY4Th2QAqGgrKU-X_Gwv:APA91bFnFHvBZy2W0DTushO3BlGef5v7IDW5InXnDGjYH7u1RMzmyR7zM-jsBeKmNWkdDKDFHbXDEwMaBdZb4jE5BZt2zv-yCMqxbjYT08bSXQeWAYp5TcA', 0, 0),
(376, 'd081bbcddf326bc8', 'eJP7qmAdbjO21iMC', '2025-05-16 11:22:01', 'dZ0mCWigQDOKWF8icx1s4X:APA91bGoj5aWNKWe266v-LIKBNU70U-HiiOcBNTfN24kTFzsFyuLWvFLnH2GzZjuXxFXfTvWfrQtg7Xg0fzPfDJJ2zkBhBCoJX2vrG5ek3zwCzAe6UyKjoM', 1, 0),
(377, 'e2851a2da07e645e', 'uCQfCMXzCwO5G8VV', '2025-05-16 11:29:57', 'eTOwTTIdS5OnbeQPtQcOep:APA91bE_qTMvsA-tB1zU6qzlAkU8DDPfj_ungcb3vs3x12cJdOZOeTfK0U2QdnJbscFk4Y5leqEn6tk550TGEkZ89KB1aTm61fCn4WOZ6EkN9mQnifUMfuI', 0, 0),
(378, 'e2851a2da07e645e', 'YEYGhT9juSq6mUh', '2025-05-16 12:11:42', 'dxxhRiSwTPaA9w7KGWhfJJ:APA91bG7xLPf_yGCU32FMbJ_ExEVCDSWPa8Jtn1daJcnVJwWtzl68OX1M_1NphJe9da7Y3OlNtBWvZmFctkXaxqsYHTMxRklqOzvZ5p03-y95slcReF72Fk', 0, 0),
(379, '30d20ed6087f9df3', 'zT3exZihYY7Ya10', '2025-05-16 17:31:53', 'c0WYZ2P-RbSnvLaCAc__et:APA91bEJ8E-jttaOngRVfitbURJV2W05sknMZs7oKedgQqYAaafdIsPc5batejiJfJz5AqeYwGmGB_JnXZx3kfZ-Rqcz8953HB5kMCZ4s7NYUiW_j7HsoFI', 1, 0),
(380, '98beca01dc11def4', 'Io0V4BaL2lrsMZj', '2025-05-16 19:38:33', 'ecQbl_fLQRKGGFnOzXAeJy:APA91bHdZDqCeLqD7k0swZgoIRI26Dq8AYJkdcitc0RZXVv7R_Mllhkov5VpMJ_9BJ-DOJ2ryWeORAM8ZWSVohq8bK8OCe0LYocHpvmRGliKnzOVEGa5PL0', 0, 0),
(381, '05b8da428cc9b93e', '0VjW50aXO30cLCHV', '2025-05-16 19:48:09', 'cJGMRfdfTUiUfp0nsKPHhV:APA91bEY_sfPKhtQAZ7pnpR-wtAYkiwn3BjzDZ_1T-kPvmV489G-Ai-5xnM11vPY98TpHdr3xevpD6ClLmA0qSLWynkDXgCullwPIx1C6jrwT4MLKZmIg_0', 1, 0),
(382, '98beca01dc11def4', 'ngOeQFaeZVUw5wmt', '2025-05-17 13:05:53', 'c-OtxTi8TSulkvePL6oDpP:APA91bFN1QsXd3GWkDqiK4p2JDiLuNtOravYjPar9Wt18_go2IvPUziuf0unPpR0W7UWR5pAZBbJ0Jjlo2djZIiSI4ZiX5WiMdNPUbwpksyVZj0LQacs9yM', 1, 0),
(383, '712e5206752b591f', 'rwLXgxyJmejzNgcS', '2025-05-17 14:16:07', 'dG27ijObQrGABYRyG3SfNU:APA91bFpIzM_iLDxGxhVsWosn2-YMf4WKtBi8a51Y-PUWpfqxbV_zuyHrStsGc_r8wHCXsqpAFjqe7-aIEvhBC3U9GXA8FKOdTdQ-DoUfQ-lGjhwJpBD_54', 1, 0),
(384, 'cb006688e7c0efec', 'RSO0J8C9m3BfEk3Q', '2025-05-19 12:07:56', 'esxeGMnKRXOaGtghYNTvYA:APA91bHbYe1psylL2eLt-dbf4ecE0syUimyiC6mHbb4Bbe00OTZSgue1rx-3cX_RRbb8Mgerw_WA6jiM9t4GzihC1zg70pSCjHsLECvd34Uf5sIegxnt6_c', 1, 0),
(385, '9c62b5de112453f0', 'VFjDIr8lAbTqutY', '2025-05-19 13:17:03', 'cJi2zjbfRWSeEOnJYG8Pft:APA91bEUSEeu6_e8FLKVuwdhXGqTHGQHPdeoIkaFCZU3TokNjXwrfqUDykINxomNrXBFQvtq2ZS2enFw76wtHD3BQR3CckkJCY4-Nt_dIW_LJv46npNbpoo', 0, 0),
(386, '9c62b5de112453f0', 'pRFCKhRBc3Nqc8km', '2025-05-19 14:44:07', 'fk_rq4rST_KSVF299EYPHk:APA91bF0tTJ4fal8SPWAjgjT7HVNqZxJdNcli1sRP6ZH2iLXbvoVdSsyrYySs5KvHO-i-HQeXDQTrDbryBB2lvFSYmjBQ5IFQUFH1jH_dnNU2jMnlS4Lpyc', 0, 0),
(387, 'e2851a2da07e645e', 'ZzO6HJkkOiWNqqt', '2025-05-19 15:39:21', 'c093S3VwTOuJ7p7ksVcKbP:APA91bHlj-aCgP5JsKrM6rLcfOciV77Tk-hHLtppXPKm9Ts1qn4mrudeDA6N5U2LJ5abDXpm6TVpyH1VdU-AoZY0EWSY0toD8lTluTeBKZJjk_B5ECdN_1o', 0, 0),
(388, 'e2851a2da07e645e', 'mPybxMAT4Z2g3XZj', '2025-05-21 12:34:29', 'd-glqo0NRM-aFl8VbE5hgi:APA91bHnMX_TujNKLc2qOWCmBMibqlw-oMK2H-pRtP0hWIR2YdC0i1G-Qnp51nbTTDTrwDVR2NA5OaWYik1_yxFnCBAVY3W-1s0DeB2k_skaiZyH4zL-gHA', 0, 0),
(389, '2807ab8b3f352a50', 'RHWg8jWMFSlWsXk', '2025-05-30 15:45:56', 'fexZXN6TRA2ysG49-XHRf-:APA91bEy6RWRMDqJTFAuWsivntXg84glxJd99ciJ-H5jtnzY1ZVrTovM2IoafuL6bQ9V4HAXqdrid35BwYyk_t8_3K3THHAPjeK1ORq3iVHMgoF98C26BaE', 1, 0),
(390, '1fa4792b9f16c2e9', 'AfElFqikWgQ03SX', '2025-06-05 18:49:56', 'fEe32O4oRgKCLAnLqsuZY9:APA91bHIbJ5wTAqOnKkbzHod0mPEcKoefajS9xubJfYHb17lW-CRGM56WBChgKF0Sa1LHIf_p23ly3_eQ0Z_P-Q8S_giZ_WHKiMLKqFXqDDNbbTJC6TX_Io', 0, 0),
(391, '1fa4792b9f16c2e9', 'jviDVFqY5Bujsx', '2025-06-05 19:03:51', 'e0c2AJPdQyqujJH0m0ZQNE:APA91bFqGZF2xNX8Y7ErTnvvDCL279ydVx8_GUtMRIGuC2sZhIC7_t-nruTNuR6lPt958ZDV-JNle6afDYpi43Jy8rrfOQt5uFgej18RpDvTvke1Hh9qUhE', 1, 0),
(392, '9c62b5de112453f0', 'wz94dEz9FE58h2iF', '2025-06-10 17:28:51', 'fFxXOQjwSKao1h0_2TSpo1:APA91bFw-oeQowpAzwV5ibdvBPQNqUrVUYRbsEwfbO9ppLKaquGfyB2VvGJyMIYchQ6VMkGM5ZP_4d7d0oNEmV3iD3TLJBaZBc1pg5nVFzmxkrBNZqAkUM4', 0, 0),
(393, '9c62b5de112453f0', 'awYleccUYzJsYt', '2025-06-10 17:44:48', 'e8SxWZTOQLadK4xcf55Eq4:APA91bFRhQFPYiZ6LXHnQqIrMAus7EvFLetG0ceH2adBbG4wNRuslNMKBqSDJjTQVv8pfCaPYHT-hHZvYNGbfcIor_CS9u7r3-nVLsfZi9o8uylM8IcYW1A', 0, 0),
(394, '9c62b5de112453f0', 'v5qBQW366y2QODW1', '2025-06-10 17:46:13', 'dGzvbDSvRsuBYLU2GnNKE3:APA91bHaNvM9Z4nsCCn7rWJ7QR_oBj7HbV-ekDdUEF_bEjCpXOZ-ksgfWR9pd85vxTEsMrGINKBkwdy1D_PcuLcdmEM7-MVjvAU4y8N9UgXuA5YLl4A0wMU', 0, 0),
(395, 'e2851a2da07e645e', 'QFfIBei4yXb4MWij', '2025-06-12 13:34:41', 'c3tvwE0UTA2ftbz8QHM8sJ:APA91bF_Dw37fi82n2M54N5-_4UQHxghxpXklVFvNEjFP2bMRafRVXQCqitUp0lYNbu92V5ug_QAHemTOmskwyYdS0g98SDCz2VaM8VTQn6w99GEMZbF6_o', 0, 0),
(396, '710F5CEC-73B7-4964-8E62-384272C0D920', 'HprlMRdOydt4d4j', '2025-06-12 15:33:11', 'fNfV9K4Ba04kmhNy3WCH6I:APA91bFXX_Bjr3rbVuZYSbdlgjqAlDONrVnPN7ABsTGEdB3p4Z9sk5LG3ls92F5wBLy-E-4biViRwlvEihiK8rKsznZzzfVIJ9KyuaniPFwnC-7K0rkC1iE', 1, 0),
(397, '9c62b5de112453f0', 'lo3QfYTDnJdXiwzo', '2025-06-13 15:47:47', 'cS3hn_69RlKF_BbjOG8htz:APA91bHMmf08HxTaKsxcHnfxl5Q7UIQ6DOu06f5mgHpjdDz_v6qTHmxLH1w6vmx-4ujGTWxysuBFqNXi_6xvKAp9QaDwS22Y1RfnCS86wsI1WznG9sH9t3s', 0, 0),
(398, '9c62b5de112453f0', 'ZjcxFCQChKmdwsl', '2025-06-13 15:49:20', 'e5KxHYrJS7-Mjjrrxseatt:APA91bFMmvzNrEO9Q6QGFDShnF7oxbMaOp4wXYeMW00lvGcWZ7p0R6OBNyYRGJP5HL3UGOtmia3MyffhYzVVLX2-1qtpesT0xtNM4fCrbhdIL34vqZF1DDs', 0, 0),
(399, '9c62b5de112453f0', 'OPB3zbij2xvqk5Uw', '2025-06-13 15:52:55', 'cYAn-4eKQvOcpMziBOfv5_:APA91bEPUAF5dvYGhe9QmqtlX24Jna9lJAIKRo3V4LN8abBfLOPj9fw1F8tJo4TQRVdYvIYCjqKCOmdZ3nMnHkU2Ln8xmKUUe4uXIE2ip_lauMph4ANZT00', 1, 0),
(400, 'e2851a2da07e645e', 'rMp0CWZpSWVTTTvf', '2025-06-13 16:01:22', 'dhAHdgr0QDyeTEBm-1bMH5:APA91bFv4WEJBgVhqJZCciXs_G6Vt9O8I0mOU_gHxH3eWUg6uVPnkfcGhbr_FGPJTA-EJH6PKMhoROPYH2WtYBeMxxYARMKUMDQrGcBi1rL2HQv5Vj4Sub0', 0, 0),
(402, '1fb58e47284e3487', 'c5tLc21U7UfFuO', '2025-06-15 17:25:41', 'fpT6bNYeQXKy_K9X_gWdm2:APA91bE8Ac0F5FqsT1lL9YM7wF7yOPvingZH1cHFFckZgThZSFpRvj2WyrI2_-TFOU_yRsGP8z7794Xs7wvJTt3bUsZgF8pg0qfopVjZKJHBCARB7CGKFIs', 1, 0),
(403, '38c69b0f6d0c4084', 'KSEXFVI4Cpoo2I7r', '2025-06-17 17:43:26', 'coq8CkfqSgC0craO-9gTaS:APA91bH-FjjujU4r0tLi5_K1pRJSoskEFNoWG6jSNsDyKlJzJSdzSEkKegXsTOuz-pv-sV71naJ0irOT1CVx0jo2PSVx05F2MeubLlZO-TaivA2KoljgDts', 1, 0),
(404, 'e2851a2da07e645e', 'dfohQT2UuslIc7Ya', '2025-06-17 17:52:45', 'eDZ-9e50QdmatKYV0dj9Ex:APA91bE9g98BcU7R5B_KdYqWoIXDYb0Tz9pE2VxVB0DqOBy7xUr_3PXZqr5FWn1cDx0x2jPPhMDLrvPdj-MIz1tY6vHpeq5EB3qFxK28BGFa0z1_xVGn3iw', 0, 0),
(405, 'b615d24241430a20', 'md8fjBlklftMUqF3', '2025-06-19 14:58:04', 'csmu1a9yTnmUGq3_i5s04E:APA91bHQtbtq0OTyKWO-jMi8qhWbSUO8FpZjKJvUgUqszWuX84MDkY94w9FhNEuZdk1qP-IViDyNFogAJSwUCSpKqSDKr8keaaMyNbacqAm5iMu62obT6Ow', 1, 0),
(406, '96b7ada2bded2c72', '52aFfwdgVYIkWfVl', '2025-06-20 12:08:16', 'cBj_L8ZOQCO5Xd3GCn5u-O:APA91bExzmFS2CBwSCgRSqhUg62k7EqoxmZ7ReAXigL9WFJR0P3YsY5LWwO0KLIfXAagjktNmCAmchsd7Q77oJXBZNE47agjbaTLvgNISzcFiWNAkKy9yMg', 0, 0),
(407, 'e2851a2da07e645e', 'K1Vc3wahVMzOn2k2', '2025-06-24 18:37:48', 'fU-rjKjSTDCmE-NM9QwFQd:APA91bGHwfG3hSHvgVj8NwUI4k1hFUUy5HO7RPE84-KfqIWQDU9iXXUfRFMzQPt0dwnowOXLuDqjiCYUw5amR6yiG_KjszT20S51fc8YaFgbmX7f5wuZOqo', 1, 0),
(409, 'b1b33ca7826d67a1', 'pFeabi5CzPU2OMU8', '2025-06-26 12:13:53', 'ehxqm1XUSk-wIkm3Guqy_-:APA91bFXAnvkBCBMeQ9Z79P9yF1BvODmmXcXyrc0IVTykLPToTy7noHdm2nQ7Wdsa5r-G6b-MpCTkZ1d3FAdPGRdDzO-jxz_yRVnv-KUthhWTHEaFtqifNI', 1, 0),
(410, '96b7ada2bded2c72', '1VwHwFTaRwE5K0qA', '2025-06-26 15:06:36', 'eM8_-sTtQ-GC1VaD-aGHZi:APA91bHFVpWacGFjvkQJgeC9aX8oRHcx7o3St52xNyM7dwXKcLyFMSKjFqtiYNm8vyWrmuL943MUfwcKPeH72xCkV2CgomhKDI64WU4PaJK-OadZFZr_Y5Y', 0, 0),
(411, '96b7ada2bded2c72', '4FjyoDYfdR4kUEo', '2025-06-26 16:11:31', 'fYPubCeSQCKnqJQjuYOS_e:APA91bHGWaVLCKrGSXm0fueT6QCsTSlZDELnMsAqh8YCgOZzjBKUBEXeYi8a2-_qIoqFGiP17po8D_5uIU6UV5wrQQy_EQ48cgf4qkzwOdKVH-hhkm0nMNk', 0, 0),
(412, '96b7ada2bded2c72', 'R8H3j79WzqPqs8If', '2025-06-26 16:13:34', 'cGXmilTaSaesp4UnWMsPyM:APA91bENtO5VRo2n4YXklwrAeclu11-woFSaY9LOJPcmL19e8SWGi6bIL6eeFPMSH5MsV4YnAD15iwvESp8h5O9SifRLMwNT1ZpXqacEyjA7W2DY-mDd1JI', 0, 0),
(413, '96b7ada2bded2c72', 'RXbMvBGSr5CqjkD3', '2025-06-26 16:14:21', 'fZ-5fE6PRWWJUHG38k4oYE:APA91bGpoy0typB10Yw4LtMqUSFnWOF0j55_jJqT0MuSIK7SJccTGAxQ8AYas_rpcU1etdAiYcB0BVbOur1eMS0tuayx9QV25k_kh3idaMcGJSk8fKNQ4p8', 0, 0),
(414, '96b7ada2bded2c72', 'eRLyA7PdBg8MXDm', '2025-06-26 16:21:32', 'eyOGh_RxRF6QF_7U-wlSj1:APA91bGOsOPUMuH718eWZEjr1zEwmL7OVUvHmp4NgzrratkhX7iXAHIoF6fh16kuygpdIUHiz7DLnDqx59yi-kGp65bcbHHfkkMJgR31UVSn8TNGOp8k-Jk', 0, 0),
(415, '96b7ada2bded2c72', 'DlHyV5aiJ7vUQNDv', '2025-06-26 16:24:45', 'fcE7csuFTnu6WPY8HdoWdg:APA91bGgOF0cMBYFlhfpvRAHbWjZstKGCkwg1V2VvFhUgaBu2ADP2awbeLPUO4saISOtvivQ6DSpviVn2ZvMTTZ9DxJemjfAT2quQkq9dHwJ2z_JSmcrn3U', 1, 0);

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
  `info` json NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `rango_blockchains`
--

INSERT INTO `rango_blockchains` (`id`, `name`, `default_decimals`, `type`, `chain_id`, `logo`, `display_name`, `short_name`, `info`, `created_at`) VALUES
(1, 'ETH', 18, 'EVM', '0x1', 'https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/ETH/icon.svg', 'Ethereum', 'ETH', '{\"rpcUrls\": [\"https://rpc.ankr.com/eth\"], \"infoType\": \"EvmMetaInfo\", \"chainName\": \"Ethereum Mainnet\", \"addressUrl\": \"https://etherscan.io/address/{wallet}\", \"enableGasV2\": true, \"nativeCurrency\": {\"name\": \"ETH\", \"symbol\": \"ETH\", \"decimals\": 18}, \"transactionUrl\": \"https://etherscan.io/tx/{txHash}\", \"blockExplorerUrls\": [\"https://etherscan.io\"]}', '2025-04-02 06:57:26'),
(2, 'BSC', 18, 'EVM', '0x38', 'https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/BSC/icon.svg', 'BNB Smart Chain', 'BSC', '{\"rpcUrls\": [\"https://bsc-dataseed1.ninicoin.io\"], \"infoType\": \"EvmMetaInfo\", \"chainName\": \"Binance Smart Chain Mainnet\", \"addressUrl\": \"https://bscscan.com/address/{wallet}\", \"enableGasV2\": false, \"nativeCurrency\": {\"name\": \"BNB\", \"symbol\": \"BNB\", \"decimals\": 18}, \"transactionUrl\": \"https://bscscan.com/tx/{txHash}\", \"blockExplorerUrls\": [\"https://bscscan.com\"]}', '2025-04-02 06:57:26'),
(3, 'BTC', 8, 'TRANSFER', NULL, 'https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/BTC/icon.svg', 'Bitcoin', 'BTC', '{\"infoType\": \"TransferMetaInfo\", \"addressUrl\": \"https://www.blockchain.com/btc/address/{wallet}\", \"transactionUrl\": \"https://www.blockchain.com/btc/tx/{txHash}\", \"blockExplorerUrls\": [\"https://www.blockchain.com/btc/\"]}', '2025-04-02 06:57:26'),
(4, 'SOLANA', 9, 'SOLANA', 'mainnet-beta', 'https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/SOLANA/icon.svg', 'Solana', 'Solana', '{\"infoType\": \"SolanaMetaInfo\", \"addressUrl\": \"https://solscan.io/account/{wallet}\", \"transactionUrl\": \"https://solscan.io/tx/{txHash}\", \"blockExplorerUrls\": [\"https://solscan.io/\"]}', '2025-04-02 06:57:26'),
(5, 'BNB', 8, 'COSMOS', NULL, 'https://raw.githubusercontent.com/rango-exchange/assets/main/blockchains/BNB/icon.svg', 'Binance Chain', 'BNB', 'null', '2025-04-02 06:57:26');

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
  `chain` varchar(25) COLLATE utf8mb4_general_ci NOT NULL,
  `chain_id` int DEFAULT NULL,
  `address_id` int DEFAULT NULL,
  `from_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `destination_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `amount` varchar(30) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tx` text COLLATE utf8mb4_general_ci NOT NULL,
  `gas` int DEFAULT NULL,
  `gas_price` bigint DEFAULT NULL,
  `block_number` int DEFAULT NULL,
  `type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `network_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `wallet_id` int DEFAULT NULL,
  `id_utente` int DEFAULT NULL,
  `data_insert` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `block_hash` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `input` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `tx_status` enum('success','pending') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `chain`, `chain_id`, `address_id`, `from_address`, `destination_address`, `amount`, `tx`, `gas`, `gas_price`, `block_number`, `type`, `network_type`, `wallet_id`, `id_utente`, `data_insert`, `block_hash`, `input`, `tx_status`) VALUES
(4, 'ETH', 11155111, 687, '0x490d8f732b22644c71dc505195c915e6e8da1af9', '0xc0dc7357e764ec555d5f097db0ed8472fc3e6982', '0.09', '0xaaa17573efc4dceed3653da6dddf184933d6b32ee18d5c931efec9cfad8bb0a1', 21000, 6517792084, 8165877, 'Legacy (Type 0)', 'TESTNET', NULL, NULL, '2025-04-21 14:01:41', '0x27355c763f09bb0d4aa9da8c06949fb81a2e38b58a57b54cbe312263651bb77d', '0x', 'pending'),
(5, 'ETH', 11155111, 703, '0xc0dc7357e764ec555d5f097db0ed8472fc3e6982', '0x490d8f732b22644c71dc505195c915e6e8da1af9', '0.05', '0x4d8ee367077c2cc03127927de93793ddf3463a3825ef3fabe737df6f4440325c', 21000, 5803265639, 8165888, 'Legacy (Type 0)', 'TESTNET', NULL, NULL, '2025-04-21 14:01:43', '0xbb17c3f2765e89cd009a391059f14e3899b166f83aefab64477e2a3823b06e17', '0x', 'pending'),
(6, 'ETH', 11155111, 603, '0xf4bc58f1682e1218a7f2d5d7d031248f8e7ef771', '0x611a90dfcb9866480cb713e34b0febb333502d2d', '0.01', '0x53d8dc695dcb2d0f92cbadab08c36ba08962dba891c89bf0a5c98e1ab0355aeb', 21000, 1992525963, 8166107, 'Legacy (Type 0)', 'TESTNET', NULL, NULL, '2025-04-21 14:31:17', '0x6876a22990a978ad661a7e9d1c8c6f2498b4ca18f90d1ebd153df4906bcb09a4', '0x', 'pending'),
(7, 'ETH', 11155111, NULL, '0xe560ca09958bdb05b776676351114811ad101e47', '0x5f6a8a58d1f692b6e23c83678aeae520e83bfdfe', '0.05', '0x8b482843715b4526ec742e3a6ec91529418eaa4a6b24d09ac8e192b8eed5ee87', 21000, 1825325829, 8166161, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', NULL, NULL, '2025-04-21 14:41:13', '0x9e842cea9110ac9bb2f33f33683e01b90cf2428e62df8bad699d3af7d32d6f9e', '0x', 'pending'),
(8, 'ETH', 11155111, NULL, '0x95a13f457c76d10a40d7e8497ed4f40c53f4d04b', '0x473aaffcb6542aab9322dcc76426b0184d5df6de', '0.05', '0x1c79e62c193b331f5ad2f13824540a7b28affda4f357bbfaa02bdf9dc0ef77a5', 21000, 38831005944, 8171563, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', NULL, NULL, '2025-04-22 09:40:49', '0x868d2befdc1915cc0bd522b86a687da70214fd3ee9b9ca1d9ea635134183a81c', '0x', 'pending'),
(9, 'ETH', 11155111, 716, '0x473aaffcb6542aab9322dcc76426b0184d5df6de', '0x2ffe050467859eff566ca88e2e594c970e45011d', '0.01', '0x72d60e96f33950fe421b43c8690c6b9f40a30a4a652fc08f46abf5f96c1de6f2', 21000, 46704546780, 8171574, 'Legacy (Type 0)', 'TESTNET', 98, 326, '2025-04-22 09:43:01', '0xa2976fb7c5590f41cfc0aec32a0b3638d796f7539fdfdf2171e5feb5cbe4675d', '0x', 'pending'),
(10, 'ETH', 11155111, 603, '0xf4bc58f1682e1218a7f2d5d7d031248f8e7ef771', '0x611a90dfcb9866480cb713e34b0febb333502d2d', '0.03', '0xa640377fb38dd2d66e618fcc6c99e590348fc039a53a96182c2549c512f65451', 21000, 40941312422, 8171715, 'Legacy (Type 0)', 'TESTNET', 72, 308, '2025-04-22 10:13:01', '0x152a65b5d727f1595d05fb6ab207f993f48584398f6c7c587551c023251f0914', '0x', 'pending'),
(11, 'ETH', 11155111, 629, '0x5f6a8a58d1f692b6e23c83678aeae520e83bfdfe', '0xfff9976782d46cc05630d1f6ebab18b2324d6b14', '0.001', '0x8cd4c4536df97443b7b3adfffded46308665559a774bd375d8ac983702595aa2', 45418, 1101047758, 8178899, 'Legacy (Type 0)', 'TESTNET', 72, 308, '2025-04-23 11:31:13', '0xd84d3c9651860281cb2c62c3caf6454ee985115d1fd3576c8c47d2054c14c949', '0xd0e30db0', 'pending'),
(12, 'ETH', 11155111, 629, '0x5f6a8a58d1f692b6e23c83678aeae520e83bfdfe', '0xfff9976782d46cc05630d1f6ebab18b2324d6b14', '0.001', '0x82742f71feeeb45dc5fae0b4e424e2babe0c4a34733b63b021a2a1c2bc84646d', 28284, 6431937876, 8179117, 'Legacy (Type 0)', 'TESTNET', 72, 308, '2025-04-23 12:17:37', '0xfebb80b331047364307ee99fe56f6c6ac500661ad505abf582df741c748c7a7e', '0xd0e30db0', 'pending'),
(13, 'SOL', NULL, 744, 'DgD24mvLSe3rzkFPLXff9DUDqG6ZxG3nxnmYaRDdtpw4', '36zErnEjGTFAJ58FD5cMrWb455BMwUtFJGCcZP3jqYxC', '0.0001', '4kaQgk6HfALaqYhkfMJTTzqVXir8KogvFQV5HXakKJuyQQc2ySKPvo9eG4S6FfYSvQgv4xRyZhtERG8Yt6ypdHsW', NULL, NULL, NULL, NULL, 'TESTNET', 113, 329, '2025-04-24 11:04:17', NULL, NULL, 'success'),
(33, 'SOL', NULL, 744, 'DgD24mvLSe3rzkFPLXff9DUDqG6ZxG3nxnmYaRDdtpw4', '36zErnEjGTFAJ58FD5cMrWb455BMwUtFJGCcZP3jqYxC', '0.62499375', '5HHrKcAE5txb9xWLGYb2QZfb98igrKvwfu89c8RMpyHab4yYNoSAeUm9x7G7dVW6U1jJxAGMoSxkbeoNPU91etiD', NULL, NULL, NULL, NULL, 'TESTNET', 113, 329, '2025-04-25 05:57:39', NULL, NULL, 'success'),
(35, 'ETH', 11155111, NULL, '0x6efb29cee3b414272eb7a8f3ebabf873d36bc033', '0xa9ff068390bb668ff56f7d372f01ac1799c3bffa', '0.05', '0xceb1d76c9cbe5af882aa5b0b9262b63e8823905142359aef3340d2d23972b103', 21000, 9914958466, 8190792, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', NULL, NULL, '2025-04-25 05:58:19', '0x912c27f6099a955c9af1231ad341373d854dbde4337076884f6dfde790b2ebf0', '0x', 'success'),
(37, 'SOL', NULL, 746, '36zErnEjGTFAJ58FD5cMrWb455BMwUtFJGCcZP3jqYxC', 'DgD24mvLSe3rzkFPLXff9DUDqG6ZxG3nxnmYaRDdtpw4', '0.001', '2skZLsU9KZdypE9f3AZS8MgPZrgyk3e8AqbuxW8MGWzpTG72HVDzfy9TRG1oYqiK1VHPBe9rauDgzoZxmkBWx238', NULL, NULL, NULL, NULL, 'TESTNET', 113, 329, '2025-04-25 06:48:38', NULL, NULL, 'success'),
(38, 'ETH', 11155111, 742, '0xa9ff068390bb668ff56f7d372f01ac1799c3bffa', '0x3b3e80a176eb51ef8ff47368dcb30b8b3b3d4624', '0.0001', '0xefcd7dcfa1ba02657ecb73d4b50674cc9ab2333086a577c79df67d77b3e7ebc0', 21000, 13104013748, 8191902, 'Legacy (Type 0)', 'TESTNET', 113, 329, '2025-04-25 09:41:01', '0x6aa6f507df62b81f477d96dd4925757dd38f72f71fbfec17cd27fbec2506a918', '0x', 'success'),
(39, 'ETH', 11155111, 742, '0xa9ff068390bb668ff56f7d372f01ac1799c3bffa', '0xfff9976782d46cc05630d1f6ebab18b2324d6b14', '0.001', '0x4a23353ce9fec6b70715eb11bfa2fc881050ffdf6e83d8fca0ab6b64db419298', 45418, 29490647694, 8191902, 'Legacy (Type 0)', 'TESTNET', 113, 329, '2025-04-25 09:41:01', '0x6aa6f507df62b81f477d96dd4925757dd38f72f71fbfec17cd27fbec2506a918', '0xd0e30db0', 'success'),
(40, 'ETH', 11155111, 742, '0xa9ff068390bb668ff56f7d372f01ac1799c3bffa', '0xfff9976782d46cc05630d1f6ebab18b2324d6b14', '0.001', '0x0295d455abc0f8c9e3dcd39fc894cb1ae2df531a16f365bf9f1f214ddac71978', 45418, 30525518924, 8191902, 'Legacy (Type 0)', 'TESTNET', 113, 329, '2025-04-25 09:41:01', '0x6aa6f507df62b81f477d96dd4925757dd38f72f71fbfec17cd27fbec2506a918', '0xd0e30db0', 'success'),
(41, 'ETH', 11155111, 742, '0xa9ff068390bb668ff56f7d372f01ac1799c3bffa', '0xfff9976782d46cc05630d1f6ebab18b2324d6b14', '0.001', '0x70bd28b74ce96d21be039130f1b2f7a7c4eacff872683b9e5ac373e744bfbe24', 45418, 29265510773, 8191902, 'Legacy (Type 0)', 'TESTNET', 113, 329, '2025-04-25 09:41:02', '0x6aa6f507df62b81f477d96dd4925757dd38f72f71fbfec17cd27fbec2506a918', '0xd0e30db0', 'success'),
(42, 'ETH', 11155111, 742, '0xa9ff068390bb668ff56f7d372f01ac1799c3bffa', '0xce7da8f009bd9b2982db9207ad11b1ea3157fd77', '0.01093154', '0xde434cec16e54a972f055940ff9a51ef764708c733245215dd4d3b48bfb9b839', 21000, 16658783831, 8211336, 'Legacy (Type 0)', 'TESTNET', 113, 329, '2025-04-28 07:07:37', '0xc2319811bbd36a5caa52b3e2533eee05866f00d3ab69f7a356f6d281c2a7fad0', '0x', 'success'),
(43, 'ETH', 11155111, NULL, '0x42645ce4dd0b766de53ee483cbf54bcea670f9b2', '0x1fa2a974f4cd41eb7549fa7c2b789f0c483d0321', '0.05', '0x31049bfbe67c5dfba9e42e8a6c71fc107e78e5e2540723fd9642511c3daa2e89', 21000, 64846063399, 8218673, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', NULL, NULL, '2025-04-29 09:22:37', '0x5f6d70af3856f4b6f7e823fcb0eda0f0cd69f6d863089c80c8986f9902b9ba9d', '0x', 'success'),
(44, 'ETH', 11155111, NULL, '0xb2de751d22adfb449e95da3c1e8836c6c61b537d', '0x6b53ed61286933e9534ed2215d3ef01904f2280b', '0.05', '0xa7f087a5a0905198359ded04d44e51818dcadfc23a06210751cce4f5c5c8e72a', 21000, 2603521635, 8238149, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', NULL, NULL, '2025-05-02 05:43:39', '0x2e053d7715b342700dae71f88660b3c31bd792036825f792f86743eee5d9e5fe', '0x', 'success'),
(45, 'ETH', 11155111, NULL, '0xafeda61db9e162293b2ef2c2bc5a800b37bb5e4a', '0x4d5e2b475b0035e809c251274cf1a578b6b10594', '0.05', '0xadb379afe9bd5677f567e054e10e074da957284663d8019ab932b5517cdb94c4', 21000, 78646263390, 8239324, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', NULL, NULL, '2025-05-02 09:42:13', '0xa566727823d2e26f1170b430587e18f64217e5cea9251602a004354f417ad12b', '0x', 'success'),
(46, 'ETH', 11155111, NULL, '0x4d5e2b475b0035e809c251274cf1a578b6b10594', '0x6b53ed61286933e9534ed2215d3ef01904f2280b', '0.0001', '0x401393eae92e0c89d9d641bc6dec2a0431a7887afd9e5bc112f51fb28f0505b1', 21000, 99204640351, 8239370, 'Legacy (Type 0)', 'TESTNET', NULL, NULL, '2025-05-02 09:51:26', '0x405acc147cbeabb693acaf86e4525c67b976f1eb340ddc6f51f355b148864ae6', '0x', 'success'),
(47, 'ETH', 11155111, NULL, '0xe560ca09958bdb05b776676351114811ad101e47', '0xa50fccf0bf9a2c8ba81f232970bcaad7b759180a', '0.05', '0xf5dfec2c11dc916a8b524d68d061f27e31e32096be19d814d39ada35e0ddb6c1', 21000, 37599902412, 8274905, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', NULL, NULL, '2025-05-07 11:44:13', '0x4bce35e662a142cb1d972fc89aaa44adf75e1edaf2d5df83303a4f828cdbed13', '0x', 'success'),
(48, 'ETH', 11155111, NULL, '0x6cc9397c3b38739dacbfaa68ead5f5d77ba5f455', '0x408b4926e1dfe0758f27ee9f8b7f3b0275f2170f', '0.0675948', '0xb1ba0af145a7c1040f1d1c8e55b2fe2380a48ab533b026166b856163b1b40d64', 21000, 34158290228, 8275417, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', NULL, NULL, '2025-05-07 13:28:26', '0x7725514dfaebc2bd91f34b9fd948bbc240a33638f7a220707ce0929fbe3439d0', '0x', 'success'),
(49, 'ETH', 11155111, NULL, '0x6efb29cee3b414272eb7a8f3ebabf873d36bc033', '0xa8d6d518692770abc29800c88e51ddeb655e08ee', '0.05', '0x6af77ccb3c1ec6fc79f12ca681cb6534ebbab338463817b076073aa8bb9c3455', 21000, 10441724458, 8275877, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', NULL, NULL, '2025-05-07 15:01:14', '0xd0c971aa41c43d97449cee2587a677f1c49579d4dfe698c0d5d3f39e6d2e1e5d', '0x', 'success'),
(50, 'ETH', 11155111, 902, '0xa8d6d518692770abc29800c88e51ddeb655e08ee', '0xd1731a32f639cf9786d2690d3d2899033fa4207f', '0.0125', '0x3eb3a93cbfac5ed26323896971f98bf10cf12cc1d1d2ec940bd1a5b1099a03f4', 21000, 9021215328, 8275906, 'Legacy (Type 0)', 'TESTNET', 153, 365, '2025-05-07 15:07:01', '0x1d0a287565ccb73358efc51f2f74781bc006ba8fdd35b4834c3a7af398e4ecd7', '0x', 'success'),
(51, 'ETH', 11155111, NULL, '0xb2de751d22adfb449e95da3c1e8836c6c61b537d', '0x829c4d1653a4e088db4b6a217f096651d5536f88', '0.05', '0xcb3fc01fd4306276982a63ef11f21bbee9fea4399d09629a0b0c6a41774b1bef', 21000, 29653057, 8280375, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', NULL, NULL, '2025-05-08 06:02:01', '0x8aceea26ee47021a30e3b3df4b482e26794f58bcfed07424d967d5c519224143', '0x', 'success'),
(53, 'ETH', 11155111, 898, '0x829c4d1653a4e088db4b6a217f096651d5536f88', '0xa09b658e9d574d7b3d62b50d1f2cc33a4c9afa89', '0.01', '0x303d2e1d5a5538109623ace7961efbf1ee08cec9dd2f74b60d1188e66892eac9', 21000, 93836004, 8280486, 'Legacy (Type 0)', 'TESTNET', 152, 364, '2025-05-08 06:24:13', '0xe582b69032b764259837a03f64a0001fdbedf915a7c62e186c34cd2bf24da285', '0x', 'success'),
(54, 'ETH', NULL, 898, '0x829c4d1653a4e088db4b6a217f096651d5536f88', '0xa09b658e9d574d7b3d62b50d1f2cc33a4c9afa89', '0.01', '0x54badba2cb8f458b5942e13e95e07a4da595f9bb37c44c812738540fec1bf64a', NULL, NULL, NULL, NULL, 'TESTNET', 152, 364, '2025-05-08 06:27:30', NULL, NULL, 'success'),
(56, 'ETH', NULL, 898, '0x829c4d1653a4e088db4b6a217f096651d5536f88', '0xa09b658e9d574d7b3d62b50d1f2cc33a4c9afa89', '0.02', '0xa73ab25b88484a3b6a18d26d4aceccdf11bd4e779ba8cb4168c5257afb38c2b7', NULL, NULL, NULL, NULL, 'TESTNET', 152, 364, '2025-05-08 06:33:23', NULL, NULL, 'success'),
(57, 'ETH', 11155111, 898, '0x829c4d1653a4e088db4b6a217f096651d5536f88', '0xa09b658e9d574d7b3d62b50d1f2cc33a4c9afa89', '0.01', '0xac55f6c7133018c672234188a8dc665b818b4bc49e380296c32b5adb0ae6bb40', 21000, 20089018937, 8281320, 'Legacy (Type 0)', 'TESTNET', 152, 364, '2025-05-08 09:09:14', '0x9c4d0304749f08710da7068b29400176b99867679f510dbeaab1b557501ac1c6', '0x', 'success'),
(58, 'ETH', 11155111, 907, '0xa09b658e9d574d7b3d62b50d1f2cc33a4c9afa89', '0x829c4d1653a4e088db4b6a217f096651d5536f88', '0.01', '0xb91f6247660977f5025c6e95db045f5c9a7cb305b6aa59bc84d942ca9b764a31', 21000, 17096389451, 8281329, 'Legacy (Type 0)', 'TESTNET', 152, 364, '2025-05-08 09:12:27', '0xe760dfcdcac1060a93610a2e3614aac019277f8903917d7635a23fceab00ead9', '0x', 'success'),
(59, 'ETH', 11155111, 898, '0x829c4d1653a4e088db4b6a217f096651d5536f88', '0x829c4d1653a4e088db4b6a217f096651d5536f88', '0.01', '0x173adbca6dedbb4c5a6197666ab00978c58a34d31b65318155d39cb2f3b7c257', 21000, 16218144645, 8281390, 'Legacy (Type 0)', 'TESTNET', 152, 364, '2025-05-08 09:24:53', '0x281caa41d470904ba6068c8334a3538351f2e9af47009eee6e8a10e10aea9c5a', '0x', 'success'),
(60, 'ETH', 11155111, 898, '0x829c4d1653a4e088db4b6a217f096651d5536f88', '0xa09b658e9d574d7b3d62b50d1f2cc33a4c9afa89', '0.01', '0x4687bf74399dda455d00cf208b7592a6ce0b144e0e64f8e9ee74fe38e5df5b4a', 21000, 12335827170, 8281421, 'Legacy (Type 0)', 'TESTNET', 152, 364, '2025-05-08 09:31:19', '0x561b2d5d74e9ac7bc3105bca2d5a9f0c6c86d770f9e5a2b1f8041f7981331551', '0x', 'success'),
(61, 'ETH', 11155111, 898, '0x829c4d1653a4e088db4b6a217f096651d5536f88', '0xa09b658e9d574d7b3d62b50d1f2cc33a4c9afa89', '0.01', '0x59af79cafa43d3a9bbfacdeae097ca4f4727a5d4a9612015e651d510571c5871', 21000, 11664173430, 8281452, 'Legacy (Type 0)', 'TESTNET', 152, 364, '2025-05-08 09:37:28', '0xdf8a74fbc249f16035eb01488cb466f169568cb38be9c731211c77c0e2d2b008', '0x', 'success'),
(62, 'ETH', 11155111, 907, '0xa09b658e9d574d7b3d62b50d1f2cc33a4c9afa89', '0x4c5b17d7c9cfee4a9f4bfa8fd3d2e2145f83d345', '0.01', '0xb1b651411da7dee94c3967320fdb0da10da56f49f0aeb0ce1cf5e8483adbd5bf', 21000, 3132188977, 8282200, 'Legacy (Type 0)', 'TESTNET', 152, 364, '2025-05-08 12:04:37', '0x33b3c529e6d3f89656f67deee390f5c6f718523ba7bb8c73639817e6dcbbbdd8', '0x', 'success'),
(63, 'ETH', 11155111, NULL, '0x15095ec8fb1fc9c664b3223459dff43158ace7ad', '0x62b39cf902c7e3e540062adb91070e1d0accd0d3', '0.05', '0x340e8e2e4e5474fcee754fd84c0289da603f7432f08b1b46111984489ed95016', 21000, 73560595263, 8282933, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', NULL, NULL, '2025-05-08 14:34:27', '0x0ffca4f00c6596cf3a5238f00fc4499af078596204facb0e23d6c6e12911846f', '0x', 'pending'),
(64, 'ETH', 11155111, 908, '0x62b39cf902c7e3e540062adb91070e1d0accd0d3', '0x7a93901f6a63f16f656d47b84cf9a1d0fb9087e4', '0.01', '0xd75902aa58bd4216d819d17f6d293ced000940e31f6353081a0d76b9182bf5fc', 21000, 73817098449, 8282941, 'Legacy (Type 0)', 'TESTNET', 154, 366, '2025-05-08 14:35:50', '0x582b0a3960a84c53ee458bba3d75c6ebe990296053d23c2339e68cdb1ac54b67', '0x', 'success'),
(65, 'ETH', 11155111, 603, '0xf4bc58f1682e1218a7f2d5d7d031248f8e7ef771', '0x611a90dfcb9866480cb713e34b0febb333502d2d', '0.0025', '0x53fa08a6fa9d6e77ae1c25ccb9d231da8d35adf9e546782569a979a71c8a1a3d', 21000, 87332055, 8318023, 'Legacy (Type 0)', 'TESTNET', 72, 308, '2025-05-13 12:31:28', '0xcd64f7c126eaa888515662fdc6c605130d7652792f82d5fb08fe7ca6a19852b0', '0x', 'success'),
(66, 'ETH', 11155111, NULL, '0xb2de751d22adfb449e95da3c1e8836c6c61b537d', '0xa2e0f0fb522156e511a3a4f2f62060e9794c1c58', '0.05', '0x0bff758de4a803976e8067b43a7142b35d6e03137451cfcf4b722eaf2162cd94', 21000, 6605878339, 8324199, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', NULL, NULL, '2025-05-14 09:38:02', '0x5fa8bfdbcd6f029a1b15514a08a8d689039568c7084b05180a6e8a9ec4f9f8d9', '0x', 'pending'),
(67, 'ETH', 11155111, 932, '0xa2e0f0fb522156e511a3a4f2f62060e9794c1c58', '0x0e18f05dd91d5b9755db7666b7c2e0b161664b3f', '0.02', '0xdef7d33e499a133f544d1908049e8ad77f1c8deaa07a32990c55af2b8d3eecec', 21000, 7066725000, 8324226, 'Legacy (Type 0)', 'TESTNET', 159, 371, '2025-05-14 09:43:28', '0xd4991bce635960f0046b5c3a24db54e5167b14d967076c521fb28a2325eacc98', '0x', 'success'),
(68, 'BTC', NULL, 935, 'mtqJMkSvrFH3qrc9YKkvpvjKrV236mM9AH', 'n4pjo32ACwdrfvbdsN5xW8tYw5jPn5af1G', '0.00075', '3673dea360a646e5e0efa6511ba4c925cf9845752b04ec1e00ced74eac7ae800', NULL, NULL, NULL, NULL, 'TESTNET', 159, 371, '2025-05-14 12:06:29', NULL, NULL, 'pending'),
(69, 'BTC', NULL, 937, 'n4pjo32ACwdrfvbdsN5xW8tYw5jPn5af1G', 'mtqJMkSvrFH3qrc9YKkvpvjKrV236mM9AH', '0.0007', '873c1e795137b240697053e02a5a6f00491ae5d5246d282456dd2963b7f3bcbf', NULL, NULL, NULL, NULL, 'TESTNET', 159, 371, '2025-05-14 12:16:57', NULL, NULL, 'pending'),
(70, 'BTC', NULL, 935, 'mtqJMkSvrFH3qrc9YKkvpvjKrV236mM9AH', 'n4pjo32ACwdrfvbdsN5xW8tYw5jPn5af1G', '0.0007', 'a63aaf9d5cbbc2dd8364a9b01cd5ea82603ba2f9b979f318f733d29a683b39ac', NULL, NULL, NULL, NULL, 'TESTNET', 159, 371, '2025-05-14 12:23:07', NULL, NULL, 'pending'),
(71, 'ETH', NULL, 932, '0xa2e0f0fb522156e511a3a4f2f62060e9794c1c58', '0x0e18f05dd91d5b9755db7666b7c2e0b161664b3f', '0.01', '0x5086b62c18200a20c1de2572cb20aa17599b62f2bc3c228b92691bbab4461a6a', NULL, NULL, NULL, NULL, 'TESTNET', 159, 371, '2025-05-14 12:58:52', NULL, NULL, 'pending'),
(72, 'ETH', 11155111, 932, '0xa2e0f0fb522156e511a3a4f2f62060e9794c1c58', '0x0e18f05dd91d5b9755db7666b7c2e0b161664b3f', '0.01', '0x6dd45c0678a4aae090c7d96e3a6a9139dbdec6b5fc90b10313f6114213b0a4b6', 21000, 2820319640, 8325175, 'Legacy (Type 0)', 'TESTNET', 159, 371, '2025-05-14 13:04:51', '0xc02bdee257978cf2d1840eefd0acee82d288330c33778a0596568ccef691f2db', '0x', 'success'),
(73, 'ETH', 11155111, NULL, '0xcbf16fed20967280a8b53299dc7dd6bd857d7e9c', '0xdfa729299d49f781dc865a773f6b673d1399db7a', '0.05', '0x419468febc13905d3cf07a96c2d28c8744542dfb1ac5c6cce63c0e8ac92d3c36', 21000, 3930964, 8359243, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', NULL, NULL, '2025-05-19 07:56:14', '0x50e44553e8923ac77226677523ca5f5d4dece1f5156a41ca3a05b2dcedd91b9d', '0x', 'pending'),
(74, 'ETH', 11155111, 1050, '0xdfa729299d49f781dc865a773f6b673d1399db7a', '0xb0b154f008f43ab074e729ffc6c2a6a319089dee', '0.01', '0xf7f4d93598a622b91ef4c9c5555992e9bcaefcca7b50f30da6346ce83effa0a6', 21000, 4024517, 8359249, 'Legacy (Type 0)', 'TESTNET', 182, 385, '2025-05-19 07:57:18', '0x4fbda8298a6b13624aacb6a1291b6db57f3ba7d6a6f7c1629079d2a784d6b73d', '0x', 'success'),
(75, 'ETH', 11155111, NULL, '0x993a0f3653887078215914badcf039263293add9', '0x1b7c8596bf31ffda6fb65fbcfc6ebe8cefd76099', '0.05', '0x4f270c007566b1bf3aa45d44cc4e265f72a9ab8096beb2e6b6526b54ac89ba14', 21000, 1958119, 8359646, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', NULL, NULL, '2025-05-19 09:17:26', '0xeb7f51ee7192b8430e389b820e9959b16a650d561f26397143f52132f6689504', '0x', 'pending'),
(76, 'ETH', 11155111, 1055, '0x1b7c8596bf31ffda6fb65fbcfc6ebe8cefd76099', '0xf1afc1ce5109b9e1664e85c8655c218212dc0b50', '0.01', '0xb384b811751574c5201d7aa7ffc13036a163bf727d7c39ead0816785aa0a23b9', 21000, 1972641, 8359659, 'Legacy (Type 0)', 'TESTNET', 183, 386, '2025-05-19 09:18:00', '0x45b6cb9ddd16452b3c24e6dc202e84e93e50af81a7c41e704f42c9ce6a079c38', '0x', 'success'),
(77, 'ETH', 11155111, NULL, '0x95a13f457c76d10a40d7e8497ed4f40c53f4d04b', '0x8b2a372685f1827720ff2b1709c9c6f2f8b9098e', '0.05', '0x1bffe5a496bf216d00a28e9dc4246552a48653bd7977a775cea9cc4a7c1d698e', 21000, 2668954802, 8361517, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', NULL, NULL, '2025-05-19 15:33:26', '0x20f48c60b634941071dcd484c4810af935ae3580355f20090329dfb08af6406e', '0x', 'success'),
(78, 'ETH', 11155111, 1030, '0x8b2a372685f1827720ff2b1709c9c6f2f8b9098e', '0xca5ab00b9b844ccd5036a0a372c5890a4175bd1e', '0.001', '0xc536e18e83f91a51d3c6683298057d31cf1b3345e79ebb6355c766bbc33ec5eb', 21000, 2309234478, 8361530, 'Legacy (Type 0)', 'TESTNET', 178, 381, '2025-05-19 15:35:05', '0x7e7685ce4b6dd06bb0a19b07ed6aa252a5ebb7af09ac4f6739bc5b8dbb5179f7', '0x', 'success'),
(79, 'ETH', 11155111, 1030, '0x8b2a372685f1827720ff2b1709c9c6f2f8b9098e', '0xca5ab00b9b844ccd5036a0a372c5890a4175bd1e', '0.005', '0x848262e229ef685901ee69a984233319970f00d052ad216b805ac09c20e78ca9', 21000, 1213735, 8412399, 'Legacy (Type 0)', 'TESTNET', 178, 381, '2025-05-26 19:11:04', '0x46aee395342f25710b59cfffa10cb87fe65f85e908fe62321882dc9f9e269677', '0x', 'success'),
(80, 'ETH', 11155111, NULL, '0x993a0f3653887078215914badcf039263293add9', '0xbc27c0ab1e8e05d6179d625b219aae26aa38e3a9', '0.05', '0xbfdba346d23c6df46b970cea34f45743f2859708f5c5b3de71e1835828d560f4', 21000, 53147722534, 8424356, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', NULL, NULL, '2025-05-28 11:07:38', '0x55345915a30faf5688e3227ff38e59d03b4f9a68a4c9876ecbf2dc185fa1f231', '0x', 'success'),
(81, 'ETH', 11155111, 941, '0xbc27c0ab1e8e05d6179d625b219aae26aa38e3a9', '0x370922d36135fb53a078240a1acf7d868bc581b3', '0.02', '0x8be277fbbb8e6bc5ffbb812eda8827cec31f7b36d6dad65ba4ef7f6951c7713c', 21000, 48530849331, 8424372, 'Legacy (Type 0)', 'TESTNET', 160, 371, '2025-05-28 11:10:38', '0xce31a2b5e6d2597e478d62e66e0b255ea2c052cbf556146164e8f907e81d4ce0', '0x', 'success'),
(82, 'ETH', 11155111, NULL, '0x52f1984cd3e46e1214db222d3ff63712e7aceedd', '0x370922d36135fb53a078240a1acf7d868bc581b3', '0.05', '0x8bedfefcd803f34ea37ec26a2adb3fb41978c784d3105602f653c1780f4a69e9', 21000, 18796020427, 8424554, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', NULL, NULL, '2025-05-28 11:47:15', '0x2bb2cf65195bc337869b8fe509bcbe42361507c3e1d8d5e92b34256e15b9d2f4', '0x', 'success'),
(83, 'ETH', 11155111, NULL, '0x9484449f2be7cd6e01ef55bc5438c733e0759e0f', '0xf5d75d13178d3b698d2457e4cb8a31bf5b5649fa', '0.05', '0x8a7ba84ab1f40445799c6d0671fc6afd00c6536360583957735f87b8f94908c2', 21000, 19998022441, 8424583, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', NULL, NULL, '2025-05-28 11:53:02', '0x4e22b16906e71e5ec71d52822386e325551a28c6dd68af8d5f3bfc8fe3f0fc52', '0x', 'success'),
(84, 'ETH', 11155111, NULL, '0xc0f3833b7e7216eecd9f6bc2c7927a7aa36ab58b', '0x27182443fb7d8a2cf1d5bb9c3143e349c48ab069', '0.05', '0x64da24fe9f778269a8366eac9f19c11303ac269ef69aafd935d784011d0f8d83', 21000, 10557655779, 8424598, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', NULL, NULL, '2025-05-28 11:56:02', '0xf1fa3e687fad854f08ffde070d6269919c9fbab3fb88cebe01d515f2b0c7afc9', '0x', 'success'),
(85, 'ETH', 11155111, NULL, '0xcbf16fed20967280a8b53299dc7dd6bd857d7e9c', '0x1b156532198eef7c1cca12c1e622a5956619f0d3', '0.05', '0x9643d0bdb325296f1d6d4f723a62fe97052230fb36c960ca5e8752ebe923ef7d', 21000, 1268679275, 8424655, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', NULL, NULL, '2025-05-28 12:07:25', '0xaed334897371d0e418b40ebb59b855220693b4bac665afea987b2b84975731a3', '0x', 'success'),
(86, 'ETH', 11155111, NULL, '0x52f1984cd3e46e1214db222d3ff63712e7aceedd', '0xb9285061cb9d39a845c96b4ee52192db6a74df02', '0.05', '0xa13b0b04cf1486fb2c234948df24a07ef2f07b28224086a363f7b61302922090', 21000, 107014323, 8424720, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', NULL, NULL, '2025-05-28 12:20:27', '0xed29684297ae25178216f183d9364dca6de81ee813d4c5a65ca7676eabdaf9ff', '0x', 'success'),
(87, 'ETH', 11155111, NULL, '0xcbf16fed20967280a8b53299dc7dd6bd857d7e9c', '0x09f09b901d1f94bf02913833402f3fe83ae6b62b', '0.05', '0xb41c4f2fe9c5f44714b2c3776f8713ecbf9b124c3072c8a22112ee3fd8cec8e2', 21000, 39711685, 8424756, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', NULL, NULL, '2025-05-28 12:27:37', '0xe9a6d8e28dd13ded48ad60f998b2ef42348a7b39b8d5c2ee9ca71393f01faf44', '0x', 'success'),
(88, 'ETH', 11155111, NULL, '0x159ca92b12f67e5676d82c238f4906692618a555', '0x27830095968149393580502aa5077e3319908634', '0.05', '0x0e62bab83200ad1bafdd5f4061ddc7b951ea928d038f5e5859b9786cb56c39be', 21000, 16020485, 8424785, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', NULL, NULL, '2025-05-28 12:33:25', '0x9bfbea6986d0f42065cddda9594e8eecc174da1b9807789e5a435d12332f8040', '0x', 'success'),
(89, 'ETH', 11155111, 1081, '0xafeda61db9e162293b2ef2c2bc5a800b37bb5e4a', '0xfac7ffce683f61a4a63d0b6b088bc716e469f6c5', '0.05', '0x8d8854cbd10444009376ddad1f3d99d6bde51c8339daaf62a461e218c14fcabe', 21000, 8654528, 8424811, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', 160, 371, '2025-05-28 12:38:37', '0x58c4b39bbd112ca3aede04be8192cc1c7e6e20fc8b500b696f0f27ffd4e1055a', '0x', 'success'),
(90, 'ETH', 11155111, 1082, '0x42645ce4dd0b766de53ee483cbf54bcea670f9b2', '0x7743171cfa8dbfc5763f17aaf34cc53675f96f53', '0.05', '0xfb4c0014ee78010033213eb2cf2904b5ede6e65c08cf2dc3e19e74f1ebf9d154', 21000, 561079366, 8438498, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', 187, 389, '2025-05-30 10:20:26', '0x09582cef0c8322b267413e09afe4f63333e00166dbdcb98f9ca3c1d8ceb1d6d9', '0x', 'success'),
(91, 'ETH', 11155111, 1090, '0x159ca92b12f67e5676d82c238f4906692618a555', '0xf2673368f5508bb8623a9ba9c4c2116110df222f', '0.05', '0xf7d75ec8174aa3841321627832ceeaa5be9bd54282a02d15e138ea120cf4be4e', 21000, 1000147, 8482612, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', 190, 391, '2025-06-05 13:37:02', '0x007f91989620fc8bd86566aa6d0e47f5cf32fc80e5a425368e2c220a58d645fe', '0x', 'success'),
(92, 'ETH', 11155111, 1117, '0x9a0c272bd8bb40edb2689bf48b395f8ecb561d55', '0xaa3702d2c4e19f9982ac8cf8e92ef5d3d487f4c7', '0.05', '0x7861c2f1633c59abb5c838ab10c301b7ff917ba1a9d4d38f1e97303ac1192a86', 21000, 19973046, 8518606, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', 193, 394, '2025-06-10 13:48:50', '0xfa54aef7f0a917a3a4eb936ad88b4244b48b5456788489d62d175cf570128889', '0x', 'success'),
(93, 'ETH', 11155111, 1113, '0x15095ec8fb1fc9c664b3223459dff43158ace7ad', '0x3fdac7271a5561a9d4a60f9f0b11a92ce9e9ee76', '0.05', '0x85c231c385670891ae1984d2901dd89ea346693bec63269d90b857e211e79803', 21000, 1935970, 8523819, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', 193, 394, '2025-06-11 07:26:35', '0x0752ce050a1725722afc890866f9f3a752f15d57ea556b5a3ee0c6799acec15f', '0x', 'success'),
(94, 'ETH', 11155111, 1109, '0xc0f3833b7e7216eecd9f6bc2c7927a7aa36ab58b', '0xb49acf606680fade083229a441b6fd08a479de25', '0.05', '0xe87d67d2832536f72b81256bdd4355317367216975cce7fcd393306c291042e5', 21000, 1942821, 8523837, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', 192, 393, '2025-06-11 07:26:36', '0x32c4fbf6f6bea737a4572b96c924366e489c358b82cfcbabceb85b004632008d', '0x', 'success'),
(95, 'ETH', 11155111, 1100, '0x95a13f457c76d10a40d7e8497ed4f40c53f4d04b', '0x0c59b96662a53c6b70de1fda139157a7adda86ea', '0.05', '0x870db3470b677937a1a26415ba5b16ab2432eee0da1dcd91c624c1c9b951e70d', 21000, 1746761, 8523864, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', 191, 392, '2025-06-11 07:26:37', '0xcb5e2a58b2cd9cd8053792de10317b462b7068cc4b81eaebc923e37ea5a9ddc6', '0x', 'success'),
(96, 'ETH', 11155111, 1101, '0x993a0f3653887078215914badcf039263293add9', '0x898b6241b6895f7a9ffed3297ab1ea3abd892a05', '0.05', '0x806dbf1a9784fc9b5b21bb6bbcdcdae7799259ff2fec7e63c9078aaccf4b27d7', 21000, 20563307, 8524029, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', 191, 392, '2025-06-11 07:54:26', '0xe36a9f33d65bf654bffc9ce53f5a4c8de8eeb41bc334292ece8fff8b9f29e49f', '0x', 'success'),
(97, 'ETH', 11155111, 848, '0x9a0c272bd8bb40edb2689bf48b395f8ecb561d55', '0xbed919e95acac77c046bf6c4ccd9f3c3e7ef0638', '0.05', '0xe9e732c0a4884077167d8108a47d8f61e8ad60cdff4318cbb5f2d135e0744adb', 21000, 8000822, 8524548, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', 140, 309, '2025-06-11 09:38:13', '0xc0ceb3e593ab0cfa4be6ea39e302f0b459f61d8b297a817287d9c3b06a6e9860', '0x', 'success'),
(98, 'SOL', NULL, 1123, '52mJt5oiJy8HwaYFkD5vqGJMDU64Vw4C68PqkNAkeazJ', NULL, '0.900005', '23oAvLY86HchzyfUiHa2hUixDfjTyijEFEtxsZoSFs1vPRCqJRMkRc99AFLA88kPhw56oU8T4VT6JH7HT8xUMiUq', NULL, NULL, NULL, NULL, 'TESTNET', 72, 308, '2025-06-12 06:40:56', '6LfsMWVZsJyUeRScUvvCqp6rSt3JQ6agCBHjmsJ2QMzJ', NULL, 'success'),
(99, 'ETH', 11155111, 1113, '0x3fdac7271a5561a9d4a60f9f0b11a92ce9e9ee76', '0xfff9976782d46cc05630d1f6ebab18b2324d6b14', '0.001', '0x367d2b82a78c0fee587d04e760e9e2e2147df36bc1d682af1c6d0e57fb99886a', 45418, 1896443, 8528089, 'Legacy (Type 0)', 'TESTNET', 193, 394, '2025-06-12 07:47:31', '0x6e0044bce2df1d4a0b4237d6fdf5aadb95ebe92e26293b8858f3c13ac5504428', '0xd0e30db0', 'success'),
(100, 'ETH', 11155111, 1134, '0xf192e0d79fc75134d6d291f6968d3a8de0c6f734', '0xd8e74ea50c9c3f252d8798ff9b18c8e5d04f2c51', '0.05', '0x90e60f1fcb2886510cda3708e94a675447bb0691c2957b5608e7a7d2fe77f987', 21000, 81699853, 8531876, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', 195, 396, '2025-06-12 10:06:26', '0x4c8249f633763e4478465863d1e52c51675294655a9b3dce47850ec391e9fbf7', '0x', 'success'),
(101, 'ETH', NULL, 1134, '0x1b2a13dc32a0227f8471da52e0cbb8e5e8a4f4e1', '0xd8e74ea50c9c3f252d8798ff9b18c8e5d04f2c51', '100', '0xd33564630795c138fbb89677b18ee63080d5518dd5c72376f3332fd897df1d97', 65676, NULL, 8531972, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', 195, 396, '2025-06-12 10:39:08', '0x9322959de0fcbb43e45b2d52e9414a0775096bf50f2c5b973bb2d81db85a7842', NULL, 'success'),
(102, 'ETH', 11155111, 1129, '0x42645ce4dd0b766de53ee483cbf54bcea670f9b2', '0xf03cdc12198940af29c50bbc022110679ddee5de', '0.05', '0x4105c31db4afab3c9384ac02c5f5c7033c3a618cd30d5d1a191ae65561713e87', 21000, 1000022, 8538272, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', 194, 395, '2025-06-13 07:27:49', '0x1a35668f4271cb53b8fa3bc646ea18b8d39b8c70894860c2337d617942941356', '0x', 'success'),
(103, 'BNB', 97, 1130, '0x43a151b0927dca5fbcb3c57d6c99546b352450af', '0xf83abc7744c5cf025c20419e9ec0779cf84ad10b', '0.5', '0xff4d9f850410ccdf67a8f2ace9d23f66b1ad5d577c54671d89e2ea1d9098e01b', 21000, 100000000000, 54640411, 'Legacy (Type 0)', 'TESTNET', 194, 395, '2025-06-13 10:12:05', '0x30fc8e43b916b098b63cb4cd224cddcf9835d89568656c4ea7763adc86afa7d7', '0x', 'success'),
(104, 'SOL', NULL, 1156, NULL, '6oxyQLykJURqkbLF5iQ98TL77t9i1vM14LX7JQCQy2pQ', '4', '2kBaTX882S9Ggw1W9FrfNGsqdjaxoVssfVXgCCQmjemVDvhbGrkmUfquF7oNpYNGHtpZF3TwVahBrqqVNC9qGm6T', NULL, NULL, NULL, NULL, 'TESTNET', 201, 400, '2025-06-13 12:43:20', 'GuGtQTnnvKbPhbCzw3f64FRUWWUSQjeAzircaWRK9k8T', NULL, 'success'),
(105, 'ETH', 11155111, 848, '0xbed919e95acac77c046bf6c4ccd9f3c3e7ef0638', '0xfff9976782d46cc05630d1f6ebab18b2324d6b14', '0.001', '0x8ebe6257095bdacb25599e296aeae83efc207872eeca2301165e9e201c0168a0', 45418, 1005080, 8559522, 'Legacy (Type 0)', 'TESTNET', 140, 309, '2025-06-16 06:24:51', '0xc5ed2735f0242c4c009f34ad7b72d276744a3572a47de1465880f867bdced231', '0xd0e30db0', 'success'),
(106, 'ETH', 11155111, 848, '0xbed919e95acac77c046bf6c4ccd9f3c3e7ef0638', '0xfff9976782d46cc05630d1f6ebab18b2324d6b14', '0', '0x022b199c0f9fea4448cd15031cad15b0234bacf8f9e4f1a50b3d3b60727842eb', 36175, 1004694, 8559531, 'Legacy (Type 0)', 'TESTNET', 140, 309, '2025-06-16 06:26:39', '0xd791f6e029ce7059d0884775d5da840272132eda32ef2a0d2f97f2e88fc2d4da', '0x2e1a7d4d00000000000000000000000000000000000000000000000000038d7ea4c68000', 'success'),
(107, 'SOL', NULL, 1156, NULL, '6oxyQLykJURqkbLF5iQ98TL77t9i1vM14LX7JQCQy2pQ', '4', '4h9iSFQ4SZHHzhWQf8r8VsySTT4FSh5rk9JojF3V7MqZ2A4vjdr4AZ8sRAE2iEq9yyZh1viyPZDNPBzxysfto8Zm', NULL, NULL, 339994771, 'NATIVE_SOL', 'TESTNET', 201, 400, '2025-06-16 10:11:58', 'CAfdV4rAzRKba3ug2QpEiC88Ldh9EpsC4xwbve1cVPE4', NULL, 'success'),
(108, 'SOL', NULL, 842, NULL, '5f4KeRzNgEHG4BuPkSqjeiJEkYn1PQRJjV5YXcPkB4jU', '4', '7KeiuaE3ByauC2Y1qAnY9jWjNwarypgWf7fcDuwYZwDHeJsUxwH3dpnQ3yEMwPbN1bzrUXCG3ahEZWb7oXWyZb8', NULL, NULL, 339997267, 'NATIVE_SOL', 'TESTNET', 138, 353, '2025-06-16 10:21:11', 'H8dypGG3Xj2tC3crpFnWyARBcgHMCcANWo2DGezEkNhG', NULL, 'success'),
(109, 'ETH', 11155111, 1178, '0x15095ec8fb1fc9c664b3223459dff43158ace7ad', '0x79e9de2844f7f0bc1e803907701e883fa3cc28d0', '0.05', '0x0827ce1380a936c00abca93fdf08e6a6a3b266041876fec0af91f9ee22c94cee', 21000, 1000060, 8582001, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', 206, 405, '2025-06-19 09:42:38', '0x89e6c3da1eee05207267bb683aeed4f98319def77a652a51138a1b25a86c0a7f', '0x', 'success'),
(110, 'BNB', 97, 1179, '0x43a151b0927dca5fbcb3c57d6c99546b352450af', '0xb5880b65595c263861accdaa54318c5d93b9dd7c', '0.5', '0x5edfb97885c8ec79cebb9a1bf3b1a64dd15dcbc6246553ccefe049181de2c541', 21000, 100000000000, 55329555, 'Legacy (Type 0)', 'TESTNET', 206, 405, '2025-06-19 09:46:24', '0x54ac8ef652aa3a74dc18dfa8acf0a6f9edf7fc3f570b83d90ea623e5118584ac', '0x', 'success'),
(111, 'SOL', NULL, 1180, NULL, '32U7rYuuraW3n2LxzNy4YvdTJw6Nnwo4JiNL48UvF6W4', '4', '34XaQNSSp1cA16id4ivuhK7Z7ZHwLJM2CiPYbHezQDz8DvGnPrt9QQhoV7HxbMNoszDYaudCFytEEzpY8Tu3H1bt', NULL, NULL, 340763172, 'NATIVE_SOL', 'TESTNET', 206, 405, '2025-06-20 08:49:29', 'BSaE7hY4wmzDWMfgkt9yVw7Ur2JRBr8mF6UnNKi3bYri', NULL, 'success'),
(112, 'ETH', 11155111, 1182, '0x95a13f457c76d10a40d7e8497ed4f40c53f4d04b', '0x8be2547c34696c89f363c77caf75e370e063f0f9', '0.05', '0x43d10956ff60c26ffab77770f0a8398747297537de7736131975e0a48bd4a419', 21000, 60068845, 8589114, 'Fee Market (Type 2, EIP-1559)', 'TESTNET', 207, 406, '2025-06-20 09:30:38', '0xdafae2e9b5f3fd32cb854d32cb767b8905140a221ad720663a955a7fec8f2452', '0x', 'success');

-- --------------------------------------------------------

--
-- Table structure for table `transactions_old`
--

CREATE TABLE `transactions_old` (
  `id` int NOT NULL,
  `chain` varchar(5) NOT NULL,
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
-- Dumping data for table `transactions_old`
--

INSERT INTO `transactions_old` (`id`, `chain`, `address_id`, `from_address`, `destination_address`, `amount`, `tx`, `data_insert`, `block_number`, `id_utente`, `network_type`, `wallet_id`) VALUES
(1, 'BTC', 189, 'mmFPovZLg82M7aGofEkm1ujtN3fFTAgtQh', '8hjy7a44m6gc0hpffa6pslgwwf3jdgtz46tursul', '0', 'tb1qk35a44m6gc0hpffa6pslgwwf3jdgtz46tur6ty', '2024-08-30 21:10:44', 12304, 191, 'MAINNET', 63),
(2, 'BNB', 189, 'mmFPovZLg82M7aGofEkm1ujtN3fFTAgtQh', '0x6b08ca1b43ff3c817679b31169fae85ec4857eac', '0.00001', '0xb19082d251be03ae2a0eff8a8ab084e3562eddd8fa1ff1d5ea05b57342aea866', '2025-02-12 13:31:53', NULL, 191, 'TESTNET', 70),
(13, 'SOL', 188, 'CgoNT8Cq2od7PDstDE7sqTrvnv41UrPsEpMz7N83tWtg', '0x6b08ca1b43ff3c817679b31169fae85ec4857eac', '0.0001', '3DSd41KQPbH3nQMBAuWrjMxN1beKE1N2RYb7Ry319ADaymSYYW9E3JmzJMMMg8nRaBqCxQ9BLDV4t4yejXJmwNfi', '2025-01-12 19:15:00', NULL, 191, 'TESTNET', 70),
(14, 'ETH', 188, 'CgoNT8Cq2od7PDstDE7sqTrvnv41UrPsEpMz7N83tWtg', '0x0d076b0d109574d06b9cd8419c5710e827e03809', '0.00001', '0x26ef4a4cef13311e3bc23fdbf85ba7ab0fa41ba7c42325eca14fc4fcfe501d85', '2025-01-09 19:05:46', NULL, 191, 'TESTNET', 63),
(15, 'ETH', 187, '0x6b08ca1b43ff3c817679b31169fae85ec4857eac', 'mmFPovZLg82M7aGofEkm1ujtN3fFTAgtQh', '0.00001', '0x58bb576a264231a98aac18dad98043b8911ac6496e80952f1a8ae89762b27989', '2024-09-03 19:07:49', NULL, 191, 'TESTNET', 63),
(16, 'ETH', 187, '0x6b08ca1b43ff3c817679b31169fae85ec4857eac', '0x0d076b0d109574d06b9cd8419c5710e827e03809', '0.00001', '0xfd404d818eb246ba7d7790acc3440498f3f7fefe2bcb01bdb65e168ab60e842c', '2024-09-03 19:10:38', NULL, 191, 'TESTNET', 70),
(17, 'ETH', 187, '0x6b08ca1b43ff3c817679b31169fae85ec4857eac', 'mt86rNfisPu9qFdhqpRo7w8dQa3ups7TRB', '0.0001', '0x525626858685c381250e3394b713a9a30b87588f5082c40db005e672e9c139f6', '2024-09-03 19:13:39', NULL, 191, 'TESTNET', 70),
(18, 'BNB', 186, '0xf430fc5b609cc6461a15191d9d94166b1105a2ba', 'mt86rNfisPu9qFdhqpRo7w8dQa3ups7TRB', '0.000001', '0x4ef5ad2a795a2ea1630ec8760326fe00f40b4c2923f24c80fdd0d55a8b1fb27e', '2024-09-03 19:25:56', NULL, 191, 'TESTNET', 70),
(19, 'ETH', 186, '0xf430fc5b609cc6461a15191d9d94166b1105a2ba', 'mt86rNfisPu9qFdhqpRo7w8dQa3ups7TRB', '0.001', '0x062d236ccc044f68194a04008e98c3823271dc26160a4db9ae9303f9ecfc7bf6', '2024-09-20 20:35:59', 2913059, 191, 'TESTNET', 70),
(20, 'ETH', 186, '0xf430fc5b609cc6461a15191d9d94166b1105a2ba', 'mt86rNfisPu9qFdhqpRo7w8dQa3ups7TRB', '0.05', '0xb64f0bdd393f73038bf8a06432ecac96f6307c94f84156a3eec10ef3a1b794c7', '2024-09-23 12:21:29', 6743697, 191, 'TESTNET', 70),
(26, 'ETH', 186, '0xf430fc5b609cc6461a15191d9d94166b1105a2ba', '0xe560ca09958bdb05b776676351114811ad101e47', '0.05', '0xffae22b6fddbdd4e1034c42d6f1f70c69c6096e0f6b4ab0d74b09c08148376f2', '2024-09-24 19:32:04', 6751452, 96, 'TESTNET', 70),
(45, 'ETH', 363, '0x6b350584508b83eba17c42b8c1631356955ccc', '0x0d076b0d109574d06b9cd8419c5710e82', '0.001', '0x062d236ccc044f68194a04008e98c3823271dc26160a4db9ae9303f9ecf', '2024-09-26 12:53:08', 2913059, 96, 'TESTNET', 63),
(55, 'ETH', 416, '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0x055ed104f913e754575d9e6412e213e3a7cbfd38', '0.0001', '0x53b0bd003145e6321b874baa52421d94e68c7563912ab2a87c5f02e7b90543df', '2024-10-15 12:21:01', NULL, 96, 'TESTNET', 63),
(57, 'ETH', 363, '0x6b350584508b83eba17c42b8c1631356955ccc22', '0x0d076b0d109574d06b9cd8419c5710e827e03809', '0.001', '0x062d236ccc044f68194a04008e98c3823271dc26160a4db9ae9303f9ecfc76', '2024-10-17 20:36:10', 2913059, 96, 'TESTNET', 63),
(59, 'ETH', 454, '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0.0001', '0x304a5fb507f6372f5da3d5ac0181587b83a0d0639d926be4571cc27d8b0b7154', '2024-10-25 13:06:42', NULL, 137, 'TESTNET', 63),
(60, 'ETH', 454, '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0.0001', '0x6dc18ece9e6036fae6d46f016cd547edd0d8cb775028ced378217490c69ce9ef', '2024-10-25 13:28:34', NULL, 137, 'TESTNET', 63),
(67, 'ETH', 454, '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0.0001', '0x2a2914ec6297c93ddf841358a2f18118b362a1489ee9610194ceb2287212e828', '2024-10-25 13:39:29', NULL, 137, 'TESTNET', 63),
(74, 'ETH', 454, '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0.0001', '0xe0636867393cf694ba53191986f83bbf53a6104cc340d061ec0521a97bcf67c6', '2024-10-25 13:42:34', NULL, 137, 'TESTNET', 70),
(79, 'ETH', 454, '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0.0001', '0x26c0c00e620b46f729849c2732a44981c9266f0a9cd2833cb4132210f937ec07', '2024-10-25 13:44:54', 6941458, 137, 'TESTNET', 70),
(85, 'ETH', 454, '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0.0001', '0x9f351c0e77e9b694c14ac1146ec7d19ec231958d60427f42bee1d50360ef284f', '2024-10-25 15:36:21', 6941986, 137, 'TESTNET', 63),
(89, 'ETH', 454, '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0x041fa7ec6a5222c43796c0be0f78612763c9aa6b', '0.0001', '0xe480173e6a8415a3ab2283dbc5d861fcc36731740ade95a01a432eac5406e7fa', '2024-10-25 15:55:55', 6942080, 137, 'TESTNET', 63),
(93, 'ETH', 459, '0xcc8d0e019e9cb3ca769fd561d2daf77a9fe75d1d', '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0.0001', '0xb35543f3d695804f417d47a5532a1b8294f6bb3b44c77b56a381b7d859e963bc', '2024-10-25 16:36:24', 6942268, 136, 'TESTNET', 70),
(97, 'ETH', 467, '0x0deae8fe2f2c6c46ae61b72a11d5a9650e8dc5e9', '0x2e68ba762524b03599d5cc00a4c6791966520a59', '0.001', '0x263d438104c3a77751267cbbfe94e5dec34a65eead165a2061ed38ba1a465a92', '2024-10-25 18:06:10', 6942686, 136, 'TESTNET', 70),
(100, 'ETH', 293, '0x4b852ec317a7d0e5f6408be66ed14232290b3397', '0x66e365114f255dccf66186a28976eb98208a2fc2', '0.0001', '0xb3e174badc58d78dcdaabc48c68e7d835fcb9cf3c958155da89eaf2f012a6f42', '2025-03-03 18:53:13', NULL, 219, 'TESTNET', 88),
(101, 'BTC', 240, 'n1FiqwarjGPW9mpGHS3uSXcUHdRj6HYkYd', '8hjy7a44m6gc0hpffa6pslgwwf3jdgtz46tursul', '0', '0x307b577620fcd1d657ee3f05c6c58a4ac699e739fbe693ecb82c50a34f724d9c', '2025-03-24 15:50:50', 12304, 193, 'TESTNET', 77),
(102, 'ETH', 584, '0x8010c65dbbd78550c3f498eec88b65f461081fe2', '0x9d702fb6b1b5b63af262f67ce4ada93021c9d1cb', '0.0001', '0xad5729c92c9d476697ec2e66bf31048649835442e3d4b94001d9a08fe0b23617', '2025-04-15 16:42:27', NULL, 305, 'TESTNET', 69),
(104, 'ETH', 615, '0x8010c65dbbd78550c3f498eec88b65f461081fe2', '0x611a90dfcb9866480cb713e34b0febb333502d2d', '0.0000003', '0x0ad281e1d85f942773bd243041b1c99f06950cf049426a4235e8d96cdb564cea', '2025-04-15 17:09:51', NULL, 308, 'TESTNET', 72),
(105, 'ETH', 615, '0x8010c65dbbd78550c3f498eec88b65f461081fe2', '0x611a90dfcb9866480cb713e34b0febb333502d2d', '0.0000009', '0x0ad281e1d85f942773bd243041b1c99f06950cf049426a4235e8d96cdb564cea', '2025-04-15 17:09:51', NULL, 308, 'TESTNET', 72),
(106, 'ETH', 615, '0x8010c65dbbd78550c3f498eec88b65f461081fe2', '0x611a90dfcb9866480cb713e34b0febb333502d2d', '0.0090', '0x0ad281e1d85f942773bd243041b1c99f06950cf049426a4235e8d96cdb564cea', '2025-03-05 17:09:51', NULL, 308, 'TESTNET', 72),
(107, 'SOL', 615, '0x8010c65dbbd78550c3f498eec88b65f461081fe2', '0x611a90dfcb9866480cb713e34b0febb333502d2d', '0.00008', '0x0ad281e1d85f942773bd243041b1c99f06950cf049426a4235e8d96cdb564cea', '2025-04-15 17:09:51', NULL, 308, 'TESTNET', 72),
(108, 'BTC', 615, '0x8010c65dbbd78550c3f498eec88b65f461081fe2', '0x611a90dfcb9866480cb713e34b0febb333502d2d', '0.008', '0x0ad281e1d85f942773bd243041b1c99f06950cf049426a4235e8d96cdb564cea', '2025-04-15 17:09:51', NULL, 308, 'TESTNET', 72),
(109, 'BNB', 615, '0x8010c65dbbd78550c3f498eec88b65f461081fe2', '0x611a90dfcb9866480cb713e34b0febb333502d2d', '0.00007', '0x0ad281e1d85f942773bd243041b1c99f06950cf049426a4235e8d96cdb564cea', '2025-03-09 17:09:51', NULL, 308, 'TESTNET', 72),
(110, 'BNB', 615, '0x8010c65dbbd78550c3f498eec88b65f461081fe2', '0x611a90dfcb9866480cb713e34b0febb333502d2d', '0.007', '0x0ad281e1d85f942773bd243041b1c99f06950cf049426a4235e8d96cdb564cea', '2025-03-12 17:09:51', NULL, 308, 'TESTNET', 72),
(111, 'ETH', 615, '0x8010c65dbbd78550c3f498eec88b65f461081fe2', '0x611a90dfcb9866480cb713e34b0febb333502d2d', '0.006', '0x0ad281e1d85f942773bd243041b1c99f06950cf049426a4235e8d96cdb564cea', '2025-04-15 17:09:51', NULL, 308, 'TESTNET', 72),
(112, 'SOL', 615, '0x8010c65dbbd78550c3f498eec88b65f461081fe2', '0x611a90dfcb9866480cb713e34b0febb333502d2d', '0.005', '0x0ad281e1d85f942773bd243041b1c99f06950cf049426a4235e8d96cdb564cea', '2025-04-15 17:09:51', NULL, 308, 'TESTNET', 72),
(113, 'ETH', 615, '0x8010c65dbbd78550c3f498eec88b65f461081fe2', '0x611a90dfcb9866480cb713e34b0febb333502d2d', '0.003', '0x0ad281e1d85f942773bd243041b1c99f06950cf049426a4235e8d96cdb564cea', '2025-04-15 17:09:51', NULL, 308, 'TESTNET', 72),
(114, 'BTC', 615, '0x8010c65dbbd78550c3f498eec88b65f461081fe2', '0x611a90dfcb9866480cb713e34b0febb333502d2d', '0.000001', '0x0ad281e1d85f942773bd243041b1c99f06950cf049426a4235e8d96cdb564cea', '2025-04-02 17:09:51', NULL, 308, 'TESTNET', 72),
(115, 'ETH', 615, '0x8010c65dbbd78550c3f498eec88b65f461081fe2', '0x611a90dfcb9866480cb713e34b0febb333502d2d', '0.002', '0x0ad281e1d85f942773bd243041b1c99f06950cf049426a4235e8d96cdb564cea', '2025-03-13 17:09:51', NULL, 308, 'TESTNET', 72);

-- --------------------------------------------------------

--
-- Table structure for table `transaction_notifications`
--

CREATE TABLE `transaction_notifications` (
  `id` int NOT NULL,
  `notification_title` text COLLATE utf8mb4_general_ci NOT NULL,
  `notification_body` text COLLATE utf8mb4_general_ci NOT NULL,
  `user_id` int NOT NULL,
  `wallet_id` int NOT NULL,
  `chain` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transaction_notifications`
--

INSERT INTO `transaction_notifications` (`id`, `notification_title`, `notification_body`, `user_id`, `wallet_id`, `chain`, `created_at`) VALUES
(1, 'Transaction Received', 'The transaction successfully received 0.01 ETH from address 0x473aaffcb6542aab9322dcc76426b0184d5df6de.\r\nTransaction ID: 0x473aaffcb6542aab9322dcc76426b0184d5df6de.', 329, 113, 'ETH', '2025-04-24 14:32:38'),
(2, 'Transaction Sent', 'The transaction successfully sent 0.01 ETH to address 0x2ffe050467859eff566ca88e2e594c970e45011d.\r\nTransaction ID: 0x72d60e96f33950fe421b43c8690c6b9f40a30a4a652fc08f46abf5f96c1de6f2', 329, 113, 'ETH', '2025-04-24 14:32:38'),
(18, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0x6efb29cee3b414272eb7a8f3ebabf873d36bc033.\n        Transaction ID: 0xceb1d76c9cbe5af882aa5b0b9262b63e8823905142359aef3340d2d23972b103.', 329, 113, 'ETH', '2025-04-25 05:58:20'),
(19, 'Transaction Sent', 'The transaction successfully sent 0.62499375 SOL to address 36zErnEjGTFAJ58FD5cMrWb455BMwUtFJGCcZP3jqYxC.\n        Transaction ID: 5HHrKcAE5txb9xWLGYb2QZfb98igrKvwfu89c8RMpyHab4yYNoSAeUm9x7G7dVW6U1jJxAGMoSxkbeoNPU91etiD', 329, 113, 'SOL', '2025-04-25 05:58:24'),
(20, 'Transaction Received', 'The transaction successfully received 0.62499375 SOL from address DgD24mvLSe3rzkFPLXff9DUDqG6ZxG3nxnmYaRDdtpw4.\n        Transaction ID: 5HHrKcAE5txb9xWLGYb2QZfb98igrKvwfu89c8RMpyHab4yYNoSAeUm9x7G7dVW6U1jJxAGMoSxkbeoNPU91etiD.', 329, 113, 'SOL', '2025-04-25 05:58:24'),
(21, 'Transaction Sent', 'The transaction successfully sent 0.001 SOL to address DgD24mvLSe3rzkFPLXff9DUDqG6ZxG3nxnmYaRDdtpw4.\n        Transaction ID: 2skZLsU9KZdypE9f3AZS8MgPZrgyk3e8AqbuxW8MGWzpTG72HVDzfy9TRG1oYqiK1VHPBe9rauDgzoZxmkBWx238', 329, 113, 'SOL', '2025-04-25 06:48:38'),
(22, 'Transaction Received', 'The transaction successfully received 0.001 SOL from address 36zErnEjGTFAJ58FD5cMrWb455BMwUtFJGCcZP3jqYxC.\n        Transaction ID: 2skZLsU9KZdypE9f3AZS8MgPZrgyk3e8AqbuxW8MGWzpTG72HVDzfy9TRG1oYqiK1VHPBe9rauDgzoZxmkBWx238.', 329, 113, 'SOL', '2025-04-25 06:48:38'),
(23, 'Transaction Sent', 'The transaction successfully sent 0.0001 ETH to address 0x3b3e80a176eb51ef8ff47368dcb30b8b3b3d4624.\n        Transaction ID: 0xefcd7dcfa1ba02657ecb73d4b50674cc9ab2333086a577c79df67d77b3e7ebc0', 329, 113, 'ETH', '2025-04-25 09:41:01'),
(24, 'Transaction Received', 'The transaction successfully received 0.0001 ETH from address 0xa9ff068390bb668ff56f7d372f01ac1799c3bffa.\n        Transaction ID: 0xefcd7dcfa1ba02657ecb73d4b50674cc9ab2333086a577c79df67d77b3e7ebc0.', 329, 113, 'ETH', '2025-04-25 09:41:01'),
(25, 'Transaction Sent', 'The transaction successfully sent 0.001 ETH to address 0xfff9976782d46cc05630d1f6ebab18b2324d6b14.\n        Transaction ID: 0x4a23353ce9fec6b70715eb11bfa2fc881050ffdf6e83d8fca0ab6b64db419298', 329, 113, 'ETH', '2025-04-25 09:41:01'),
(26, 'Transaction Sent', 'The transaction successfully sent 0.001 ETH to address 0xfff9976782d46cc05630d1f6ebab18b2324d6b14.\n        Transaction ID: 0x0295d455abc0f8c9e3dcd39fc894cb1ae2df531a16f365bf9f1f214ddac71978', 329, 113, 'ETH', '2025-04-25 09:41:01'),
(27, 'Transaction Sent', 'The transaction successfully sent 0.001 ETH to address 0xfff9976782d46cc05630d1f6ebab18b2324d6b14.\n        Transaction ID: 0x70bd28b74ce96d21be039130f1b2f7a7c4eacff872683b9e5ac373e744bfbe24', 329, 113, 'ETH', '2025-04-25 09:41:02'),
(28, 'Transaction Sent', 'The transaction successfully sent 0.01093154 ETH to address 0xce7da8f009bd9b2982db9207ad11b1ea3157fd77.\n        Transaction ID: 0xde434cec16e54a972f055940ff9a51ef764708c733245215dd4d3b48bfb9b839', 329, 113, 'ETH', '2025-04-28 07:07:37'),
(29, 'Transaction Received', 'The transaction successfully received 0.01093154 ETH from address 0xa9ff068390bb668ff56f7d372f01ac1799c3bffa.\n        Transaction ID: 0xde434cec16e54a972f055940ff9a51ef764708c733245215dd4d3b48bfb9b839.', 329, 110, 'ETH', '2025-04-28 07:07:37'),
(30, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0x42645ce4dd0b766de53ee483cbf54bcea670f9b2.\n        Transaction ID: 0x31049bfbe67c5dfba9e42e8a6c71fc107e78e5e2540723fd9642511c3daa2e89.', 348, 124, 'ETH', '2025-04-29 09:22:37'),
(31, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0xe560ca09958bdb05b776676351114811ad101e47.\n        Transaction ID: 0xf5dfec2c11dc916a8b524d68d061f27e31e32096be19d814d39ada35e0ddb6c1.', 361, 149, 'ETH', '2025-05-07 11:44:13'),
(32, 'Transaction Received', 'The transaction successfully received 0.0675948 ETH from address 0x6cc9397c3b38739dacbfaa68ead5f5d77ba5f455.\n        Transaction ID: 0xb1ba0af145a7c1040f1d1c8e55b2fe2380a48ab533b026166b856163b1b40d64.', 363, 151, 'ETH', '2025-05-07 13:28:26'),
(33, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0x6efb29cee3b414272eb7a8f3ebabf873d36bc033.\n        Transaction ID: 0x6af77ccb3c1ec6fc79f12ca681cb6534ebbab338463817b076073aa8bb9c3455.', 365, 153, 'ETH', '2025-05-07 15:01:14'),
(34, 'Transaction Sent', 'The transaction successfully sent 0.0125 ETH to address 0xd1731a32f639cf9786d2690d3d2899033fa4207f.\n        Transaction ID: 0x3eb3a93cbfac5ed26323896971f98bf10cf12cc1d1d2ec940bd1a5b1099a03f4', 365, 153, 'ETH', '2025-05-07 15:07:01'),
(35, 'Transaction Received', 'The transaction successfully received 0.0125 ETH from address 0xa8d6d518692770abc29800c88e51ddeb655e08ee.\n        Transaction ID: 0x3eb3a93cbfac5ed26323896971f98bf10cf12cc1d1d2ec940bd1a5b1099a03f4.', 365, 153, 'ETH', '2025-05-07 15:07:02'),
(36, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0xb2de751d22adfb449e95da3c1e8836c6c61b537d.\n        Transaction ID: 0xcb3fc01fd4306276982a63ef11f21bbee9fea4399d09629a0b0c6a41774b1bef.', 364, 152, 'ETH', '2025-05-08 06:02:01'),
(37, 'Transaction Sent', 'The transaction successfully sent 0.01 ETH to address 0xa09b658e9d574d7b3d62b50d1f2cc33a4c9afa89.\nTransaction ID: 0x303d2e1d5a5538109623ace7961efbf1ee08cec9dd2f74b60d1188e66892eac9', 364, 152, 'ETH', '2025-05-08 06:24:13'),
(38, 'Transaction Received', 'The transaction successfully received 0.01 ETH from address 0x829c4d1653a4e088db4b6a217f096651d5536f88.\nTransaction ID: 0x303d2e1d5a5538109623ace7961efbf1ee08cec9dd2f74b60d1188e66892eac9.', 364, 152, 'ETH', '2025-05-08 06:24:13'),
(39, 'Transaction Sent', 'The transaction successfully sent 0.01 ETH to address 0xa09b658e9d574d7b3d62b50d1f2cc33a4c9afa89.\nTransaction ID: 0x54badba2cb8f458b5942e13e95e07a4da595f9bb37c44c812738540fec1bf64a', 364, 152, 'ETH', '2025-05-08 06:27:37'),
(40, 'Transaction Received', 'The transaction successfully received 0.01 ETH from address 0x829c4d1653a4e088db4b6a217f096651d5536f88.\nTransaction ID: 0x54badba2cb8f458b5942e13e95e07a4da595f9bb37c44c812738540fec1bf64a.', 364, 152, 'ETH', '2025-05-08 06:27:37'),
(41, 'Transaction Sent', 'The transaction successfully sent 0.01 ETH to address 0xa09b658e9d574d7b3d62b50d1f2cc33a4c9afa89.\nTransaction ID: 0xac55f6c7133018c672234188a8dc665b818b4bc49e380296c32b5adb0ae6bb40', 364, 152, 'ETH', '2025-05-08 09:29:58'),
(42, 'Transaction Received', 'The transaction successfully received 0.01 ETH from address 0x829c4d1653a4e088db4b6a217f096651d5536f88.\nTransaction ID: 0xac55f6c7133018c672234188a8dc665b818b4bc49e380296c32b5adb0ae6bb40.', 364, 152, 'ETH', '2025-05-08 09:29:58'),
(43, 'Transaction Sent', 'The transaction successfully sent 0.01 ETH to address 0x829c4d1653a4e088db4b6a217f096651d5536f88.\nTransaction ID: 0xb91f6247660977f5025c6e95db045f5c9a7cb305b6aa59bc84d942ca9b764a31', 364, 152, 'ETH', '2025-05-08 09:29:59'),
(44, 'Transaction Received', 'The transaction successfully received 0.01 ETH from address 0xa09b658e9d574d7b3d62b50d1f2cc33a4c9afa89.\nTransaction ID: 0xb91f6247660977f5025c6e95db045f5c9a7cb305b6aa59bc84d942ca9b764a31.', 364, 152, 'ETH', '2025-05-08 09:29:59'),
(45, 'Transaction Sent', 'The transaction successfully sent 0.01 ETH to address 0x829c4d1653a4e088db4b6a217f096651d5536f88.\nTransaction ID: 0x173adbca6dedbb4c5a6197666ab00978c58a34d31b65318155d39cb2f3b7c257', 364, 152, 'ETH', '2025-05-08 09:30:01'),
(46, 'Transaction Received', 'The transaction successfully received 0.01 ETH from address 0x829c4d1653a4e088db4b6a217f096651d5536f88.\nTransaction ID: 0x173adbca6dedbb4c5a6197666ab00978c58a34d31b65318155d39cb2f3b7c257.', 364, 152, 'ETH', '2025-05-08 09:30:01'),
(47, 'Transaction Sent', 'The transaction successfully sent 0.01 ETH to address 0xa09b658e9d574d7b3d62b50d1f2cc33a4c9afa89.\nTransaction ID: 0x4687bf74399dda455d00cf208b7592a6ce0b144e0e64f8e9ee74fe38e5df5b4a', 364, 152, 'ETH', '2025-05-08 09:31:27'),
(48, 'Transaction Received', 'The transaction successfully received 0.01 ETH from address 0x829c4d1653a4e088db4b6a217f096651d5536f88.\nTransaction ID: 0x4687bf74399dda455d00cf208b7592a6ce0b144e0e64f8e9ee74fe38e5df5b4a.', 364, 152, 'ETH', '2025-05-08 09:31:27'),
(49, 'Transaction Sent', 'The transaction successfully sent 0.01 ETH to address 0xa09b658e9d574d7b3d62b50d1f2cc33a4c9afa89.\nTransaction ID: 0x59af79cafa43d3a9bbfacdeae097ca4f4727a5d4a9612015e651d510571c5871', 364, 152, 'ETH', '2025-05-08 09:37:38'),
(50, 'Transaction Received', 'The transaction successfully received 0.01 ETH from address 0x829c4d1653a4e088db4b6a217f096651d5536f88.\nTransaction ID: 0x59af79cafa43d3a9bbfacdeae097ca4f4727a5d4a9612015e651d510571c5871.', 364, 152, 'ETH', '2025-05-08 09:37:38'),
(51, 'Transaction Sent', 'The transaction successfully sent 0.01 ETH to address 0x4c5b17d7c9cfee4a9f4bfa8fd3d2e2145f83d345.\nTransaction ID: 0xb1b651411da7dee94c3967320fdb0da10da56f49f0aeb0ce1cf5e8483adbd5bf', 364, 152, 'ETH', '2025-05-08 12:07:37'),
(52, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0x15095ec8fb1fc9c664b3223459dff43158ace7ad.\nTransaction ID: 0x340e8e2e4e5474fcee754fd84c0289da603f7432f08b1b46111984489ed95016.', 366, 154, 'ETH', '2025-05-08 14:34:27'),
(53, 'Transaction Sent', 'The transaction successfully sent 0.01 ETH to address 0x7a93901f6a63f16f656d47b84cf9a1d0fb9087e4.\nTransaction ID: 0xd75902aa58bd4216d819d17f6d293ced000940e31f6353081a0d76b9182bf5fc', 366, 154, 'ETH', '2025-05-08 14:36:01'),
(54, 'Transaction Received', 'The transaction successfully received 0.01 ETH from address 0x62b39cf902c7e3e540062adb91070e1d0accd0d3.\nTransaction ID: 0xd75902aa58bd4216d819d17f6d293ced000940e31f6353081a0d76b9182bf5fc.', 366, 154, 'ETH', '2025-05-08 14:36:01'),
(55, 'Transaction Sent', 'The transaction successfully sent 0.0025 ETH to address 0x611a90dfcb9866480cb713e34b0febb333502d2d.\nTransaction ID: 0x53fa08a6fa9d6e77ae1c25ccb9d231da8d35adf9e546782569a979a71c8a1a3d', 308, 72, 'ETH', '2025-05-13 12:31:49'),
(56, 'Transaction Received', 'The transaction successfully received 0.0025 ETH from address 0xf4bc58f1682e1218a7f2d5d7d031248f8e7ef771.\nTransaction ID: 0x53fa08a6fa9d6e77ae1c25ccb9d231da8d35adf9e546782569a979a71c8a1a3d.', 308, 72, 'ETH', '2025-05-13 12:31:50'),
(57, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0xb2de751d22adfb449e95da3c1e8836c6c61b537d.\nTransaction ID: 0x0bff758de4a803976e8067b43a7142b35d6e03137451cfcf4b722eaf2162cd94.', 371, 159, 'ETH', '2025-05-14 09:38:02'),
(58, 'Transaction Sent', 'The transaction successfully sent 0.02 ETH to address 0x0e18f05dd91d5b9755db7666b7c2e0b161664b3f.\nTransaction ID: 0xdef7d33e499a133f544d1908049e8ad77f1c8deaa07a32990c55af2b8d3eecec', 371, 159, 'ETH', '2025-05-14 09:43:49'),
(59, 'Transaction Received', 'The transaction successfully received 0.02 ETH from address 0xa2e0f0fb522156e511a3a4f2f62060e9794c1c58.\nTransaction ID: 0xdef7d33e499a133f544d1908049e8ad77f1c8deaa07a32990c55af2b8d3eecec.', 371, 159, 'ETH', '2025-05-14 09:43:50'),
(60, 'Transaction Sent', 'The transaction successfully sent 0.01 ETH to address 0x0e18f05dd91d5b9755db7666b7c2e0b161664b3f.\nTransaction ID: 0x6dd45c0678a4aae090c7d96e3a6a9139dbdec6b5fc90b10313f6114213b0a4b6', 371, 159, 'ETH', '2025-05-14 13:05:13'),
(61, 'Transaction Received', 'The transaction successfully received 0.01 ETH from address 0xa2e0f0fb522156e511a3a4f2f62060e9794c1c58.\nTransaction ID: 0x6dd45c0678a4aae090c7d96e3a6a9139dbdec6b5fc90b10313f6114213b0a4b6.', 371, 159, 'ETH', '2025-05-14 13:05:13'),
(62, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0xcbf16fed20967280a8b53299dc7dd6bd857d7e9c.\nTransaction ID: 0x419468febc13905d3cf07a96c2d28c8744542dfb1ac5c6cce63c0e8ac92d3c36.', 385, 182, 'ETH', '2025-05-19 07:56:13'),
(63, 'Transaction Sent', 'The transaction successfully sent 0.01 ETH to address 0xb0b154f008f43ab074e729ffc6c2a6a319089dee.\nTransaction ID: 0xf7f4d93598a622b91ef4c9c5555992e9bcaefcca7b50f30da6346ce83effa0a6', 385, 182, 'ETH', '2025-05-19 07:57:25'),
(64, 'Transaction Received', 'The transaction successfully received 0.01 ETH from address 0xdfa729299d49f781dc865a773f6b673d1399db7a.\nTransaction ID: 0xf7f4d93598a622b91ef4c9c5555992e9bcaefcca7b50f30da6346ce83effa0a6.', 385, 182, 'ETH', '2025-05-19 07:57:25'),
(65, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0x993a0f3653887078215914badcf039263293add9.\nTransaction ID: 0x4f270c007566b1bf3aa45d44cc4e265f72a9ab8096beb2e6b6526b54ac89ba14.', 386, 183, 'ETH', '2025-05-19 09:17:26'),
(66, 'Transaction Sent', 'The transaction successfully sent 0.01 ETH to address 0xf1afc1ce5109b9e1664e85c8655c218212dc0b50.\nTransaction ID: 0xb384b811751574c5201d7aa7ffc13036a163bf727d7c39ead0816785aa0a23b9', 386, 183, 'ETH', '2025-05-19 09:20:02'),
(67, 'Transaction Received', 'The transaction successfully received 0.01 ETH from address 0x1b7c8596bf31ffda6fb65fbcfc6ebe8cefd76099.\nTransaction ID: 0xb384b811751574c5201d7aa7ffc13036a163bf727d7c39ead0816785aa0a23b9.', 386, 183, 'ETH', '2025-05-19 09:20:02'),
(68, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0x95a13f457c76d10a40d7e8497ed4f40c53f4d04b.\nTransaction ID: 0x1bffe5a496bf216d00a28e9dc4246552a48653bd7977a775cea9cc4a7c1d698e.', 381, 178, 'ETH', '2025-05-19 15:33:26'),
(69, 'Transaction Sent', 'The transaction successfully sent 0.001 ETH to address 0xca5ab00b9b844ccd5036a0a372c5890a4175bd1e.\nTransaction ID: 0xc536e18e83f91a51d3c6683298057d31cf1b3345e79ebb6355c766bbc33ec5eb', 381, 178, 'ETH', '2025-05-19 15:36:03'),
(70, 'Transaction Sent', 'The transaction successfully sent 0.005 ETH to address 0xca5ab00b9b844ccd5036a0a372c5890a4175bd1e.\nTransaction ID: 0x848262e229ef685901ee69a984233319970f00d052ad216b805ac09c20e78ca9', 381, 178, 'ETH', '2025-05-26 19:11:14'),
(71, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0x993a0f3653887078215914badcf039263293add9.\nTransaction ID: 0xbfdba346d23c6df46b970cea34f45743f2859708f5c5b3de71e1835828d560f4.', 371, 160, 'ETH', '2025-05-28 11:07:38'),
(72, 'Transaction Sent', 'The transaction successfully sent 0.02 ETH to address 0x370922d36135fb53a078240a1acf7d868bc581b3.\nTransaction ID: 0x8be277fbbb8e6bc5ffbb812eda8827cec31f7b36d6dad65ba4ef7f6951c7713c', 371, 160, 'ETH', '2025-05-28 11:10:50'),
(73, 'Transaction Received', 'The transaction successfully received 0.02 ETH from address 0xbc27c0ab1e8e05d6179d625b219aae26aa38e3a9.\nTransaction ID: 0x8be277fbbb8e6bc5ffbb812eda8827cec31f7b36d6dad65ba4ef7f6951c7713c.', 371, 160, 'ETH', '2025-05-28 11:10:50'),
(74, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0x52f1984cd3e46e1214db222d3ff63712e7aceedd.\nTransaction ID: 0x8bedfefcd803f34ea37ec26a2adb3fb41978c784d3105602f653c1780f4a69e9.', 371, 160, 'ETH', '2025-05-28 11:47:14'),
(75, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0x9484449f2be7cd6e01ef55bc5438c733e0759e0f.\nTransaction ID: 0x8a7ba84ab1f40445799c6d0671fc6afd00c6536360583957735f87b8f94908c2.', 371, 160, 'ETH', '2025-05-28 11:53:01'),
(76, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0xc0f3833b7e7216eecd9f6bc2c7927a7aa36ab58b.\nTransaction ID: 0x64da24fe9f778269a8366eac9f19c11303ac269ef69aafd935d784011d0f8d83.', 371, 160, 'ETH', '2025-05-28 11:56:02'),
(77, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0xcbf16fed20967280a8b53299dc7dd6bd857d7e9c.\nTransaction ID: 0x9643d0bdb325296f1d6d4f723a62fe97052230fb36c960ca5e8752ebe923ef7d.', 371, 160, 'ETH', '2025-05-28 12:07:25'),
(78, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0x52f1984cd3e46e1214db222d3ff63712e7aceedd.\nTransaction ID: 0xa13b0b04cf1486fb2c234948df24a07ef2f07b28224086a363f7b61302922090.', 371, 160, 'ETH', '2025-05-28 12:20:26'),
(79, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0xcbf16fed20967280a8b53299dc7dd6bd857d7e9c.\nTransaction ID: 0xb41c4f2fe9c5f44714b2c3776f8713ecbf9b124c3072c8a22112ee3fd8cec8e2.', 371, 160, 'ETH', '2025-05-28 12:27:37'),
(80, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0x159ca92b12f67e5676d82c238f4906692618a555.\nTransaction ID: 0x0e62bab83200ad1bafdd5f4061ddc7b951ea928d038f5e5859b9786cb56c39be.', 371, 160, 'ETH', '2025-05-28 12:33:25'),
(81, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0xafeda61db9e162293b2ef2c2bc5a800b37bb5e4a.\nTransaction ID: 0x8d8854cbd10444009376ddad1f3d99d6bde51c8339daaf62a461e218c14fcabe.', 371, 160, 'ETH', '2025-05-28 12:38:37'),
(82, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0x42645ce4dd0b766de53ee483cbf54bcea670f9b2.\nTransaction ID: 0xfb4c0014ee78010033213eb2cf2904b5ede6e65c08cf2dc3e19e74f1ebf9d154.', 389, 187, 'ETH', '2025-05-30 10:20:26'),
(83, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0x9a0c272bd8bb40edb2689bf48b395f8ecb561d55.\nTransaction ID: 0x7861c2f1633c59abb5c838ab10c301b7ff917ba1a9d4d38f1e97303ac1192a86.', 394, 193, 'ETH', '2025-06-10 13:48:50'),
(84, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0x9a0c272bd8bb40edb2689bf48b395f8ecb561d55.\nTransaction ID: 0x7861c2f1633c59abb5c838ab10c301b7ff917ba1a9d4d38f1e97303ac1192a86.', 394, 193, 'ETH', '2025-06-10 13:54:49'),
(85, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0x15095ec8fb1fc9c664b3223459dff43158ace7ad.\nTransaction ID: 0x85c231c385670891ae1984d2901dd89ea346693bec63269d90b857e211e79803.', 394, 193, 'ETH', '2025-06-11 07:26:34'),
(86, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0xc0f3833b7e7216eecd9f6bc2c7927a7aa36ab58b.\nTransaction ID: 0xe87d67d2832536f72b81256bdd4355317367216975cce7fcd393306c291042e5.', 393, 192, 'ETH', '2025-06-11 07:26:35'),
(87, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0x95a13f457c76d10a40d7e8497ed4f40c53f4d04b.\nTransaction ID: 0x870db3470b677937a1a26415ba5b16ab2432eee0da1dcd91c624c1c9b951e70d.', 392, 191, 'ETH', '2025-06-11 07:26:36'),
(88, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0x159ca92b12f67e5676d82c238f4906692618a555.\nTransaction ID: 0xf7d75ec8174aa3841321627832ceeaa5be9bd54282a02d15e138ea120cf4be4e.', 391, 190, 'ETH', '2025-06-11 07:31:36'),
(89, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0x993a0f3653887078215914badcf039263293add9.\nTransaction ID: 0x806dbf1a9784fc9b5b21bb6bbcdcdae7799259ff2fec7e63c9078aaccf4b27d7.', 392, 191, 'ETH', '2025-06-11 07:54:25'),
(90, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0x9a0c272bd8bb40edb2689bf48b395f8ecb561d55.\nTransaction ID: 0xe9e732c0a4884077167d8108a47d8f61e8ad60cdff4318cbb5f2d135e0744adb.', 309, 140, 'ETH', '2025-06-11 09:38:13'),
(91, 'Transaction Sent', 'The transaction successfully sent 0.900005 SOL to address undefined.\nTransaction ID: 23oAvLY86HchzyfUiHa2hUixDfjTyijEFEtxsZoSFs1vPRCqJRMkRc99AFLA88kPhw56oU8T4VT6JH7HT8xUMiUq', 308, 72, 'SOL', '2025-06-12 06:40:56'),
(92, 'Transaction Sent', 'The transaction successfully sent 0.001 ETH to address 0xfff9976782d46cc05630d1f6ebab18b2324d6b14.\nTransaction ID: 0x367d2b82a78c0fee587d04e760e9e2e2147df36bc1d682af1c6d0e57fb99886a', 394, 193, 'ETH', '2025-06-12 07:47:30'),
(93, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0xf192e0d79fc75134d6d291f6968d3a8de0c6f734.\nTransaction ID: 0x90e60f1fcb2886510cda3708e94a675447bb0691c2957b5608e7a7d2fe77f987.', 396, 195, 'ETH', '2025-06-12 10:06:25'),
(94, 'Transaction Received', 'The transaction successfully received 100 ETH from address 0x1b2a13dc32a0227f8471da52e0cbb8e5e8a4f4e1.\nTransaction ID: 0xd33564630795c138fbb89677b18ee63080d5518dd5c72376f3332fd897df1d97.', 396, 195, 'ETH', '2025-06-12 10:39:07'),
(95, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0x42645ce4dd0b766de53ee483cbf54bcea670f9b2.\nTransaction ID: 0x4105c31db4afab3c9384ac02c5f5c7033c3a618cd30d5d1a191ae65561713e87.', 395, 194, 'ETH', '2025-06-13 07:27:49'),
(96, 'Transaction Received', 'The transaction successfully received 0.5 BNB from address 0x43a151b0927dca5fbcb3c57d6c99546b352450af.\nTransaction ID: 0xff4d9f850410ccdf67a8f2ace9d23f66b1ad5d577c54671d89e2ea1d9098e01b.', 395, 194, 'BNB', '2025-06-13 10:12:04'),
(97, 'Transaction Received', 'The transaction successfully received 4 SOL from address undefined.\nTransaction ID: 2kBaTX882S9Ggw1W9FrfNGsqdjaxoVssfVXgCCQmjemVDvhbGrkmUfquF7oNpYNGHtpZF3TwVahBrqqVNC9qGm6T.', 400, 201, 'SOL', '2025-06-13 12:43:20'),
(98, 'Transaction Sent', 'The transaction successfully sent 0.001 ETH to address 0xfff9976782d46cc05630d1f6ebab18b2324d6b14.\nTransaction ID: 0x8ebe6257095bdacb25599e296aeae83efc207872eeca2301165e9e201c0168a0', 309, 140, 'ETH', '2025-06-16 06:24:50'),
(99, 'Transaction Sent', 'The transaction successfully sent 0 ETH to address 0xfff9976782d46cc05630d1f6ebab18b2324d6b14.\nTransaction ID: 0x022b199c0f9fea4448cd15031cad15b0234bacf8f9e4f1a50b3d3b60727842eb', 309, 140, 'ETH', '2025-06-16 06:26:39'),
(100, 'Transaction Received', 'The transaction successfully received 4 SOL from address undefined.\nTransaction ID: 4h9iSFQ4SZHHzhWQf8r8VsySTT4FSh5rk9JojF3V7MqZ2A4vjdr4AZ8sRAE2iEq9yyZh1viyPZDNPBzxysfto8Zm.', 400, 201, 'SOL', '2025-06-16 10:11:58'),
(101, 'Transaction Received', 'The transaction successfully received 4 SOL from address undefined.\nTransaction ID: 7KeiuaE3ByauC2Y1qAnY9jWjNwarypgWf7fcDuwYZwDHeJsUxwH3dpnQ3yEMwPbN1bzrUXCG3ahEZWb7oXWyZb8.', 353, 138, 'SOL', '2025-06-16 10:21:10'),
(102, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0x15095ec8fb1fc9c664b3223459dff43158ace7ad.\nTransaction ID: 0x0827ce1380a936c00abca93fdf08e6a6a3b266041876fec0af91f9ee22c94cee.', 405, 206, 'ETH', '2025-06-19 09:42:37'),
(103, 'Transaction Received', 'The transaction successfully received 0.5 BNB from address 0x43a151b0927dca5fbcb3c57d6c99546b352450af.\nTransaction ID: 0x5edfb97885c8ec79cebb9a1bf3b1a64dd15dcbc6246553ccefe049181de2c541.', 405, 206, 'BNB', '2025-06-19 09:46:23'),
(104, 'Transaction Received', 'The transaction successfully received 4 SOL from address undefined.\nTransaction ID: 34XaQNSSp1cA16id4ivuhK7Z7ZHwLJM2CiPYbHezQDz8DvGnPrt9QQhoV7HxbMNoszDYaudCFytEEzpY8Tu3H1bt.', 405, 206, 'SOL', '2025-06-20 08:49:29'),
(105, 'Transaction Received', 'The transaction successfully received 0.05 ETH from address 0x95a13f457c76d10a40d7e8497ed4f40c53f4d04b.\nTransaction ID: 0x43d10956ff60c26ffab77770f0a8398747297537de7736131975e0a48bd4a419.', 406, 207, 'ETH', '2025-06-20 09:30:38');

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
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `wallet_type` enum('phone','card') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
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
(40, 'My wallet', 'phone', 0, 264, 264, '2025-03-26 14:39:01', '2025-03-26 14:39:01'),
(41, 'Wallet 212', 'phone', 1, 264, 264, '2025-03-28 10:24:41', '2025-03-28 10:24:41'),
(42, 'Wallet 1', 'phone', 1, 265, 265, '2025-03-31 12:58:20', '2025-03-31 12:58:20'),
(43, 'Wallet 1', 'phone', 1, 266, 266, '2025-04-01 06:02:50', '2025-04-01 06:02:50'),
(44, 'Wallet 1', 'phone', 1, 272, 272, '2025-04-01 08:07:21', '2025-04-01 08:07:21'),
(45, 'Wallet 1', 'phone', 1, 276, 276, '2025-04-02 07:45:36', '2025-04-02 07:45:36'),
(46, 'Wallet 1', 'phone', 1, 277, 277, '2025-04-02 11:50:51', '2025-04-02 11:50:51'),
(47, 'Wallet 1', 'phone', 1, 278, 278, '2025-04-08 09:11:28', '2025-04-08 09:11:28'),
(48, 'Wallet 1', 'phone', 1, 279, 279, '2025-04-08 12:17:40', '2025-04-08 12:17:40'),
(49, 'Wallet 1', 'phone', 1, 280, 280, '2025-04-09 11:21:40', '2025-04-09 11:21:40'),
(50, 'Wallet 1', 'phone', 1, 281, 281, '2025-04-09 13:49:19', '2025-04-09 13:49:19'),
(51, 'Wallet 1', 'phone', 0, 283, 283, '2025-04-09 14:14:14', '2025-04-09 14:14:14'),
(52, 'Wallet 2', 'phone', 1, 283, 283, '2025-04-09 14:14:51', '2025-04-09 14:14:51'),
(53, 'Wallet 1', 'phone', 1, 284, 284, '2025-04-09 14:19:26', '2025-04-09 14:19:26'),
(54, 'Wallet 1', 'phone', 1, 287, 287, '2025-04-11 09:05:40', '2025-04-11 09:05:40'),
(55, 'Wallet 1', 'phone', 1, 288, 288, '2025-04-11 11:28:47', '2025-04-11 11:28:47'),
(56, 'Wallet 1', 'phone', 1, 289, 289, '2025-04-11 13:49:14', '2025-04-11 13:49:14'),
(57, 'Wallet 1', 'phone', 1, 290, 290, '2025-04-11 13:58:48', '2025-04-11 13:58:48'),
(58, 'Wallet 1', 'phone', 0, 293, 293, '2025-04-14 06:25:25', '2025-04-14 06:25:25'),
(59, 'Wallet 2', 'phone', 1, 293, 293, '2025-04-14 07:23:05', '2025-04-14 07:23:05'),
(60, 'Wallet 1', 'phone', 1, 294, 294, '2025-04-14 07:57:10', '2025-04-14 07:57:10'),
(61, 'Wallet 1', 'phone', 1, 296, 296, '2025-04-14 10:07:28', '2025-04-14 10:07:28'),
(62, 'Wallet 1', 'phone', 1, 297, 297, '2025-04-14 18:25:07', '2025-04-14 18:25:07'),
(63, 'Wallet 1', 'phone', 1, 300, 300, '2025-04-14 18:52:06', '2025-04-14 18:52:06'),
(64, 'Wallet 1', 'phone', 1, 302, 302, '2025-04-15 07:39:47', '2025-04-15 07:39:47'),
(65, 'Wallet 1', 'phone', 1, 304, 304, '2025-04-15 09:28:41', '2025-04-15 09:28:41'),
(66, 'Wallet 1', 'phone', 1, 303, 303, '2025-04-15 09:30:13', '2025-04-15 09:30:13'),
(67, 'Urvashi', 'phone', 0, 305, 305, '2025-04-15 09:38:24', '2025-04-15 09:38:24'),
(68, 'tesr', 'phone', 1, 306, 306, '2025-04-15 09:46:12', '2025-04-15 09:46:12'),
(69, 'Wallet second', 'phone', 1, 305, 305, '2025-04-15 10:33:11', '2025-04-15 10:33:11'),
(70, 'Wallet 1', 'phone', 0, 307, 307, '2025-04-15 11:22:25', '2025-04-15 11:22:25'),
(71, 'Wallet 2', 'phone', 1, 307, 307, '2025-04-15 12:12:48', '2025-04-15 12:12:48'),
(72, 'Wallet 1', 'phone', 1, 308, 308, '2025-04-15 12:28:54', '2025-04-15 12:28:54'),
(73, 'wallet 1', 'phone', 0, 310, 310, '2025-04-16 07:01:11', '2025-04-16 07:01:11'),
(74, 'wallet 2', 'phone', 1, 310, 310, '2025-04-16 07:04:49', '2025-04-16 07:04:49'),
(75, 'Wallet 1', 'phone', 0, 311, 311, '2025-04-16 10:59:38', '2025-04-16 10:59:38'),
(76, 'Wallet 1', 'phone', 0, 311, 311, '2025-04-16 10:59:38', '2025-04-16 10:59:38'),
(77, 'wallet1', 'phone', 0, 312, 312, '2025-04-17 06:46:08', '2025-04-17 06:46:08'),
(78, 'wallet2', 'phone', 1, 312, 312, '2025-04-17 06:48:02', '2025-04-17 06:48:02'),
(79, 'a', 'phone', 0, 308, 308, '2025-04-17 07:40:33', '2025-04-17 07:40:33'),
(80, 'Wallet 3', 'phone', 0, 305, 305, '2025-04-17 09:11:29', '2025-04-17 09:11:29'),
(81, 'testwallet1', 'phone', 1, 313, 313, '2025-04-17 09:56:31', '2025-04-17 09:56:31'),
(82, 'Wallet 1', 'phone', 1, 315, 315, '2025-04-18 05:59:28', '2025-04-18 05:59:28'),
(83, '', 'phone', 0, 318, 318, '2025-04-18 07:29:56', '2025-04-18 07:29:56'),
(84, 'Wallet 1', 'phone', 1, 319, 319, '2025-04-18 12:25:52', '2025-04-18 12:25:52'),
(85, 'Wallet 1', 'phone', 0, 320, 320, '2025-04-18 12:59:11', '2025-04-18 12:59:11'),
(86, 'Test 2', 'phone', 0, 318, 318, '2025-04-18 13:21:57', '2025-04-18 13:21:57'),
(87, 'Test 3', 'phone', 1, 318, 318, '2025-04-18 13:29:23', '2025-04-18 13:29:23'),
(88, 'Wallet 1', 'phone', 1, 321, 321, '2025-04-18 14:23:09', '2025-04-18 14:23:09'),
(89, 'Wallet 1', 'phone', 1, 323, 323, '2025-04-21 06:04:19', '2025-04-21 06:04:19'),
(91, 'Wallet 2', 'card', 0, 320, 320, '2025-04-21 10:03:47', '2025-04-21 10:03:47'),
(92, 'Wallet 3', 'card', 0, 320, 320, '2025-04-21 10:27:09', '2025-04-21 10:27:09'),
(93, 'Wallet 4', 'card', 0, 320, 320, '2025-04-21 10:37:20', '2025-04-21 10:37:20'),
(94, 'testrestore', 'card', 1, 320, 320, '2025-04-21 13:22:21', '2025-04-21 13:22:21'),
(95, 'Wallet 1', 'card', 1, 324, 324, '2025-04-21 13:40:08', '2025-04-21 13:40:08'),
(96, '', 'card', 1, 325, 325, '2025-04-21 14:18:17', '2025-04-21 14:18:17'),
(97, 'Wallet 1', 'card', 0, 326, 326, '2025-04-21 14:32:30', '2025-04-21 14:32:30'),
(98, 'Wallet 2', 'phone', 0, 326, 326, '2025-04-22 07:08:00', '2025-04-22 07:08:00'),
(99, 'Wallet 1', 'card', 0, 327, 327, '2025-04-23 06:24:22', '2025-04-23 06:24:22'),
(100, 'Wallet 2', 'card', 1, 327, 327, '2025-04-23 06:30:13', '2025-04-23 06:30:13'),
(101, 'Wallet 3', 'phone', 0, 326, 326, '2025-04-23 09:30:12', '2025-04-23 09:30:12'),
(102, 'Test wall', 'phone', 0, 326, 326, '2025-04-23 09:32:42', '2025-04-23 09:32:42'),
(103, 'Wallet 5', 'card', 1, 326, 326, '2025-04-23 09:40:03', '2025-04-23 09:40:03'),
(106, 'deummy', 'phone', 0, 329, 329, '2025-04-23 11:01:20', '2025-04-23 11:01:20'),
(107, 'Wallet 2', 'phone', 0, 329, 329, '2025-04-23 11:14:22', '2025-04-23 11:14:22'),
(108, 'Wallet 3', 'phone', 0, 329, 329, '2025-04-23 11:28:34', '2025-04-23 11:28:34'),
(109, 'Wallet 4', 'phone', 0, 329, 329, '2025-04-23 11:32:08', '2025-04-23 11:32:08'),
(110, 'Wallet 5', 'phone', 0, 329, 329, '2025-04-23 11:48:44', '2025-04-23 11:48:44'),
(111, 'Wallet 6', 'card', 0, 329, 329, '2025-04-23 12:22:11', '2025-04-23 12:22:11'),
(112, 'Wallet 1', 'card', 1, 330, 330, '2025-04-23 14:20:05', '2025-04-23 14:20:05'),
(113, 'Wallet 7', 'phone', 1, 329, 329, '2025-04-24 07:11:16', '2025-04-24 07:11:16'),
(114, 'Wallet 8', 'card', 0, 329, 329, '2025-04-24 12:08:00', '2025-04-24 12:08:00'),
(115, 'Wallet 3', 'phone', 0, 308, 308, '2025-04-25 05:53:24', '2025-04-25 05:53:24'),
(116, 'Wallet 9', 'card', 0, 329, 329, '2025-04-25 11:24:02', '2025-04-25 11:24:02'),
(117, 'Wallet 1', 'phone', 1, 333, 333, '2025-04-28 11:17:19', '2025-04-28 11:17:19'),
(118, 'Wallet 1', 'card', 1, 335, 335, '2025-04-28 11:26:08', '2025-04-28 11:26:08'),
(119, 'Wallet 1', 'phone', 1, 341, 341, '2025-04-29 06:24:43', '2025-04-29 06:24:43'),
(120, 'Wallet 2', 'card', 0, 341, 341, '2025-04-29 06:46:51', '2025-04-29 06:46:51'),
(121, 'Wallet 3', 'card', 0, 341, 341, '2025-04-29 06:54:00', '2025-04-29 06:54:00'),
(122, 'Wallet 1', 'phone', 1, 344, 344, '2025-04-29 08:55:22', '2025-04-29 08:55:22'),
(123, 'Wallet 1', 'phone', 1, 346, 346, '2025-04-29 09:02:52', '2025-04-29 09:02:52'),
(124, 'Wallet 1', 'phone', 1, 348, 348, '2025-04-29 09:04:48', '2025-04-29 09:04:48'),
(135, 'Wallet 1', 'phone', 1, 350, 350, '2025-04-30 06:34:51', '2025-04-30 06:34:51'),
(137, 'Wallet 1', 'card', 1, 352, 352, '2025-04-30 06:53:34', '2025-04-30 06:53:34'),
(138, 'Wallet 1', 'card', 0, 353, 353, '2025-05-02 12:27:55', '2025-05-02 12:27:55'),
(139, 'Wallet 2', 'phone', 1, 353, 353, '2025-05-02 14:08:43', '2025-05-02 14:08:43'),
(140, 'Wallet 1', 'phone', 1, 309, 309, '2025-05-02 18:38:26', '2025-05-02 18:38:26'),
(141, 'Wallet 1', 'phone', 0, 354, 354, '2025-05-02 18:48:48', '2025-05-02 18:48:48'),
(142, 'Wallet 2', 'phone', 1, 354, 354, '2025-05-05 09:52:07', '2025-05-05 09:52:07'),
(143, 'Wallet 1', 'phone', 1, 355, 355, '2025-05-06 09:59:27', '2025-05-06 09:59:27'),
(144, 'Wallet 1', 'phone', 1, 356, 356, '2025-05-06 11:04:13', '2025-05-06 11:04:13'),
(145, 'Wallet 1', 'phone', 1, 357, 357, '2025-05-06 11:31:51', '2025-05-06 11:31:51'),
(146, 'Wallet 1', 'phone', 1, 358, 358, '2025-05-06 12:44:37', '2025-05-06 12:44:37'),
(147, 'Wallet 1', 'phone', 1, 359, 359, '2025-05-07 09:00:14', '2025-05-07 09:00:14'),
(148, 'Wallet 1', 'phone', 1, 360, 360, '2025-05-07 09:08:05', '2025-05-07 09:08:05'),
(149, 'Wallet 1', 'phone', 1, 361, 361, '2025-05-07 10:14:27', '2025-05-07 10:14:27'),
(150, 'Wallet 1', 'phone', 1, 362, 362, '2025-05-07 12:14:42', '2025-05-07 12:14:42'),
(151, 'Wallet 1', 'phone', 1, 363, 363, '2025-05-07 12:18:47', '2025-05-07 12:18:47'),
(152, 'Wallet 1', 'phone', 1, 364, 364, '2025-05-07 14:38:50', '2025-05-07 14:38:50'),
(153, 'test wallet', 'phone', 1, 365, 365, '2025-05-07 14:58:56', '2025-05-07 14:58:56'),
(154, 'Wallet 1', 'phone', 1, 366, 366, '2025-05-08 14:33:23', '2025-05-08 14:33:23'),
(155, 'Wallet 1', 'phone', 1, 368, 368, '2025-05-13 10:41:01', '2025-05-13 10:41:01'),
(156, 'Wallet 4', 'phone', 0, 308, 308, '2025-05-13 12:40:21', '2025-05-13 12:40:21'),
(157, 'Wallet 1', 'phone', 1, 369, 369, '2025-05-14 06:44:58', '2025-05-14 06:44:58'),
(158, 'Wallet 1', 'phone', 1, 370, 370, '2025-05-14 09:11:25', '2025-05-14 09:11:25'),
(159, 'my wallet', 'phone', 0, 371, 371, '2025-05-14 09:28:54', '2025-05-14 09:28:54'),
(160, 'wallet here ', 'phone', 1, 371, 371, '2025-05-14 14:29:57', '2025-05-14 14:29:57'),
(161, 'ii', 'phone', 0, 308, 308, '2025-05-15 07:03:47', '2025-05-15 07:03:47'),
(162, 'Wallet 6', 'phone', 0, 308, 308, '2025-05-15 07:20:36', '2025-05-15 07:20:36'),
(163, 'Wallet 1', 'phone', 0, 372, 372, '2025-05-15 09:20:55', '2025-05-15 09:20:55'),
(164, 'Wallet 2', 'phone', 0, 372, 372, '2025-05-15 09:24:27', '2025-05-15 09:24:27'),
(165, 'Wallet 3', 'phone', 0, 372, 372, '2025-05-15 10:02:12', '2025-05-15 10:02:12'),
(166, 'Wallet 4', 'phone', 1, 372, 372, '2025-05-15 11:14:04', '2025-05-15 11:14:04'),
(167, 'Wallet 5', 'phone', 0, 372, 372, '2025-05-15 11:18:54', '2025-05-15 11:18:54'),
(168, 'Wallet 1', 'phone', 1, 373, 373, '2025-05-15 11:35:07', '2025-05-15 11:35:07'),
(169, 'Wallet 1', 'phone', 1, 374, 374, '2025-05-15 11:48:56', '2025-05-15 11:48:56'),
(170, 'Wallet 1', 'phone', 1, 375, 375, '2025-05-15 12:28:17', '2025-05-15 12:28:17'),
(171, 'Wallet 1', 'phone', 1, 376, 376, '2025-05-16 05:52:39', '2025-05-16 05:52:39'),
(172, 'Wallet 1', 'phone', 0, 377, 377, '2025-05-16 06:02:13', '2025-05-16 06:02:13'),
(173, 'Wallet 2', 'phone', 1, 377, 377, '2025-05-16 06:34:20', '2025-05-16 06:34:20'),
(174, 'Wallet 1', 'phone', 1, 378, 378, '2025-05-16 06:43:18', '2025-05-16 06:43:18'),
(175, 'Wallet 2', 'phone', 0, 378, 378, '2025-05-16 09:30:52', '2025-05-16 09:30:52'),
(176, 'Wallet 123', 'phone', 1, 379, 379, '2025-05-16 12:02:18', '2025-05-16 12:02:18'),
(177, 'Wallet 1', 'phone', 1, 380, 380, '2025-05-16 14:11:43', '2025-05-16 14:11:43'),
(178, 'Wallet 1', 'phone', 1, 381, 381, '2025-05-16 14:20:25', '2025-05-16 14:20:25'),
(179, 'Wallet 3', 'phone', 1, 382, 382, '2025-05-17 07:36:24', '2025-05-17 07:36:24'),
(180, 'Wallet 1', 'phone', 1, 383, 383, '2025-05-17 08:50:06', '2025-05-17 08:50:06'),
(181, 'Wallet 1', 'phone', 1, 384, 384, '2025-05-19 06:39:48', '2025-05-19 06:39:48'),
(182, 'Wallet 1', 'phone', 1, 385, 385, '2025-05-19 07:47:32', '2025-05-19 07:47:32'),
(183, 'my wallet', 'phone', 1, 386, 386, '2025-05-19 09:14:28', '2025-05-19 09:14:28'),
(184, 'imported wallet', 'phone', 0, 386, 386, '2025-05-19 09:33:08', '2025-05-19 09:33:08'),
(185, 'Wallet 1', 'phone', 1, 387, 387, '2025-05-19 10:13:21', '2025-05-19 10:13:21'),
(186, 'Wallet 1', 'phone', 1, 388, 388, '2025-05-21 07:04:47', '2025-05-21 07:04:47'),
(187, 'Wallet 1', 'phone', 1, 389, 389, '2025-05-30 10:16:19', '2025-05-30 10:16:19'),
(188, 'Wallet 1', 'phone', 0, 390, 390, '2025-06-05 13:25:52', '2025-06-05 13:25:52'),
(189, 'Wallet 2', 'phone', 1, 390, 390, '2025-06-05 13:25:58', '2025-06-05 13:25:58'),
(190, 'test', 'phone', 1, 391, 391, '2025-06-05 13:35:07', '2025-06-05 13:35:07'),
(191, 'Wallet 1', 'phone', 1, 392, 392, '2025-06-10 11:59:12', '2025-06-10 11:59:12'),
(192, 'Wallet 1', 'phone', 1, 393, 393, '2025-06-10 12:15:04', '2025-06-10 12:15:04'),
(193, 'Wallet 1', 'phone', 1, 394, 394, '2025-06-10 12:16:30', '2025-06-10 12:16:30'),
(194, 'Wallet 1', 'phone', 1, 395, 395, '2025-06-12 08:05:10', '2025-06-12 08:05:10'),
(195, 'Wallet 1', 'phone', 1, 396, 396, '2025-06-12 10:04:05', '2025-06-12 10:04:05'),
(196, 'phantom', 'phone', 0, 395, 395, '2025-06-12 11:02:58', '2025-06-12 11:02:58'),
(197, 'Wallet 3', 'phone', 0, 395, 395, '2025-06-12 11:12:36', '2025-06-12 11:12:36'),
(198, 'Wallet 1', 'phone', 1, 397, 397, '2025-06-13 10:18:17', '2025-06-13 10:18:17'),
(199, 'Wallet 1', 'phone', 1, 398, 398, '2025-06-13 10:19:51', '2025-06-13 10:19:51'),
(200, 'Wallet 1', 'phone', 1, 399, 399, '2025-06-13 10:23:10', '2025-06-13 10:23:10'),
(201, 'Wallet 1', 'phone', 1, 400, 400, '2025-06-13 10:31:37', '2025-06-13 10:31:37'),
(203, 'Wallet 1', 'phone', 1, 403, 403, '2025-06-17 12:13:52', '2025-06-17 12:13:52'),
(204, 'Wallet 1', 'phone', 1, 404, 404, '2025-06-17 12:42:08', '2025-06-17 12:42:08'),
(205, 'Wallet 2', 'card', 0, 404, 404, '2025-06-17 12:44:39', '2025-06-17 12:44:39'),
(206, 'Wallet 1', 'phone', 1, 405, 405, '2025-06-19 09:29:50', '2025-06-19 09:29:50'),
(207, 'Wallet 1', 'phone', 1, 406, 406, '2025-06-20 06:55:50', '2025-06-20 06:55:50'),
(208, 'Wallet 1', 'phone', 1, 407, 407, '2025-06-24 13:08:04', '2025-06-24 13:08:04'),
(209, 'Wallet 1', 'phone', 1, 409, 409, '2025-06-26 06:44:55', '2025-06-26 06:44:55'),
(210, 'Wallet 1', 'phone', 1, 410, 410, '2025-06-26 09:37:33', '2025-06-26 09:37:33'),
(211, 'Wallet 1', 'phone', 1, 415, 415, '2025-06-26 10:55:21', '2025-06-26 10:55:21');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bookmarked_tokens`
--
ALTER TABLE `bookmarked_tokens`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `custom_urls`
--
ALTER TABLE `custom_urls`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dapps_list`
--
ALTER TABLE `dapps_list`
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
-- Indexes for table `transactions_old`
--
ALTER TABLE `transactions_old`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transaction_notifications`
--
ALTER TABLE `transaction_notifications`
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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1203;

--
-- AUTO_INCREMENT for table `bookmarked_tokens`
--
ALTER TABLE `bookmarked_tokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT for table `custom_urls`
--
ALTER TABLE `custom_urls`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `dapps_list`
--
ALTER TABLE `dapps_list`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=333;

--
-- AUTO_INCREMENT for table `device`
--
ALTER TABLE `device`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=416;

--
-- AUTO_INCREMENT for table `rango_blockchains`
--
ALTER TABLE `rango_blockchains`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT for table `transactions_old`
--
ALTER TABLE `transactions_old`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=116;

--
-- AUTO_INCREMENT for table `transaction_notifications`
--
ALTER TABLE `transaction_notifications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `utenti`
--
ALTER TABLE `utenti`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `wallet`
--
ALTER TABLE `wallet`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=212;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
