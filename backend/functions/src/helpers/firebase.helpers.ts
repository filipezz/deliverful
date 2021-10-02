export function parseFirestoreTimestamp<T, K extends keyof T>(obj: T, keys: K[]): void {
  keys.forEach(key => {
    if (obj[key] && typeof obj[key] === 'object') {
      (<unknown>obj[key] as Date) = (<unknown>obj[key] as FirebaseFirestore.Timestamp).toDate()
    }
  })
}