class Navbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        navbar-section {
          display: block;
          width: 100%;
        }

        .navbar-custom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: white;
          padding: 0.625rem 1.875rem;
          box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.05);
        }

        .logo a {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: var(--primary-color);
          font-size: 1.4rem;
          font-weight: bold;
        }

        .logo img {
          height: 5vh;
          margin-right: 0.5rem;
        }

        .nav-links {
          list-style: none;
          display: flex;
          margin: 0;
          padding: 0;
          gap: 1rem;
        }

        .nav-links a {
          text-decoration: none;
          color: var(--primary-color);
          padding: 0.4em 1em;
          border-radius: 0.6rem;
          transition: 0.3s;
          white-space: nowrap;
        }

        .nav-links a:hover,
        .nav-links a.active-link {
          background-color: var(--accent-green);
          color: white;
        }

        .logo .med {
          color: var(--primary-color);
        }

        .logo .guide {
          color: var(--accent-green);
        }

        @media (max-width: 48rem) {
          .navbar-custom {
            flex-direction: column;
            gap: 0.75rem;
          }

          .nav-links {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      </style>

      <nav class="navbar-custom">
        <div class="logo">
          <a href="home2.html">
            <img src="logo.png" alt="MedGuide Logo">
            <span class="med">Med</span><span class="guide">Guide</span>
          </a>
        </div>

        <ul class="nav-links">
          <li><a href="dashboard.html">Dashboard</a></li>
          <li><a href="accessmap.html">AccessMap</a></li>
          <li><a href="calendar.html">Calendar</a></li>
          <li><a href="mycondition.html">My Conditions</a></li>
          <li><a href="help.html">Help</a></li>
        </ul>
      </nav>
    `;
  }
}

customElements.define("navbar-section", Navbar);