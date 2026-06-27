import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { formatCurrency } from "../utils/format.js";

export function exportMonthlyPdf(monthLabel, summary, categoryBreakdown, budgets, recentTransactions) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.text("FinTrack Report", pageWidth / 2, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text(`Monthly snapshot — ${monthLabel}`, pageWidth / 2, 28, { align: "center" });

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 34, { align: "center" });

  doc.setFontSize(14);
  doc.text("Summary", 14, 46);
  doc.autoTable({
    startY: 50,
    head: [["Metric", "Value"]],
    body: [
      ["Income", formatCurrency(summary?.total_income)],
      ["Expenses", formatCurrency(summary?.total_expense)],
      ["Balance", formatCurrency(summary?.balance)],
      ["Budget count", String(budgets.length)],
      ["Category count", String(categoryBreakdown.length)]
    ],
    theme: "grid",
    headStyles: { fillColor: [108, 212, 168] }
  });

  if (categoryBreakdown.length) {
    doc.text("Category Breakdown", 14, doc.lastAutoTable.finalY + 12);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 16,
      head: [["Category", "Spent"]],
      body: categoryBreakdown.map((c) => [c.category_name, formatCurrency(c.total)]),
      theme: "grid",
      headStyles: { fillColor: [108, 212, 168] }
    });
  }

  if (budgets.length) {
    doc.text("Budget vs Spending", 14, doc.lastAutoTable.finalY + 12);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 16,
      head: [["Category", "Budget", "Spent", "Remaining"]],
      body: budgets.map((b) => [
        b.category_name,
        formatCurrency(b.amount),
        formatCurrency(b.spent),
        formatCurrency(b.remaining)
      ]),
      theme: "grid",
      headStyles: { fillColor: [108, 212, 168] }
    });
  }

  if (recentTransactions.length) {
    doc.text("Recent Transactions", 14, doc.lastAutoTable.finalY + 12);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 16,
      head: [["Date", "Category", "Description", "Amount"]],
      body: recentTransactions.map((t) => [
        t.transaction_date,
        t.category_name || "Uncategorized",
        t.description || "-",
        formatCurrency(t.amount)
      ]),
      theme: "grid",
      headStyles: { fillColor: [108, 212, 168] }
    });
  }

  doc.save(`fintrack-${monthLabel.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}

export function exportYearlyPdf(year, months, totals, categoryBreakdown) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.text("FinTrack Report", pageWidth / 2, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text(`Yearly report — ${year}`, pageWidth / 2, 28, { align: "center" });

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 34, { align: "center" });

  doc.setFontSize(14);
  doc.text("Year Totals", 14, 46);
  doc.autoTable({
    startY: 50,
    head: [["Metric", "Value"]],
    body: [
      ["Total Income", formatCurrency(totals.total_income)],
      ["Total Expenses", formatCurrency(totals.total_expense)],
      ["Balance", formatCurrency(totals.balance)]
    ],
    theme: "grid",
    headStyles: { fillColor: [108, 212, 168] }
  });

  doc.text("Monthly Breakdown", 14, doc.lastAutoTable.finalY + 12);
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 16,
    head: [["Month", "Income", "Expenses", "Balance"]],
    body: months.map((m) => [
      m.month,
      formatCurrency(m.total_income),
      formatCurrency(m.total_expense),
      formatCurrency(m.balance)
    ]),
    theme: "grid",
    headStyles: { fillColor: [108, 212, 168] }
  });

  if (categoryBreakdown.length) {
    doc.text("Yearly Category Breakdown", 14, doc.lastAutoTable.finalY + 12);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 16,
      head: [["Category", "Total Spent"]],
      body: categoryBreakdown.map((c) => [c.category_name, formatCurrency(c.total)]),
      theme: "grid",
      headStyles: { fillColor: [108, 212, 168] }
    });
  }

  doc.save(`fintrack-yearly-${year}.pdf`);
}
