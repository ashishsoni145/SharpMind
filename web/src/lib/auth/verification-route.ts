export function createVerificationPageUrl(email: string, signupAlreadySentOtp: boolean): string {
  const params = new URLSearchParams({ email: email.trim().toLowerCase() });
  if (signupAlreadySentOtp) params.set('step', 'otp');
  return `/verify-email?${params.toString()}`;
}
