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

const DiaryManager = () => {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingEntry, setDeletingEntry] = useState(null)

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

  return (
    <Base>
      <div className="container py-4">
        <Row className="align-items-center mb-4">
          <Col><h2>Diary Management</h2></Col>
          <Col className="text-end">
            <Button variant="success" onClick={openAddModal}>Add Entry</Button>
          </Col>
        </Row>

        {loading && <div className="text-center my-4"><Spinner animation="border" /></div>}
        {error && <Alert variant="danger">{error}</Alert>}
        {!loading && entries.length === 0 && <p className="text-center">No diary entries found.</p>}

        {!loading && entries.length > 0 && (
          <Table className="table-professional" striped bordered hover responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th>Content (Preview)</th>
                <th style={{ minWidth: '160px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.entryDate}</td>
                  <td dangerouslySetInnerHTML={{ __html: entry.content.substring(0, 100) + '...' }} />
                  <td>
                    <Button size="sm" variant="warning" className="me-2" onClick={() => openEditModal(entry)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => openDeleteModal(entry)}>Delete</Button>
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
              <Modal.Title>{editingEntry ? 'Edit Diary Entry' : 'Add Diary Entry'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label>Entry Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="entryDate"
                      value={form.entryDate}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={12} className="mb-3">
                  <Form.Group>
                    <Form.Label>Content</Form.Label>
                    <Editor value={form.content} onChange={handleContentChange}>
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
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowFormModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary">{editingEntry ? 'Update' : 'Add'}</Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
          <Modal.Body>Are you sure you want to delete diary entry dated <strong>{deletingEntry?.entryDate}</strong>?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Base>
  )
}

export default DiaryManager
