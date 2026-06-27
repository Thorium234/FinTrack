USE fintrack;

INSERT INTO categories (user_id, name, color, icon, is_global) VALUES
(NULL, 'Salary', '#16a34a', 'wallet', 1),
(NULL, 'Food', '#f97316', 'utensils', 1),
(NULL, 'Transport', '#0ea5e9', 'car', 1),
(NULL, 'Bills', '#ef4444', 'receipt', 1),
(NULL, 'Shopping', '#a855f7', 'shopping-bag', 1),
(NULL, 'Health', '#14b8a6', 'heart-pulse', 1),
(NULL, 'Entertainment', '#f43f5e', 'film', 1),
(NULL, 'Education', '#6366f1', 'book-open', 1),
(NULL, 'Savings', '#22c55e', 'piggy-bank', 1),
(NULL, 'Investments', '#eab308', 'chart-line', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);
