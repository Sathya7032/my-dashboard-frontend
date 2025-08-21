import React, { useState, useEffect } from 'react';
import { Base } from '../components/Base';
import {
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
  Row,
  Col,
  Card,
  Badge,
  ListGroup
} from 'react-bootstrap';
import useAxios from '../auth/useAxios';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaBriefcase,
  FaBuilding,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaPaperclip,
  FaGlobe,
  FaMapMarkerAlt,
  FaLink,
  FaStickyNote,
  FaCheck,
  FaTimes,
  FaUser,
  FaEnvelope,
  FaReply
} from 'react-icons/fa';

const JobApplicationManager = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingApplication, setDeletingApplication] = useState(null);

  const api = useAxios();
  const baseURL = '/job-applications';

  const initialFormState = {
    companyName: '',
    companyWebsite: '',
    companyLocation: '',
    jobTitle: '',
    jobRole: '',
    jobDescriptionLink: '',
    dateApplied: '',
    resumeEditedForJob: false,
    applicationStatus: 'APPLIED',
    responseDate: '',
    notes: '',
    resumeS3Url: null,
    referencePersons: [''],
    referenceEmails: [''],
    referenceReplies: ['']
  };

  const [form, setForm] = useState(initialFormState);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get(baseURL);
      setApplications(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load job applications.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const openAddModal = () => {
    setEditingApplication(null);
    setForm(initialFormState);
    setShowFormModal(true);
  };

  const openEditModal = (application) => {
    setEditingApplication(application);
    setSelectedApplication(application);
    
    // Format references for the form
    const refPersons = application.referencePersons && application.referencePersons.length > 0 
      ? application.referencePersons : [''];
    const refEmails = application.referenceEmails && application.referenceEmails.length > 0 
      ? application.referenceEmails : [''];
    const refReplies = application.referenceReplies && application.referenceReplies.length > 0 
      ? application.referenceReplies : [''];

    setForm({
      companyName: application.companyName || '',
      companyWebsite: application.companyWebsite || '',
      companyLocation: application.companyLocation || '',
      jobTitle: application.jobTitle || '',
      jobRole: application.jobRole || '',
      jobDescriptionLink: application.jobDescriptionLink || '',
      dateApplied: application.dateApplied
        ? new Date(application.dateApplied).toISOString().slice(0, 10)
        : '',
      resumeEditedForJob: application.resumeEditedForJob || false,
      applicationStatus: application.applicationStatus || 'APPLIED',
      responseDate: application.responseDate
        ? new Date(application.responseDate).toISOString().slice(0, 10)
        : '',
      notes: application.notes || '',
      resumeS3Url: null,
      referencePersons: refPersons,
      referenceEmails: refEmails,
      referenceReplies: refReplies
    });
    setShowFormModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({ ...prev, resumeS3Url: e.target.files[0] }));
  };

  const handleReferenceChange = (index, field, value) => {
    setForm(prev => {
      const newRefs = [...prev[field]];
      newRefs[index] = value;
      return { ...prev, [field]: newRefs };
    });
  };

  const addReferenceField = () => {
    setForm(prev => ({
      ...prev,
      referencePersons: [...prev.referencePersons, ''],
      referenceEmails: [...prev.referenceEmails, ''],
      referenceReplies: [...prev.referenceReplies, '']
    }));
  };

  const removeReferenceField = (index) => {
    if (form.referencePersons.length <= 1) return;
    
    setForm(prev => ({
      ...prev,
      referencePersons: prev.referencePersons.filter((_, i) => i !== index),
      referenceEmails: prev.referenceEmails.filter((_, i) => i !== index),
      referenceReplies: prev.referenceReplies.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.companyName || !form.jobTitle || !form.dateApplied) {
      alert('Please fill all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('companyName', form.companyName || '');
    formData.append('companyWebsite', form.companyWebsite || '');
    formData.append('companyLocation', form.companyLocation || '');
    formData.append('jobTitle', form.jobTitle || '');
    formData.append('jobRole', form.jobRole || '');
    formData.append('jobDescriptionLink', form.jobDescriptionLink || '');
    formData.append('dateApplied', form.dateApplied || '');
    formData.append('resumeEditedForJob', form.resumeEditedForJob ? 'true' : 'false');
    formData.append('applicationStatus', form.applicationStatus || '');
    formData.append('responseDate', form.responseDate || '');
    formData.append('notes', form.notes || '');

    // Append reference arrays
    form.referencePersons.forEach((value, index) => {
      formData.append(`referencePersons[${index}]`, value);
    });
    
    form.referenceEmails.forEach((value, index) => {
      formData.append(`referenceEmails[${index}]`, value);
    });
    
    form.referenceReplies.forEach((value, index) => {
      formData.append(`referenceReplies[${index}]`, value);
    });

    if (form.resumeS3Url) {
      formData.append('resumeS3Url', form.resumeS3Url);
    }

    try {
      if (editingApplication) {
        await api.put(`${baseURL}/${editingApplication.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await api.post(baseURL, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      setShowFormModal(false);
      fetchApplications();
    } catch (err) {
      alert('Failed to save application. Try again.');
    }
  };

  const openDeleteModal = (application) => {
    setDeletingApplication(application);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`${baseURL}/${deletingApplication.id}`);
      setShowDeleteModal(false);
      setDeletingApplication(null);
      setSelectedApplication(null);
      fetchApplications();
    } catch (err) {
      alert('Failed to delete application.');
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'APPLIED':
        return 'secondary';
      case 'INTERVIEW_SCHEDULED':
        return 'primary';
      case 'REJECTED':
        return 'danger';
      case 'OFFER_RECEIVED':
        return 'success';
      case 'OFFER_ACCEPTED':
        return 'success';
      case 'OFFER_DECLINED':
        return 'warning';
      case 'WITHDRAWN':
        return 'dark';
      default:
        return 'dark';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Base>
      <div className="container py-4">
        <Row className="align-items-center mb-4">
          <Col>
            <h2 className="fw-bold text-primary">
              <FaBriefcase className="me-2" />
              Job Applications
            </h2>
            <p className="text-muted">Track and manage your job hunt progress</p>
          </Col>
          <Col className="text-end">
            <Button
              variant="primary"
              onClick={openAddModal}
              className="rounded-pill px-4 d-inline-flex align-items-center"
            >
              <FaPlus className="me-2" />
              Add Application
            </Button>
          </Col>
        </Row>

        {loading && (
          <div className="text-center my-5 py-5">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted">Loading applications...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="d-flex align-items-center">
            <FaExclamationTriangle className="me-2" />
            {error}
          </Alert>
        )}

        {!loading && applications.length === 0 && (
          <Card className="text-center border-0 shadow-sm">
            <Card.Body className="py-5">
              <FaBriefcase size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No applications found</h5>
              <p className="text-muted">Start tracking by adding your first job application</p>
              <Button
                variant="outline-primary"
                onClick={openAddModal}
                className="rounded-pill px-4 d-inline-flex align-items-center"
              >
                <FaPlus className="me-2" />
                Add Application
              </Button>
            </Card.Body>
          </Card>
        )}

        {!loading && applications.length > 0 && (
          <Row>
            <Col md={5} lg={4}>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white py-3">
                  <h5 className="mb-0 fw-semibold">Your Applications</h5>
                </Card.Header>
                <ListGroup variant="flush">
                  {applications.map((app) => (
                    <ListGroup.Item 
                      key={app.id} 
                      action 
                      active={selectedApplication && selectedApplication.id === app.id}
                      onClick={() => setSelectedApplication(app)}
                      className="d-flex justify-content-between align-items-start"
                    >
                      <div className="ms-2 me-auto">
                        <div className="fw-bold">{app.companyName}</div>
                        <small className="text-muted">{app.jobTitle}</small>
                      </div>
                      <Badge bg={getStatusVariant(app.applicationStatus)} pill>
                        {app.applicationStatus}
                      </Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            </Col>
            
            <Col md={7} lg={8}>
              {selectedApplication ? (
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
                    <h5 className="mb-0">Application Details</h5>
                    <div>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={() => openEditModal(selectedApplication)}
                      >
                        <FaEdit className="me-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => openDeleteModal(selectedApplication)}
                      >
                        <FaTrash className="me-1" />
                        Delete
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <Row className="mb-4">
                      <Col md={6}>
                        <h6 className="text-primary">
                          <FaBuilding className="me-2" />
                          Company Information
                        </h6>
                        <p><strong>Name:</strong> {selectedApplication.companyName}</p>
                        {selectedApplication.companyWebsite && (
                          <p>
                            <strong>Website:</strong>{' '}
                            <a href={selectedApplication.companyWebsite} target="_blank" rel="noreferrer">
                              {selectedApplication.companyWebsite}
                            </a>
                          </p>
                        )}
                        {selectedApplication.companyLocation && (
                          <p>
                            <strong>Location:</strong> {selectedApplication.companyLocation}
                          </p>
                        )}
                      </Col>
                      <Col md={6}>
                        <h6 className="text-primary">
                          <FaBriefcase className="me-2" />
                          Job Information
                        </h6>
                        <p><strong>Title:</strong> {selectedApplication.jobTitle}</p>
                        {selectedApplication.jobRole && (
                          <p><strong>Role:</strong> {selectedApplication.jobRole}</p>
                        )}
                        {selectedApplication.jobDescriptionLink && (
                          <p>
                            <strong>Job Description:</strong>{' '}
                            <a href={selectedApplication.jobDescriptionLink} target="_blank" rel="noreferrer">
                              View Description
                            </a>
                          </p>
                        )}
                        <p>
                          <strong>Date Applied:</strong> {formatDate(selectedApplication.dateApplied)}
                        </p>
                        <p>
                          <strong>Resume Edited:</strong>{' '}
                          {selectedApplication.resumeEditedForJob ? (
                            <FaCheck className="text-success" />
                          ) : (
                            <FaTimes className="text-danger" />
                          )}
                        </p>
                      </Col>
                    </Row>

                    <Row className="mb-4">
                      <Col md={6}>
                        <h6 className="text-primary">
                          <FaCalendarAlt className="me-2" />
                          Application Status
                        </h6>
                        <p>
                          <strong>Status:</strong>{' '}
                          <Badge bg={getStatusVariant(selectedApplication.applicationStatus)}>
                            {selectedApplication.applicationStatus}
                          </Badge>
                        </p>
                        {selectedApplication.responseDate && (
                          <p>
                            <strong>Response Date:</strong> {formatDate(selectedApplication.responseDate)}
                          </p>
                        )}
                      </Col>
                      <Col md={6}>
                        <h6 className="text-primary">
                          <FaPaperclip className="me-2" />
                          Resume
                        </h6>
                        {selectedApplication.resumeS3Url ? (
                          <div>
                            <p>
                              <a 
                                href={selectedApplication.resumeS3Url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="btn btn-outline-primary btn-sm"
                              >
                                <FaPaperclip className="me-1" />
                                Download Resume
                              </a>
                            </p>
                          </div>
                        ) : (
                          <p className="text-muted">No resume uploaded</p>
                        )}
                      </Col>
                    </Row>

                    {selectedApplication.referencePersons && selectedApplication.referencePersons.length > 0 && 
                     selectedApplication.referencePersons[0] !== '' && (
                      <div className="mb-4">
                        <h6 className="text-primary">
                          <FaUser className="me-2" />
                          References
                        </h6>
                        {selectedApplication.referencePersons.map((person, index) => (
                          <Card key={index} className="mb-2">
                            <Card.Body className="py-2">
                              <p className="mb-1"><strong>{person}</strong></p>
                              {selectedApplication.referenceEmails[index] && (
                                <p className="mb-1 small">
                                  <FaEnvelope className="me-1 text-muted" />
                                  {selectedApplication.referenceEmails[index]}
                                </p>
                              )}
                              {selectedApplication.referenceReplies[index] && (
                                <p className="mb-0 small">
                                  <FaReply className="me-1 text-muted" />
                                  {selectedApplication.referenceReplies[index]}
                                </p>
                              )}
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    )}

                    {selectedApplication.notes && (
                      <div>
                        <h6 className="text-primary">
                          <FaStickyNote className="me-2" />
                          Notes
                        </h6>
                        <Card>
                          <Card.Body>
                            <p className="mb-0">{selectedApplication.notes}</p>
                          </Card.Body>
                        </Card>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              ) : (
                <Card className="border-0 shadow-sm text-center py-5">
                  <Card.Body>
                    <FaBriefcase size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">Select an application</h5>
                    <p className="text-muted">Choose an application from the list to view details</p>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        )}

        {/* Add/Edit Application Modal */}
        <Modal show={showFormModal} onHide={() => setShowFormModal(false)} centered size="lg">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold text-primary">
              {editingApplication ? 'Edit Application' : 'Add New Application'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body className="pt-0" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Company Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="companyName"
                      value={form.companyName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Company Website</Form.Label>
                    <Form.Control
                      type="url"
                      name="companyWebsite"
                      value={form.companyWebsite}
                      onChange={handleChange}
                      placeholder="https://example.com"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Company Location</Form.Label>
                    <Form.Control
                      type="text"
                      name="companyLocation"
                      value={form.companyLocation}
                      onChange={handleChange}
                      placeholder="City, State"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Job Title *</Form.Label>
                    <Form.Control
                      type="text"
                      name="jobTitle"
                      value={form.jobTitle}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Job Role</Form.Label>
                    <Form.Control
                      type="text"
                      name="jobRole"
                      value={form.jobRole}
                      onChange={handleChange}
                      placeholder="e.g. Software Engineer"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Job Description Link</Form.Label>
                    <Form.Control
                      type="url"
                      name="jobDescriptionLink"
                      value={form.jobDescriptionLink}
                      onChange={handleChange}
                      placeholder="https://example.com/job-description"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Date Applied *</Form.Label>
                    <Form.Control
                      type="date"
                      name="dateApplied"
                      value={form.dateApplied}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Application Status</Form.Label>
                    <Form.Select
                      name="applicationStatus"
                      value={form.applicationStatus}
                      onChange={handleChange}
                    >
                      <option value="APPLIED">Applied</option>
                      <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="OFFER_RECEIVED">Offer Received</option>
                      <option value="OFFER_ACCEPTED">Offer Accepted</option>
                      <option value="OFFER_DECLINED">Offer Declined</option>
                      <option value="WITHDRAWN">Withdrawn</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Response Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="responseDate"
                      value={form.responseDate}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label className="d-block">
                      Resume Edited for Job
                    </Form.Label>
                    <Form.Check
                      inline
                      type="checkbox"
                      name="resumeEditedForJob"
                      checked={form.resumeEditedForJob}
                      onChange={handleChange}
                      label="Yes"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col className="mb-3">
                  <Form.Group>
                    <Form.Label>Upload Resume (PDF, DOC, DOCX)</Form.Label>
                    <Form.Control
                      type="file"
                      name="resumeS3Url"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <hr />
              
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">References</h6>
                <Button variant="outline-primary" size="sm" onClick={addReferenceField}>
                  Add Reference
                </Button>
              </div>
              
              {form.referencePersons.map((_, index) => (
                <Card key={index} className="mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">Reference #{index + 1}</h6>
                      {index > 0 && (
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          onClick={() => removeReferenceField(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <Row>
                      <Col md={6} className="mb-2">
                        <Form.Group>
                          <Form.Label>Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={form.referencePersons[index]}
                            onChange={(e) => handleReferenceChange(index, 'referencePersons', e.target.value)}
                            placeholder="Reference person name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-2">
                        <Form.Group>
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            value={form.referenceEmails[index]}
                            onChange={(e) => handleReferenceChange(index, 'referenceEmails', e.target.value)}
                            placeholder="reference@example.com"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group>
                      <Form.Label>Reply</Form.Label>
                      <Form.Control
                        type="text"
                        value={form.referenceReplies[index]}
                        onChange={(e) => handleReferenceChange(index, 'referenceReplies', e.target.value)}
                        placeholder="Reference response or notes"
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>
              ))}
              
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Additional notes about this application..."
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button variant="outline-secondary" onClick={() => setShowFormModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingApplication ? 'Update Application' : 'Add Application'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-bold text-danger">Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body className="py-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-danger bg-opacity-10 rounded-circle p-3 me-3">
                <FaExclamationTriangle size={24} className="text-danger" />
              </div>
              <div>
                <h6 className="mb-1">Are you sure you want to delete this job application?</h6>
                <p className="mb-0 text-muted">This action cannot be undone.</p>
              </div>
            </div>
            <Card className="bg-light border-0">
              <Card.Body>
                <h6 className="mb-1">{deletingApplication?.jobTitle}</h6>
                <div className="text-muted small">{deletingApplication?.companyName}</div>
              </Card.Body>
            </Card>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete Application
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Base>
  );
};

export default JobApplicationManager;