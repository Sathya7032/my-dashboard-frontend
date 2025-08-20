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
  Badge
} from 'react-bootstrap'
import useAxios from '../auth/useAxios'
import Editor, { Toolbar, BtnBold, BtnItalic, BtnUnderline, BtnNumberedList, BtnBulletList, Separator } from 'react-simple-wysiwyg'
import { format, parseISO } from 'date-fns'
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaEye } from 'react-icons/fa'
import './DiaryManager.css'

const DiaryManager = () => {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingEntry, setDeletingEntry] = useState(null)

  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewEntry, setPreviewEntry] = useState(null)

  const api = useAxios()
  const diaryURL = '/diary'

  const initialFormState = {
    entryDate: new Date().toISOString().slice(0, 10), // yyyy-MM-dd
    content: '',
  }

  const [form, setForm] = useState(initialFormState)

  const fetchEntries = async () => {
    try {
      setLoading(true)
      const res = await api.get(diaryURL)
      setEntries(res.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load diary entries.')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const openAddModal = () => {
    setEditingEntry(null)
    setForm(initialFormState)
    setShowFormModal(true)
  }

  const openEditModal = (entry) => {
    setEditingEntry(entry)
    setForm({
      entryDate: entry.entryDate ?? new Date().toISOString().slice(0, 10),
      content: entry.content ?? '',
    })
    setShowFormModal(true)
  }

  const openPreviewModal = (entry) => {
    setPreviewEntry(entry)
    setShowPreviewModal(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleContentChange = (e) => {
    setForm((prev) => ({ ...prev, content: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.entryDate || !form.content) {
      alert('Please fill all required fields.')
      return
    }
    const payload = {
      entryDate: form.entryDate,
      content: form.content, // HTML/text from editor
    }

    try {
      if (editingEntry) {
        await api.put(`${diaryURL}/${editingEntry.id}`, payload)
      } else {
        await api.post(diaryURL, payload)
      }
      setShowFormModal(false)
      fetchEntries()
    } catch (err) {
      alert('Failed to save diary entry.')
    }
  }

  const openDeleteModal = (entry) => {
    setDeletingEntry(entry)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await api.delete(`${diaryURL}/${deletingEntry.id}`)
      setShowDeleteModal(false)
      setDeletingEntry(null)
      fetchEntries()
    } catch (err) {
      alert('Failed to delete diary entry.')
    }
  }

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy')
    } catch (error) {
      return dateString
    }
  }

  const stripHtml = (html) => {
    const tmp = document.createElement("DIV")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  return (
    <Base>
      <div className="diary-manager-container">
        <Row className="align-items-center mb-4">
          <Col>
            <h2 className="page-title">
              <FaCalendarAlt className="me-2" />
              Diary Management
            </h2>
            <p className="text-muted">Create and manage your personal diary entries</p>
          </Col>
          <Col className="text-end">
            <Button variant="gradient-primary" onClick={openAddModal}>
              <FaPlus className="me-2" />
              Add New Entry
            </Button>
          </Col>
        </Row>

        {loading && (
          <div className="text-center my-5 py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Loading your diary entries...</p>
          </div>
        )}
        
        {error && (
          <Alert variant="danger" className="alert-custom">
            <strong>Error:</strong> {error}
          </Alert>
        )}
        
        {!loading && entries.length === 0 && (
          <Card className="empty-state-card">
            <Card.Body className="text-center py-5">
              <div className="empty-state-icon">
                <FaCalendarAlt />
              </div>
              <h4>No diary entries yet</h4>
              <p className="text-muted">Start by adding your first diary entry to capture your thoughts and experiences.</p>
              <Button variant="primary" onClick={openAddModal}>
                Create Your First Entry
              </Button>
            </Card.Body>
          </Card>
        )}

        {!loading && entries.length > 0 && (
          <Row>
            {entries.map((entry) => (
              <Col md={6} lg={4} key={entry.id} className="mb-4">
                <Card className="diary-entry-card h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <Badge bg="light" text="dark" className="date-badge">
                        {formatDate(entry.entryDate)}
                      </Badge>
                      <div className="entry-actions">
                        <Button 
                          size="sm" 
                          variant="outline-primary" 
                          className="me-1 action-btn"
                          onClick={() => openPreviewModal(entry)}
                        >
                          <FaEye />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline-secondary" 
                          className="me-1 action-btn"
                          onClick={() => openEditModal(entry)}
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline-danger" 
                          className="action-btn"
                          onClick={() => openDeleteModal(entry)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </div>
                    <div className="diary-preview">
                      {stripHtml(entry.content).substring(0, 120)}
                      {stripHtml(entry.content).length > 120 && '...'}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Add/Edit Modal */}
        <Modal show={showFormModal} onHide={() => setShowFormModal(false)} centered size="lg" className="diary-modal">
          <Form onSubmit={handleSubmit}>
            <Modal.Header closeButton className="modal-header-custom">
              <Modal.Title>
                {editingEntry ? 'Edit Diary Entry' : 'Add New Diary Entry'}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label className="form-label-custom">Entry Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="entryDate"
                      value={form.entryDate}
                      onChange={handleChange}
                      required
                      className="form-control-custom"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={12} className="mb-3">
                  <Form.Group>
                    <Form.Label className="form-label-custom">Your Thoughts</Form.Label>
                    <Editor 
                      value={form.content} 
                      onChange={handleContentChange}
                      className="editor-custom"
                    >
                      <Toolbar className="editor-toolbar">
                        <BtnBold />
                        <BtnItalic />
                        <BtnUnderline />
                        <Separator />
                        <BtnNumberedList />
                        <BtnBulletList />
                      </Toolbar>
                    </Editor>
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className="modal-footer-custom">
              <Button variant="outline-secondary" onClick={() => setShowFormModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="submit-btn">
                {editingEntry ? 'Update Entry' : 'Save Entry'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Preview Modal */}
        <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} centered size="lg" className="preview-modal">
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>
              Diary Entry - {previewEntry && formatDate(previewEntry.entryDate)}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {previewEntry && (
              <div 
                className="diary-content-preview"
                dangerouslySetInnerHTML={{ __html: previewEntry.content }} 
              />
            )}
          </Modal.Body>
          <Modal.Footer className="modal-footer-custom">
            <Button variant="outline-secondary" onClick={() => setShowPreviewModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered className="delete-modal">
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 text-center">
            <div className="delete-icon">
              <FaTrash />
            </div>
            <h5>Are you sure?</h5>
            <p>You are about to delete the diary entry dated <strong>{deletingEntry && formatDate(deletingEntry.entryDate)}</strong>. This action cannot be undone.</p>
          </Modal.Body>
          <Modal.Footer className="modal-footer-custom justify-content-center">
            <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} className="delete-confirm-btn">
              Delete Entry
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Base>
  )
}

export default DiaryManager