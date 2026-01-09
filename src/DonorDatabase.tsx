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
      background: '#F7F2E9',
      fontFamily: '"Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{ 
        background: '#8B6B45',
        padding: '2.25rem 2.5rem',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: '2.35rem', fontWeight: '700', letterSpacing: '0.2px', fontFamily: '"Cormorant Garamond", "Times New Roman", serif' }}>North Star House Donor Database</h1>
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginTop: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveTab('2026-donations')}
            style={{
              background: activeTab === '2026-donations' ? 'white' : '#A48763',
              color: activeTab === '2026-donations' ? '#8B6B45' : 'white',
              border: 'none',
              padding: '0.65rem 1.6rem',
              borderRadius: '12px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: activeTab === '2026-donations' ? '0 2px 6px rgba(0,0,0,0.12)' : 'none'
            }}
          >
            2026 Donations
          </button>
          <button
            onClick={() => setActiveTab('2025-donations')}
            style={{
              background: activeTab === '2025-donations' ? 'white' : '#A48763',
              color: activeTab === '2025-donations' ? '#8B6B45' : 'white',
              border: 'none',
              padding: '0.65rem 1.6rem',
              borderRadius: '12px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: activeTab === '2025-donations' ? '0 2px 6px rgba(0,0,0,0.12)' : 'none'
            }}
          >
            2025 Donations
          </button>
          <button
            onClick={() => setActiveTab('2026-sponsors')}
            style={{
              background: activeTab === '2026-sponsors' ? 'white' : '#A48763',
              color: activeTab === '2026-sponsors' ? '#8B6B45' : 'white',
              border: 'none',
              padding: '0.65rem 1.6rem',
              borderRadius: '12px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: activeTab === '2026-sponsors' ? '0 2px 6px rgba(0,0,0,0.12)' : 'none'
            }}
          >
            2026 Sponsors
          </button>
          <button
            onClick={() => setActiveTab('2025-sponsors')}
            style={{
              background: activeTab === '2025-sponsors' ? 'white' : '#A48763',
              color: activeTab === '2025-sponsors' ? '#8B6B45' : 'white',
              border: 'none',
              padding: '0.65rem 1.6rem',
              borderRadius: '12px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: activeTab === '2025-sponsors' ? '0 2px 6px rgba(0,0,0,0.12)' : 'none'
            }}
          >
            2025 Sponsors
          </button>
        </div>
      </div>

      <div style={{ 
        background: 'white',
        padding: '2rem 2.5rem',
        borderBottom: '1px solid #E3DBD0',
        display: 'flex',
        gap: '4rem',
        alignItems: 'center'
      }}>
        {!isSponsorsView && (
          <>
            <div>
              <div style={{ fontSize: '0.95rem', color: '#7A6A58', marginBottom: '0.4rem' }}>
                Total {activeTab.includes('2026') ? '2026' : '2025'} Donations
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '600', color: '#8B6B45' }}>
                ${currentTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', color: '#7A6A58', marginBottom: '0.4rem' }}>Number of Donations</div>
              <div style={{ fontSize: '2rem', fontWeight: '600', color: '#8B6B45' }}>
                {currentData.length}
              </div>
            </div>
          </>
        )}
        {isSponsorsView && (
          <div>
            <div style={{ fontSize: '0.95rem', color: '#7A6A58', marginBottom: '0.4rem' }}>
              Total {activeTab.includes('2026') ? '2026' : '2025'} Sponsors
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '600', color: '#8B6B45' }}>
              {currentData.length}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '2.5rem' }}>
        <div style={{ 
          display: 'flex', 
          gap: '1.5rem', 
          marginBottom: '2.5rem',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '520px' }}>
            <Search size={20} style={{ 
              position: 'absolute', 
              left: '1.1rem', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#9A8C7C'
            }} />
            <input
              type="text"
              placeholder={isSponsorsView ? "Search sponsors..." : "Search donors..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem 0.85rem 3rem',
                border: '1px solid #E3DBD0',
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'white',
                color: '#3F3226'
              }}
            />
          </div>
          <button
            onClick={() => isSponsorsView ? setShowSponsorForm(true) : setShowDonationForm(true)}
            style={{
              background: '#8B6B45',
              color: 'white',
              border: 'none',
              padding: '0.85rem 1.6rem',
              borderRadius: '12px',
              fontSize: '1.05rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
            }}
          >
            <Plus size={20} />
            {isSponsorsView ? 'Add Sponsor' : 'Add Donation'}
          </button>
        </div>

        <div style={{ 
          background: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 1px 6px rgba(0,0,0,0.08)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F7F2E9' }}>
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
                    <th style={headerStyle}>Donation Fair Market Value</th>
                    <th style={headerStyle}>Area Supported</th>
                    <th style={headerStyle}>Phone Number</th>
                    <th style={headerStyle}>Email Address</th>
                    <th style={headerStyle}>Mailing Address</th>
                    <th style={headerStyle}>Date Received</th>
                    <th style={headerStyle}>Acknowledged</th>
                    <th style={headerStyle}>Notes</th>
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
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F7F2E9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  onClick={() => isSponsorsView ? setSelectedSponsor(item.businessName) : setSelectedDonor(item.donorName)}
                >
                  {!isSponsorsView ? (
                    <>
                      <td style={cellStyle}>
                        <div style={{ fontWeight: '500', color: '#8B6B45' }}>{item.donorName}</div>
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
                          <span style={{ color: '#2E7D32', fontWeight: '600' }}>
                            Yes{item.acknowledgedDate ? ` (${item.acknowledgedDate})` : ''}
                          </span>
                        ) : (
                          <span style={{ color: '#9A8C7C' }}>Pending</span>
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={cellStyle}>
                        <div style={{ fontWeight: '500', color: '#8B6B45' }}>{item.businessName}</div>
                      </td>
                      <td style={cellStyle}>{item.mainContact}</td>
                      <td style={cellStyle}>{item.donationFMV}</td>
                      <td style={cellStyle}>{item.areaSupported}</td>
                      <td style={cellStyle}>{item.phoneNumber}</td>
                      <td style={cellStyle}>{item.emailAddress}</td>
                      <td style={cellStyle}>{item.mailingAddress}</td>
                      <td style={cellStyle}>{item.dateReceived}</td>
                      <td style={cellStyle}>
                        {item.acknowledged ? (
                          <span style={{ color: '#2E7D32', fontWeight: '600' }}>Yes</span>
                        ) : (
                          <span style={{ color: '#9A8C7C' }}>Pending</span>
                        )}
                      </td>
                      <td style={cellStyle}>{item.notes}</td>
                      <td style={cellStyle}>{item.nshContact}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9A8C7C' }}>
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
              <h2 style={{ margin: 0, color: '#8B6B45' }}>Add New Donation</h2>
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
              <h2 style={{ margin: 0, color: '#8B6B45' }}>Add New Sponsor</h2>
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
                  <h2 style={{ margin: 0, color: '#8B6B45' }}>{selectedDonor}</h2>
                  {donorInfo.informalName && (
                    <p style={{ margin: '0.25rem 0 0 0', color: '#7A6A58' }}>({donorInfo.informalName})</p>
                  )}
                </div>
                <button onClick={() => setSelectedDonor(null)} style={closeButtonStyle}>
                  <X size={24} color="#6E5B44" />
                </button>
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                <div style={detailCardStyle}>
                  <h3 style={detailTitleStyle}>Contact Information</h3>
                  <div style={detailGridStyle}>
                    {donorInfo.email && (
                      <div style={detailRowStyle}>
                        <Mail size={18} color="#8B6B45" />
                        <span>{donorInfo.email}</span>
                      </div>
                    )}
                    {donorInfo.phone && (
                      <div style={detailRowStyle}>
                        <Phone size={18} color="#8B6B45" />
                        <span>{donorInfo.phone}</span>
                      </div>
                    )}
                    {donorInfo.address && (
                      <div style={detailRowStyle}>
                        <MapPin size={18} color="#8B6B45" />
                        <span>{donorInfo.address}</span>
                      </div>
                    )}
                    {donorInfo.accountType && (
                      <div style={detailRowStyle}>
                        <Building2 size={18} color="#8B6B45" />
                        <span>{donorInfo.accountType}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={detailCardStyle}>
                  <h3 style={detailTitleStyle}>Donation History</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#6E5B44', fontSize: '0.95rem' }}>
                    <span>Total</span>
                    <span style={{ fontWeight: '600', color: '#8B6B45' }}>
                      ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {donorDonations.map((donation) => (
                      <div key={donation.id} style={detailItemRowStyle}>
                        <div>
                          <div style={{ fontWeight: '600' }}>{donation.closeDate}</div>
                          <div style={{ fontSize: '0.85rem', color: '#7A6A58' }}>
                            {donation.donationType} - {donation.paymentType}
                          </div>
                        </div>
                        <div style={{ fontWeight: '600' }}>
                          ${donation.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Sponsor Detail Modal */}
      {selectedSponsor && (() => {
        const sponsorHistory = getSponsorHistory(selectedSponsor);
        const sponsorInfo = sponsorHistory[0];

        return (
          <div style={modalOverlayStyle}>
            <div style={modalStyle}>
              <div style={modalHeaderStyle}>
                <div>
                  <h2 style={{ margin: 0, color: '#8B6B45' }}>{selectedSponsor}</h2>
                  {sponsorInfo.mainContact && (
                    <p style={{ margin: '0.25rem 0 0 0', color: '#7A6A58' }}>{sponsorInfo.mainContact}</p>
                  )}
                </div>
                <button onClick={() => setSelectedSponsor(null)} style={closeButtonStyle}>
                  <X size={24} color="#6E5B44" />
                </button>
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                <div style={detailCardStyle}>
                  <h3 style={detailTitleStyle}>Contact Information</h3>
                  <div style={detailGridStyle}>
                    {sponsorInfo.emailAddress && (
                      <div style={detailRowStyle}>
                        <Mail size={18} color="#8B6B45" />
                        <span>{sponsorInfo.emailAddress}</span>
                      </div>
                    )}
                    {sponsorInfo.phoneNumber && (
                      <div style={detailRowStyle}>
                        <Phone size={18} color="#8B6B45" />
                        <span>{sponsorInfo.phoneNumber}</span>
                      </div>
                    )}
                    {sponsorInfo.mailingAddress && (
                      <div style={detailRowStyle}>
                        <MapPin size={18} color="#8B6B45" />
                        <span>{sponsorInfo.mailingAddress}</span>
                      </div>
                    )}
                    {sponsorInfo.areaSupported && (
                      <div style={detailRowStyle}>
                        <Building2 size={18} color="#8B6B45" />
                        <span>{sponsorInfo.areaSupported}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={detailCardStyle}>
                  <h3 style={detailTitleStyle}>Sponsorship History</h3>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {sponsorHistory.map((sponsor) => (
                      <div key={sponsor.id} style={detailItemRowStyle}>
                        <div>
                          <div style={{ fontWeight: '600' }}>{sponsor.dateReceived}</div>
                          <div style={{ fontSize: '0.85rem', color: '#7A6A58' }}>
                            {sponsor.areaSupported || 'General'} - {sponsor.nshContact || 'NSH'}
                          </div>
                        </div>
                        <div style={{ fontWeight: '600' }}>
                          {sponsor.donationFMV || 'In-kind'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

const headerStyle = {
  textAlign: 'left',
  padding: '1rem 1.25rem',
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  color: '#8B6B45',
  fontFamily: '"Helvetica Neue", Arial, sans-serif',
  fontWeight: '700',
  letterSpacing: '0.05em',
  background: '#F7F2E9'
};

const cellStyle = {
  padding: '1rem 1.25rem',
  fontSize: '0.95rem',
  color: '#3F3226'
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(60, 48, 36, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '1.5rem'
};

const modalStyle = {
  background: '#FDFBF7',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '720px',
  maxHeight: '85vh',
  overflowY: 'auto',
  boxShadow: '0 24px 60px rgba(0,0,0,0.25)'
};

const modalHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1.25rem 1.5rem',
  borderBottom: '1px solid #E3DBD0',
  background: '#F7F2E9'
};

const closeButtonStyle = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 0
};

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem'
};

const formGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
};

const labelStyle = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: '#6E5B44'
};

const inputStyle = {
  padding: '0.65rem 0.75rem',
  border: '1px solid #E3DBD0',
  borderRadius: '8px',
  fontSize: '0.95rem',
  fontFamily: 'inherit',
  background: 'white',
  color: '#3F3226'
};

const formButtonsStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.75rem',
  marginTop: '1.5rem'
};

const cancelButtonStyle = {
  background: '#EFE7DC',
  border: 'none',
  color: '#6E5B44',
  padding: '0.65rem 1.3rem',
  borderRadius: '10px',
  fontWeight: '600',
  cursor: 'pointer'
};

const submitButtonStyle = {
  background: '#8B6B45',
  border: 'none',
  color: 'white',
  padding: '0.7rem 1.3rem',
  borderRadius: '10px',
  fontWeight: '600',
  cursor: 'pointer'
};

const detailCardStyle = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: '12px',
  marginBottom: '1.5rem',
  border: '1px solid #F0E7DC'
};

const detailTitleStyle = {
  margin: '0 0 1rem 0',
  color: '#8B6B45',
  fontSize: '1.1rem',
  fontFamily: '"Helvetica Neue", Arial, sans-serif'
};

const detailGridStyle = {
  display: 'grid',
  gap: '0.75rem'
};

const detailRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.65rem',
  color: '#3F3226'
};

const detailItemRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0.6rem 0',
  borderBottom: '1px solid #EFE7DC'
};

export default DonorDatabase;


