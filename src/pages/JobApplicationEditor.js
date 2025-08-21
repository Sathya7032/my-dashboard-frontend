import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAxios from '../auth/useAxios';

const JobApplicationEditor = ({ applicationId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    companyWebsite: '',
    companyLocation: '',
    jobTitle: '',
    jobRole: '',
    jobDescriptionLink: '',
    dateApplied: '',
    resumeEditedForJob: false,
    resumeFile: null,
    referencePersons: [''],
    referenceEmails: [''],
    referenceReplies: [''],
    applicationStatus: 'APPLIED',
    responseDate: '',
    notes: ''
  });
  const api = useAxios();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch application data when component mounts or ID changes
  useEffect(() => {
    if (applicationId) {
      fetchApplication();
    }
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/job-applications/${applicationId}`);
      const data = response.data;
      
      // Format the data for the form
      setFormData({
        companyName: data.companyName || '',
        companyWebsite: data.companyWebsite || '',
        companyLocation: data.companyLocation || '',
        jobTitle: data.jobTitle || '',
        jobRole: data.jobRole || '',
        jobDescriptionLink: data.jobDescriptionLink || '',
        dateApplied: data.dateApplied || '',
        resumeEditedForJob: data.resumeEditedForJob || false,
        resumeFile: null, // We don't pre-set the file input
        referencePersons: data.referencePersons && data.referencePersons.length > 0 
          ? data.referencePersons : [''],
        referenceEmails: data.referenceEmails && data.referenceEmails.length > 0 
          ? data.referenceEmails : [''],
        referenceReplies: data.referenceReplies && data.referenceReplies.length > 0 
          ? data.referenceReplies : [''],
        applicationStatus: data.applicationStatus || 'APPLIED',
        responseDate: data.responseDate || '',
        notes: data.notes || ''
      });
    } catch (err) {
      setError('Failed to fetch application data');
      console.error('Error fetching application:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleReferenceChange = (index, field, value) => {
    setFormData(prev => {
      const newRefs = [...prev[field]];
      newRefs[index] = value;
      return { ...prev, [field]: newRefs };
    });
  };

  const addReferenceField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeReferenceField = (index, field) => {
    if (formData[field].length <= 1) return;
    
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Create FormData for multipart request
      const submitData = new FormData();
      
      // Append all fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'resumeFile' && formData[key]) {
          submitData.append('resumeS3Url', formData[key]);
        } else if (key === 'referencePersons' || key === 'referenceEmails' || key === 'referenceReplies') {
          // Handle arrays by appending each element
          formData[key].forEach((value, index) => {
            submitData.append(`${key}[${index}]`, value);
          });
        } else if (key !== 'resumeFile') {
          submitData.append(key, formData[key]);
        }
      });
      
      let response;
      if (applicationId) {
        // Update existing application
        response = await api.put(`/job-applications/${applicationId}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Create new application (using JobApplicationDto)
        // Note: You might need a different endpoint for creation
        response = await axios.post('/job-applications', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      setSuccess('Application saved successfully!');
      if (onSave) onSave(response.data);
    } catch (err) {
      setError('Failed to save application');
      console.error('Error saving application:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.companyName) {
    return <div className="loading">Loading application data...</div>;
  }

  return (
    <div className="job-application-editor">
      <h2>{applicationId ? 'Edit Job Application' : 'New Job Application'}</h2>
      
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}
      
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-section">
          <h3>Company Information</h3>
          <div className="form-group">
            <label>Company Name *</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Company Website</label>
            <input
              type="url"
              name="companyWebsite"
              value={formData.companyWebsite}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Company Location</label>
            <input
              type="text"
              name="companyLocation"
              value={formData.companyLocation}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>Job Information</h3>
          <div className="form-group">
            <label>Job Title *</label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Job Role</label>
            <input
              type="text"
              name="jobRole"
              value={formData.jobRole}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Job Description URL</label>
            <input
              type="url"
              name="jobDescriptionLink"
              value={formData.jobDescriptionLink}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label>Date Applied *</label>
            <input
              type="date"
              name="dateApplied"
              value={formData.dateApplied}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>Resume Information</h3>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="resumeEditedForJob"
                checked={formData.resumeEditedForJob}
                onChange={handleInputChange}
              />
              Resume Edited for This Job
            </label>
          </div>
          
          <div className="form-group">
            <label>Upload New Resume (optional)</label>
            <input
              type="file"
              name="resumeFile"
              onChange={handleInputChange}
              accept=".pdf,.doc,.docx"
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>References</h3>
          {formData.referencePersons.map((person, index) => (
            <div key={index} className="reference-group">
              <div className="form-group">
                <label>Reference Person {index + 1}</label>
                <input
                  type="text"
                  value={person}
                  onChange={(e) => handleReferenceChange(index, 'referencePersons', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>Reference Email {index + 1}</label>
                <input
                  type="email"
                  value={formData.referenceEmails[index] || ''}
                  onChange={(e) => handleReferenceChange(index, 'referenceEmails', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>Reference Reply {index + 1}</label>
                <input
                  type="text"
                  value={formData.referenceReplies[index] || ''}
                  onChange={(e) => handleReferenceChange(index, 'referenceReplies', e.target.value)}
                />
              </div>
              
              {index > 0 && (
                <button 
                  type="button" 
                  className="remove-ref"
                  onClick={() => removeReferenceField(index, 'referencePersons')}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          
          <button 
            type="button" 
            className="add-ref"
            onClick={() => {
              addReferenceField('referencePersons');
              addReferenceField('referenceEmails');
              addReferenceField('referenceReplies');
            }}
          >
            Add Another Reference
          </button>
        </div>
        
        <div className="form-section">
          <h3>Application Status</h3>
          <div className="form-group">
            <label>Status</label>
            <select
              name="applicationStatus"
              value={formData.applicationStatus}
              onChange={handleInputChange}
            >
              <option value="APPLIED">Applied</option>
              <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
              <option value="REJECTED">Rejected</option>
              <option value="OFFER_RECEIVED">Offer Received</option>
              <option value="OFFER_ACCEPTED">Offer Accepted</option>
              <option value="OFFER_DECLINED">Offer Declined</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Response Date</label>
            <input
              type="date"
              name="responseDate"
              value={formData.responseDate}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>Notes</h3>
          <div className="form-group">
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="4"
              placeholder="Add any additional notes about this application..."
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobApplicationEditor;