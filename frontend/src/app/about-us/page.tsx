"use client";
export default function AboutUsPage() {
  return (
    <section className="px-6 py-16 max-w-5xl mx-auto text-center space-y-12">
      {/* Heading */}
      <div>
        <h2 className="text-3xl sm:text-4xl font-semibold mb-4">About Us</h2>
        <p className="text-base sm:text-lg text-gray-700">
          Your simple choice for everyday style.
        </p>
      </div>

      {/* Brand Philosophy */}
      <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
        At <strong>ZaytounaMart </strong>, we believe that{" "}
        <em>“less is more.”</em>
        <br />
        Our brand was born from a passion for clean design and practical living.
        Every item is carefully selected to match your ZaytounaMart  lifestyle with
        purpose and simplicity.
      </p>

      {/* Core Values */}
      <div className="grid gap-8 text-left sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h4 className="font-semibold text-xl mb-2">🤍 ZaytounaMart Design</h4>
          <p className="text-gray-600 text-base sm:text-lg">
            Clean, calming, and easy to navigate — no clutter, no stress.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-xl mb-2">🔧 Function First</h4>
          <p className="text-gray-600 text-base sm:text-lg">
            It&apos;s not just about aesthetics — it&apos;s about usability and
            quality that lasts.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-xl mb-2">🫶 Customer-Centered</h4>
          <p className="text-gray-600 text-base sm:text-lg">
            We listen. Your feedback shapes our store and inspires every
            decision we make.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div>
        <h4 className="text-xl sm:text-2xl font-semibold mb-2">
          🛍️ Our Mission
        </h4>
        <p className="text-gray-600 text-base sm:text-lg">
          To simplify your shopping experience — one meaningful product at a
          time.
        </p>
      </div>

      {/* Location */}
      <div>
        <h4 className="text-xl sm:text-2xl font-semibold mb-2">
          📍 Based in Palestine Ramallah
        </h4>
        <p className="text-gray-600 text-base sm:text-lg">
          We ship nationwide and are always expanding our reach.
        </p>
      </div>

      {/* Thank You */}
      <blockquote className="text-gray-700 italic border-l-4 border-gray-400 pl-4 text-left text-base sm:text-lg">
        Thank you for supporting an independent brand with intention and care.
        <br />
        <span className="not-italic font-semibold block mt-2">
          ZaytounaMart — the calm side of commerce.
        </span>
      </blockquote>
    </section>
  );
}
