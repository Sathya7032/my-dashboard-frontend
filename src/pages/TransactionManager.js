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
} from 'react-bootstrap'
import useAxios from '../auth/useAxios'
import { FaEdit, FaTrash, FaPlus, FaMoneyBillWave, FaReceipt } from 'react-icons/fa'

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
    wallet: { id: 1 },
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

  const getPaymentTypeVariant = (type) => {
    return type === 'CASH' ? 'success' : 'primary'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <Base>
      <div className="container py-4">
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body className="p-4">
            <Row className="align-items-center">
              <Col>
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                    <FaMoneyBillWave size={28} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="mb-0 fw-bold">Transaction Management</h2>
                    <p className="text-muted mb-0">Manage all financial transactions</p>
                  </div>
                </div>
              </Col>
              <Col className="text-end">
                <Button 
                  variant="primary" 
                  onClick={openAddModal}
                  className="rounded-pill px-4 py-2 d-inline-flex align-items-center"
                >
                  <FaPlus className="me-2" />
                  Add Transaction
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {loading && (
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body className="text-center p-5">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <p className="text-muted">Loading transactions...</p>
            </Card.Body>
          </Card>
        )}

        {error && (
          <Alert variant="danger" className="rounded-lg">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <h5 className="alert-heading">Error</h5>
                {error}
              </div>
              <Button variant="outline-danger" size="sm" onClick={fetchTransactions}>
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {!loading && transactions.length === 0 && !error && (
          <Card className="shadow-sm border-0 text-center py-5">
            <Card.Body>
              <div className="py-4">
                <FaReceipt size={48} className="text-muted mb-3" />
                <h4 className="text-muted">No transactions found</h4>
                <p className="text-muted mb-4">Get started by adding your first transaction</p>
                <Button variant="primary" onClick={openAddModal}>
                  Add Transaction
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}

        {!loading && transactions.length > 0 && (
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3 border-0">
              <h5 className="mb-0 fw-semibold">Transaction History</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Amount</th>
                      <th>Paid To</th>
                      <th>Payment Type</th>
                      <th>Created At</th>
                      <th>Wallet ID</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="align-middle">
                        <td className="ps-4 fw-bold text-primary">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-light rounded-circle p-2 me-2">
                              <FaMoneyBillWave size={14} className="text-muted" />
                            </div>
                            {tx.paidTo}
                          </div>
                        </td>
                        <td>
                          <Badge bg={getPaymentTypeVariant(tx.paymentType)} className="px-2 py-1">
                            {tx.paymentType}
                          </Badge>
                        </td>
                        <td>
                          {tx.createdAt
                            ? new Date(tx.createdAt).toLocaleString()
                            : '-'}
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {tx.wallet?.id || '-'}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="me-2 rounded-pill px-3"
                            onClick={() => openEditModal(tx)}
                            aria-label={`Edit transaction ${tx.paidTo}`}
                          >
                            <FaEdit className="me-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            className="rounded-pill px-3"
                            onClick={() => openDeleteModal(tx)}
                            aria-label={`Delete transaction ${tx.paidTo}`}
                          >
                            <FaTrash className="me-1" />
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Add/Edit Transaction Modal */}
        <Modal
          show={showFormModal}
          onHide={() => setShowFormModal(false)}
          centered
          size="lg"
          className="modal-professional"
        >
          <Modal.Header closeButton className="bg-light">
            <Modal.Title className="fw-bold">
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body className="p-4">
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formAmount" className="mb-4">
                    <Form.Label className="fw-semibold mb-2">
                      Amount (₹) <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                      className="py-2"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formPaidTo" className="mb-4">
                    <Form.Label className="fw-semibold mb-2">
                      Paid To <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="paidTo"
                      value={form.paidTo}
                      onChange={handleChange}
                      placeholder="Payee name"
                      required
                      className="py-2"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formPaymentType" className="mb-4">
                    <Form.Label className="fw-semibold mb-2">
                      Payment Type <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="paymentType"
                      value={form.paymentType}
                      onChange={handleChange}
                      required
                      className="py-2"
                    >
                      <option value="CASH">Cash</option>
                      <option value="ONLINE">Online</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formCreatedAt" className="mb-4">
                    <Form.Label className="fw-semibold mb-2">Created At</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="createdAt"
                      value={form.createdAt}
                      onChange={handleChange}
                      className="py-2"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formWalletId">
                    <Form.Label className="fw-semibold mb-2">Wallet ID</Form.Label>
                    <Form.Control
                      type="number"
                      name="walletId"
                      value={form.wallet.id}
                      disabled
                      className="py-2 bg-light"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className="bg-light px-4 py-3">
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowFormModal(false)}
                className="rounded-pill px-4"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                className="rounded-pill px-4"
              >
                {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
          className="modal-professional"
        >
          <Modal.Header closeButton className="bg-light">
            <Modal.Title className="fw-bold">Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 text-center">
            <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
              <FaTrash size={24} className="text-danger" />
            </div>
            <h5>Are you sure?</h5>
            <p className="text-muted">
              You are about to delete transaction paid to{' '}
              <strong className="text-dark">{deletingTransaction?.paidTo}</strong>. This action cannot be undone.
            </p>
          </Modal.Body>
          <Modal.Footer className="bg-light justify-content-center">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowDeleteModal(false)}
              className="rounded-pill px-4"
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmDelete}
              className="rounded-pill px-4"
            >
              Delete Transaction
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      <style jsx>{`
        .table th {
          border-top: none;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 0.5px;
          color: #6c757d;
        }
        
        .table td {
          border-top: 1px solid #f1f1f1;
          vertical-align: middle;
        }
        
        .table tbody tr:hover {
          background-color: #f8f9fa !important;
        }
        
        .modal-professional .modal-content {
          border: none;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }
        
        .btn {
          font-weight: 500;
        }
      `}</style>
    </Base>
  )
}

export default TransactionManager