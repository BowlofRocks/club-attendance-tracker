import './index.css';

const Contact = () => {
  return (
    <div className="contact-container">
      <h2 className="contact-title">Contact Us</h2>
      
      <div className="contact-card">
        <div className="contact-info">
          <h3>Primary Contact</h3>
          <div className="contact-detail">
            <span className="contact-label">Email:</span>
            <a href="mailto:rexburghema@gmail.com" className="contact-email">
              rexburghema@gmail.com
            </a>
          </div>
        </div>
      </div>
      
      <p className="contact-message">
        For any questions or concerns, please reach out to us at the email above.
      </p>
    </div>
  );
};

export default Contact;
