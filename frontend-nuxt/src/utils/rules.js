export function requiredRule(message = "This field is required") {
  return (value) => !!value || value === 0 || message;
}
export function minCharacters(
  minCharacters,
  message = `Must have at least ${minCharacters} characters`
) {
  return (value) => value.length >= minCharacters || message;
}
export function validEmail(message = "E-mail must be valid") {
  return (value) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value) || message;
}
export function matchPassword(message = "Passwords must match") {
  return (_) => this.$data.password === this.$data.confirmPassword || message;
}
