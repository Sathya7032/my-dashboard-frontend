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
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaRupeeSign,
  FaMoneyCheckAlt,
  FaCalendarAlt,
  FaWallet,
  FaCashRegister,
  FaGlobe,
  FaExclamationTriangle
} from 'react-icons/fa'

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

  // Helper function to get payment type badge
  const getPaymentTypeVariant = (type) => {
    switch (type) {
      case 'CASH': return 'success'
      case 'ONLINE': return 'primary'
      default: return 'secondary'
    }
  }

  // Helper function to get payment type icon
  const getPaymentTypeIcon = (type) => {
    switch (type) {
      case 'CASH': return <FaCashRegister className="me-1" />
      case 'ONLINE': return <FaGlobe className="me-1" />
      default: return <FaMoneyCheckAlt className="me-1" />
    }
  }

  // Calculate total income
  const totalIncome = incomes.reduce((sum, income) => sum + (parseFloat(income.amount) || 0), 0)

  return (
    <Base>
      <div className="container py-4">
        <Row className="align-items-center mb-4">
          <Col>
            <h2 className="fw-bold text-success">
              <FaMoneyCheckAlt className="me-2" />
              Income Management
            </h2>
            <p className="text-muted">Track and manage your income sources</p>
          </Col>
          <Col className="text-end">
            <Button 
              variant="success" 
              onClick={openAddModal}
              className="rounded-pill px-4 d-inline-flex align-items-center"
            >
              <FaPlus className="me-2" />
              Add Income
            </Button>
          </Col>
        </Row>

        {/* Summary Card */}
        {incomes.length > 0 && (
          <Row className="mb-4">
            <Col>
              <Card className="border-0 bg-success bg-opacity-10">
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-success mb-1">Total Income</h6>
                      <h3 className="fw-bold text-success mb-0">
                        <FaRupeeSign className="me-1" />
                        {totalIncome.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </h3>
                    </div>
                    <div className="text-end">
                      <Badge bg="success" className="fs-6 px-3 py-2">
                        {incomes.length} {incomes.length === 1 ? 'Entry' : 'Entries'}
                      </Badge>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {loading && (
          <div className="text-center my-5 py-5">
            <Spinner animation="border" variant="success" className="mb-3" />
            <p className="text-muted">Loading income data...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="d-flex align-items-center">
            <FaExclamationTriangle className="me-2" />
            {error}
          </Alert>
        )}

        {!loading && incomes.length === 0 && (
          <Card className="text-center border-0 shadow-sm">
            <Card.Body className="py-5">
              <FaMoneyCheckAlt size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No income recorded</h5>
              <p className="text-muted">Start tracking your income by adding your first entry</p>
              <Button 
                variant="outline-success" 
                onClick={openAddModal}
                className="rounded-pill px-4 d-inline-flex align-items-center"
              >
                <FaPlus className="me-2" />
                Add Income
              </Button>
            </Card.Body>
          </Card>
        )}

        {!loading && incomes.length > 0 && (
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white py-3">
              <h5 className="mb-0 fw-semibold">Income Records</h5>
            </Card.Header>
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Source</th>
                    <th>Amount</th>
                    <th>Received Date</th>
                    <th>Payment Type</th>
                    <th>Wallet ID</th>
                    <th style={{ minWidth: '140px' }} className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.map((income) => (
                    <tr key={income.id}>
                      <td className="ps-4 fw-semibold">
                        {income.source}
                      </td>
                      <td className="fw-bold text-success">
                        <FaRupeeSign className="me-1" />
                        {income.amount?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaCalendarAlt className="text-muted me-2" />
                          {income.receivedDate
                            ? new Date(income.receivedDate).toLocaleString()
                            : '-'}
                        </div>
                      </td>
                      <td>
                        <Badge bg={getPaymentTypeVariant(income.paymentType)} className="d-inline-flex align-items-center">
                          {getPaymentTypeIcon(income.paymentType)}
                          {income.paymentType}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="secondary" className="d-inline-flex align-items-center">
                          <FaWallet className="me-1" />
                          {income.wallet?.id || '-'}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="me-2 rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ width: '32px', height: '32px' }}
                          onClick={() => openEditModal(income)}
                          aria-label={`Edit income ${income.source}`}
                        >
                          <FaEdit size={12} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="rounded-circle d-inline-flex align-items-center justify-content-center"
                          style={{ width: '32px', height: '32px' }}
                          onClick={() => openDeleteModal(income)}
                          aria-label={`Delete income ${income.source}`}
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

        {/* Add/Edit Income Modal */}
        <Modal
          show={showFormModal}
          onHide={() => setShowFormModal(false)}
          centered
          size="lg"
        >
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold text-success">
              {editingIncome ? 'Edit Income' : 'Add New Income'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body className="pt-0">
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formAmount">
                    <Form.Label className="fw-semibold">
                      Amount (₹) <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="position-relative">
                      <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
                        <FaRupeeSign />
                      </span>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        name="amount"
                        value={form.amount}
                        onChange={handleChange}
                        placeholder="Enter amount"
                        required
                        className="ps-5 py-2"
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formSource">
                    <Form.Label className="fw-semibold">
                      Source <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="source"
                      value={form.source}
                      onChange={handleChange}
                      placeholder="Salary, Business, Investment etc."
                      required
                      className="py-2"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formReceivedDate">
                    <Form.Label className="fw-semibold">
                      Received Date <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="position-relative">
                      <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
                        <FaCalendarAlt />
                      </span>
                      <Form.Control
                        type="datetime-local"
                        name="receivedDate"
                        value={form.receivedDate}
                        onChange={handleChange}
                        required
                        className="ps-5 py-2"
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formPaymentType">
                    <Form.Label className="fw-semibold">
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
              </Row>

              {/* Wallet is fixed id 1, but if you want can add a disabled field here */}
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formWalletId">
                    <Form.Label className="fw-semibold">Wallet ID</Form.Label>
                    <div className="d-flex align-items-center bg-light rounded p-2">
                      <FaWallet className="text-muted me-2" />
                      <span className="fw-semibold">{form.wallet.id}</span>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button variant="outline-secondary" onClick={() => setShowFormModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="success" className="px-4">
                {editingIncome ? 'Update Income' : 'Add Income'}
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
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-bold text-danger">Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body className="py-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-danger bg-opacity-10 rounded-circle p-3 me-3">
                <FaExclamationTriangle size={24} className="text-danger" />
              </div>
              <div>
                <h6 className="mb-1">Are you sure you want to delete this income record?</h6>
                <p className="mb-0 text-muted">This action cannot be undone.</p>
              </div>
            </div>
            <Card className="bg-light border-0">
              <Card.Body className="py-3">
                <h6 className="mb-1">{deletingIncome?.source}</h6>
                <div className="d-flex align-items-center text-success fw-semibold">
                  <FaRupeeSign className="me-1" />
                  {deletingIncome?.amount?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="text-muted small mt-1">
                  {deletingIncome?.receivedDate && new Date(deletingIncome.receivedDate).toLocaleDateString()}
                </div>
              </Card.Body>
            </Card>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} className="px-4">
              Delete Income
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Base>
  )
}

export default IncomeManager