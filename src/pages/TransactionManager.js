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

const TransactionManager = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingTransaction, setDeletingTransaction] = useState(null)
  const api = useAxios();
  const baseURL = '/transaction'

  const initialFormState = {
    amount: '',
    paidTo: '',
    paymentType: 'CASH',
    wallet: { id: 1 }, // Adjust wallet id as needed or make it selectable
    createdAt: '',
  }

  const [form, setForm] = useState(initialFormState)

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const res = await api.get(baseURL)
      setTransactions(res.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load transactions.')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const openAddModal = () => {
    setEditingTransaction(null)
    setForm({ ...initialFormState, createdAt: new Date().toISOString().slice(0, 16) })
    setShowFormModal(true)
  }

  const openEditModal = (transaction) => {
    const createdAtStr = transaction.createdAt
      ? new Date(transaction.createdAt).toISOString().slice(0, 16)
      : ''
    setEditingTransaction(transaction)
    setForm({
      amount: transaction.amount ?? '',
      paidTo: transaction.paidTo ?? '',
      paymentType: transaction.paymentType ?? 'CASH',
      wallet: transaction.wallet ?? { id: 1 },
      createdAt: createdAtStr,
    })
    setShowFormModal(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'amount') {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setForm((prev) => ({ ...prev, [name]: value }))
      }
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.amount || !form.paidTo || !form.paymentType) {
      alert('Please fill all required fields.')
      return
    }

    const payload = {
      amount: parseFloat(form.amount),
      paidTo: form.paidTo,
      paymentType: form.paymentType,
      wallet: { id: form.wallet.id },
      createdAt: form.createdAt
        ? new Date(form.createdAt).toISOString()
        : new Date().toISOString(),
    }

    try {
      if (editingTransaction) {
        await api.put(`${baseURL}/${editingTransaction.id}`, payload)
      } else {
        await api.post(baseURL, payload)
      }
      setShowFormModal(false)
      fetchTransactions()
    } catch (err) {
      alert('Failed to save transaction. Please try again.')
    }
  }

  const openDeleteModal = (transaction) => {
    setDeletingTransaction(transaction)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await api.delete(`${baseURL}/${deletingTransaction.id}`)
      setShowDeleteModal(false)
      setDeletingTransaction(null)
      fetchTransactions()
    } catch (err) {
      alert('Failed to delete transaction.')
    }
  }

  return (
    <Base>
      <div className="container py-4">
        <Row className="align-items-center mb-4">
          <Col>
            <h2>Transaction Management</h2>
          </Col>
          <Col className="text-end">
            <Button variant="success" onClick={openAddModal}>
              Add Transaction
            </Button>
          </Col>
        </Row>

        {loading && (
          <div className="text-center my-4">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && transactions.length === 0 && (
          <p className="text-center text-muted">No transactions found.</p>
        )}

        {!loading && transactions.length > 0 && (
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
                <th>Paid To</th>
                <th>Payment Type</th>
                <th>Created At</th>
                <th>Wallet ID</th>
                <th style={{ minWidth: '160px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    {tx.amount?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>{tx.paidTo}</td>
                  <td>{tx.paymentType}</td>
                  <td>
                    {tx.createdAt
                      ? new Date(tx.createdAt).toLocaleString()
                      : '-'}
                  </td>
                  <td>{tx.wallet?.id || '-'}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="warning"
                      className="me-2"
                      onClick={() => openEditModal(tx)}
                      aria-label={`Edit transaction ${tx.paidTo}`}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => openDeleteModal(tx)}
                      aria-label={`Delete transaction ${tx.paidTo}`}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Add/Edit Transaction Modal */}
        <Modal
          show={showFormModal}
          onHide={() => setShowFormModal(false)}
          centered
          size="lg"
        >
          <Form onSubmit={handleSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>
                {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
              </Modal.Title>
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
                  <Form.Group controlId="formPaidTo">
                    <Form.Label>
                      Paid To <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="paidTo"
                      value={form.paidTo}
                      onChange={handleChange}
                      placeholder="Payee name"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
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
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formCreatedAt">
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

              {/* Wallet ID fixed or selectable */}
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
                {editingTransaction ? 'Update' : 'Add'}
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
            Are you sure you want to delete transaction paid to{' '}
            <strong>{deletingTransaction?.paidTo}</strong>?
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

export default TransactionManager
