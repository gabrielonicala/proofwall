export interface Testimonial {
  id: string;
  authorName: string;
  authorTitle: string;
  authorCompany: string;
  authorPhoto: string;
  text: string;
  rating: number;
  tags: string[];
  createdAt?: string;
}

export const sampleTestimonials: Testimonial[] = [
  {
    id: "1",
    authorName: "Sarah Chen",
    authorTitle: "Head of Growth",
    authorCompany: "Vercel",
    authorPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    text: "Laudica completely transformed our conversion rate. We went from a generic testimonials page to contextual social proof on every key page. Our pricing page alone saw a 34% lift.",
    rating: 5,
    tags: ["results", "pricing"],
  },
  {
    id: "2",
    authorName: "Marcus Johnson",
    authorTitle: "Founder & CEO",
    authorCompany: "ShipFast",
    authorPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus",
    text: "The showcase styles are absolutely gorgeous. Our wall of love went from boring to breathtaking. Customers actually comment on how beautiful our testimonials look.",
    rating: 5,
    tags: ["quality", "features"],
  },
  {
    id: "3",
    authorName: "Emily Rodriguez",
    authorTitle: "Marketing Director",
    authorCompany: "Lemon Squeezy",
    authorPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
    text: "I pasted 50 tweet URLs and had a stunning testimonials wall in under 10 minutes. No other tool makes collecting social proof this effortless.",
    rating: 5,
    tags: ["speed", "features"],
  },
  {
    id: "4",
    authorName: "David Park",
    authorTitle: "Product Lead",
    authorCompany: "Linear",
    authorPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
    text: "Smart Walls is a game-changer. Different testimonials for different pages means we can match social proof to whatever the visitor is evaluating. Brilliant concept.",
    rating: 5,
    tags: ["trust", "results"],
  },
  {
    id: "5",
    authorName: "Aisha Patel",
    authorTitle: "VP of Sales",
    authorCompany: "Stripe",
    authorPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=aisha",
    text: "We embedded Laudica on our pricing page and saw demo requests jump 28% in the first month. The ROI is absurd for the price.",
    rating: 5,
    tags: ["results", "pricing"],
  },
  {
    id: "6",
    authorName: "Tom Anderson",
    authorTitle: "Solo Founder",
    authorCompany: "IndieHacker",
    authorPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=tom",
    text: "Finally, a testimonials tool that doesn't look like it was built in 2015. The animations are buttery smooth and the embeds load lightning fast.",
    rating: 4,
    tags: ["quality", "speed"],
  },
  {
    id: "7",
    authorName: "Lisa Wang",
    authorTitle: "CTO",
    authorCompany: "Raycast",
    authorPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa",
    text: "The embed widget is incredibly lightweight. No layout shift, no performance hit. Our Lighthouse scores didn't budge after adding Laudica to every page.",
    rating: 5,
    tags: ["features", "speed"],
  },
  {
    id: "8",
    authorName: "James Mitchell",
    authorTitle: "Growth Engineer",
    authorCompany: "Notion",
    authorPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
    text: "We've tried Senja, Testimonial.to, and three others. Laudica is the only one that treats testimonials as conversion assets, not just a library to organize.",
    rating: 5,
    tags: ["trust", "results"],
  },
  {
    id: "9",
    authorName: "Nina Kowalski",
    authorTitle: "Head of Marketing",
    authorCompany: "Cal.com",
    authorPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=nina",
    text: "Setup took literally two minutes. The collection form is gorgeous and our customers love filling it out.",
    rating: 5,
    tags: ["onboarding", "quality"],
  },
];
