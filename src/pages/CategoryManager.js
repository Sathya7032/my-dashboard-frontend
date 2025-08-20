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
  InputGroup
} from 'react-bootstrap'
import { 
  Plus, 
  Trash2, 
  Search, 
  Grid, 
  Archive,
  Loader
} from 'react-feather'
import useAxios from '../auth/useAxios'
import { Pencil } from 'react-bootstrap-icons'

const CategoryManager = () => {
  const [categories, setCategories] = useState([])
  const [filteredCategories, setFilteredCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const api = useAxios()
  const baseURL = '/categories'

  const initialFormState = { name: '' }
  const [form, setForm] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState({})

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await api.get('/categories')
      setCategories(res.data)
      setFilteredCategories(res.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load categories. Please try again later.')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories(categories)
    }
  }, [searchTerm, categories])

  const openAddModal = () => {
    setEditingCategory(null)
    setForm(initialFormState)
    setFormErrors({})
    setShowFormModal(true)
  }

  const openEditModal = (category) => {
    setEditingCategory(category)
    setForm({ name: category.name })
    setFormErrors({})
    setShowFormModal(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({...formErrors, [name]: ''})
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!form.name.trim()) {
      errors.name = 'Category name is required'
    } else if (form.name.length < 2) {
      errors.name = 'Category name must be at least 2 characters'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setSubmitting(true)
    try {
      if (editingCategory) {
        await api.put(`${baseURL}/${editingCategory.id}`, form)
      } else {
        await api.post(baseURL, form)
      }
      setShowFormModal(false)
      fetchCategories()
    } catch (err) {
      setFormErrors({ submit: 'Failed to save category. Please try again.' })
    } finally {
      setSubmitting(false)
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
      alert('Failed to delete category. It may be in use by existing products.')
    }
  }

  return (
    <Base>
      <div className="container py-4">
        <Row className="align-items-center mb-4">
          <Col>
            <div className="d-flex align-items-center">
              <div className="bg-primary p-3 rounded-circle me-3">
                <Grid size={24} className="text-white" />
              </div>
              <div>
                <h2 className="mb-0">Category Management</h2>
                <p className="text-muted mb-0">Manage product categories and organization</p>
              </div>
            </div>
          </Col>
          <Col className="text-end">
            <Button 
              variant="primary" 
              onClick={openAddModal}
              className="d-inline-flex align-items-center"
            >
              <Plus size={18} className="me-2" />
              Add Category
            </Button>
          </Col>
        </Row>

        <Card className="shadow-sm border-0 mb-4">
          <Card.Body className="p-4">
            <Row className="mb-4">
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-end-0">
                    <Search size={18} />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0"
                  />
                </InputGroup>
              </Col>
              <Col md={6} className="text-md-end mt-2 mt-md-0">
                <Badge bg="light" text="dark" className="px-3 py-2">
                  {filteredCategories.length} {filteredCategories.length === 1 ? 'Category' : 'Categories'}
                </Badge>
              </Col>
            </Row>

            {loading && (
              <div className="text-center py-5">
                <Spinner animation="border" role="status" variant="primary" className="mb-3" />
                <p className="text-muted">Loading categories...</p>
              </div>
            )}
            
            {error && (
              <Alert variant="danger" className="d-flex align-items-center">
                <Alert.Heading className="me-2 mb-0">Error</Alert.Heading>
                {error}
              </Alert>
            )}
            
            {!loading && filteredCategories.length === 0 && (
              <div className="text-center py-5">
                <Archive size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No categories found</h5>
                <p className="text-muted">
                  {searchTerm ? 'Try a different search term' : 'Get started by adding your first category'}
                </p>
                {!searchTerm && (
                  <Button variant="primary" onClick={openAddModal}>
                    Add Category
                  </Button>
                )}
              </div>
            )}

            {!loading && filteredCategories.length > 0 && (
              <div className="table-responsive rounded">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '80px' }}>ID</th>
                      <th>Name</th>
                      <th style={{ width: '140px' }} className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((cat) => (
                      <tr key={cat.id}>
                        <td className="fw-semibold text-muted">#{cat.id}</td>
                        <td className="fw-semibold">{cat.name}</td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline-primary" 
                              className="d-inline-flex align-items-center"
                              onClick={() => openEditModal(cat)}
                            >
                              <Pencil size={14} className="me-1" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline-danger" 
                              className="d-inline-flex align-items-center"
                              onClick={() => openDeleteModal(cat)}
                            >
                              <Trash2 size={14} className="me-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Add/Edit Modal */}
        <Modal show={showFormModal} onHide={() => !submitting && setShowFormModal(false)} centered>
          <Modal.Header closeButton className="border-bottom-0 pb-0">
            <Modal.Title className="h5">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body className="pb-1">
              {formErrors.submit && (
                <Alert variant="danger" className="py-2">
                  {formErrors.submit}
                </Alert>
              )}
              
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Category Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g., Electronics, Clothing, Books"
                  isInvalid={!!formErrors.name}
                  className="py-2"
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.name}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Enter a descriptive name for your category
                </Form.Text>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="border-top-0 pt-0">
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowFormModal(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={submitting}
                className="d-inline-flex align-items-center"
              >
                {submitting ? (
                  <>
                    <Loader size={16} className="me-1 animate-spin" />
                    {editingCategory ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    {editingCategory ? 'Update Category' : 'Add Category'}
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="md">
          <Modal.Header closeButton className="border-bottom-0 pb-0">
            <Modal.Title className="h5 text-danger">Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body className="py-4">
            <div className="text-center mb-3">
              <div className="bg-danger bg-opacity-10 d-inline-flex p-3 rounded-circle">
                <Trash2 size={24} className="text-danger" />
              </div>
            </div>
            <p className="text-center mb-0">
              Are you sure you want to delete <strong>"{deletingCategory?.name}"</strong>? 
              This action cannot be undone.
            </p>
          </Modal.Body>
          <Modal.Footer className="border-top-0 justify-content-center">
            <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Yes, Delete Category
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Base>
  )
}

export default CategoryManager