"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { getAuthorBySlug, type Author } from "@/lib/authors";
import { OptimizedPicture } from "@/components/shared/OptimizedPicture";
import { Linkedin, Twitter, Mail, ArrowLeft } from "lucide-react";
import { getContactFormLink } from "@/lib/routes";

interface TeamMemberProps {
  author?: Author;
}

export default function TeamMember({ author: authorProp }: TeamMemberProps) {
  const { slug } = useParams<{ slug: string }>();
  const author = authorProp ?? (slug ? getAuthorBySlug(slug) : null);

  if (!author) {
    return (
      <Layout>
        
        <section className="pt-28 pb-10">
          <div className="container-wide">
            <div className="card-elevated p-8">
              <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-2">
                Team Member not found
              </h1>
              <p className="text-muted-foreground mb-6">
                The team member you’re looking for doesn’t exist.
              </p>
              <Button asChild>
                <Link href="/about">Return to About</Link>
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      
      <section className="pt-28 pb-10">
        <div className="container-wide">
          <div className="mb-8">
            <Button variant="ghost" asChild>
              <Link href="/about" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to About
              </Link>
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="card-elevated p-6">
                {author.image ? (
                  <OptimizedPicture
                    imageKey={author.image}
                    alt={author.name}
                    className="w-full rounded-lg mb-6"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full aspect-square bg-secondary rounded-lg mb-6 flex items-center justify-center">
                    <span className="text-4xl font-bold text-muted-foreground">
                      {author.name.charAt(0)}
                    </span>
                  </div>
                )}
                <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                  {author.name}
                </h1>
                <p className="text-muted-foreground mb-6">{author.role}</p>
                <div className="flex gap-3">
                  {author.linkedin && (
                    <a
                      href={author.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {author.twitter && (
                    <a
                      href={author.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      aria-label="Twitter"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {author.email && (
                    <a
                      href={`mailto:${author.email}`}
                      className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      aria-label="Email"
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="card-elevated p-8">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  About
                </h2>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <p className="leading-relaxed">{author.bio}</p>
                </div>
                <div className="mt-8">
                  <Button asChild>
                    <Link href={getContactFormLink("team-member-cta")}>
                      Get in Touch
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
