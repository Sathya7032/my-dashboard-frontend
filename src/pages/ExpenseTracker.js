import React, { useEffect, useState } from 'react'
import { Base } from '../components/Base'
import {
  Card,
  Row,
  Col,
  Spinner,
  Alert,
  Button,
  Form,
  Badge,
  ProgressBar
} from 'react-bootstrap'
import useAxios from '../auth/useAxios'
import { 
  FaWallet, 
  FaMoneyBillWave, 
  FaPiggyBank, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaRupeeSign,
  FaChartLine
} from 'react-icons/fa'

const ExpenseTracker = () => {
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    currentBalance: '',
    cashInHand: '',
    cashInAccount: '',
  })
  const [editing, setEditing] = useState(false)

  const baseURL = '/wallet'
  const walletId = 1
  const api = useAxios();

  const fetchWallet = async () => {
    try {
      setLoading(true)
      const response = await api.get(`${baseURL}/${walletId}`)
      setWallet(response.data)
      setForm({
        currentBalance: response.data.currentBalance ?? '',
        cashInHand: response.data.cashInHand ?? '',
        cashInAccount: response.data.cashInAccount ?? '',
      })
      setLoading(false)
    } catch (err) {
      setError('Failed to load wallet details.')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWallet()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      const updatedData = {
        currentBalance:
          form.currentBalance === '' ? 0 : parseFloat(form.currentBalance),
        cashInHand: form.cashInHand === '' ? 0 : parseFloat(form.cashInHand),
        cashInAccount:
          form.cashInAccount === '' ? 0 : parseFloat(form.cashInAccount),
      }
      await api.put(`${baseURL}/${walletId}`, updatedData)
      setEditing(false)
      fetchWallet()
    } catch (err) {
      alert('Failed to update wallet. Please check input values.')
    }
  }

  // Calculate distribution percentages for visualization
  const getDistribution = () => {
    if (!wallet || wallet.currentBalance === 0) return { hand: 0, account: 0 }
    
    const total = parseFloat(wallet.currentBalance)
    const hand = parseFloat(wallet.cashInHand || 0)
    const account = parseFloat(wallet.cashInAccount || 0)
    
    return {
      hand: total > 0 ? (hand / total) * 100 : 0,
      account: total > 0 ? (account / total) * 100 : 0
    }
  }

  const distribution = getDistribution()

  if (loading) {
    return (
      <Base>
        <div className="d-flex flex-column justify-content-center align-items-center py-5">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted">Loading wallet details...</p>
        </div>
      </Base>
    )
  }

  if (error) {
    return (
      <Base>
        <Alert variant="danger" className="my-4 mx-auto text-center" style={{ maxWidth: '600px' }}>
          <FaWallet className="me-2" />
          {error}
        </Alert>
      </Base>
    )
  }

  return (
    <Base>
      <div className="container py-4">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-primary mb-2">
            <FaWallet className="me-2" />
            Wallet Details
          </h2>
          <p className="text-muted">Manage your financial resources in one place</p>
        </div>
        
        {wallet && (
          <>
            <Row className="g-4 justify-content-center mb-5">
              <Col xs={12} lg={8}>
                <Card className="shadow border-0">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="mb-0 fw-semibold">Financial Overview</h5>
                      <Badge bg="light" text="dark" className="fs-6 px-3 py-2">
                        <FaRupeeSign className="me-1" />
                        Total Balance
                      </Badge>
                    </div>
                    
                    <div className="text-center mb-4">
                      <h1 className="display-4 fw-bold text-primary mb-1">
                        ₹{wallet.currentBalance?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </h1>
                      <p className="text-muted">Current Total Balance</p>
                    </div>
                    
                    <div className="mb-4">
                      <h6 className="mb-3 fw-semibold">Funds Distribution</h6>
                      <div className="d-flex align-items-center mb-2">
                        <div className="me-3 d-flex align-items-center">
                          <span className="bg-warning rounded-circle p-2 me-2 d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px'}}>
                            <FaMoneyBillWave size={12} className="text-dark" />
                          </span>
                          <span>Cash in Hand</span>
                        </div>
                        <div className="flex-grow-1 mx-3">
                          <ProgressBar 
                            now={distribution.hand} 
                            variant="warning" 
                            className="flex-grow-1"
                            style={{height: '8px'}}
                          />
                        </div>
                        <div className="fw-semibold">
                          ₹{(wallet.cashInHand || 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center">
                        <div className="me-3 d-flex align-items-center">
                          <span className="bg-info rounded-circle p-2 me-2 d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px'}}>
                            <FaPiggyBank size={12} className="text-white" />
                          </span>
                          <span>Cash in Account</span>
                        </div>
                        <div className="flex-grow-1 mx-3">
                          <ProgressBar 
                            now={distribution.account} 
                            variant="info" 
                            className="flex-grow-1"
                            style={{height: '8px'}}
                          />
                        </div>
                        <div className="fw-semibold">
                          ₹{(wallet.cashInAccount || 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="g-4 justify-content-center">
              <Col xs={12} md={6} lg={4}>
                <Card className={`shadow-sm border-0 h-100 ${editing ? 'border-primary' : ''}`}>
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                        <FaMoneyBillWave size={20} className="text-warning" />
                      </div>
                      <Card.Title className="mb-0">Cash In Hand</Card.Title>
                    </div>
                    {!editing ? (
                      <div>
                        <h3 className="fw-bold text-warning">
                          ₹{wallet.cashInHand?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }) || '0.00'}
                        </h3>
                        <p className="text-muted mb-0">Physical cash available</p>
                      </div>
                    ) : (
                      <Form.Group>
                        <Form.Label className="fw-semibold">Amount</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="cashInHand"
                          value={form.cashInHand}
                          onChange={handleChange}
                          placeholder="Enter cash in hand"
                          className="py-2"
                        />
                      </Form.Group>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} md={6} lg={4}>
                <Card className={`shadow-sm border-0 h-100 ${editing ? 'border-primary' : ''}`}>
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                        <FaPiggyBank size={20} className="text-info" />
                      </div>
                      <Card.Title className="mb-0">Cash In Account</Card.Title>
                    </div>
                    {!editing ? (
                      <div>
                        <h3 className="fw-bold text-info">
                          ₹{wallet.cashInAccount?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }) || '0.00'}
                        </h3>
                        <p className="text-muted mb-0">Bank account balance</p>
                      </div>
                    ) : (
                      <Form.Group>
                        <Form.Label className="fw-semibold">Amount</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="cashInAccount"
                          value={form.cashInAccount}
                          onChange={handleChange}
                          placeholder="Enter cash in account"
                          className="py-2"
                        />
                      </Form.Group>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}

        <div className="d-flex justify-content-center mt-5 gap-3">
          {!editing ? (
            <Button 
              variant="primary" 
              onClick={() => setEditing(true)}
              className="rounded-pill px-4 d-inline-flex align-items-center"
            >
              <FaEdit className="me-2" />
              Edit Wallet
            </Button>
          ) : (
            <>
              <Button 
                variant="success" 
                onClick={handleSave}
                className="rounded-pill px-4 d-inline-flex align-items-center"
              >
                <FaSave className="me-2" />
                Save Changes
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={() => setEditing(false)}
                className="rounded-pill px-4 d-inline-flex align-items-center"
              >
                <FaTimes className="me-2" />
                Cancel
              </Button>
            </>
          )}
        </div>

        {wallet && !editing && (
          <Row className="mt-5">
            <Col xs={12}>
              <Card className="border-0 bg-light">
                <Card.Body className="p-4 text-center">
                  <FaChartLine size={32} className="text-primary mb-3" />
                  <h5 className="fw-semibold">Financial Health</h5>
                  <p className="text-muted mb-0">
                    {distribution.hand > 50 ? 
                      "Most of your funds are in cash. Consider moving some to your account for safety." : 
                      distribution.account > 50 ? 
                      "Most of your funds are in your account. Good for security!" : 
                      "Your funds are balanced between cash and account. Well done!"
                    }
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </Base>
  )
}

export default ExpenseTracker