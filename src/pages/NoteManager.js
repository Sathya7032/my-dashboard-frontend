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
} from 'react-bootstrap'
import useAxios from '../auth/useAxios'
import Editor, { Toolbar, BtnBold, BtnItalic, BtnUnderline, BtnNumberedList, BtnBulletList, Separator } from 'react-simple-wysiwyg'

const NoteManager = () => {
  const [notes, setNotes] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingNote, setEditingNote] = useState(null)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingNote, setDeletingNote] = useState(null)

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
      content: form.content, // HTML from editor
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

  return (
    <Base>
      <div className="container py-4">
        <Row className="align-items-center mb-4">
          <Col><h2>Note Management</h2></Col>
          <Col className="text-end">
            <Button variant="success" onClick={openAddModal}>Add Note</Button>
          </Col>
        </Row>

        {loading && <div className="text-center my-4"><Spinner animation="border" /></div>}
        {error && <Alert variant="danger">{error}</Alert>}
        {!loading && notes.length === 0 && <p className="text-center">No notes found.</p>}

        {!loading && notes.length > 0 && (
          <Table className="table-professional" striped bordered hover responsive>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Created At</th>
                <th style={{ minWidth: '160px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note) => (
                <tr key={note.id}>
                  <td>{note.title}</td>
                  <td>{note.category?.name || '-'}</td>
                  <td>{note.createdAt ? new Date(note.createdAt).toLocaleString() : '-'}</td>
                  <td>
                    <Button size="sm" variant="warning" className="me-2" onClick={() => openEditModal(note)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => openDeleteModal(note)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Add/Edit Modal */}
        <Modal show={showFormModal} onHide={() => setShowFormModal(false)} centered size="lg">
          <Form onSubmit={handleSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>{editingNote ? 'Edit Note' : 'Add Note'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      name="categoryId"
                      value={form.categoryId}
                      onChange={handleChange}
                      required
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
      <Form.Label>Content</Form.Label>
      <Editor value={form.content} onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}>
        <Toolbar>
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
                    <Form.Label>Created At</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="createdAt"
                      value={form.createdAt}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowFormModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary">{editingNote ? 'Update' : 'Add'}</Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
          <Modal.Body>Are you sure you want to delete note <strong>{deletingNote?.title}</strong>?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Base>
  )
}

export default NoteManager
