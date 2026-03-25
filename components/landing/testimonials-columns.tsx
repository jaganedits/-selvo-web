"use client";

import React from "react";
import { motion } from "motion/react";

interface Testimonial {
  text: string;
  name: string;
  role: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    text: "Selvo completely changed how I track my spending. Having my data in my own Firebase gives me peace of mind.",
    name: "Priya Sharma",
    role: "Freelance Designer",
    avatar: "PS",
  },
  {
    text: "The recurring transactions feature saves me so much time. Bills and subscriptions are tracked automatically.",
    name: "Arjun Patel",
    role: "Software Engineer",
    avatar: "AP",
  },
  {
    text: "Beautiful charts and insights. I finally understand where my money goes each month.",
    name: "Meera Reddy",
    role: "Marketing Manager",
    avatar: "MR",
  },
  {
    text: "Love the Splitwise integration! Shared expenses sync right into my personal tracker.",
    name: "Rohan Gupta",
    role: "Student",
    avatar: "RG",
  },
  {
    text: "Setting up budgets and tracking them in real-time has helped me save 30% more each month.",
    name: "Kavya Nair",
    role: "Product Manager",
    avatar: "KN",
  },
  {
    text: "The fact that I bring my own Firebase project is genius. No one else touches my financial data.",
    name: "Vikram Joshi",
    role: "Startup Founder",
    avatar: "VJ",
  },
  {
    text: "Syncing between my phone and laptop is seamless. Add a transaction on one, see it instantly on the other.",
    name: "Ananya Das",
    role: "Data Analyst",
    avatar: "AD",
  },
  {
    text: "The budget vs actual view keeps me accountable. Simple, clean, and exactly what I needed.",
    name: "Suresh Kumar",
    role: "Accountant",
    avatar: "SK",
  },
  {
    text: "I've tried many finance apps but Selvo's privacy-first approach won me over. Highly recommend!",
    name: "Neha Singh",
    role: "Journalist",
    avatar: "NS",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

function TestimonialsColumn({
  items,
  className,
  duration = 10,
}: {
  items: Testimonial[];
  className?: string;
  duration?: number;
}) {
  return (
    <div className={className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-5 pb-5"
      >
        {[...Array(2)].map((_, index) => (
          <React.Fragment key={index}>
            {items.map((t, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/60 bg-card p-6 max-w-xs w-full shadow-sm"
              >
                <p className="text-[13px] leading-relaxed text-foreground/80">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-2.5 mt-4">
                  <div className="h-9 w-9 rounded-full bg-linear-to-br from-orange to-orange-light flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-white">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium leading-tight">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground leading-tight">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center mb-12"
        >
          <div className="border border-border rounded-lg py-1 px-4 text-sm text-muted-foreground mb-5">
            Testimonials
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight">
            Loved by people who care about their finances
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg">
            See what Selvo users have to say about taking control of their money.
          </p>
        </motion.div>

        <div className="flex justify-center gap-5 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn items={firstColumn} duration={15} />
          <TestimonialsColumn
            items={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            items={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
      </div>
    </section>
  );
}
