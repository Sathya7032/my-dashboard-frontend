import React, { use, useEffect, useState } from 'react'
import { Base } from '../components/Base'
import axios from 'axios'
import { Card, Row, Col, Spinner, Alert, Button, Form } from 'react-bootstrap'
import useAxios from '../auth/useAxios'

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
  const walletId = 1 // as you said single wallet only and id = 1L is default
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

  if (loading) {
    return (
      <Base>
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      </Base>
    )
  }

  if (error) {
    return (
      <Base>
        <Alert variant="danger" className="my-4 mx-auto w-75 text-center">
          {error}
        </Alert>
      </Base>
    )
  }

  return (
    <Base>
      <div className="container py-4">
        <h2 className="mb-4 text-center">Wallet Details</h2>
        {wallet && (
          <Row className="g-4 justify-content-center">
            <Col xs={12} md={4}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>Current Balance</Card.Title>
                  {!editing ? (
                    <Card.Text className="fs-4">
                      ₹ {wallet.currentBalance?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </Card.Text>
                  ) : (
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="currentBalance"
                      value={form.currentBalance}
                      onChange={handleChange}
                      placeholder="Enter current balance"
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} md={4}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>Cash In Hand</Card.Title>
                  {!editing ? (
                    <Card.Text className="fs-4">
                      ₹ {wallet.cashInHand?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}
                    </Card.Text>
                  ) : (
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="cashInHand"
                      value={form.cashInHand}
                      onChange={handleChange}
                      placeholder="Enter cash in hand"
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} md={4}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>Cash In Account</Card.Title>
                  {!editing ? (
                    <Card.Text className="fs-4">
                      ₹ {wallet.cashInAccount?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}
                    </Card.Text>
                  ) : (
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="cashInAccount"
                      value={form.cashInAccount}
                      onChange={handleChange}
                      placeholder="Enter cash in account"
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        <div className="d-flex justify-content-center mt-4 gap-3">
          {!editing ? (
            <Button variant="primary" onClick={() => setEditing(true)}>
              Edit Wallet
            </Button>
          ) : (
            <>
              <Button variant="success" onClick={handleSave}>
                Save Changes
              </Button>
              <Button variant="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </Base>
  )
}

export default ExpenseTracker
