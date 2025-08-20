import React, { useState, useEffect } from 'react'
import { Base } from '../components/Base'
import {
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
  Row,
  Col,
  Card,
  Badge,
} from 'react-bootstrap'
import useAxios from '../auth/useAxios'
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaBriefcase,
  FaBuilding,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaPaperclip,
} from 'react-icons/fa'

const JobApplicationManager = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingApplication, setEditingApplication] = useState(null)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingApplication, setDeletingApplication] = useState(null)

  const api = useAxios()
  const baseURL = '/job-applications'

  const initialFormState = {
    companyName: '',
    companyWebsite: '',
    companyLocation: '',
    jobTitle: '',
    jobRole: '',
    jobDescriptionLink: '',
    dateApplied: '',
    resumeEditedForJob: false,
    applicationStatus: 'APPLIED', // Not in DTO but kept for UI; adjust if necessary
    responseDate: '',
    notes: '',
    resumeS3Url: null,
  }

  const [form, setForm] = useState(initialFormState)

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const res = await api.get(baseURL)
      setApplications(res.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load job applications.')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const openAddModal = () => {
    setEditingApplication(null)
    setForm(initialFormState)
    setShowFormModal(true)
  }

  const openEditModal = (application) => {
    setEditingApplication(application)
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
      // applicationStatus and responseDate are UI only if not in DTO adjust accordingly
      applicationStatus: application.applicationStatus || 'APPLIED',
      responseDate: application.responseDate
        ? new Date(application.responseDate).toISOString().slice(0, 10)
        : '',
      notes: application.notes || '',
      resumeS3Url: null, // do not prefill the file input
    })
    setShowFormModal(true)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleFileChange = (e) => {
    setForm((prev) => ({ ...prev, resumeS3Url: e.target.files[0] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.companyName || !form.jobTitle || !form.dateApplied) {
      alert('Please fill all required fields.')
      return
    }

    const formData = new FormData()
    formData.append('companyName', form.companyName || '')
    formData.append('companyWebsite', form.companyWebsite || '')
    formData.append('companyLocation', form.companyLocation || '')
    formData.append('jobTitle', form.jobTitle || '')
    formData.append('jobRole', form.jobRole || '')
    formData.append('jobDescriptionLink', form.jobDescriptionLink || '')
    formData.append('dateApplied', form.dateApplied || '')
    formData.append('resumeEditedForJob', form.resumeEditedForJob ? 'true' : 'false')

    // The below fields are not present in your DTO, include only if you handle them separately:
    // formData.append('applicationStatus', form.applicationStatus || '')
    // formData.append('responseDate', form.responseDate || '')
    // formData.append('notes', form.notes || '')

    if (form.resumeS3Url) {
      formData.append('resumeS3Url', form.resumeS3Url)
    }

    try {
      if (editingApplication) {
        await api.put(`${baseURL}/${editingApplication.id}`, formData)
      } else {
        await api.post(baseURL, formData)
      }
      setShowFormModal(false)
      fetchApplications()
    } catch (err) {
      alert('Failed to save application. Try again.')
    }
  }

  const openDeleteModal = (application) => {
    setDeletingApplication(application)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await api.delete(`${baseURL}/${deletingApplication.id}`)
      setShowDeleteModal(false)
      setDeletingApplication(null)
      fetchApplications()
    } catch (err) {
      alert('Failed to delete application.')
    }
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case 'APPLIED':
        return 'secondary'
      case 'INTERVIEWING':
        return 'primary'
      case 'OFFERED':
        return 'success'
      case 'REJECTED':
        return 'danger'
      default:
        return 'dark'
    }
  }

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
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white py-3">
              <h5 className="mb-0 fw-semibold">Applications</h5>
            </Card.Header>
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Company</th>
                    <th>Title</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th>Resume</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <FaBuilding className="me-1 text-muted" />
                        {app.companyName}
                      </td>
                      <td>{app.jobTitle}</td>
                      <td>
                        <FaCalendarAlt className="me-1 text-muted" />
                        {app.dateApplied ? new Date(app.dateApplied).toLocaleDateString() : '-'}
                      </td>
                      <td>
                        <Badge bg={getStatusVariant(app.applicationStatus)}>{app.applicationStatus}</Badge>
                      </td>
                      <td>
                        {app.resumeS3Url ? (
                          <a href={app.resumeS3Url} target="_blank" rel="noreferrer">
                            <FaPaperclip className="me-1" />
                            Download
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="text-center">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="me-2 rounded-circle"
                          style={{ width: '32px', height: '32px' }}
                          onClick={() => openEditModal(app)}
                        >
                          <FaEdit size={12} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="rounded-circle"
                          style={{ width: '32px', height: '32px' }}
                          onClick={() => openDeleteModal(app)}
                        >
                          <FaTrash size={12} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card>
        )}

        {/* Add/Edit Application Modal */}
        <Modal show={showFormModal} onHide={() => setShowFormModal(false)} centered size="lg">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold text-primary">
              {editingApplication ? 'Edit Application' : 'Add New Application'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body className="pt-0">
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
                    <Form.Label>
                      Resume Edited for Job
                    </Form.Label>
                    <Form.Check
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
                <Col md={12} className="mb-3">
                  <Form.Group>
                    <Form.Label>Resume</Form.Label>
                    <Form.Control
                      type="file"
                      name="resumeS3Url"
                      accept=".pdf,.xls,.xlsx"
                      onChange={handleFileChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
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
  )
}

export default JobApplicationManager
