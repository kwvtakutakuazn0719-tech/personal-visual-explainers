/** 日本時間（Asia/Tokyo）の暦日を YYYY-MM-DD で返す（ledger の discovered_at とダイジェストの一致用） */
export function formatJstYmd(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
