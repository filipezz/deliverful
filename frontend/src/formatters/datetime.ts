export function toMonthnameYearOrPresent(dateArg: Date | string | undefined): string {
  if (!dateArg) {
    return 'Present'
  }
  const months = ['Jan', 'Feb', 'Mar', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const date = new Date(dateArg)
  return `${months[date.getMonth()]}. ${date.getFullYear()}`
}