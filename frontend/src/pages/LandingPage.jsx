import { Link } from 'react-router-dom';
import PropTypes from 'prop-types'; // Adding PropTypes for validation

const LandingPage = () => {
  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 container mx-auto px-6 flex flex-col justify-center items-center">
        <div className="text-center max-w-5xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Welcome User
          </h1>
          <p className="text-xl text-gray-300 mb-3">
            A secure and efficient platform for managing and sharing resources with role-based access control.
          </p>
          <p className="text-base text-blue-400 mb-8 italic">
            There is a platform where you can upload your stuff and access other cowerkers' stuff.
          </p>
          
          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <FeatureCard
              title="User Access"
              description="View Available PO"
              icon="👥"
            />
            <FeatureCard
              title="Admin Panel"
              description="Manage content & users"
              icon="⚡"
            />
            <FeatureCard
              title="Contact"
              description="Contact authority"
              icon="🔒"
            />
          </div>

          {/* Tech Stack */}
          {/* <div className="flex flex-wrap justify-center gap-3 mb-8">
            <TechBadge text="React" />
            <TechBadge text="Node.js" />
            <TechBadge text="PostgreSQL" />
            <TechBadge text="Tailwind" />
          </div> */}

          {/* CTA Buttons */}
          <div className="flex justify-center gap-4">
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-3 px-8 rounded-lg transition duration-300"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold text-lg py-3 px-8 rounded-lg transition duration-300"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-4">
        <p className="text-gray-400 text-center text-base">
          © 2025 NoticeBoard. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ title, description, icon }) => {
  return (
    <div className="bg-gray-800 p-5 rounded-lg hover:bg-gray-700 transition duration-300">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
};

FeatureCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired
};

const TechBadge = ({ text }) => {
  return (
    <span className="bg-gray-800 text-blue-400 px-4 py-2 rounded-full text-sm font-semibold">
      {text}
    </span>
  );
};

TechBadge.propTypes = {
  text: PropTypes.string.isRequired
};

export default LandingPage; 