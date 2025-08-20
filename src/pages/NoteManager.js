import React, { useState, useEffect } from 'react'
import { Base } from '../components/Base'
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
  InputGroup
} from 'react-bootstrap'
import useAxios from '../auth/useAxios'
import Editor, { Toolbar, BtnBold, BtnItalic, BtnUnderline, BtnNumberedList, BtnBulletList, Separator } from 'react-simple-wysiwyg'
import { format, parseISO } from 'date-fns'
import { FaPlus, FaEdit, FaTrash, FaStickyNote, FaSearch, FaFolder, FaCalendarAlt, FaEye } from 'react-icons/fa'
import './NoteManager.css'

const NoteManager = () => {
  const [notes, setNotes] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingNote, setEditingNote] = useState(null)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingNote, setDeletingNote] = useState(null)

  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewNote, setPreviewNote] = useState(null)

  const api = useAxios()
  const noteURL = '/notes'
  const categoryURL = '/categories'

  const initialFormState = {
    title: '',
    content: '',
    categoryId: '',
    createdAt: '',
  }

  const [form, setForm] = useState(initialFormState)

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const res = await api.get(noteURL)
      setNotes(res.data)
      const catRes = await api.get(categoryURL)
      setCategories(catRes.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load notes.')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const openAddModal = () => {
    setEditingNote(null)
    setForm({ ...initialFormState, createdAt: new Date().toISOString().slice(0, 16) })
    setShowFormModal(true)
  }

  const openEditModal = (note) => {
    setEditingNote(note)
    setForm({
      title: note.title ?? '',
      content: note.content ?? '',
      categoryId: note.category?.id ?? '',
      createdAt: note.createdAt
        ? new Date(note.createdAt).toISOString().slice(0, 16)
        : '',
    })
    setShowFormModal(true)
  }

  const openPreviewModal = (note) => {
    setPreviewNote(note)
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
    if (!form.title || !form.content || !form.categoryId) {
      alert('Please fill all required fields.')
      return
    }
    const payload = {
      title: form.title,
      content: form.content,
      createdAt: form.createdAt
        ? new Date(form.createdAt).toISOString()
        : new Date().toISOString(),
    }

    try {
      if (editingNote) {
        await api.put(`${noteURL}/${editingNote.id}/category/${form.categoryId}`, payload)
      } else {
        await api.post(`${noteURL}/category/${form.categoryId}`, payload)
      }
      setShowFormModal(false)
      fetchNotes()
    } catch (err) {
      alert('Failed to save note.')
    }
  }

  const openDeleteModal = (note) => {
    setDeletingNote(note)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await api.delete(`${noteURL}/${deletingNote.id}`)
      setShowDeleteModal(false)
      setDeletingNote(null)
      fetchNotes()
    } catch (err) {
      alert('Failed to delete note.')
    }
  }

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy • hh:mm a')
    } catch (error) {
      return dateString
    }
  }

  const stripHtml = (html) => {
    if (!html) return ''
    const tmp = document.createElement("DIV")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  // Filter notes based on search term and category
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          stripHtml(note.content).toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || note.category?.id == selectedCategory
    
    return matchesSearch && matchesCategory
  })

  return (
    <Base>
      <div className="note-manager-container">
        <Row className="align-items-center mb-4">
          <Col>
            <h2 className="page-title">
              <FaStickyNote className="me-2" />
              Note Management
            </h2>
            <p className="text-muted">Organize your thoughts and ideas with notes</p>
          </Col>
          <Col className="text-end">
            <Button variant="gradient-primary" onClick={openAddModal}>
              <FaPlus className="me-2" />
              Add New Note
            </Button>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="filter-card mb-4">
          <Card.Body>
            <Row>
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>
                    <FaFolder />
                  </InputGroup.Text>
                  <Form.Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </InputGroup>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {loading && (
          <div className="text-center my-5 py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Loading your notes...</p>
          </div>
        )}
        
        {error && (
          <Alert variant="danger" className="alert-custom">
            <strong>Error:</strong> {error}
          </Alert>
        )}
        
        {!loading && filteredNotes.length === 0 && (
          <Card className="empty-state-card">
            <Card.Body className="text-center py-5">
              <div className="empty-state-icon">
                <FaStickyNote />
              </div>
              <h4>No notes found</h4>
              <p className="text-muted">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Start by adding your first note to capture your thoughts and ideas.'}
              </p>
              <Button variant="primary" onClick={openAddModal}>
                Create Your First Note
              </Button>
            </Card.Body>
          </Card>
        )}

        {!loading && filteredNotes.length > 0 && (
          <Row>
            {filteredNotes.map((note) => (
              <Col md={6} lg={4} key={note.id} className="mb-4">
                <Card className="note-card h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <Badge 
                        bg="light" 
                        text="dark" 
                        className="category-badge"
                        style={{ backgroundColor: `${note.category?.color || '#e9ecef'} !important` }}
                      >
                        {note.category?.name || 'Uncategorized'}
                      </Badge>
                      <div className="note-actions">
                        <Button 
                          size="sm" 
                          variant="outline-primary" 
                          className="me-1 action-btn"
                          onClick={() => openPreviewModal(note)}
                        >
                          <FaEye />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline-secondary" 
                          className="me-1 action-btn"
                          onClick={() => openEditModal(note)}
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline-danger" 
                          className="action-btn"
                          onClick={() => openDeleteModal(note)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </div>
                    
                    <Card.Title className="note-title">{note.title}</Card.Title>
                    
                    <div className="note-preview mb-3">
                      {stripHtml(note.content).substring(0, 120)}
                      {stripHtml(note.content).length > 120 && '...'}
                    </div>
                    
                    <div className="note-date">
                      <FaCalendarAlt className="me-1" />
                      {formatDate(note.createdAt)}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Add/Edit Modal */}
        <Modal show={showFormModal} onHide={() => setShowFormModal(false)} centered size="lg" className="note-modal">
          <Form onSubmit={handleSubmit}>
            <Modal.Header closeButton className="modal-header-custom">
              <Modal.Title>
                {editingNote ? 'Edit Note' : 'Add New Note'}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              <Row>
                <Col md={8} className="mb-3">
                  <Form.Group>
                    <Form.Label className="form-label-custom">Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                      className="form-control-custom"
                      placeholder="Enter note title"
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label className="form-label-custom">Category</Form.Label>
                    <Form.Select
                      name="categoryId"
                      value={form.categoryId}
                      onChange={handleChange}
                      required
                      className="form-control-custom"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={12} className="mb-3">
                  <Form.Group>
                    <Form.Label className="form-label-custom">Content</Form.Label>
                    <Editor 
                      value={form.content} 
                      onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
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

              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="form-label-custom">Created At</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="createdAt"
                      value={form.createdAt}
                      onChange={handleChange}
                      className="form-control-custom"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className="modal-footer-custom">
              <Button variant="outline-secondary" onClick={() => setShowFormModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="submit-btn">
                {editingNote ? 'Update Note' : 'Save Note'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Preview Modal */}
        <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} centered size="lg" className="preview-modal">
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>
              {previewNote?.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {previewNote && (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Badge bg="light" text="dark">
                    {previewNote.category?.name || 'Uncategorized'}
                  </Badge>
                  <div className="text-muted">
                    <FaCalendarAlt className="me-1" />
                    {formatDate(previewNote.createdAt)}
                  </div>
                </div>
                
                <div 
                  className="note-content-preview"
                  dangerouslySetInnerHTML={{ __html: previewNote.content }} 
                />
              </>
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
            <p>You are about to delete the note titled <strong>"{deletingNote?.title}"</strong>. This action cannot be undone.</p>
          </Modal.Body>
          <Modal.Footer className="modal-footer-custom justify-content-center">
            <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} className="delete-confirm-btn">
              Delete Note
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Base>
  )
}

export default NoteManager