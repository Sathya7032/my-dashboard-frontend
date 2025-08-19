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

const EmailManager = () => {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const api = useAxios();

  // Modal control to view/edit email detail for sending or marking reply
  const [showSendModal, setShowSendModal] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(null)

  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false)
  const [sendingAttachmentsEmail, setSendingAttachmentsEmail] = useState(null)

  // Modal to mark reply status
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replyEmail, setReplyEmail] = useState(null)
  const [replyStatus, setReplyStatus] = useState(false)

  const baseURL = '/emails'

  const initialForm = {
    companyName: '',
    recipient: '',
    subject: '',
    msgBody: '',
    attachments: '',
  }

  const [form, setForm] = useState(initialForm)

  const fetchEmails = async () => {
    try {
      setLoading(true)
      const res = await api.get(`${baseURL}/`)
      setEmails(res.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load emails.')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmails()
  }, [])

  // For form changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Open send email modal for new email or editing
  const openSendEmailModal = (email) => {
    if (email) {
      setForm({
        companyName: email.companyName || '',
        recipient: email.recipient || '',
        subject: email.subject || '',
        msgBody: email.msgBody || '',
        attachments: email.attachments || '',
      })
      setSendingEmail(email)
    } else {
      setForm(initialForm)
      setSendingEmail(null)
    }
    setShowSendModal(true)
  }

  const openSendAttachmentsModal = (email) => {
    if (email) {
      setForm({
        companyName: email.companyName || '',
        recipient: email.recipient || '',
        subject: email.subject || '',
        msgBody: email.msgBody || '',
        attachments: email.attachments || '',
      })
      setSendingAttachmentsEmail(email)
    } else {
      setForm(initialForm)
      setSendingAttachmentsEmail(null)
    }
    setShowAttachmentsModal(true)
  }

  const openReplyModal = (email) => {
    setReplyEmail(email)
    setReplyStatus(email.gotReply)
    setShowReplyModal(true)
  }

  // Send email without attachments
  const handleSendEmail = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form }

      const res = await api.post(`${baseURL}/send`, payload)
      alert(res.data || 'Email sent successfully')
      setShowSendModal(false)
      fetchEmails()
    } catch {
      alert('Failed to send email.')
    }
  }

  // Send email with attachments
  const handleSendEmailWithAttachments = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form }
      const res = await api.post(`${baseURL}/sendWithAttachments`, payload)
      alert(res.data || 'Email with attachments sent successfully')
      setShowAttachmentsModal(false)
      fetchEmails()
    } catch {
      alert('Failed to send email with attachments.')
    }
  }

  // Mark reply status
  const saveReplyStatus = async () => {
    try {
      const res = await api.post(
        `${baseURL}/markReply/${replyEmail.id}?gotReply=${replyStatus}`
      )
      alert('Reply status updated.')
      setShowReplyModal(false)
      fetchEmails()
    } catch {
      alert('Failed to update reply status.')
    }
  }

  return (
    <Base>
      <div className="container py-4">
        <Row className="mb-3 align-items-center">
          <Col>
            <h2>Email Management</h2>
          </Col>
          <Col className="text-end">
            <Button variant="primary" onClick={() => openSendEmailModal(null)}>
              New Email
            </Button>
          </Col>
        </Row>

        {loading && (
          <div className="text-center my-4">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && emails.length === 0 && (
          <p className="text-center text-muted">No emails sent yet.</p>
        )}

        {!loading && emails.length > 0 && (
          <Table striped bordered hover responsive className="table-professional">
            <thead>
              <tr>
                <th>Company</th>
                <th>Recipient</th>
                <th>Subject</th>
                <th>Got Reply</th>
                <th>Attachments</th>
                <th style={{ minWidth: '220px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((email) => (
                <tr key={email.id}>
                  <td>{email.companyName}</td>
                  <td>{email.recipient}</td>
                  <td>{email.subject}</td>
                  <td>
                    {email.gotReply ? (
                      <Badge bg="success">Yes</Badge>
                    ) : (
                      <Badge bg="secondary">No</Badge>
                    )}
                  </td>
                  <td>{email.attachments ? email.attachments : '-'}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="primary"
                      className="me-2"
                      onClick={() => openSendEmailModal(email)}
                    >
                      Resend
                    </Button>
                    <Button
                      size="sm"
                      variant="info"
                      className="me-2"
                      onClick={() => openSendAttachmentsModal(email)}
                    >
                      Send Attachments
                    </Button>
                    <Button
                      size="sm"
                      variant={email.gotReply ? 'success' : 'outline-secondary'}
                      onClick={() => openReplyModal(email)}
                    >
                      Mark Reply
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Send Email Modal */}
        <Modal show={showSendModal} onHide={() => setShowSendModal(false)} centered>
          <Form onSubmit={handleSendEmail}>
            <Modal.Header closeButton>
              <Modal.Title>{sendingEmail ? 'Resend Email' : 'New Email'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3" controlId="formCompanyName">
                <Form.Label>Company Name</Form.Label>
                <Form.Control
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formRecipient">
                <Form.Label>Recipient Email</Form.Label>
                <Form.Control
                  type="email"
                  name="recipient"
                  value={form.recipient}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formSubject">
                <Form.Label>Subject</Form.Label>
                <Form.Control
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formMsgBody">
                <Form.Label>Message Body</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="msgBody"
                  value={form.msgBody}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowSendModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Send Email
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Send Email with Attachments Modal */}
        <Modal
          show={showAttachmentsModal}
          onHide={() => setShowAttachmentsModal(false)}
          centered
        >
          <Form onSubmit={handleSendEmailWithAttachments}>
            <Modal.Header closeButton>
              <Modal.Title>
                {sendingAttachmentsEmail ? 'Resend Email with Attachments' : 'New Email with Attachments'}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3" controlId="formCompanyNameAtt">
                <Form.Label>Company Name</Form.Label>
                <Form.Control
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formRecipientAtt">
                <Form.Label>Recipient Email</Form.Label>
                <Form.Control
                  type="email"
                  name="recipient"
                  value={form.recipient}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formSubjectAtt">
                <Form.Label>Subject</Form.Label>
                <Form.Control
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formMsgBodyAtt">
                <Form.Label>Message Body</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="msgBody"
                  value={form.msgBody}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formAttachments">
                <Form.Label>Attachments (comma separated)</Form.Label>
                <Form.Control
                  type="text"
                  name="attachments"
                  value={form.attachments}
                  onChange={handleChange}
                  placeholder="file1.pdf, image.png"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAttachmentsModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Send with Attachments
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Mark Reply Modal */}
        <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Mark Reply Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Mark whether you have received a reply for email to <strong>{replyEmail?.recipient}</strong>
            </p>
            <Form.Check
              type="switch"
              id="reply-switch"
              label={replyStatus ? 'Got Reply' : 'No Reply'}
              checked={replyStatus}
              onChange={(e) => setReplyStatus(e.target.checked)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowReplyModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveReplyStatus}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Base>
  )
}

export default EmailManager
