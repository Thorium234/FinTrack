CREATE TABLE IF NOT EXISTS recurring_transactions (
  id BIGINT(20) AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT(20) NOT NULL,
  category_id BIGINT(20) DEFAULT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  type ENUM('income','expense') NOT NULL,
  description TEXT DEFAULT NULL,
  frequency ENUM('daily','weekly','monthly','yearly') NOT NULL DEFAULT 'monthly',
  interval_value INT(11) NOT NULL DEFAULT 1,
  next_date DATE NOT NULL,
  end_date DATE DEFAULT NULL,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
