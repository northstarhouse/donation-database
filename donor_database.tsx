import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Mail, Phone, MapPin, Building2 } from 'lucide-react';

const DonorDatabase = () => {
  const [donations, setDonations] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [activeTab, setActiveTab] = useState('2026-donations');
  
  const [donationFormData, setDonationFormData] = useState({
    donorName: '',
    amount: '',
    closeDate: '',
    donationType: '',
    paymentType: '',
    notes: '',
    benefits: '',
    acknowledged: false,
    acknowledgedDate: '',
    accountType: '',
    address: '',
    email: '',
    phone: '',
    informalName: '',
    lastName: ''
  });

  const [sponsorFormData, setSponsorFormData] = useState({
    businessName: '',
    mainContact: '',
    donationFMV: '',
    areaSupported: '',
    phoneNumber: '',
    emailAddress: '',
    mailingAddress: '',
    dateReceived: '',
    acknowledged: false,
    notes: '',
    nshContact: ''
  });

  useEffect(() => {
    const savedDonations = localStorage.getItem('nsh_donations');
    const savedSponsors = localStorage.getItem('nsh_sponsors');
    if (savedDonations) setDonations(JSON.parse(savedDonations));
    if (savedSponsors) setSponsors(JSON.parse(savedSponsors));
  }, []);

  useEffect(() => {
    if (donations.length > 0) {
      localStorage.setItem('nsh_donations', JSON.stringify(donations));
    }
  }, [donations]);

  useEffect(() => {
    if (sponsors.length > 0) {
      localStorage.setItem('nsh_sponsors', JSON.stringify(sponsors));
    }
  }, [sponsors]);

  const donationTypes = ['Annual Fund', 'Capital Campaign', 'In-Kind', 'Event Sponsorship', 'General', 'Grant', 'Memorial'];
  const paymentTypes = ['Check', 'Cash', 'Credit Card', 'Venmo', 'PayPal', 'Stock/Securities', 'Wire Transfer'];
  const accountTypes = ['Individual', 'Family', 'Corporate', 'Foundation', 'Government'];

  const handleDonationSubmit = () => {
    if (!donationFormData.donorName || !donationFormData.amount || !donationFormData.closeDate || !donationFormData.donationType || !donationFormData.paymentType || !donationFormData.accountType) {
      alert('Please fill in all required fields');
      return;
    }
    
    const newDonation = {
      ...donationFormData,
      id: Date.now(),
      amount: parseFloat(donationFormData.amount),
      closeDate: donationFormData.closeDate,
      acknowledgedDate: donationFormData.acknowledged ? donationFormData.acknowledgedDate : ''
    };
    setDonations([...donations, newDonation]);
    setDonationFormData({
      donorName: '',
      amount: '',
      closeDate: '',
      donationType: '',
      paymentType: '',
      notes: '',
      benefits: '',
      acknowledged: false,
      acknowledgedDate: '',
      accountType: '',
      address: '',
      email: '',
      phone: '',
      informalName: '',
      lastName: ''
    });
    setShowDonationForm(false);
  };

  const handleSponsorSubmit = () => {
    if (!sponsorFormData.businessName || !sponsorFormData.dateReceived) {
      alert('Please fill in Business Name and Date Received');
      return;
    }
    
    const newSponsor = {
      ...sponsorFormData,
      id: Date.now(),
      dateReceived: sponsorFormData.dateReceived
    };
    setSponsors([...sponsors, newSponsor]);
    setSponsorFormData({
      businessName: '',
      mainContact: '',
      donationFMV: '',
      areaSupported: '',
      phoneNumber: '',
      emailAddress: '',
      mailingAddress: '',
      dateReceived: '',
      acknowledged: false,
      notes: '',
      nshContact: ''
    });
    setShowSponsorForm(false);
  };

  const handleDonationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDonationFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSponsorChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSponsorFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const donations2026 = donations.filter(d => d.closeDate && d.closeDate.startsWith('2026'));
  const donations2025 = donations.filter(d => d.closeDate && d.closeDate.startsWith('2025'));
  const sponsors2026 = sponsors.filter(s => s.dateReceived && s.dateReceived.startsWith('2026'));
  const sponsors2025 = sponsors.filter(s => s.dateReceived && s.dateReceived.startsWith('2025'));

  let currentData = [];
  if (activeTab === '2026-donations') currentData = donations2026;
  else if (activeTab === '2025-donations') currentData = donations2025;
  else if (activeTab === '2026-sponsors') currentData = sponsors2026;
  else if (activeTab === '2025-sponsors') currentData = sponsors2025;

  const filteredData = currentData.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    if (activeTab.includes('donations')) {
      return (item.donorName && item.donorName.toLowerCase().includes(searchLower)) ||
             (item.email && item.email.toLowerCase().includes(searchLower)) ||
             (item.informalName && item.informalName.toLowerCase().includes(searchLower));
    } else {
      return (item.businessName && item.businessName.toLowerCase().includes(searchLower)) ||
             (item.mainContact && item.mainContact.toLowerCase().includes(searchLower)) ||
             (item.emailAddress && item.emailAddress.toLowerCase().includes(searchLower));
    }
  });

  const getDonorHistory = (donorName) => {
    const donorDonations = donations.filter(d => d.donorName === donorName);
    const total = donorDonations.reduce((sum, d) => sum + d.amount, 0);
    return { donations: donorDonations, total };
  };

  const getSponsorHistory = (businessName) => {
    return sponsors.filter(s => s.businessName === businessName);
  };

  const currentTotal = activeTab.includes('donations') 
    ? currentData.reduce((sum, d) => sum + d.amount, 0) 
    : 0;

  const isSponsorsView = activeTab.includes('sponsors');

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#FAF8F3',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #886c44 0%, #a88b65 100%)',
        padding: '2rem',
        color: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '600' }}>North Star House Donor Database</h1>
        <div style={{ 
          display: 'flex', 
          gap: '0.75rem', 
          marginTop: '1rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveTab('2026-donations')}
            style={{
              background: activeTab === '2026-donations' ? 'white' : 'rgba(255,255,255,0.2)',
              color: activeTab === '2026-donations' ? '#886c44' : 'white',
              border: 'none',
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              fontSize: '0.95rem',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            2026 Donations
          </button>
          <button
            onClick={() => setActiveTab('2025-donations')}
            style={{
              background: activeTab === '2025-donations' ? 'white' : 'rgba(255,255,255,0.2)',
              color: activeTab === '2025-donations' ? '#886c44' : 'white',
              border: 'none',
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              fontSize: '0.95rem',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            2025 Donations
          </button>
          <button
            onClick={() => setActiveTab('2026-sponsors')}
            style={{
              background: activeTab === '2026-sponsors' ? 'white' : 'rgba(255,255,255,0.2)',
              color: activeTab === '2026-sponsors' ? '#886c44' : 'white',
              border: 'none',
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              fontSize: '0.95rem',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            2026 Sponsors
          </button>
          <button
            onClick={() => setActiveTab('2025-sponsors')}
            style={{
              background: activeTab === '2025-sponsors' ? 'white' : 'rgba(255,255,255,0.2)',
              color: activeTab === '2025-sponsors' ? '#886c44' : 'white',
              border: 'none',
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              fontSize: '0.95rem',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            2025 Sponsors
          </button>
        </div>
      </div>

      <div style={{ 
        background: 'white',
        padding: '1.5rem 2rem',
        borderBottom: '1px solid #E5E5E5',
        display: 'flex',
        gap: '3rem',
        alignItems: 'center'
      }}>
        {!isSponsorsView && (
          <>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                Total {activeTab.includes('2026') ? '2026' : '2025'} Donations
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '600', color: '#886c44' }}>
                ${currentTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Number of Donations</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '600', color: '#886c44' }}>
                {currentData.length}
              </div>
            </div>
          </>
        )}
        {isSponsorsView && (
          <div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
              Total {activeTab.includes('2026') ? '2026' : '2025'} Sponsors
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '600', color: '#886c44' }}>
              {currentData.length}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={20} style={{ 
              position: 'absolute', 
              left: '1rem', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#999'
            }} />
            <input
              type="text"
              placeholder={isSponsorsView ? "Search sponsors..." : "Search donors..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                border: '1px solid #DDD',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>
          <button
            onClick={() => isSponsorsView ? setShowSponsorForm(true) : setShowDonationForm(true)}
            style={{
              background: '#886c44',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '500'
            }}
          >
            <Plus size={20} />
            {isSponsorsView ? 'Add Sponsor' : 'Add Donation'}
          </button>
        </div>

        <div style={{ 
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F5F5F5' }}>
                {!isSponsorsView ? (
                  <>
                    <th style={headerStyle}>Donor Name</th>
                    <th style={headerStyle}>Amount</th>
                    <th style={headerStyle}>Date</th>
                    <th style={headerStyle}>Type</th>
                    <th style={headerStyle}>Payment</th>
                    <th style={headerStyle}>Acknowledged</th>
                  </>
                ) : (
                  <>
                    <th style={headerStyle}>Business Name</th>
                    <th style={headerStyle}>Main Contact</th>
                    <th style={headerStyle}>Area Supported</th>
                    <th style={headerStyle}>Date Received</th>
                    <th style={headerStyle}>Acknowledged</th>
                    <th style={headerStyle}>NSH Contact</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => (
                <tr 
                  key={item.id}
                  style={{ 
                    borderBottom: '1px solid #F0F0F0',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAFA'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  onClick={() => isSponsorsView ? setSelectedSponsor(item.businessName) : setSelectedDonor(item.donorName)}
                >
                  {!isSponsorsView ? (
                    <>
                      <td style={cellStyle}>
                        <div style={{ fontWeight: '500', color: '#886c44' }}>{item.donorName}</div>
                        {item.informalName && (
                          <div style={{ fontSize: '0.875rem', color: '#666' }}>({item.informalName})</div>
                        )}
                      </td>
                      <td style={cellStyle}>
                        <span style={{ fontWeight: '600' }}>
                          ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td style={cellStyle}>{item.closeDate}</td>
                      <td style={cellStyle}>{item.donationType}</td>
                      <td style={cellStyle}>{item.paymentType}</td>
                      <td style={cellStyle}>
                        {item.acknowledged ? (
                          <span style={{ color: '#28A745' }}>✓ {item.acknowledgedDate}</span>
                        ) : (
                          <span style={{ color: '#999' }}>Pending</span>
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={cellStyle}>
                        <div style={{ fontWeight: '500', color: '#886c44' }}>{item.businessName}</div>
                      </td>
                      <td style={cellStyle}>{item.mainContact}</td>
                      <td style={cellStyle}>{item.areaSupported}</td>
                      <td style={cellStyle}>{item.dateReceived}</td>
                      <td style={cellStyle}>
                        {item.acknowledged ? (
                          <span style={{ color: '#28A745' }}>✓</span>
                        ) : (
                          <span style={{ color: '#999' }}>Pending</span>
                        )}
                      </td>
                      <td style={cellStyle}>{item.nshContact}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
              No {isSponsorsView ? 'sponsors' : 'donations'} found for {activeTab.includes('2026') ? '2026' : '2025'}
            </div>
          )}
        </div>
      </div>

      {/* Donation Form Modal */}
      {showDonationForm && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{ margin: 0, color: '#886c44' }}>Add New Donation</h2>
              <button onClick={() => setShowDonationForm(false)} style={closeButtonStyle}>
                <X size={24} color="#666" />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={formGridStyle}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Donor Name *</label>
                  <input type="text" name="donorName" value={donationFormData.donorName} onChange={handleDonationChange} style={inputStyle} />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Last Name</label>
                  <input type="text" name="lastName" value={donationFormData.lastName} onChange={handleDonationChange} style={inputStyle} />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Informal Name</label>
                  <input type="text" name="informalName" value={donationFormData.informalName} onChange={handleDonationChange} style={inputStyle} />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Amount *</label>
                  <input type="number" step="0.01" name="amount" value={donationFormData.amount} onChange={handleDonationChange} style={inputStyle} />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Close Date *</label>
                  <input type="date" name="closeDate" value={donationFormData.closeDate} onChange={handleDonationChange} style={inputStyle} />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Donation Type *</label>
                  <select name="donationType" value={donationFormData.donationType} onChange={handleDonationChange} style={inputStyle}>
                    <option value="">Select...</option>
                    {donationTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Payment Type *</label>
                  <select name="paymentType" value={donationFormData.paymentType} onChange={handleDonationChange} style={inputStyle}>
                    <option value="">Select...</option>
                    {paymentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Account Type *</label>
                  <select name="accountType" value={donationFormData.accountType} onChange={handleDonationChange} style={inputStyle}>
                    <option value="">Select...</option>
                    {accountTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Email</label>
                  <input type="email" name="email" value={donationFormData.email} onChange={handleDonationChange} style={inputStyle} />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Phone</label>
                  <input type="tel" name="phone" value={donationFormData.phone} onChange={handleDonationChange} style={inputStyle} />
                </div>
                <div style={{ ...formGroupStyle, gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Address</label>
                  <input type="text" name="address" value={donationFormData.address} onChange={handleDonationChange} style={inputStyle} />
                </div>
                <div style={{ ...formGroupStyle, gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Benefits</label>
                  <input type="text" name="benefits" value={donationFormData.benefits} onChange={handleDonationChange} style={inputStyle} placeholder="Event tickets, naming rights, etc." />
                </div>
                <div style={{ ...formGroupStyle, gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Notes</label>
                  <textarea name="notes" value={donationFormData.notes} onChange={handleDonationChange} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
                </div>
                <div style={{ ...formGroupStyle, gridColumn: '1 / -1' }}>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" name="acknowledged" checked={donationFormData.acknowledged} onChange={handleDonationChange} style={{ width: 'auto' }} />
                    Acknowledged
                  </label>
                </div>
                {donationFormData.acknowledged && (
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Acknowledged Date</label>
                    <input type="date" name="acknowledgedDate" value={donationFormData.acknowledgedDate} onChange={handleDonationChange} style={inputStyle} />
                  </div>
                )}
              </div>
              <div style={formButtonsStyle}>
                <button onClick={() => setShowDonationForm(false)} style={cancelButtonStyle}>Cancel</button>
                <button onClick={handleDonationSubmit} style={submitButtonStyle}>Add Donation</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sponsor Form Modal */}
      {showSponsorForm && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{ margin: 0, color: '#886c44' }}>Add New Sponsor</h2>
              <button onClick={() => setShowSponsorForm(false)} style={closeButtonStyle}>
                <X size={24} color="#666" />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={formGridStyle}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Business Name *</label>
                  <input type="text" name="businessName" value={sponsorFormData.businessName} onChange={handleSponsorChange} style={inputStyle} />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Main Contact</label>
                  <input type="text" name="mainContact" value={sponsorFormData.mainContact} onChange={handleSponsorChange} style={inputStyle} />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Donation Fair Market Value</label>
                  <input type="text" name="donationFMV" value={sponsorFormData.donationFMV} onChange={handleSponsorChange} style={inputStyle} placeholder="e.g., $170/hr or services" />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Area Supported</label>
                  <input type="text" name="areaSupported" value={sponsorFormData.areaSupported} onChange={handleSponsorChange} style={inputStyle} placeholder="e.g., Restoration" />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Date Received *</label>
                  <input type="date" name="dateReceived" value={sponsorFormData.dateReceived} onChange={handleSponsorChange} style={inputStyle} />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>NSH Contact</label>
                  <input type="text" name="nshContact" value={sponsorFormData.nshContact} onChange={handleSponsorChange} style={inputStyle} />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Email Address</label>
                  <input type="email" name="emailAddress" value={sponsorFormData.emailAddress} onChange={handleSponsorChange} style={inputStyle} />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Phone Number</label>
                  <input type="tel" name="phoneNumber" value={sponsorFormData.phoneNumber} onChange={handleSponsorChange} style={inputStyle} />
                </div>
                <div style={{ ...formGroupStyle, gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Mailing Address</label>
                  <input type="text" name="mailingAddress" value={sponsorFormData.mailingAddress} onChange={handleSponsorChange} style={inputStyle} />
                </div>
                <div style={{ ...formGroupStyle, gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Notes</label>
                  <textarea name="notes" value={sponsorFormData.notes} onChange={handleSponsorChange} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
                </div>
                <div style={{ ...formGroupStyle, gridColumn: '1 / -1' }}>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" name="acknowledged" checked={sponsorFormData.acknowledged} onChange={handleSponsorChange} style={{ width: 'auto' }} />
                    Acknowledged
                  </label>
                </div>
              </div>
              <div style={formButtonsStyle}>
                <button onClick={() => setShowSponsorForm(false)} style={cancelButtonStyle}>Cancel</button>
                <button onClick={handleSponsorSubmit} style={submitButtonStyle}>Add Sponsor</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donor Detail Modal */}
      {selectedDonor && (() => {
        const { donations: donorDonations, total } = getDonorHistory(selectedDonor);
        const donorInfo = donorDonations[0];
        
        return (
          <div style={modalOverlayStyle}>
            <div style={modalStyle}>
              <div style={modalHeaderStyle}>
                <div>
                  <h2 style={{ margin: 0, color: '#886c44' }}>{selectedDonor}</h2>
                  {donorInfo.informalName && (
                    <p style={{ margin: '0.25rem 0 0 0', color: '#666' }}>({donorInfo.informalName})</p>
                  )}
                </div>
                <button onClick={() => setSelectedDonor(null)} style={closeButtonStyle}>
                  <X size={24} color="#666" />
                </button>
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#886c44', fontSize: '1.125rem' }}>Contact Information</h3>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {donorInfo.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mail size={18} color="#886c44" />
                        <span>{donorInfo.email}</span>
                      </div>
                    )}
                    {donorInfo.phone && (
                      <div style={{ display: 'flex', alignItems: 'center