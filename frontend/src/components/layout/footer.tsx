import React from "react";
import { 
  FaFacebook, 
  FaInstagram, 
  FaLinkedin, 
  FaTwitter, 
  FaPlane,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaYoutube
} from "react-icons/fa";

interface Footer7Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  sections?: Array<{
    title: string;
    links: Array<{ name: string; href: string }>;
  }>;
  description?: string;
  socialLinks?: Array<{
    icon: React.ReactElement;
    href: string;
    label: string;
  }>;
  copyright?: string;
  legalLinks?: Array<{
    name: string;
    href: string;
  }>;
}

const defaultSections = [
  {
    title: "Quick Links",
    links: [
      { name: "Flights", href: "/flight" },
      { name: "Hotels", href: "/hotels" },
      { name: "Car Rentals", href: "/car-rentals" },
      { name: "Packages", href: "/packages" },
      { name: "Places", href: "/places" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "#careers" },
      { name: "Blog", href: "#blog" },
      { name: "Press", href: "#press" },
      { name: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help Center", href: "#help" },
      { name: "My Bookings", href: "/my-bookings" },
      { name: "FAQs", href: "#faq" },
      { name: "Cancellation", href: "#cancellation" },
      { name: "Refund Policy", href: "#refund" },
    ],
  },
];

const defaultSocialLinks = [
  { icon: <FaFacebook className="size-5" />, href: "#", label: "Facebook" },
  { icon: <FaTwitter className="size-5" />, href: "#", label: "Twitter" },
  { icon: <FaInstagram className="size-5" />, href: "#", label: "Instagram" },
  { icon: <FaLinkedin className="size-5" />, href: "#", label: "LinkedIn" },
  { icon: <FaYoutube className="size-5" />, href: "#", label: "YouTube" },
];

const defaultLegalLinks = [
  { name: "Terms of Service", href: "#terms" },
  { name: "Privacy Policy", href: "#privacy" },
  { name: "Cookie Policy", href: "#cookies" },
];

const Footer = ({
  logo = {
    url: "/",
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg",
    alt: "CloudRush Logo",
    title: "CloudRush",
  },
  sections = defaultSections,
  description = "Your trusted travel partner for unforgettable journeys. Book flights, hotels, and complete travel packages at the best prices.",
  socialLinks = defaultSocialLinks,
  copyright = `© ${new Date().getFullYear()} CloudRush. All rights reserved.`,
  legalLinks = defaultLegalLinks,
}: Footer7Props) => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Company Info - Spans 2 columns on large screens */}
            <div className="lg:col-span-2">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-4">
                <a href={logo.url} className="flex items-center gap-3 group">
                  <div className="bg-linear-to-r from-[#07401F] to-[#148C56] p-2 rounded-lg group-hover:scale-105 transition-transform">
                    <FaPlane className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold bg-linear-to-r from-[#07401F] to-[#148C56] bg-clip-text text-transparent">
                    {logo.title}
                  </span>
                </a>
              </div>
              
              {/* Description */}
              <p className="text-foreground/70 mb-6 leading-relaxed max-w-sm">
                {description}
              </p>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-foreground/70 hover:text-[#148C56] transition-colors">
                  <FaPhone className="text-[#148C56]" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-foreground/70 hover:text-[#148C56] transition-colors">
                  <FaEnvelope className="text-[#148C56]" />
                  <span className="text-sm">support@cloudrush.com</span>
                </div>
                <div className="flex items-start gap-3 text-foreground/70">
                  <FaMapMarkerAlt className="text-[#148C56] mt-1" />
                  <span className="text-sm">123 Travel Street, Suite 456<br />New York, NY 10001</span>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Follow Us</p>
                <div className="flex items-center gap-3">
                  {socialLinks.map((social, idx) => (
                    <a
                      key={idx}
                      href={social.href}
                      aria-label={social.label}
                      className="bg-muted hover:bg-[#148C56] text-foreground hover:text-white p-2.5 rounded-full transition-all duration-300 hover:scale-110"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Sections - Each spans 1 column */}
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="text-lg font-bold text-[#148C56] mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a
                        href={link.href}
                        className="text-foreground/70 hover:text-[#148C56] text-sm transition-colors duration-200 inline-block hover:translate-x-1 transform"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-border py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold text-[#148C56] mb-2">
                Subscribe to our Newsletter
              </h3>
              <p className="text-sm text-foreground/70">
                Get the latest deals and travel tips delivered to your inbox
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2.5 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-[#148C56] focus:border-transparent text-sm"
              />
              <button className="bg-linear-to-r from-[#07401F] to-[#148C56] text-white px-6 py-2.5 rounded-lg hover:from-[#148C56] hover:to-[#148C11] transition-all duration-300 font-semibold text-sm whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-foreground/70 text-center md:text-left">
              {copyright}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {legalLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  className="text-sm text-foreground/70 hover:text-[#148C56] transition-colors duration-200"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-border py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">Secure Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">Best Price Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
              </svg>
              <span className="text-xs font-medium">Free Cancellation</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
