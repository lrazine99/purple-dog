"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique d'inscription à la newsletter
    setIsSubmitted(true);
    setTimeout(() => {
      setEmail("");
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-8 shadow-xl md:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Mail className="h-8 w-8" />
            </div>
            <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
              Restez Informé
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Recevez nos dernières ventes, conseils d&apos;experts et
              opportunités exclusives directement dans votre boîte mail.
            </p>

            {isSubmitted ? (
              <div className="rounded-lg bg-primary/10 p-4 text-primary">
                <p className="font-medium">
                  Merci ! Vous êtes inscrit à notre newsletter.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <Input
                  type="email"
                  placeholder="Votre adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 border-2 border-border bg-background text-foreground"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-primary text-primary-foreground"
                >
                  S&apos;abonner
                </Button>
              </form>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
