import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Mail, Phone, MapPin, Building2 } from 'lucide-react';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxknvigF90NbBe86zrXT6JvRlaDQmvsuYuRYCfOOLISwtzDO3X7hH5TIDH7ALemwCWy/exec';

const DonorDatabase = () => {
  const [donations, setDonations] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [sheetHeaders, setSheetHeaders] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [activeTab, setActiveTab] = useState('2026-donations');
  const [matchedDonorNotice, setMatchedDonorNotice] = useState('');
  
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
    const normalizeHeader = (value) => value.toString().trim().toLowerCase().replace(/\s+/g, ' ');
    const toBoolean = (value) => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value !== 0;
      if (!value) return false;
      const normalized = value.toString().trim().toLowerCase();
      return ['true', 'yes', 'y', '1'].includes(normalized);
    };
    const normalizeDate = (value) => {
      if (!value) return '';
      if (value instanceof Date && !isNaN(value)) return value.toISOString().slice(0, 10);
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return '';
        if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
        const parsed = new Date(trimmed);
        if (!isNaN(parsed)) return parsed.toISOString().slice(0, 10);
      }
      return '';
    };

    const mapDonationRow = (row, year, index) => {
      const rowMap = {};
      Object.keys(row || {}).forEach((key) => {
        rowMap[normalizeHeader(key)] = row[key];
      });
      const amountValue = parseFloat(rowMap['amount']);
      return {
        id: `donation-${year}-${index}`,
        year,
        donorName: rowMap['donor name'] || '',
        amount: Number.isFinite(amountValue) ? amountValue : 0,
        closeDate: normalizeDate(rowMap['close date']),
        donationType: rowMap['donation type'] || '',
        paymentType: rowMap['payment type'] || '',
        notes: rowMap['notes'] || '',
        benefits: rowMap['benefits'] || '',
        acknowledged: toBoolean(rowMap['acknowledged']),
        acknowledgedDate: normalizeDate(rowMap['acknowledged date']),
        accountType: rowMap['account type'] || '',
        address: rowMap['address'] || '',
        email: rowMap['email'] || '',
        phone: rowMap['phone number'] || rowMap['phone'] || '',
        informalName: rowMap['informal names'] || rowMap['informal name'] || '',
        lastName: rowMap['last name'] || ''
      };
    };

    const mapSponsorRow = (row, year, index) => {
      const rowMap = {};
      Object.keys(row || {}).forEach((key) => {
        rowMap[normalizeHeader(key)] = row[key];
      });
      return {
        id: `sponsor-${year}-${index}`,
        year,
        businessName: rowMap['business name'] || '',
        mainContact: rowMap['main contact'] || '',
        donationFMV: rowMap['fair market value'] || rowMap['donation'] || '',
        areaSupported: rowMap['area supported'] || '',
        phoneNumber: rowMap['phone number'] || '',
        emailAddress: rowMap['email address'] || '',
        mailingAddress: rowMap['mailing address'] || '',
        dateReceived: normalizeDate(rowMap['date received'] || rowMap['date recieved']),
        acknowledged: toBoolean(rowMap['acknowledged']),
        notes: rowMap['notes'] || '',
        nshContact: rowMap['nsh contact'] || ''
      };
    };

    const loadSheetData = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const response = await fetch(SCRIPT_URL);
        if (!response.ok) {
          throw new Error(`Failed to load sheet data (${response.status})`);
        }
        const payload = await response.json();
        const headersByName = {};
        const donationRows = [];
        const sponsorRows = [];
        (payload.sheets || []).forEach((sheet) => {
          const sheetName = sheet.name || '';
          headersByName[sheetName] = sheet.headers || [];
          const yearMatch = sheetName.match(/(20\d{2})/);
          const year = yearMatch ? yearMatch[1] : '';
          if (/donations/i.test(sheetName)) {
            (sheet.rows || []).forEach((row, index) => {
              donationRows.push(mapDonationRow(row, year, donationRows.length + index));
            });
          } else if (/sponsors/i.test(sheetName)) {
            (sheet.rows || []).forEach((row, index) => {
              sponsorRows.push(mapSponsorRow(row, year, sponsorRows.length + index));
            });
          }
        });
        setSheetHeaders(headersByName);
        setDonations(donationRows);
        setSponsors(sponsorRows);
      } catch (error) {
        setLoadError(error.message || 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    loadSheetData();
  }, []);

  const donationTypes = ['Annual Fund', 'Capital Campaign', 'In-Kind', 'Event Sponsorship', 'General', 'Grant', 'Memorial'];
  const paymentTypes = ['Check', 'Cash', 'Credit Card', 'Venmo', 'PayPal', 'Stock/Securities', 'Wire Transfer'];
  const accountTypes = ['Individual', 'Family', 'Corporate', 'Foundation', 'Government'];

  const normalizeHeader = (value) => value.toString().trim().toLowerCase().replace(/\s+/g, ' ');
  const formatDisplayDate = (value) => {
    if (!value) return '';
    if (value instanceof Date && !isNaN(value)) {
      return value.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    if (typeof value === 'string') {
      const parsed = new Date(value);
      if (!isNaN(parsed)) {
        return parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      }
      return value;
    }
    return '';
  };
  const buildRowForSheet = (headers, dataMap) => {
    const row = {};
    headers.forEach((header) => {
      const key = normalizeHeader(header);
      row[header] = dataMap[key] ?? '';
    });
    return row;
  };

  const postRow = async (sheetName, row) => {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheet: sheetName, row })
    });
    if (!response.ok) {
      throw new Error(`Failed to write to ${sheetName}`);
    }
  };

  const handleDonationSubmit = async () => {
    if (!donationFormData.donorName || !donationFormData.amount || !donationFormData.closeDate || !donationFormData.donationType || !donationFormData.paymentType || !donationFormData.accountType) {
      alert('Please fill in all required fields');
      return;
    }

    const targetSheet = activeTab.includes('2026')
      ? '2026 Donations'
      : activeTab.includes('2024')
      ? '2024 Donations'
      : '2025 Donations';
    const headers = sheetHeaders[targetSheet] || [];
    const dataMap = {
      'donor name': donationFormData.donorName,
      'amount': donationFormData.amount,
      'close date': donationFormData.closeDate,
      'donation type': donationFormData.donationType,
      'payment type': donationFormData.paymentType,
      'notes': donationFormData.notes,
      'benefits': donationFormData.benefits,
      'salesforce': '',
      'acknowledged': donationFormData.acknowledged,
      'acknowledged date': donationFormData.acknowledgedDate,
      'account type': donationFormData.accountType,
      'address': donationFormData.address,
      'email': donationFormData.email,
      'phone number': donationFormData.phone,
      'phone': donationFormData.phone,
      'informal names': donationFormData.informalName,
      'informal name': donationFormData.informalName,
      'last name': donationFormData.lastName
    };
    
    const newDonation = {
      ...donationFormData,
      id: Date.now(),
      year: activeTab.includes('2026')
        ? '2026'
        : activeTab.includes('2024')
        ? '2024'
        : '2025',
      amount: parseFloat(donationFormData.amount),
      closeDate: donationFormData.closeDate,
      acknowledgedDate: donationFormData.acknowledged ? donationFormData.acknowledgedDate : ''
    };
    try {
      if (headers.length > 0) {
        const row = buildRowForSheet(headers, dataMap);
        await postRow(targetSheet, row);
      }
      setDonations([...donations, newDonation]);
    } catch (error) {
      alert('Failed to save donation to the spreadsheet.');
      return;
    }
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

  const handleSponsorSubmit = async () => {
    if (!sponsorFormData.businessName || !sponsorFormData.dateReceived) {
      alert('Please fill in Business Name and Date Received');
      return;
    }

    const targetSheet = activeTab.includes('2026') ? '2026 Sponsors' : '2025 Sponsors';
    const headers = sheetHeaders[targetSheet] || [];
    const dataMap = {
      'business name': sponsorFormData.businessName,
      'main contact': sponsorFormData.mainContact,
      'donation': '',
      'fair market value': sponsorFormData.donationFMV,
      'area supported': sponsorFormData.areaSupported,
      'phone number': sponsorFormData.phoneNumber,
      'email address': sponsorFormData.emailAddress,
      'mailing address': sponsorFormData.mailingAddress,
      'date received': sponsorFormData.dateReceived,
      'date recieved': sponsorFormData.dateReceived,
      'acknowledged': sponsorFormData.acknowledged,
      'notes': sponsorFormData.notes,
      'nsh contact': sponsorFormData.nshContact
    };

    const newSponsor = {
      ...sponsorFormData,
      id: Date.now(),
      year: activeTab.includes('2026') ? '2026' : '2025',
      dateReceived: sponsorFormData.dateReceived
    };
    try {
      if (headers.length > 0) {
        const row = buildRowForSheet(headers, dataMap);
        await postRow(targetSheet, row);
      }
      setSponsors([...sponsors, newSponsor]);
    } catch (error) {
      alert('Failed to save sponsor to the spreadsheet.');
      return;
    }
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

  useEffect(() => {
    if (!showDonationForm) {
      setMatchedDonorNotice('');
      return;
    }
    const donorName = donationFormData.donorName.trim();
    const email = donationFormData.email.trim();
    if (!donorName || !email) {
      setMatchedDonorNotice('');
      return;
    }

    const matches = donations.filter(d => {
      const nameMatch = d.donorName && d.donorName.toLowerCase() === donorName.toLowerCase();
      const emailMatch = d.email && d.email.toLowerCase() === email.toLowerCase();
      return nameMatch && emailMatch;
    });

    if (matches.length === 0) {
      setMatchedDonorNotice('');
      return;
    }

    const sortedMatches = [...matches].sort((a, b) => {
      if (a.closeDate && b.closeDate) {
        return new Date(b.closeDate) - new Date(a.closeDate);
      }
      return (b.id || 0) - (a.id || 0);
    });
    const latest = sortedMatches[0];

    setDonationFormData(prev => ({
      ...prev,
      address: prev.address || latest.address || '',
      phone: prev.phone || latest.phone || '',
      informalName: prev.informalName || latest.informalName || '',
      lastName: prev.lastName || latest.lastName || '',
      accountType: prev.accountType || latest.accountType || ''
    }));
    setMatchedDonorNotice('Previous donor found - contact details were filled in.');
  }, [donationFormData.donorName, donationFormData.email, donations, showDonationForm]);

  const donations2026 = donations.filter(d => d.year === '2026');
  const donations2025 = donations.filter(d => d.year === '2025');
  const donations2024 = donations.filter(d => d.year === '2024');
  const sponsors2026 = sponsors.filter(s => s.year === '2026');
  const sponsors2025 = sponsors.filter(s => s.year === '2025');

  let currentData = [];
  if (activeTab === '2026-donations') currentData = donations2026;
  else if (activeTab === '2025-donations') currentData = donations2025;
  else if (activeTab === '2024-donations') currentData = donations2024;
  else if (activeTab === '2026-sponsors') currentData = sponsors2026;
  else if (activeTab === '2025-sponsors') currentData = sponsors2025;

  const filteredData = currentData.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    if (activeTab.includes('donations')) {
      return (item.donorName && item.donorName.toLowerCase().includes(searchLower)) ||
             (item.email && item.email.toLowerCase().includes(searchLower)) ||
             (item.informalName && item.informalName.toLowerCase().includes(searchLower)) ||
             (item.donationType && item.donationType.toLowerCase().includes(searchLower)) ||
             (item.paymentType && item.paymentType.toLowerCase().includes(searchLower)) ||
             (item.notes && item.notes.toLowerCase().includes(searchLower));
    } else {
      return (item.businessName && item.businessName.toLowerCase().includes(searchLower)) ||
             (item.mainContact && item.mainContact.toLowerCase().includes(searchLower)) ||
             (item.emailAddress && item.emailAddress.toLowerCase().includes(searchLower)) ||
             (item.areaSupported && item.areaSupported.toLowerCase().includes(searchLower)) ||
             (item.donationFMV && item.donationFMV.toLowerCase().includes(searchLower)) ||
             (item.notes && item.notes.toLowerCase().includes(searchLower));
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
    ? currentData.reduce((sum, d) => sum + (d.amount || 0), 0) 
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
            onClick={() => setActiveTab('2024-donations')}
            style={{
              background: activeTab === '2024-donations' ? 'white' : '#A48763',
              color: activeTab === '2024-donations' ? '#8B6B45' : 'white',
              border: 'none',
              padding: '0.65rem 1.6rem',
              borderRadius: '12px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: activeTab === '2024-donations' ? '0 2px 6px rgba(0,0,0,0.12)' : 'none'
            }}
          >
            2024 Donations
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
                Total {activeTab.includes('2026') ? '2026' : activeTab.includes('2024') ? '2024' : '2025'} Donations
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
                    borderBottom: '2px solid #E6DDD2',
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
                      </td>
                      <td style={cellStyle}>
                        <span style={{ fontWeight: '600' }}>
                          ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td style={cellStyle}>{formatDisplayDate(item.closeDate)}</td>
                      <td style={cellStyle}>{item.donationType}</td>
                      <td style={cellStyle}>{item.paymentType}</td>
                      <td style={cellStyle}>
                        {item.acknowledged ? (
                          <span style={{ color: '#2E7D32', fontWeight: '600' }}>
                            Yes{item.acknowledgedDate ? ` (${formatDisplayDate(item.acknowledgedDate)})` : ''}
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
                      <td style={cellStyle}>{formatDisplayDate(item.dateReceived)}</td>
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
          {loading && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9A8C7C' }}>
              Loading data...
            </div>
          )}
          {!loading && loadError && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9A8C7C' }}>
              {loadError}
            </div>
          )}
          {!loading && !loadError && filteredData.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9A8C7C' }}>
              No {isSponsorsView ? 'sponsors' : 'donations'} found for {activeTab.includes('2026') ? '2026' : activeTab.includes('2024') ? '2024' : '2025'}
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
              {matchedDonorNotice && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: '#F7F2E9', borderRadius: '10px', color: '#6E5B44' }}>
                  {matchedDonorNotice}
                </div>
              )}
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
                          <div style={{ fontWeight: '600' }}>{formatDisplayDate(donation.closeDate)}</div>
                          <div style={{ fontSize: '0.85rem', color: '#7A6A58' }}>
                            {donation.donationType} - {donation.paymentType}
                          </div>
                          {donation.notes && (
                            <div style={{ fontSize: '0.85rem', color: '#6E5B44', marginTop: '0.35rem' }}>
                              Notes: {donation.notes}
                            </div>
                          )}
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
                          <div style={{ fontWeight: '600' }}>{formatDisplayDate(sponsor.dateReceived)}</div>
                          <div style={{ fontSize: '0.85rem', color: '#7A6A58' }}>
                            {sponsor.areaSupported || 'General'} - {sponsor.nshContact || 'NSH'}
                          </div>
                          {sponsor.notes && (
                            <div style={{ fontSize: '0.85rem', color: '#6E5B44', marginTop: '0.35rem' }}>
                              Notes: {sponsor.notes}
                            </div>
                          )}
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


