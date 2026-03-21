export interface FormField {
  id: string;
  type: "text" | "email" | "textarea" | "rating" | "photo" | "url";
  label: string;
  placeholder?: string;
  required: boolean;
  enabled: boolean;
}

export const defaultFields: FormField[] = [
  { id: "author_name", type: "text", label: "Your name", placeholder: "John Doe", required: true, enabled: true },
  { id: "rating", type: "rating", label: "Rating", required: true, enabled: true },
  { id: "text", type: "textarea", label: "Your experience", placeholder: "Tell us about your experience...", required: true, enabled: true },
  { id: "author_title", type: "text", label: "Job title", placeholder: "Product Manager", required: false, enabled: true },
  { id: "author_company", type: "text", label: "Company", placeholder: "Acme Inc.", required: false, enabled: true },
  { id: "author_photo", type: "photo", label: "Photo", required: false, enabled: false },
];

export interface FormConfig {
  fields: FormField[];
  welcomeMessage: string;
  thankYouMessage: string;
  accentColor: string;
  logoUrl: string;
  redirectUrl: string;
  theme: "dark" | "light" | "auto" | "custom";
  bgColor: string;
  bgTransparent: boolean;
  formColor: string;
  formBorderColor: string;
  formBorderThickness: number;
  inputColor: string;
  borderRadius: "none" | "subtle" | "rounded" | "pill";
  bgFade: boolean;
  embedPadding: number;
}

export const defaultFormConfig: FormConfig = {
  fields: defaultFields,
  welcomeMessage: "We'd love to hear from you!",
  thankYouMessage: "Thank you for your feedback! It means a lot to us.",
  accentColor: "#4F46E5",
  logoUrl: "",
  redirectUrl: "",
  theme: "dark",
  bgColor: "",
  bgTransparent: false,
  formColor: "",
  formBorderColor: "",
  formBorderThickness: 1,
  inputColor: "",
  borderRadius: "rounded",
  bgFade: false,
  embedPadding: 3,
};
