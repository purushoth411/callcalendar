import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, User, Mail, Building, Phone } from 'lucide-react';

const OTPVerificationPage = () => {
  // State management
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [urlStatus, setUrlStatus] = useState('');
  const [bookingData, setBookingData] = useState({
    id: '',
    name: '',
    email: '',
    bookingCode: '',
    callRegarding: '',
    bookingDate: '',
    bookingSlot: '',
    timezone: '',
    joiningLink: '',
    status: '',
    adminName: '',
    verifyOtpUrl: ''
  });
  
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  // Get URL parameters
  const getUrlParams = () => {
    const pathParts = window.location.pathname.split('/');
    return {
      bookingId: pathParts[2] || '',
      verifyOtpUrl: pathParts[3] || ''
    };
  };

  // Fetch booking data and generate OTP
  const fetchBookingData = async () => {
    const { bookingId, verifyOtpUrl } = getUrlParams();
    
    if (!bookingId || !verifyOtpUrl) {
      setUrlStatus('Expired');
      setPageLoading(false);
      return;
    }

    try {
      const response = await fetch('https://callback-2suo.onrender.com/api/helpers/verifyOtpUrl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          verifyOtpUrl
        })
      });

      const data = await response.json();

      if (data.status ) {
        setBookingData({
          id: data.booking.id,
          name: data.booking.fld_name,
          email: data.booking.fld_email,
          bookingCode: data.booking.fld_bookingcode,
          callRegarding: data.booking.fld_call_regarding,
          bookingDate: data.booking.fld_booking_date,
          bookingSlot: data.booking.fld_booking_slot,
          timezone: data.booking.fld_timezone,
          joiningLink: data.booking.fld_call_joining_link,
          status: data.booking.fld_call_confirmation_status,
          adminName: data.booking.admin_name,
          verifyOtpUrl: data.booking.fld_verify_otp_url
        });
        
        // Set OTP digits if provided (for development/testing)
        if (data.verifyemailotp) {
          const otpArray = data.verifyemailotp.toString().split('');
          setOtp(otpArray);
        }
        
        setUrlStatus('Valid');
      } else {
        setUrlStatus('Expired');
      }
    } catch (error) {
      console.error('Error fetching booking data:', error);
      setUrlStatus('Expired');
    } finally {
      setPageLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchBookingData();
  }, []);

  // Format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Handle OTP input
  const handleOTPChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  // Validate and submit OTP
  const handleSubmit = async () => {
    const otpString = otp.join('');
    const { bookingId } = getUrlParams();
    
    if (otpString.length !== 4) {
      setMessage('Please Enter Complete OTP');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('Please Wait!');
    setMessageType('info');

    try {
      const response = await fetch('/api/validateotp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          str2: otpString,
          booking_id: bookingId,
          verify_otp_url: bookingData.verifyOtpUrl
        })
      });

      const result = await response.text();
      
      if (result === 'error') {
        setMessage('Something Went Wrong Please Try Again Later!');
        setMessageType('error');
      } else if (result === 'other_confirmed') {
        setMessage('Unfortunately, the time slot has already been booked due to a slight delay in accepting the call. I truly appreciate your flexibility, and we look forward to an alternate suitable time for us to connect soon!\n\nThank you for your understanding!');
        setMessageType('warning');
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      } else if (result === 'fail') {
        setMessage('Invalid OTP!');
        setMessageType('error');
      } else {
        setMessage('OTP Verified Successfully');
        setMessageType('success');
        
        // Redirect to booking details
        setTimeout(() => {
          window.location.href = `/booking_details/${result}`;
        }, 1000);
      }
    } catch (error) {
      console.error('Error validating OTP:', error);
      setMessage('Something Went Wrong Please Try Again Later!');
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const getDateParts = () => {
    const formatted = formatDate(bookingData.bookingDate);
    const parts = formatted.split(' ');
    return {
      day: parts[1],
      month: parts[0],
      year: parts[2]
    };
  };

  const { day, month, year } = getDateParts();

  const MessageAlert = ({ message, type }) => {
    if (!message) return null;
    
    const bgColor = {
      error: 'bg-red-100 text-red-700 border-red-200',
      success: 'bg-green-100 text-green-700 border-green-200',
      info: 'bg-blue-100 text-blue-700 border-blue-200',
      warning: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    }[type] || 'bg-gray-100 text-gray-700 border-gray-200';

    // Show loading spinner while fetching data
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-100 font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show expired message if URL is invalid
  if (urlStatus === 'Expired') {
    return (
      <div className="min-h-screen bg-gray-100 font-sans">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Link Expired</h1>
              <p className="text-gray-600">This verification link is no longer valid.</p>
            </div>
          </div>
        </div>
        <footer className="bg-gray-900 text-white py-4 fixed bottom-0 w-full">
          <div className="container mx-auto px-4">
            <div className="text-sm">
              All Rights Reserved, Rapid Collaborate, (c) Copyright 2024.
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Check if call is already confirmed
  if (bookingData.status === 'Call Confirmed by Client') {
    window.location.href = `/booking_details/${bookingData.id}`;
    return null;
  }

  return (
      <div className={`border rounded-lg p-3 mb-4 ${bgColor}`}>
        {message}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Call Summary */}
          <div className="lg:w-2/3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Call Summary</h1>
              
              {/* Calendar Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
                <div className="flex flex-col md:flex-row">
                  {/* Calendar Visual */}
                  <div className="md:w-1/4 bg-gray-200 p-6 flex flex-col items-center justify-center relative min-h-44">
                    <Calendar className="w-16 h-16 text-gray-600 mb-2" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-white font-medium text-sm bg-red-500 px-2 py-1 rounded-t">
                        {month}
                      </span>
                      <span className="text-2xl font-bold text-gray-800 bg-white px-4 py-2">
                        {day}
                      </span>
                      <span className="text-xs font-bold text-gray-600 bg-white px-2 pb-2 rounded-b">
                        {year}
                      </span>
                    </div>
                  </div>

                  {/* Meeting Details */}
                  <div className="md:w-1/2 p-6 border-x border-gray-200">
                    <h3 className="font-semibold text-lg mb-4">{bookingData.callRegarding}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <span className="text-gray-500 w-20">Timezone</span>
                        <span>{bookingData.timezone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Agenda */}
                  <div className="md:w-1/2 p-6">
                    <h3 className="font-semibold text-lg mb-2">Agenda</h3>
                    <p className="text-sm text-gray-600 mb-3">{formatDate(bookingData.bookingDate)}</p>
                    <p className="text-xs text-gray-500 italic mb-2">No Earlier Events</p>
                    <p className="text-sm font-medium">{bookingData.bookingSlot} {bookingData.callRegarding}</p>
                    <p className="text-xs text-gray-500 italic">No Later Events</p>
                  </div>
                </div>
              </div>

              {/* Email Template */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="bg-purple-800 h-4 rounded-t-lg -mx-6 -mt-6 mb-6"></div>
                <div className="prose max-w-none">
                  <p className="mb-4">Hi <strong>{bookingData.name}</strong>,</p>
                  <p className="mb-4">
                    Your appointment ID: <strong>{bookingData.bookingCode}</strong> has been confirmed. 
                    Here are the details of your appointment:
                  </p>
                  <p className="mb-4">
                    <em><strong>Topic - {bookingData.callRegarding}</strong></em>
                  </p>
                  <p className="mb-4">
                    <em><strong>
                      {getDayName(bookingData.bookingDate)} {formatDate(bookingData.bookingDate)}, {bookingData.bookingSlot}, {bookingData.timezone}
                      <br />
                      MEETING LINK: <a href={bookingData.joiningLink} className="text-blue-600 hover:underline">
                        {bookingData.joiningLink}
                      </a>
                    </strong></em>
                  </p>
                  <p>Thanks,<br />Rapid Collaborate.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - OTP Verification */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Securely Confirm Your Appointment with Our Expert
                </h2>
                <h3 className="text-red-600 text-sm mb-3">
                  Please enter the one time password to verify your account
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  A code has been sent to your email id {bookingData.email}
                </p>

                <MessageAlert message={message} type={messageType} />

                <div>
                  <div className="flex justify-center gap-2 mb-4">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={inputRefs[index]}
                        type="tel"
                        maxLength="1"
                        className="w-12 h-12 text-center border border-gray-300 rounded-lg text-lg font-semibold focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                        value={digit}
                        onChange={(e) => handleOTPChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        disabled={loading}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-red-600 text-white px-8 py-2 rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Validating...' : 'Validate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="text-sm">
            All Rights Reserved, Rapid Collaborate, (c) Copyright 2024.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OTPVerificationPage;