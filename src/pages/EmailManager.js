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
import Editor, { 
  Toolbar, 
  BtnBold, 
  BtnItalic, 
  BtnUnderline, 
  BtnNumberedList, 
  BtnBulletList, 
  Separator 
} from 'react-simple-wysiwyg'

// Utility: strip HTML tags to plain text
const stripHtmlTags = (html) => {
  const temp = document.createElement("div")
  temp.innerHTML = html
  return temp.textContent || temp.innerText || ""
}

const EmailManager = () => {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const api = useAxios();

  // Modal control
  const [showSendModal, setShowSendModal] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(null)

  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false)
  const [sendingAttachmentsEmail, setSendingAttachmentsEmail] = useState(null)

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

  // Fetch emails
  const fetchEmails = async () => {
    try {
      setLoading(true)
      const res = await api.get(`${baseURL}/`)
      setEmails(res.data)
      setLoading(false)
    } catch {
      setError('Failed to load emails.')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmails()
  }, [])

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Handle editor change
  const handleEditorChange = (e) => {
    setForm(prev => ({ ...prev, msgBody: e.target.value }))
  }

  // Open modals
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
      const payload = { 
        ...form,
        msgBodyHtml: form.msgBody, 
        msgBodyText: stripHtmlTags(form.msgBody)
      }

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
      const payload = { 
        ...form,
        msgBodyHtml: form.msgBody, 
        msgBodyText: stripHtmlTags(form.msgBody)
      }

      const res = await api.post(`${baseURL}/sendWithAttachments`, payload)
      alert(res.data || 'Email with attachments sent successfully')
      setShowAttachmentsModal(false)
      fetchEmails()
    } catch {
      alert('Failed to send email with attachments.')
    }
  }

  // Save reply status
  const saveReplyStatus = async () => {
    try {
      await api.post(
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
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-primary text-white py-3">
            <Row className="align-items-center">
              <Col>
                <h4 className="mb-0">
                  <i className="fas fa-envelope me-2"></i>Email Management
                </h4>
              </Col>
              <Col className="text-end">
                <Button 
                  variant="light" 
                  onClick={() => openSendEmailModal(null)}
                  className="rounded-pill px-3"
                >
                  <i className="fas fa-plus me-2"></i>New Email
                </Button>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body className="p-4">
            {loading && (
              <div className="text-center my-5 py-4">
                <Spinner animation="border" variant="primary" className="mb-3" />
                <p className="text-muted">Loading emails...</p>
              </div>
            )}

            {error && (
              <Alert variant="danger" className="d-flex align-items-center">
                <i className="fas fa-exclamation-circle me-2"></i>
                {error}
              </Alert>
            )}

            {!loading && emails.length === 0 && (
              <div className="text-center my-5 py-4">
                <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">No emails sent yet</h5>
                <p className="text-muted">Get started by sending your first email</p>
                <Button 
                  variant="primary" 
                  onClick={() => openSendEmailModal(null)}
                  className="rounded-pill px-4"
                >
                  <i className="fas fa-plus me-2"></i>Create Email
                </Button>
              </div>
            )}

            {!loading && emails.length > 0 && (
              <div className="table-responsive">
                <Table striped bordered hover responsive className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Company</th>
                      <th>Recipient</th>
                      <th>Subject</th>
                      <th className="text-center">Reply</th>
                      <th>Attachments</th>
                      <th style={{ minWidth: '220px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emails.map((email) => (
                      <tr key={email.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '36px', height: '36px'}}>
                              <i className="fas fa-building text-white"></i>
                            </div>
                            <span className="fw-medium">{email.companyName}</span>
                          </div>
                        </td>
                        <td>
                          <i className="fas fa-envelope text-muted me-2"></i>
                          {email.recipient}
                        </td>
                        <td>
                          <div className="text-truncate" style={{maxWidth: '200px'}} title={email.subject}>
                            {email.subject}
                          </div>
                        </td>
                        <td className="text-center">
                          {email.gotReply ? (
                            <Badge bg="success" className="px-2 py-1">
                              <i className="fas fa-check me-1"></i>Yes
                            </Badge>
                          ) : (
                            <Badge bg="secondary" className="px-2 py-1">
                              <i className="fas fa-times me-1"></i>No
                            </Badge>
                          )}
                        </td>
                        <td>
                          {email.attachments ? (
                            <div className="d-flex align-items-center">
                              <i className="fas fa-paperclip text-muted me-1"></i>
                              <span className="text-truncate" style={{maxWidth: '120px'}}>
                                {email.attachments}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => openSendEmailModal(email)}
                            >
                              <i className="fas fa-redo me-1"></i> Resend
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-info"
                              onClick={() => openSendAttachmentsModal(email)}
                            >
                              <i className="fas fa-paperclip me-1"></i> Attach
                            </Button>
                            <Button
                              size="sm"
                              variant={email.gotReply ? "outline-success" : "outline-secondary"}
                              onClick={() => openReplyModal(email)}
                            >
                              <i className="fas fa-reply me-1"></i> Reply
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Send Email Modal */}
        <Modal show={showSendModal} onHide={() => setShowSendModal(false)} centered size="lg">
          <Form onSubmit={handleSendEmail}>
            <Modal.Header closeButton className="bg-light">
              <Modal.Title>
                <i className="fas fa-paper-plane me-2 text-primary"></i>
                {sendingEmail ? 'Resend Email' : 'Compose New Email'}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Company Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="companyName"
                      value={form.companyName}
                      onChange={handleChange}
                      required
                      placeholder="Enter company name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Recipient Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="recipient"
                      value={form.recipient}
                      onChange={handleChange}
                      required
                      placeholder="recipient@example.com"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Subject</Form.Label>
                <Form.Control
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  placeholder="Email subject"
                />
              </Form.Group>
              
              <Form.Group>
                <Form.Label>Message Body</Form.Label>
                <Editor 
                  value={form.msgBody} 
                  onChange={handleEditorChange}
                  className="editor-custom border rounded"
                >
                  <Toolbar className="editor-toolbar border-bottom bg-light px-2 py-1 rounded-top">
                    <BtnBold />
                    <BtnItalic />
                    <BtnUnderline />
                    <Separator />
                    <BtnNumberedList />
                    <BtnBulletList />
                  </Toolbar>
                </Editor>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="bg-light">
              <Button variant="outline-secondary" onClick={() => setShowSendModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="px-4">
                <i className="fas fa-paper-plane me-2"></i>Send Email
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Reply Modal */}
        <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)} centered>
          <Modal.Header closeButton className="bg-light">
            <Modal.Title>
              <i className="fas fa-reply me-2 text-primary"></i>Mark Reply Status
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <h6>Email to {replyEmail?.recipient}</h6>
            <small className="text-muted">{replyEmail?.subject}</small>
            <div className="form-check form-switch mt-3">
              <Form.Check
                type="switch"
                id="reply-switch"
                label={replyStatus ? "Reply Received" : "No Reply Yet"}
                checked={replyStatus}
                onChange={(e) => setReplyStatus(e.target.checked)}
              />
            </div>
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="outline-secondary" onClick={() => setShowReplyModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveReplyStatus} className="px-4">
              Save Status
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      <style jsx>{`
        .editor-custom {
          border: 1px solid #ced4da;
          border-radius: 0.375rem;
        }
        .editor-toolbar {
          border-bottom: 1px solid #dee2e6;
          background-color: #f8f9fa;
        }
      `}</style>
    </Base>
  )
}

export default EmailManager
