import React, { useState, useEffect } from 'react'
import { Base } from '../components/Base'
import axios from 'axios'
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

const IncomeManager = () => {
  const [incomes, setIncomes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingIncome, setEditingIncome] = useState(null)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingIncome, setDeletingIncome] = useState(null)
  const api = useAxios();

  const baseURL = '/income'

  const initialFormState = {
    amount: '',
    source: '',
    receivedDate: '',
    paymentType: 'CASH',
    wallet: { id: 1 }, // Assuming default wallet id = 1
  }

  const [form, setForm] = useState(initialFormState)

  const fetchIncomes = async () => {
    try {
      setLoading(true)
      const res = await api.get(baseURL)
      setIncomes(res.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load incomes.')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncomes()
  }, [])

  const openAddModal = () => {
    setEditingIncome(null)
    setForm(initialFormState)
    setShowFormModal(true)
  }

  const openEditModal = (income) => {
    // Format receivedDate for input type="datetime-local"
    const dateStr = income.receivedDate
      ? new Date(income.receivedDate).toISOString().slice(0, 16)
      : ''
    setEditingIncome(income)
    setForm({
      amount: income.amount ?? '',
      source: income.source ?? '',
      receivedDate: dateStr,
      paymentType: income.paymentType ?? 'CASH',
      wallet: income.wallet ?? { id: 1 },
    })
    setShowFormModal(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'amount') {
      // ensure numeric values
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setForm((prev) => ({ ...prev, [name]: value }))
      }
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required fields
    if (!form.amount || !form.source || !form.receivedDate || !form.paymentType) {
      alert('Please fill all required fields.')
      return
    }

    // Prepare payload with correct types
    const payload = {
      amount: parseFloat(form.amount),
      source: form.source,
      receivedDate: form.receivedDate
        ? new Date(form.receivedDate).toISOString()
        : new Date().toISOString(),
      paymentType: form.paymentType,
      wallet: { id: form.wallet.id },
    }

    try {
      if (editingIncome) {
        await api.put(`${baseURL}/${editingIncome.id}`, payload)
      } else {
        await api.post(baseURL, payload)
      }
      setShowFormModal(false)
      fetchIncomes()
    } catch (err) {
      alert('Failed to save income. Try again.')
    }
  }

  const openDeleteModal = (income) => {
    setDeletingIncome(income)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await api.delete(`${baseURL}/${deletingIncome.id}`)
      setShowDeleteModal(false)
      setDeletingIncome(null)
      fetchIncomes()
    } catch (err) {
      alert('Failed to delete income.')
    }
  }

  return (
    <Base>
      <div className="container py-4">
        <Row className="align-items-center mb-4">
          <Col>
            <h2>Income Management</h2>
          </Col>
          <Col className="text-end">
            <Button variant="success" onClick={openAddModal}>
              Add Income
            </Button>
          </Col>
        </Row>

        {loading && (
          <div className="text-center my-4">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && incomes.length === 0 && (
          <p className="text-center text-muted">No incomes recorded.</p>
        )}

        {!loading && incomes.length > 0 && (
          <Table
            striped
            bordered
            hover
            responsive
            className="table-professional"
            style={{ minWidth: '700px' }}
          >
            <thead>
              <tr>
                <th>Amount (₹)</th>
                <th>Source</th>
                <th>Received Date</th>
                <th>Payment Type</th>
                <th>Wallet ID</th>
                <th style={{ minWidth: '160px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((income) => (
                <tr key={income.id}>
                  <td>
                    {income.amount?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>{income.source}</td>
                  <td>
                    {income.receivedDate
                      ? new Date(income.receivedDate).toLocaleString()
                      : '-'}
                  </td>
                  <td>{income.paymentType}</td>
                  <td>{income.wallet?.id || '-'}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="warning"
                      className="me-2"
                      onClick={() => openEditModal(income)}
                      aria-label={`Edit income ${income.source}`}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => openDeleteModal(income)}
                      aria-label={`Delete income ${income.source}`}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Add/Edit Income Modal */}
        <Modal
          show={showFormModal}
          onHide={() => setShowFormModal(false)}
          centered
          size="lg"
        >
          <Form onSubmit={handleSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>{editingIncome ? 'Edit Income' : 'Add New Income'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formAmount">
                    <Form.Label>
                      Amount (₹) <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      placeholder="Enter amount"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formSource">
                    <Form.Label>
                      Source <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="source"
                      value={form.source}
                      onChange={handleChange}
                      placeholder="Salary, Business, Investment etc."
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formReceivedDate">
                    <Form.Label>
                      Received Date <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="receivedDate"
                      value={form.receivedDate}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formPaymentType">
                    <Form.Label>
                      Payment Type <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="paymentType"
                      value={form.paymentType}
                      onChange={handleChange}
                      required
                    >
                      <option value="CASH">Cash</option>
                      <option value="ONLINE">Online</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Wallet is fixed id 1, but if you want can add a disabled field here */}
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formWalletId">
                    <Form.Label>Wallet ID</Form.Label>
                    <Form.Control
                      type="number"
                      name="walletId"
                      value={form.wallet.id}
                      disabled
                      plaintext
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowFormModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingIncome ? 'Update' : 'Add'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Confirm Modal */}
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete income source{' '}
            <strong>{deletingIncome?.source}</strong>?
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

export default IncomeManager
