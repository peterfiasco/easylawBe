declare module 'body-parser';
declare module 'jsonwebtoken' {
  interface JwtPayload {
    id: string;
    // Add other properties that might be in your JWT token
  }
}
declare module 'pdfkit';
