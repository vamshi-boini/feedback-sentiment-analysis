export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span>© {new Date().getFullYear()} SmartFeedback</span>
        <span className="footer-links">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
        </span>
      </div>
    </footer>
  );
}
