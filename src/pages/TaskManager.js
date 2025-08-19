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
} from 'react-bootstrap'
import useAxios from '../auth/useAxios'
import '../table.css'

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

  return (
    <Base>
      <div className="container py-4">
        <Row className="align-items-center mb-4">
          <Col>
            <h2>Task Manager</h2>
          </Col>
          <Col className="text-end">
            <Button variant="primary" onClick={openAddModal}>
              Add Task
            </Button>
          </Col>
        </Row>

        {loading && (
          <div className="text-center my-4">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && tasks.length === 0 && (
          <p className="text-center text-muted">No tasks found.</p>
        )}

        {!loading && tasks.length > 0 && (
          <Table className='table-professional' striped bordered hover responsive>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th style={{ minWidth: '140px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.status}</td>
                  <td>{task.priority}</td>
                  <td>
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : '-'}
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="warning"
                      className="me-2"
                      onClick={() => openEditModal(task)}
                      aria-label={`Edit task ${task.title}`}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => openDeleteModal(task)}
                      aria-label={`Delete task ${task.title}`}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Add/Edit Form Modal */}
        <Modal show={showFormModal} onHide={() => setShowFormModal(false)} centered>
          <Form onSubmit={handleFormSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>{editingTask ? 'Edit Task' : 'Add New Task'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3" controlId="formTitle">
                <Form.Label>
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
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength={1000}
                  placeholder="Enter description"
                />
              </Form.Group>

              <Row>
                <Col>
                  <Form.Group className="mb-3" controlId="formStatus">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3" controlId="formPriority">
                    <Form.Label>Priority</Form.Label>
                    <Form.Select
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
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
                  <Form.Label>Reason Not Completed</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="notCompletedReason"
                    value={form.notCompletedReason}
                    onChange={handleChange}
                    maxLength={500}
                    placeholder="Reason if not completed"
                  />
                </Form.Group>
              )}

              <Form.Group className="mb-3" controlId="formDueDate">
                <Form.Label>Due Date</Form.Label>
                <Form.Control
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowFormModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingTask ? 'Update' : 'Add'}
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
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete{' '}
            <strong>{deletingTask?.title}</strong>?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Base>
  )
}

export default TaskManager
