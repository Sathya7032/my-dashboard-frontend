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

const CategoryManager = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState(null)

  const api = useAxios()
  const baseURL = '/categories'

  const initialFormState = { name: '' }
  const [form, setForm] = useState(initialFormState)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await api.get('/categories')
      setCategories(res.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load categories.')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const openAddModal = () => {
    setEditingCategory(null)
    setForm(initialFormState)
    setShowFormModal(true)
  }

  const openEditModal = (category) => {
    setEditingCategory(category)
    setForm({ name: category.name })
    setShowFormModal(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name) {
      alert('Category name is required.')
      return
    }
    try {
      if (editingCategory) {
        await api.put(`${baseURL}/${editingCategory.id}`, form)
      } else {
        await api.post(baseURL, form)
      }
      setShowFormModal(false)
      fetchCategories()
    } catch (err) {
      alert('Failed to save category.')
    }
  }

  const openDeleteModal = (category) => {
    setDeletingCategory(category)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await api.delete(`${baseURL}/${deletingCategory.id}`)
      setShowDeleteModal(false)
      setDeletingCategory(null)
      fetchCategories()
    } catch (err) {
      alert('Failed to delete category.')
    }
  }

  return (
    <Base>
      <div className="container py-4">
        <Row className="align-items-center mb-4">
          <Col><h2>Category Management</h2></Col>
          <Col className="text-end">
            <Button variant="success" onClick={openAddModal}>Add Category</Button>
          </Col>
        </Row>

        {loading && <div className="text-center my-4"><Spinner animation="border" /></div>}
        {error && <Alert variant="danger">{error}</Alert>}
        {!loading && categories.length === 0 && <p className="text-center">No categories found.</p>}

        {!loading && categories.length > 0 && (
          <Table className="table-professional" striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th style={{ minWidth: '160px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td>{cat.name}</td>
                  <td>
                    <Button size="sm" variant="warning" className="me-2" onClick={() => openEditModal(cat)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => openDeleteModal(cat)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Add/Edit Modal */}
        <Modal show={showFormModal} onHide={() => setShowFormModal(false)} centered>
          <Form onSubmit={handleSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>{editingCategory ? 'Edit Category' : 'Add Category'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group>
                <Form.Label>Category Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter category name"
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowFormModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary">{editingCategory ? 'Update' : 'Add'}</Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
          <Modal.Body>Are you sure you want to delete <strong>{deletingCategory?.name}</strong>?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Base>
  )
}

export default CategoryManager
