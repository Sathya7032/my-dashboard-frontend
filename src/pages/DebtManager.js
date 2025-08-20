import React, { useEffect, useState } from 'react'
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
  Badge,
  Card,
} from 'react-bootstrap'
import useAxios from '../auth/useAxios'
import { FaMoneyBillWave, FaPlus, FaEdit, FaTrash, FaEye, FaExchangeAlt, FaChartLine } from 'react-icons/fa'

const DebtManager = () => {
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [totalOutstanding, setTotalOutstanding] = useState(null)

  // Debt form modal
  const [showDebtModal, setShowDebtModal] = useState(false)
  const [editingDebt, setEditingDebt] = useState(null)

  // Interest modal to show interests for selected debt
  const [showInterestModal, setShowInterestModal] = useState(false)
  const [currentInterests, setCurrentInterests] = useState([])
  const [selectedDebtForInterest, setSelectedDebtForInterest] = useState(null)

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingDebt, setDeletingDebt] = useState(null)

  // Paid toggle modal
  const [showPaidToggleModal, setShowPaidToggleModal] = useState(false)
  const [paidToggleDebt, setPaidToggleDebt] = useState(null)
  const [paidToggleValue, setPaidToggleValue] = useState(false)
  const [paidToggleLoading, setPaidToggleLoading] = useState(false)
  const [paidToggleError, setPaidToggleError] = useState(null)

  const api = useAxios()
  const baseURL = '/debt'

  const initialDebtForm = {
    lenderName: '',
    principalAmount: '',
    interestRate: '',
    paid: false,
    debtTakenAt: '',
    paidAmount: '',
  }

  const [form, setForm] = useState(initialDebtForm)

  // Fetch debts list
  const fetchDebts = async () => {
    try {
      setLoading(true)
      const res = await api.get(baseURL)
      setDebts(res.data)
      setLoading(false)
    } catch {
      setError('Failed to load debts.')
      setLoading(false)
    }
  }

  // Fetch total outstanding debt
  const fetchTotalOutstanding = async () => {
    try {
      const res = await api.get(`${baseURL}/total`)
      setTotalOutstanding(res.data)
    } catch {
      // Ignore minor error
    }
  }

  useEffect(() => {
    fetchDebts()
    fetchTotalOutstanding()
  }, [])

  // Open add modal
  const openAddModal = () => {
    setEditingDebt(null)
    setForm(initialDebtForm)
    setShowDebtModal(true)
  }

  // Open edit modal, prefill form
  const openEditModal = (debt) => {
    setEditingDebt(debt)
    setForm({
      lenderName: debt.lenderName ?? '',
      principalAmount: debt.principalAmount
        ? debt.principalAmount.toString()
        : '',
      interestRate: debt.interestRate ?? '',
      paid: debt.paid ?? false,
      debtTakenAt: debt.debtTakenAt ? debt.debtTakenAt.split('T')[0] : '',
      paidAmount: debt.paidAmount ? debt.paidAmount.toString() : '',
    })
    setShowDebtModal(true)
  }

  // Open paid toggle modal
  const openPaidToggleModal = (debt) => {
    setPaidToggleDebt(debt)
    setPaidToggleValue(debt.paid)
    setPaidToggleError(null)
    setShowPaidToggleModal(true)
  }

  // Form control changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }))
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Submit debt add or edit
  const handleDebtSubmit = async (e) => {
    e.preventDefault()

    if (
      !form.lenderName ||
      !form.principalAmount ||
      !form.interestRate ||
      !form.debtTakenAt
    ) {
      alert('Please fill all required fields.')
      return
    }

    try {
      const payload = {
        lenderName: form.lenderName,
        principalAmount: parseFloat(form.principalAmount),
        interestRate: parseFloat(form.interestRate),
        paid: form.paid,
        debtTakenAt: form.debtTakenAt ? form.debtTakenAt + 'T00:00:00' : null,
        paidAmount: form.paidAmount ? parseFloat(form.paidAmount) : 0,
      }
      if (editingDebt) {
        await api.put(`${baseURL}/${editingDebt.id}`, payload)
      } else {
        await api.post(baseURL, payload)
      }
      setShowDebtModal(false)
      fetchDebts()
      fetchTotalOutstanding()
    } catch {
      alert('Failed to save debt. Please check input values.')
    }
  }

  // Confirm delete debt
  const confirmDelete = async () => {
    try {
      await api.delete(`${baseURL}/${deletingDebt.id}`)
      setShowDeleteModal(false)
      setDeletingDebt(null)
      fetchDebts()
      fetchTotalOutstanding()
    } catch {
      alert('Failed to delete debt.')
    }
  }

  // Open delete confirm modal
  const openDeleteModal = (debt) => {
    setDeletingDebt(debt)
    setShowDeleteModal(true)
  }

  // Open interests modal
  const openInterestModal = (debt) => {
    setSelectedDebtForInterest(debt)
    setCurrentInterests(debt.interests || [])
    setShowInterestModal(true)
  }

  // Mark interest as paid
  const payInterest = async (interestId) => {
    try {
      await api.post(`${baseURL}/pay-interest/${interestId}`)
      fetchDebts()
      fetchTotalOutstanding()
      if (selectedDebtForInterest) {
        const res = await api.get(`${baseURL}/${selectedDebtForInterest.id}`)
        setCurrentInterests(res.data.interests || [])
      }
    } catch {
      alert('Failed to pay interest.')
    }
  }

  // Save paid toggle status from modal
  const savePaidToggleChange = async () => {
    if (!paidToggleDebt) return
    setPaidToggleLoading(true)
    setPaidToggleError(null)
    try {
      const payload = {
        lenderName: paidToggleDebt.lenderName,
        principalAmount: paidToggleDebt.principalAmount,
        interestRate: paidToggleDebt.interestRate,
        paid: paidToggleValue,
        debtTakenAt: paidToggleDebt.debtTakenAt,
        paidAmount: paidToggleDebt.paidAmount,
      }
      await api.put(`${baseURL}/${paidToggleDebt.id}`, payload)
      setShowPaidToggleModal(false)
      fetchDebts()
      fetchTotalOutstanding()
    } catch {
      setPaidToggleError('Failed to update paid status.')
    } finally {
      setPaidToggleLoading(false)
    }
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
                    <h2 className="mb-0 fw-bold">Debt Management</h2>
                    <p className="text-muted mb-0">Track and manage all your debts</p>
                  </div>
                </div>
              </Col>
              <Col className="text-end">
                <Button 
                  variant="primary" 
                  className="me-2 rounded-pill px-4 py-2 d-inline-flex align-items-center"
                  onClick={openAddModal}
                >
                  <FaPlus className="me-2" />
                  Add Debt
                </Button>
                <Button
                  variant="outline-info"
                  className="rounded-pill px-4 py-2 d-inline-flex align-items-center"
                  onClick={async () => {
                    try {
                      await api.post(`${baseURL}/generate-interest`)
                      alert('Monthly interest generated for all debts.')
                      fetchDebts()
                      fetchTotalOutstanding()
                    } catch {
                      alert('Failed to generate interest.')
                    }
                  }}
                >
                  <FaChartLine className="me-2" />
                  Generate Interest
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {totalOutstanding !== null && (
          <Alert variant="warning" className="text-center fw-semibold border-0 rounded-lg shadow-sm">
            <div className="d-flex align-items-center justify-content-center">
              <FaMoneyBillWave className="me-2" />
              Total Outstanding Debt: {formatCurrency(totalOutstanding)}
            </div>
          </Alert>
        )}

        {error && (
          <Alert variant="danger" className="rounded-lg border-0 shadow-sm">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <h5 className="alert-heading">Error</h5>
                {error}
              </div>
              <Button variant="outline-danger" size="sm" onClick={fetchDebts}>
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {loading && (
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body className="text-center p-5">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <p className="text-muted">Loading debts...</p>
            </Card.Body>
          </Card>
        )}

        {!loading && debts.length === 0 && !error && (
          <Card className="shadow-sm border-0 text-center py-5">
            <Card.Body>
              <div className="py-4">
                <FaMoneyBillWave size={48} className="text-muted mb-3" />
                <h4 className="text-muted">No debts recorded</h4>
                <p className="text-muted mb-4">Get started by adding your first debt</p>
                <Button variant="primary" onClick={openAddModal}>
                  Add Debt
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}

        {!loading && debts.length > 0 && (
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3 border-0">
              <h5 className="mb-0 fw-semibold">Debt Records</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Lender</th>
                      <th>Principal Amount</th>
                      <th>Interest Rate</th>
                      <th>Status</th>
                      <th>Debt Taken At</th>
                      <th>Paid Amount</th>
                      <th>Interests</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debts.map((debt) => (
                      <tr key={debt.id} className="align-middle">
                        <td className="ps-4 fw-semibold">{debt.lenderName}</td>
                        <td className="fw-bold text-primary">
                          {formatCurrency(debt.principalAmount)}
                        </td>
                        <td>
                          <Badge bg="light" text="dark" className="px-2 py-1">
                            {debt.interestRate.toFixed(2)}%
                          </Badge>
                        </td>
                        <td>
                          <Badge
                            bg={debt.paid ? 'success' : 'warning'}
                            className="px-2 py-1"
                          >
                            {debt.paid ? 'Paid' : 'Pending'}
                          </Badge>
                        </td>
                        <td>
                          {debt.debtTakenAt
                            ? new Date(debt.debtTakenAt).toLocaleDateString()
                            : '-'}
                        </td>
                        <td className={debt.paidAmount > 0 ? 'text-success fw-semibold' : ''}>
                          {formatCurrency(debt.paidAmount || 0)}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-info"
                            className="rounded-pill d-inline-flex align-items-center"
                            onClick={() => openInterestModal(debt)}
                          >
                            <FaEye className="me-1" />
                            View{' '}
                            <Badge bg="light" text="dark" className="ms-1">
                              {debt.interests ? debt.interests.length : 0}
                            </Badge>
                          </Button>
                        </td>
                        <td className="text-end pe-4">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="me-2 rounded-pill px-3"
                            onClick={() => openEditModal(debt)}
                          >
                            <FaEdit className="me-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            className="me-2 rounded-pill px-3"
                            onClick={() => openPaidToggleModal(debt)}
                            title="Toggle Paid Status"
                          >
                            <FaExchangeAlt className="me-1" />
                            {debt.paid ? 'Pending' : 'Paid'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            className="rounded-pill px-3"
                            onClick={() => openDeleteModal(debt)}
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

        {/* Debt Add/Edit Modal */}
        <Modal
          show={showDebtModal}
          onHide={() => setShowDebtModal(false)}
          centered
          size="lg"
          className="modal-professional"
        >
          <Modal.Header closeButton className="bg-light">
            <Modal.Title className="fw-bold">
              {editingDebt ? 'Edit Debt' : 'Add New Debt'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleDebtSubmit}>
            <Modal.Body className="p-4">
              <Row>
                <Col md={6} className="mb-4">
                  <Form.Group controlId="formLenderName">
                    <Form.Label className="fw-semibold mb-2">
                      Lender Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="lenderName"
                      value={form.lenderName}
                      onChange={handleChange}
                      placeholder="Enter lender's name"
                      required
                      className="py-2"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-4">
                  <Form.Group controlId="formPrincipalAmount">
                    <Form.Label className="fw-semibold mb-2">
                      Principal Amount (₹) <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      name="principalAmount"
                      value={form.principalAmount}
                      onChange={handleChange}
                      placeholder="Enter principal amount"
                      required
                      className="py-2"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6} className="mb-4">
                  <Form.Group controlId="formInterestRate">
                    <Form.Label className="fw-semibold mb-2">
                      Interest Rate (%) <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      name="interestRate"
                      value={form.interestRate}
                      onChange={handleChange}
                      placeholder="Monthly interest rate in %"
                      required
                      className="py-2"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-4">
                  <Form.Group controlId="formDebtTakenAt">
                    <Form.Label className="fw-semibold mb-2">
                      Debt Taken At <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="debtTakenAt"
                      value={form.debtTakenAt}
                      onChange={handleChange}
                      required
                      className="py-2"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6} className="mb-4">
                  <Form.Group controlId="formPaidAmount">
                    <Form.Label className="fw-semibold mb-2">Paid Amount (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      name="paidAmount"
                      value={form.paidAmount}
                      onChange={handleChange}
                      placeholder="Amount paid so far"
                      className="py-2"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-4 d-flex align-items-center">
                  <Form.Check
                    type="checkbox"
                    label="Debt Paid"
                    name="paid"
                    checked={form.paid}
                    onChange={handleChange}
                    className="fw-semibold pt-4"
                  />
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className="bg-light px-4 py-3">
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowDebtModal(false)}
                className="rounded-pill px-4"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                className="rounded-pill px-4"
              >
                {editingDebt ? 'Update Debt' : 'Add Debt'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Paid Toggle Modal */}
        <Modal
          show={showPaidToggleModal}
          onHide={() => setShowPaidToggleModal(false)}
          centered
          className="modal-professional"
        >
          <Modal.Header closeButton className="bg-light">
            <Modal.Title className="fw-bold">Update Debt Status</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 text-center">
            {paidToggleError && (
              <Alert variant="danger" className="mb-3 rounded-lg">
                {paidToggleError}
              </Alert>
            )}
            <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
              <FaExchangeAlt size={24} className="text-primary" />
            </div>
            <h5>Update Payment Status</h5>
            <p className="text-muted">
              Debt from <strong className="text-dark">{paidToggleDebt?.lenderName}</strong>
            </p>
            <div className="d-flex align-items-center justify-content-center mb-3">
              <span className="me-3 fw-semibold">Status:</span>
              <Badge
                bg={paidToggleValue ? 'success' : 'warning'}
                className="px-3 py-2"
              >
                {paidToggleValue ? 'Paid' : 'Pending'}
              </Badge>
            </div>
            <Form.Check
              type="switch"
              id="paid-status-switch"
              label="Mark as Paid"
              checked={paidToggleValue}
              disabled={paidToggleLoading}
              onChange={(e) => setPaidToggleValue(e.target.checked)}
              className="d-inline-flex justify-content-center fw-semibold"
            />
          </Modal.Body>
          <Modal.Footer className="bg-light justify-content-center">
            <Button
              variant="outline-secondary"
              onClick={() => setShowPaidToggleModal(false)}
              disabled={paidToggleLoading}
              className="rounded-pill px-4"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={savePaidToggleChange}
              disabled={paidToggleLoading}
              className="rounded-pill px-4"
            >
              {paidToggleLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Interests Modal */}
        <Modal
          show={showInterestModal}
          onHide={() => setShowInterestModal(false)}
          centered
          size="lg"
          className="modal-professional"
        >
          <Modal.Header closeButton className="bg-light">
            <Modal.Title className="fw-bold">
              Interests for Debt: {selectedDebtForInterest?.lenderName}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {currentInterests.length === 0 ? (
              <div className="text-center py-4">
                <FaChartLine size={36} className="text-muted mb-3" />
                <p className="text-muted">No interest entries found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover>
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Interest Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInterests.map((interest) => (
                      <tr key={interest.id}>
                        <td>{new Date(interest.interestDate).toLocaleDateString()}</td>
                        <td className="fw-semibold">
                          {formatCurrency(interest.interestAmount)}
                        </td>
                        <td>
                          {interest.paid ? (
                            <Badge bg="success" className="px-2 py-1">Paid</Badge>
                          ) : (
                            <Badge bg="warning" text="dark" className="px-2 py-1">Pending</Badge>
                          )}
                        </td>
                        <td>
                          {!interest.paid && (
                            <Button
                              size="sm"
                              variant="success"
                              className="rounded-pill px-3"
                              onClick={() => payInterest(interest.id)}
                            >
                              Mark as Paid
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button 
              variant="secondary" 
              onClick={() => setShowInterestModal(false)}
              className="rounded-pill px-4"
            >
              Close
            </Button>
          </Modal.Footer>
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
              You are about to delete debt from{' '}
              <strong className="text-dark">{deletingDebt?.lenderName}</strong>. This action cannot be undone.
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
              Delete Debt
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

export default DebtManager