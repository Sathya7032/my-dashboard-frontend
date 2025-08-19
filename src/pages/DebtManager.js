import React, { useEffect, useState } from 'react'
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
  Badge,
} from 'react-bootstrap'
import useAxios from '../auth/useAxios'

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

  return (
    <Base>
      <div className="container py-4">
        <Row className="mb-3 align-items-center">
          <Col>
            <h2>Debt Management</h2>
          </Col>
          <Col className="text-end">
            <Button variant="success" className="me-2" onClick={openAddModal}>
              Add Debt
            </Button>
            <Button
              variant="info"
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
              Generate Monthly Interest
            </Button>
          </Col>
        </Row>

        {totalOutstanding !== null && (
          <Alert variant="warning" className="text-center fw-semibold">
            Total Outstanding Debt: ₹{' '}
            {parseFloat(totalOutstanding).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Alert>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {loading && (
          <div className="text-center my-4">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {!loading && debts.length === 0 && (
          <p className="text-center text-muted">No debts recorded.</p>
        )}

        {!loading && debts.length > 0 && (
          <Table
            striped
            bordered
            hover
            responsive
            className="table-professional"
            style={{ minWidth: '900px' }}
          >
            <thead>
              <tr>
                <th>Lender</th>
                <th>Principal Amount (₹)</th>
                <th>Interest Rate (%)</th>
                <th>Paid</th>
                <th>Debt Taken At</th>
                <th>Paid Amount (₹)</th>
                <th>Interests</th>
                <th style={{ minWidth: '220px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {debts.map((debt) => (
                <tr key={debt.id}>
                  <td>{debt.lenderName}</td>
                  <td>
                    {debt.principalAmount?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>{debt.interestRate.toFixed(2)}</td>
                  <td>
                    <Badge
                      bg={debt.paid ? 'success' : 'warning'}
                      text={debt.paid ? undefined : 'dark'}
                    >
                      {debt.paid ? 'Paid' : 'Pending'}
                    </Badge>
                  </td>
                  <td>
                    {debt.debtTakenAt
                      ? new Date(debt.debtTakenAt).toLocaleDateString()
                      : '-'}
                  </td>
                  <td>
                    {debt.paidAmount?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) || '0.00'}
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() => openInterestModal(debt)}
                    >
                      View Interests{' '}
                      <Badge bg="light" text="dark">
                        {debt.interests ? debt.interests.length : 0}
                      </Badge>
                    </Button>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="warning"
                      className="me-2"
                      onClick={() => openEditModal(debt)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="me-2"
                      onClick={() => openPaidToggleModal(debt)}
                      title="Toggle Paid Status"
                    >
                      {debt.paid ? 'Mark Pending' : 'Mark Paid'}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => openDeleteModal(debt)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Debt Add/Edit Modal */}
        <Modal
          show={showDebtModal}
          onHide={() => setShowDebtModal(false)}
          centered
          size="lg"
        >
          <Form onSubmit={handleDebtSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>{editingDebt ? 'Edit Debt' : 'Add Debt'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formLenderName">
                    <Form.Label>
                      Lender Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="lenderName"
                      value={form.lenderName}
                      onChange={handleChange}
                      placeholder="Enter lender's name"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formPrincipalAmount">
                    <Form.Label>
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
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formInterestRate">
                    <Form.Label>
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
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formDebtTakenAt">
                    <Form.Label>
                      Debt Taken At <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="debtTakenAt"
                      value={form.debtTakenAt}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="formPaidAmount">
                    <Form.Label>Paid Amount (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      name="paidAmount"
                      value={form.paidAmount}
                      onChange={handleChange}
                      placeholder="Amount paid so far"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3 d-flex align-items-center">
                  <Form.Check
                    type="checkbox"
                    label="Debt Paid"
                    name="paid"
                    checked={form.paid}
                    onChange={handleChange}
                  />
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDebtModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingDebt ? 'Update' : 'Add'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Paid Toggle Modal */}
        <Modal
          show={showPaidToggleModal}
          onHide={() => setShowPaidToggleModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Toggle Debt Paid Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {paidToggleError && (
              <Alert variant="danger" className="mb-3">
                {paidToggleError}
              </Alert>
            )}
            <p>
              Current status for debt from{' '}
              <strong>{paidToggleDebt?.lenderName}</strong>:{' '}
              <Badge
                bg={paidToggleValue ? 'success' : 'warning'}
                text={paidToggleValue ? undefined : 'dark'}
              >
                {paidToggleValue ? 'Paid' : 'Pending'}
              </Badge>
            </p>
            <Form.Check
              type="switch"
              id="paid-status-switch"
              label="Mark as Paid"
              checked={paidToggleValue}
              disabled={paidToggleLoading}
              onChange={(e) => setPaidToggleValue(e.target.checked)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowPaidToggleModal(false)}
              disabled={paidToggleLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={savePaidToggleChange}
              disabled={paidToggleLoading}
            >
              {paidToggleLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                'Save'
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
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Interests for Debt: {selectedDebtForInterest?.lenderName}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {currentInterests.length === 0 ? (
              <p>No interest entries found.</p>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Interest Amount (₹)</th>
                    <th>Paid</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentInterests.map((interest) => (
                    <tr key={interest.id}>
                      <td>{new Date(interest.interestDate).toLocaleDateString()}</td>
                      <td>
                        {interest.interestAmount?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        {interest.paid ? (
                          <Badge bg="success">Paid</Badge>
                        ) : (
                          <Badge bg="warning text-dark">Pending</Badge>
                        )}
                      </td>
                      <td>
                        {!interest.paid && (
                          <Button
                            size="sm"
                            variant="success"
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
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowInterestModal(false)}>
              Close
            </Button>
          </Modal.Footer>
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
            Are you sure you want to delete debt from{' '}
            <strong>{deletingDebt?.lenderName}</strong>?
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

export default DebtManager
