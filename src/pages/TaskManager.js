import React, { useEffect, useState } from 'react'
import { Base } from '../components/Base'
import axios from 'axios'
import {
  Button,
  Modal,
  Table,
  Form,
  Spinner,
  Alert,
  Row,
  Col,
  Badge,
  Card,
} from 'react-bootstrap'
import useAxios from '../auth/useAxios'

import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaExclamationTriangle, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa'

const TaskManager = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const api = useAxios();

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingTask, setDeletingTask] = useState(null)

  // Form state
  const initialFormState = {
    title: '',
    description: '',
    status: 'PENDING',
    priority: 'MEDIUM',
    notCompletedReason: '',
    dueDate: '',
  }
  const [form, setForm] = useState(initialFormState)

  const baseURL = '/tasks'

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/tasks`)
      setTasks(response.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load tasks')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const openAddModal = () => {
    setEditingTask(null)
    setForm(initialFormState)
    setShowFormModal(true)
  }

  const openEditModal = (task) => {
    setEditingTask(task)
    const dueDateStr = task.dueDate
      ? new Date(task.dueDate).toISOString().split('T')[0]
      : ''
    setForm({ ...task, dueDate: dueDateStr })
    setShowFormModal(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    try {
      // Append the time portion if dueDate exists and does not already have a time
      let dueDateWithTime = null
      if (form.dueDate) {
        dueDateWithTime = form.dueDate.includes('T')
          ? form.dueDate
          : form.dueDate + 'T00:00:00'
      }

      const payload = { ...form, dueDate: dueDateWithTime }

      if (editingTask) {
        await api.put(`${baseURL}/${editingTask.id}`, payload)
      } else {
        await api.post(baseURL, payload)
      }
      setShowFormModal(false)
      fetchTasks()
    } catch (err) {
      alert('Error saving task. Please check inputs.')
    }
  }

  const openDeleteModal = (task) => {
    setDeletingTask(task)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await api.delete(`${baseURL}/${deletingTask.id}`)
      setShowDeleteModal(false)
      setDeletingTask(null)
      fetchTasks()
    } catch (err) {
      alert('Failed to delete task.')
    }
  }

  // Helper function to determine status badge color
  const getStatusVariant = (status) => {
    switch (status) {
      case 'COMPLETED': return 'success'
      case 'IN_PROGRESS': return 'primary'
      case 'PENDING': return 'warning'
      case 'CANCELLED': return 'secondary'
      default: return 'secondary'
    }
  }

  // Helper function to determine priority badge color
  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'HIGH': return 'danger'
      case 'MEDIUM': return 'warning'
      case 'LOW': return 'info'
      default: return 'secondary'
    }
  }

  // Helper function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <FaCheckCircle className="me-1" />
      case 'IN_PROGRESS': return <FaClock className="me-1" />
      case 'PENDING': return <FaClock className="me-1" />
      case 'CANCELLED': return <FaTimesCircle className="me-1" />
      default: return <FaClock className="me-1" />
    }
  }

  // Check if a task is overdue
  const isOverdue = (dueDate) => {
    if (!dueDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(dueDate) < today
  }

  return (
    <Base>
      <div className="container py-4">
        <Row className="align-items-center mb-4">
          <Col>
            <h2 className="fw-bold text-primary">Task Manager</h2>
            <p className="text-muted">Manage your tasks efficiently</p>
          </Col>
          <Col className="text-end">
            <Button 
              variant="primary" 
              onClick={openAddModal}
              className="rounded-pill px-4 d-inline-flex align-items-center"
            >
              <FaPlus className="me-2" /> Add Task
            </Button>
          </Col>
        </Row>

        {loading && (
          <div className="text-center my-5 py-5">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted">Loading tasks...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="d-flex align-items-center">
            <FaExclamationTriangle className="me-2" />
            {error}
          </Alert>
        )}

        {!loading && tasks.length === 0 && (
          <Card className="text-center border-0 shadow-sm">
            <Card.Body className="py-5">
              <FaCalendarAlt size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No tasks found</h5>
              <p className="text-muted">Get started by adding your first task</p>
              <Button 
                variant="outline-primary" 
                onClick={openAddModal}
                className="rounded-pill px-4 d-inline-flex align-items-center"
              >
                <FaPlus className="me-2" /> Add Task
              </Button>
            </Card.Body>
          </Card>
        )}

        {!loading && tasks.length > 0 && (
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white py-3">
              <h5 className="mb-0 fw-semibold">Your Tasks</h5>
            </Card.Header>
            <div className="table-responsive">
              <Table className='table-professional' hover>
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th style={{ minWidth: '140px' }} className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className={isOverdue(task.dueDate) && task.status !== 'COMPLETED' ? 'table-warning' : ''}>
                      <td className="ps-4 fw-semibold">
                        <div className="d-flex align-items-center">
                          {task.title}
                          {isOverdue(task.dueDate) && task.status !== 'COMPLETED' && (
                            <Badge bg="danger" className="ms-2">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        {task.description && (
                          <div className="text-muted small mt-1" style={{ maxWidth: '300px' }}>
                            {task.description.length > 60 
                              ? `${task.description.substring(0, 60)}...` 
                              : task.description
                            }
                          </div>
                        )}
                      </td>
                      <td>
                        <Badge bg={getStatusVariant(task.status)} className="d-inline-flex align-items-center">
                          {getStatusIcon(task.status)}
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={getPriorityVariant(task.priority)}>
                          {task.priority}
                        </Badge>
                      </td>
                      <td>
                        {task.dueDate
                          ? (
                            <div className="d-flex align-items-center">
                              <FaCalendarAlt className="text-muted me-2" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )
                          : '-'
                        }
                      </td>
                      <td className="text-center">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="me-2 rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ width: '32px', height: '32px' }}
                          onClick={() => openEditModal(task)}
                          aria-label={`Edit task ${task.title}`}
                        >
                          <FaEdit size={12} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ width: '32px', height: '32px' }}
                          onClick={() => openDeleteModal(task)}
                          aria-label={`Delete task ${task.title}`}
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

        {/* Add/Edit Form Modal */}
        <Modal show={showFormModal} onHide={() => setShowFormModal(false)} centered size="lg">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold">{editingTask ? 'Edit Task' : 'Add New Task'}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleFormSubmit}>
            <Modal.Body className="pt-0">
              <Form.Group className="mb-3" controlId="formTitle">
                <Form.Label className="fw-semibold">
                  Title <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  maxLength={150}
                  required
                  placeholder="Enter title"
                  className="py-2"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formDescription">
                <Form.Label className="fw-semibold">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={1000}
                  placeholder="Enter description"
                  className="py-2"
                />
                <Form.Text className="text-muted">
                  {form.description.length}/1000 characters
                </Form.Text>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formStatus">
                    <Form.Label className="fw-semibold">Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="py-2"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formPriority">
                    <Form.Label className="fw-semibold">Priority</Form.Label>
                    <Form.Select
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
                      className="py-2"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {(form.status !== 'COMPLETED' && form.status !== '') && (
                <Form.Group className="mb-3" controlId="formNotCompletedReason">
                  <Form.Label className="fw-semibold">Reason Not Completed</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="notCompletedReason"
                    value={form.notCompletedReason}
                    onChange={handleChange}
                    maxLength={500}
                    placeholder="Reason if not completed"
                    className="py-2"
                  />
                  <Form.Text className="text-muted">
                    {form.notCompletedReason.length}/500 characters
                  </Form.Text>
                </Form.Group>
              )}

              <Form.Group className="mb-3" controlId="formDueDate">
                <Form.Label className="fw-semibold">Due Date</Form.Label>
                <Form.Control
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                  className="py-2"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button variant="outline-secondary" onClick={() => setShowFormModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="px-4">
                {editingTask ? 'Update Task' : 'Add Task'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-bold text-danger">Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body className="py-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-danger bg-opacity-10 rounded-circle p-3 me-3">
                <FaExclamationTriangle size={24} className="text-danger" />
              </div>
              <div>
                <h6 className="mb-1">Are you sure you want to delete this task?</h6>
                <p className="mb-0 text-muted">This action cannot be undone.</p>
              </div>
            </div>
            <Card className="bg-light border-0">
              <Card.Body className="py-3">
                <h6 className="mb-1">{deletingTask?.title}</h6>
                <div className="d-flex align-items-center text-muted small">
                  <Badge bg={getStatusVariant(deletingTask?.status)} className="me-2">
                    {deletingTask?.status?.replace('_', ' ')}
                  </Badge>
                  {deletingTask?.dueDate && (
                    <>
                      <FaCalendarAlt className="me-1" />
                      {new Date(deletingTask.dueDate).toLocaleDateString()}
                    </>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} className="px-4">
              Delete Task
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Base>
  )
}

export default TaskManager