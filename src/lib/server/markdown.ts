import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { rehypeAutolink } from "@/lib/rehype-autolink";

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ],
  attributes: {
    ...defaultSchema.attributes,
    img: ["src", "alt", "title", "width", "height", "loading"],
    a: ["href", "title", "rel", "target", "className"],
  },
};

function stripFrontmatter(markdown: string): string {
  const text = String(markdown ?? "");
  const fmRegex = /^---\s*\r?\n[\s\S]*?\r?\n---\s*(\r?\n|$)/;
  return text.replace(fmRegex, "");
}

export async function renderMarkdownToHtml(markdown: string): Promise<string> {
  const sanitized = stripFrontmatter(markdown);
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkRehype)
    .use(rehypeAutolink)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
    .process(sanitized);

  return String(file);
}
