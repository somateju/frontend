import "./Home.css";

function Home({ onLogin, onRegister }) {

  return (
    <div className="home-page">

      {/* NAVBAR */}
      <nav className="home-navbar">

        <div className="home-logo">
          <span className="home-logo-icon">⌂</span>
          <span>Smart Hostel</span>
        </div>

        <div className="home-nav-links">
          <a className="active">Home</a>
          <a>Features</a>
          <a>About</a>
          <a>Contact</a>
        </div>

        <button
          className="home-login-button"
          onClick={onLogin}
        >
          <span>♙</span>
          Login
        </button>

      </nav>


      {/* HERO */}
      <section className="hero-section">

        <div className="hero-left">

          <div className="hero-badge">
            ✨ &nbsp; Smarter. Fairer. Better.
          </div>

          <h1>
            <span className="hero-dark">
              Smart Hostel
            </span>

            <span className="hero-gradient">
              Roommate Matching &
              <br />
              Room Allocation
            </span>
          </h1>

          <p className="hero-description">
            Find the best roommate based on your
            lifestyle, preferences and compatibility.
            Manage hostel rooms and allocations easily
            through one smart system.
          </p>

          <div className="hero-buttons">

            <button
              className="hero-main-button"
              onClick={onLogin}
            >
              <span>→</span>
              Login to Continue
            </button>

            <button
              className="hero-register-button"
              onClick={onRegister}
            >
              Create Student Account
            </button>

          </div>

        </div>


        {/* ROOM ILLUSTRATION */}
        <div className="hero-right">

          <div className="room-illustration">

            <div className="room-window">
              <div className="window-sky"></div>
              <div className="window-ground"></div>
            </div>

            <div className="room-shelf shelf-left">
              <span>📚</span>
              <span>📕</span>
            </div>

            <div className="room-shelf shelf-right">
              <span>📚</span>
              <span>📗</span>
            </div>

            <div className="desk">
              <div className="laptop">💻</div>
              <div className="plant">🌿</div>
            </div>

            <div className="bed bed-left">
              <div className="pillow blue"></div>
              <div className="blanket blue-blanket"></div>
            </div>

            <div className="bed bed-right">
              <div className="pillow purple"></div>
              <div className="blanket purple-blanket"></div>
            </div>

            <div className="chair">
              🪑
            </div>

            <div className="wardrobe">
              <div className="wardrobe-door"></div>
            </div>

            <div className="room-board">
              <strong>
                Better Rooms
              </strong>

              <strong>
                Better Friends
              </strong>

              <span>☺</span>
            </div>

          </div>

        </div>

      </section>


      {/* FEATURES */}
      <section className="features-section">

        <div className="feature-card">

          <div className="feature-icon blue-icon">
            👥
          </div>

          <h3>
            Smart Matching
          </h3>

          <p>
            Find compatible roommates
            based on your preferences.
          </p>

        </div>


        <div className="feature-card">

          <div className="feature-icon purple-icon">
            🛏️
          </div>

          <h3>
            Room Management
          </h3>

          <p>
            View and manage hostel
            rooms and allocations.
          </p>

        </div>


        <div className="feature-card">

          <div className="feature-icon green-icon">
            ⚙️
          </div>

          <h3>
            Personalized Preferences
          </h3>

          <p>
            Set your lifestyle and
            roommate preferences.
          </p>

        </div>


        <div className="feature-card">

          <div className="feature-icon orange-icon">
            🛡️
          </div>

          <h3>
            Fair & Efficient
          </h3>

          <p>
            Best matches through
            smart algorithms.
          </p>

        </div>

      </section>

    </div>
  );
}

export default Home;