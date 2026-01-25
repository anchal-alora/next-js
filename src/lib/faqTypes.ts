export type ReportFaq = {
  id: string;
  question: string;
  /** Sanitized HTML from the server-side markdown renderer. */
  answerHtml: string;
};
