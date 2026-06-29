function Details() {
  const businessDetails = {
    companyName: "RupeeVyze",
    primaryPhone: "9686899698",
    secondaryPhone: "8296504204",
    email: "hello@rupeevyze.com",
    website: "www.rupeevyze.com",
    city: "Bengaluru",
    financialYear: "FY 2025–26",
    tataAiaCode: "TAIA-XXXXX",
    irdaiCode: "IRDAI-XXXXX",
    recruitmentTarget: "100"
  };

  return (
    <div className="details-page">
      <h1>Details</h1>
      
      <section className="business-details-section">
        <div className="section-header">
          <h2>Business Details</h2>
          <p className="section-subtitle">Edit your distribution business details here.</p>
        </div>

        <div className="details-grid">
          <div className="detail-card">
            <label className="detail-label">Company / Brand Name</label>
            <p className="detail-value">{businessDetails.companyName}</p>
          </div>

          <div className="detail-card">
            <label className="detail-label">Primary Phone</label>
            <p className="detail-value">{businessDetails.primaryPhone}</p>
          </div>

          <div className="detail-card">
            <label className="detail-label">Secondary Phone</label>
            <p className="detail-value">{businessDetails.secondaryPhone}</p>
          </div>

          <div className="detail-card">
            <label className="detail-label">Email</label>
            <p className="detail-value">
              <a href={`mailto:${businessDetails.email}`}>{businessDetails.email}</a>
            </p>
          </div>

          <div className="detail-card">
            <label className="detail-label">Website</label>
            <p className="detail-value">
              <a href={`https://${businessDetails.website}`} target="_blank" rel="noopener noreferrer">
                {businessDetails.website}
              </a>
            </p>
          </div>

          <div className="detail-card">
            <label className="detail-label">City / HQ</label>
            <p className="detail-value">{businessDetails.city}</p>
          </div>

          <div className="detail-card">
            <label className="detail-label">Financial Year</label>
            <p className="detail-value">{businessDetails.financialYear}</p>
          </div>

          <div className="detail-card">
            <label className="detail-label">TATA AIA Distributor Code</label>
            <p className="detail-value">{businessDetails.tataAiaCode}</p>
          </div>

          <div className="detail-card">
            <label className="detail-label">IRDAI Corporate Agent / POSP Code</label>
            <p className="detail-value">{businessDetails.irdaiCode}</p>
          </div>

          <div className="detail-card">
            <label className="detail-label">Recruitment Target (FY)</label>
            <p className="detail-value">{businessDetails.recruitmentTarget}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Details;
